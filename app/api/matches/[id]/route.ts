import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordMatchResult } from "@/lib/tournament-engine";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { score1, score2, winnerId, notes } = await req.json();

    if (!winnerId) {
      return NextResponse.json({ error: "Winner is required" }, { status: 400 });
    }

    const match = await recordMatchResult(id, score1 ?? 0, score2 ?? 0, winnerId, notes);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? "",
        action: "Match result recorded",
        entity: "Match",
        entityId: id,
        metadata: { score1, score2, winnerId },
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
