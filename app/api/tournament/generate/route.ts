import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateBracket } from "@/lib/tournament-engine";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { tournamentId } = await req.json();
    if (!tournamentId) {
      return NextResponse.json({ error: "Tournament ID required" }, { status: 400 });
    }

    const result = await generateBracket(tournamentId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? "",
        action: "Bracket generated",
        entity: "Tournament",
        entityId: tournamentId,
        metadata: { matches: result.matches },
      },
    });

    // Broadcast (non-fatal if Pusher not configured)
    try {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });
      await pusherServer.trigger(CHANNELS.TOURNAMENT, EVENTS.BRACKET_GENERATED, {
        tournament,
        round: result.round,
      });
    } catch {
      // Pusher failure must not block the response
    }

    return NextResponse.json({ data: result, message: "Bracket generated!" });
  } catch (err) {
    // EFB-010: never leak ORM/schema details
    console.error("[generate]", err);
    const msg = err instanceof Error ? err.message : "";
    const safe = msg.includes("approved") || msg.includes("players") ? msg : "Failed to generate bracket";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
