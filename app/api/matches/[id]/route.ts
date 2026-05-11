import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordMatchResult } from "@/lib/tournament-engine";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { scoreSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();

    // Reset match back to pending
    if (body.reset) {
      const match = await prisma.match.update({
        where: { id },
        data: { status: "PENDING", winnerId: null, score1: null, score2: null, notes: null },
      });
      await prisma.auditLog.create({
        data: {
          userId: session.user?.id ?? "",
          action: "Match reset to pending",
          entity: "Match",
          entityId: id,
        },
      });
      return NextResponse.json({ data: match });
    }

    // Validate with schema — rejects unknown shapes, enforces score ranges
    let parsed: { score1: number; score2: number; winnerId: string; notes?: string };
    try {
      parsed = scoreSchema.parse({
        score1: body.score1 ?? 0,
        score2: body.score2 ?? 0,
        winnerId: body.winnerId,
        notes: body.notes,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid data" }, { status: 400 });
      }
      throw err;
    }

    const { score1, score2, winnerId, notes } = parsed;

    if (!winnerId) {
      return NextResponse.json({ error: "Winner is required" }, { status: 400 });
    }

    const match = await recordMatchResult(id, score1, score2, winnerId, notes);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? "",
        action: "Match result recorded",
        entity: "Match",
        entityId: id,
        metadata: { score1: parsed.score1, score2: parsed.score2, winnerId: parsed.winnerId },
      },
    });

    // Broadcast realtime update (non-fatal if Pusher not configured)
    try {
      const fullMatch = await prisma.match.findUnique({
        where: { id },
        include: {
          player1: true,
          player2: true,
          winner: true,
          round: true,
        },
      });
      await pusherServer.trigger(CHANNELS.MATCHES, EVENTS.MATCH_UPDATED, {
        match: fullMatch,
      });
    } catch {
      // Pusher failure must not block the response
    }

    return NextResponse.json({ data: match });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to record result" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      player1: true,
      player2: true,
      winner: true,
      round: true,
      incidents: { include: { player: true } },
    },
  });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  return NextResponse.json({ data: match });
}
