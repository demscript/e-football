export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { BracketView } from "@/components/tournament/bracket-view";
import { Trophy } from "lucide-react";

async function getTournament() {
  return prisma.tournament.findFirst({
    include: {
      rounds: {
        include: {
          matches: {
            include: { player1: true, player2: true, winner: true },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });
}

export default async function BracketPage() {
  const tournament = await getTournament();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Bracket</h1>
        <p className="text-gray-500 text-sm mt-1">Visual tournament bracket — admin view</p>
      </div>

      {!tournament || tournament.rounds.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dark-600 bg-dark-800/40">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-500 mb-2">No Bracket Yet</h2>
          <p className="text-gray-600 text-sm mb-4">
            Go to Dashboard and click &ldquo;Generate Bracket&rdquo; to start.
          </p>
        </div>
      ) : (
        <BracketView tournament={tournament as never} isAdmin />
      )}
    </div>
  );
}
