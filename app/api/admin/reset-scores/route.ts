import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { scope } = await req.json(); // "current" | "all"

    const tournament = await prisma.tournament.findFirst({
      include: { rounds: { include: { matches: true }, orderBy: { roundNumber: "asc" } } },
    });

    if (!tournament) return NextResponse.json({ error: "No tournament found" }, { status: 404 });

    if (scope === "all") {
      // Reset every match in every round
      await prisma.match.updateMany({
        where: { round: { tournamentId: tournament.id } },
        data: { status: "PENDING", winnerId: null, score1: null, score2: null, notes: null },
      });

      // Reset tournament back to round 1
      await prisma.tournament.update({
        where: { id: tournament.id },
        data: { currentRound: 1, status: "IN_PROGRESS" },
      });

      // Reset all rounds to IN_PROGRESS
      await prisma.round.updateMany({
        where: { tournamentId: tournament.id },
        data: { status: "IN_PROGRESS" },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.user?.id ?? "",
          action: "ALL scores reset — full tournament reset",
          entity: "Tournament",
          entityId: tournament.id,
          metadata: { scope: "all", reason: "Admin initiated full reset" },
        },
      });

      return NextResponse.json({ message: "All scores reset successfully", affected: "all rounds" });
    }

    // Reset current round only
    const currentRound = tournament.rounds.find(r => r.roundNumber === tournament.currentRound);
    if (!currentRound) return NextResponse.json({ error: "Current round not found" }, { status: 404 });

    await prisma.match.updateMany({
      where: { roundId: currentRound.id },
      data: { status: "PENDING", winnerId: null, score1: null, score2: null, notes: null },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? "",
        action: `Round ${tournament.currentRound} scores reset`,
        entity: "Round",
        entityId: currentRound.id,
        metadata: { scope: "current", roundNumber: tournament.currentRound },
      },
    });

    return NextResponse.json({ message: `Round ${tournament.currentRound} reset successfully` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
