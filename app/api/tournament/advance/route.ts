import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { advanceRound } from "@/lib/tournament-engine";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { tournamentId } = await req.json();
    const result = await advanceRound(tournamentId);

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? "",
        action: result.complete ? "Tournament completed" : "Round advanced",
        entity: "Tournament",
        entityId: tournamentId,
        metadata: { complete: result.complete },
      },
    });

    try {
      const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
      await pusherServer.trigger(CHANNELS.TOURNAMENT, EVENTS.ROUND_ADVANCED, {
        tournament,
        result,
      });
    } catch {
      // Pusher failure must not block the response
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    // EFB-010: never leak ORM/schema details — log server-side only
    console.error("[advance]", err);
    const msg = err instanceof Error ? err.message : "Failed to advance round";
    // Only expose safe business-logic messages (no Prisma internals)
    const safe = msg.includes("pending") || msg.includes("not found") || msg.includes("complete") ? msg : "Failed to advance round";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
