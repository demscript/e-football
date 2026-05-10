import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { tournamentId } = await req.json();
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

    const newStatus = tournament.status === "PAUSED" ? "IN_PROGRESS" : "PAUSED";
    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: newStatus },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? "",
        action: `Tournament ${newStatus === "PAUSED" ? "paused" : "resumed"}`,
        entity: "Tournament",
        entityId: tournamentId,
      },
    });

    await pusherServer.trigger(CHANNELS.TOURNAMENT, EVENTS.TOURNAMENT_UPDATED, {
      tournament: updated,
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update tournament" }, { status: 500 });
  }
}
