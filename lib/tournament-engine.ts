import { prisma } from "@/lib/prisma";
import { shuffle, nextPowerOf2, getRoundName } from "@/lib/utils";
import type { Player } from "../generated/prisma";

export async function generateBracket(tournamentId: string) {
  const approvedPlayers = await prisma.player.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "asc" },
  });

  if (approvedPlayers.length < 2) {
    throw new Error("Need at least 2 approved players to generate bracket");
  }

  const shuffled = shuffle(approvedPlayers);
  const bracketSize = nextPowerOf2(shuffled.length);
  const totalRounds = Math.log2(bracketSize);

  // Update tournament
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: "IN_PROGRESS",
      currentRound: 1,
      totalRounds,
      startDate: new Date(),
    },
  });

  // Create Round 1
  const roundName = getRoundName(shuffled.length, 1);
  const round = await prisma.round.create({
    data: {
      tournamentId,
      roundNumber: 1,
      name: roundName,
      status: "IN_PROGRESS",
    },
  });

  // Pair players, with byes for odd count
  const matches: {
    tournamentId: string;
    roundId: string;
    matchNumber: number;
    player1Id: string | null;
    player2Id: string | null;
    status: "WALKOVER" | "PENDING";
    winnerId: string | null;
    isBye: boolean;
  }[] = [];

  const slots: (Player | null)[] = [...shuffled];
  while (slots.length < bracketSize) slots.push(null); // fill with byes

  for (let i = 0; i < slots.length; i += 2) {
    const p1 = slots[i];
    const p2 = slots[i + 1];
    const matchNum = Math.floor(i / 2) + 1;
    const isBye = !p1 || !p2;

    matches.push({
      tournamentId,
      roundId: round.id,
      matchNumber: matchNum,
      player1Id: p1?.id ?? null,
      player2Id: p2?.id ?? null,
      status: isBye ? "WALKOVER" : "PENDING",
      winnerId: isBye ? (p1?.id ?? p2?.id ?? null) : null,
      isBye,
    });
  }

  await prisma.match.createMany({ data: matches });

  return { round, matches: matches.length };
}

export async function advanceRound(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      rounds: {
        include: {
          matches: {
            include: { winner: true },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });

  if (!tournament) throw new Error("Tournament not found");

  const currentRoundData = tournament.rounds.find(
    (r) => r.roundNumber === tournament.currentRound
  );
  if (!currentRoundData) throw new Error("Current round not found");

  // Verify all matches are complete
  const incomplete = currentRoundData.matches.filter(
    (m) => m.status !== "COMPLETED" && m.status !== "WALKOVER"
  );
  if (incomplete.length > 0) {
    throw new Error(`${incomplete.length} match(es) still pending`);
  }

  const winners = currentRoundData.matches
    .map((m) => m.winner)
    .filter(Boolean) as Player[];

  if (winners.length === 1) {
    // Tournament over
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "COMPLETED", endDate: new Date() },
    });
    await prisma.round.update({
      where: { id: currentRoundData.id },
      data: { status: "COMPLETED" },
    });
    return { complete: true, winner: winners[0] };
  }

  // Mark current round complete
  await prisma.round.update({
    where: { id: currentRoundData.id },
    data: { status: "COMPLETED" },
  });

  const nextRoundNum = tournament.currentRound + 1;
  const nextRoundName = getRoundName(winners.length * 2, nextRoundNum);

  const nextRound = await prisma.round.create({
    data: {
      tournamentId,
      roundNumber: nextRoundNum,
      name: nextRoundName,
      status: "IN_PROGRESS",
    },
  });

  const shuffledWinners = shuffle(winners);
  const nextMatches: {
    tournamentId: string;
    roundId: string;
    matchNumber: number;
    player1Id: string | null;
    player2Id: string | null;
    status: "WALKOVER" | "PENDING";
    winnerId: string | null;
    isBye: boolean;
  }[] = [];

  for (let i = 0; i < shuffledWinners.length; i += 2) {
    const p1 = shuffledWinners[i];
    const p2 = shuffledWinners[i + 1] ?? null;
    const isBye = !p2;

    nextMatches.push({
      tournamentId,
      roundId: nextRound.id,
      matchNumber: Math.floor(i / 2) + 1,
      player1Id: p1.id,
      player2Id: p2?.id ?? null,
      status: isBye ? "WALKOVER" : "PENDING",
      winnerId: isBye ? p1.id : null,
      isBye,
    });
  }

  await prisma.match.createMany({ data: nextMatches });
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { currentRound: nextRoundNum },
  });

  return { complete: false, round: nextRound };
}

export async function recordMatchResult(
  matchId: string,
  score1: number,
  score2: number,
  winnerId: string,
  notes?: string
) {
  // Security: fetch match first to verify winnerId is an actual participant
  const existing = await prisma.match.findUnique({
    where: { id: matchId },
    select: { player1Id: true, player2Id: true },
  });

  if (!existing) throw new Error("Match not found");

  const validIds = [existing.player1Id, existing.player2Id].filter(Boolean);
  if (!validIds.includes(winnerId)) {
    throw new Error("Winner must be one of the match participants");
  }

  // Strip any HTML/script tags from notes before persisting
  const safeNotes = notes
    ? notes.replace(/<[^>]*>/g, "").slice(0, 500).trim() || undefined
    : undefined;

  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      score1,
      score2,
      winnerId,
      status: "COMPLETED",
      completedAt: new Date(),
      notes: safeNotes,
    },
    include: { player1: true, player2: true, winner: true },
  });

  return match;
}
