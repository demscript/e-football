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
      const round1 = tournament.rounds.find((r) => r.roundNumber === 1);

      // Delete every round beyond Round 1 (cascades to their matches automatically)
      await prisma.round.deleteMany({
        where: {
          tournamentId: tournament.id,
          roundNumber: { gt: 1 },
        },
      });

      // Reset Round 1 matches to PENDING
      if (round1) {
        await prisma.match.updateMany({
          where: { roundId: round1.id },
          data: { status: "PENDING", winnerId: null, score1: null, score2: null, notes: null },
        });

        await prisma.round.update({
          where: { id: round1.id },
          data: { status: "IN_PROGRESS" },
        });
      }

      // Reset tournament back to round 1
      await prisma.tournament.update({
        where: { id: tournament.id },
        data: { currentRound: 1, status: "IN_PROGRESS" },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.user?.id ?? "",
          action: "FULL reset — all generated rounds deleted, Round 1 restored",
          entity: "Tournament",
          entityId: tournament.id,
          metadata: { scope: "all", reason: "Admin initiated full reset" },
        },
      });

      return NextResponse.json({ message: "Full reset complete. Only Round 1 remains.", affected: "all rounds" });
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
