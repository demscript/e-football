export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { MatchList } from "@/components/admin/match-list";
import { Swords } from "lucide-react";

async function getMatches() {
  return prisma.match.findMany({
    include: {
      player1: true,
      player2: true,
      winner: true,
      round: true,
    },
    orderBy: [{ round: { roundNumber: "asc" } }, { matchNumber: "asc" }],
  });
}

async function getTournament() {
  return prisma.tournament.findFirst({ orderBy: { createdAt: "desc" } });
}

export default async function MatchesPage() {
  const [matches, tournament] = await Promise.all([getMatches(), getTournament()]);

  const byRound = matches.reduce<Record<string, typeof matches>>((acc, m) => {
    const key = `${m.round.roundNumber}:${m.round.name}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Matches</h1>
          <p className="text-gray-500 text-sm mt-1">Record scores and manage match results</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-sm text-gray-400">
          <Swords className="w-4 h-4" />
          <span>{matches.length} total matches</span>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dark-600 bg-dark-800/40">
          <Swords className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-500 mb-2">No Matches Yet</h2>
          <p className="text-gray-600 text-sm">
            Generate the bracket from the Dashboard to create matches.
          </p>
        </div>
      ) : (
        <MatchList byRound={byRound as never} tournamentId={tournament?.id ?? ""} />
      )}
    </div>
  );
}
