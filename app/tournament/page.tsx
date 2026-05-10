export const dynamic = "force-dynamic";

import Link from "next/link";
import { Trophy, Swords, Users, ArrowLeft, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BracketView } from "@/components/tournament/bracket-view";
import { LeaderboardTable } from "@/components/tournament/leaderboard";
import { Badge } from "@/components/ui/badge";

async function getTournamentData() {
  const tournament = await prisma.tournament.findFirst({
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

  const players = await prisma.player.findMany({
    where: { status: "APPROVED" },
    include: {
      _count: { select: { wonMatches: true } },
      wonMatches: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return { tournament, players };
}

export default async function TournamentPage() {
  const { tournament, players } = await getTournamentData();

  const currentRound = tournament?.rounds.find(
    (r) => r.roundNumber === tournament.currentRound
  );

  const pendingMatches = currentRound?.matches.filter(
    (m) => m.status === "PENDING" || m.status === "IN_PROGRESS"
  ).length ?? 0;

  const completedMatches = tournament?.rounds.reduce(
    (sum, r) => sum + r.matches.filter((m) => m.status === "COMPLETED").length,
    0
  ) ?? 0;

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="border-b border-dark-600 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:block">Home</span>
            </Link>
            <div className="h-4 w-px bg-dark-500" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-blue flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white font-display text-sm hidden sm:block">
                Live Bracket
              </span>
            </div>
          </div>

          {/* Live status */}
          <div className="flex items-center gap-3">
            {tournament && (
              <Badge variant="status" status={tournament.status}>
                {tournament.status.replace(/_/g, " ")}
              </Badge>
            )}
            {tournament?.status === "IN_PROGRESS" && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue-light text-xs font-bold">
                <Zap className="w-3.5 h-3.5" />
                LIVE
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white font-display">
              eFootball City Cup 2026
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {tournament?.status === "IN_PROGRESS"
                ? `Round ${tournament.currentRound} of ${tournament.totalRounds} — ${pendingMatches} matches remaining`
                : tournament?.status === "COMPLETED"
                ? "Tournament Complete"
                : "Tournament bracket will appear here when generated"}
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-700/60 border border-dark-500">
              <Users className="w-4 h-4 text-brand-blue-light" />
              <span className="text-sm font-semibold text-white">{players.length}</span>
              <span className="text-xs text-gray-500">Players</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-700/60 border border-dark-500">
              <Swords className="w-4 h-4 text-brand-yellow" />
              <span className="text-sm font-semibold text-white">{completedMatches}</span>
              <span className="text-xs text-gray-500">Matches Played</span>
            </div>
          </div>
        </div>

        {/* No tournament yet */}
        {!tournament || tournament.rounds.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-dark-600 bg-dark-800/40">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-dark-700 border border-dark-500 mb-6">
              <Trophy className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-400 mb-3 font-display">
              Tournament Not Started Yet
            </h2>
            <p className="text-gray-600 max-w-md mx-auto text-sm mb-6">
              The bracket will be published here once the admin generates fixtures.
              Registration is open — sign up now to secure your spot!
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold transition-all hover:shadow-glow-sm"
            >
              <Trophy className="w-4 h-4" />
              Register Now
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live bracket */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Swords className="w-4 h-4 text-brand-blue-light" />
                Tournament Bracket
                {tournament.status === "IN_PROGRESS" && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue-light text-xs font-bold animate-pulse">
                    LIVE
                  </span>
                )}
              </h2>
              <BracketView tournament={tournament as never} />
            </div>

            {/* Leaderboard */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-brand-yellow" />
                Leaderboard
              </h2>
              <LeaderboardTable players={players as never} tournament={tournament as never} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
