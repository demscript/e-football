"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import type { Player, Tournament, Match } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import { ConsoleBadge, Badge } from "@/components/ui/badge";

type PlayerWithStats = Player & { _count: { wonMatches: number } };
type TournamentWithData = Tournament & {
  rounds: { matches: (Match & { player1: Player | null; player2: Player | null; winner: Player | null })[] }[];
};

const RANK_ICONS = [
  <Trophy key={1} className="w-5 h-5 text-brand-yellow" />,
  <Medal key={2} className="w-5 h-5 text-gray-400" />,
  <Award key={3} className="w-5 h-5 text-orange-500" />,
];

export function LeaderboardTable({
  players,
  tournament,
}: {
  players: PlayerWithStats[];
  tournament: TournamentWithData;
}) {
  const [liveWins, setLiveWins] = useState<Record<string, number>>({});

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(CHANNELS.MATCHES);

    channel.bind(EVENTS.MATCH_UPDATED, (data: { match: Match }) => {
      if (data.match.winnerId && (data.match.status === "COMPLETED" || data.match.status === "WALKOVER")) {
        setLiveWins((prev) => ({
          ...prev,
          [data.match.winnerId!]: (prev[data.match.winnerId!] ?? 0) + 1,
        }));
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.MATCHES);
    };
  }, []);

  // Determine eliminated players
  const allMatches = tournament.rounds.flatMap((r) => r.matches);
  const eliminatedIds = new Set(
    allMatches
      .filter((m) => m.status === "COMPLETED" && m.winnerId)
      .flatMap((m) => [m.player1?.id, m.player2?.id].filter((id) => id !== m.winnerId && id))
  );

  const champion = tournament.rounds.at(-1)?.matches[0]?.winner;

  const sortedPlayers = [...players].sort((a, b) => {
    const winsA = (liveWins[a.id] ?? 0) + a._count.wonMatches;
    const winsB = (liveWins[b.id] ?? 0) + b._count.wonMatches;
    return winsB - winsA;
  });

  return (
    <div className="rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-brand-yellow" />
          <h3 className="font-bold text-white text-sm">Player Standings</h3>
        </div>
        <span className="text-xs text-gray-500">{players.length} players</span>
      </div>

      <div className="divide-y divide-dark-600/40">
        {sortedPlayers.map((player, idx) => {
          const wins = (liveWins[player.id] ?? 0) + player._count.wonMatches;
          const isEliminated = eliminatedIds.has(player.id);
          const isChampion = champion?.id === player.id;

          return (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "px-6 py-3.5 flex items-center gap-4 transition-all",
                isEliminated && !isChampion && "opacity-40",
                isChampion && "bg-brand-yellow/5"
              )}
            >
              {/* Rank */}
              <div className="w-8 flex-shrink-0 flex items-center justify-center">
                {idx < 3 ? (
                  RANK_ICONS[idx]
                ) : (
                  <span className="text-sm font-bold text-gray-600">#{idx + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0",
                  isChampion
                    ? "bg-brand-yellow/20 border border-brand-yellow/40 text-brand-yellow"
                    : "bg-brand-blue/10 border border-brand-blue/20 text-brand-blue-light"
                )}
              >
                {player.gamerTag.slice(0, 2).toUpperCase()}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-semibold text-sm truncate",
                      isChampion ? "text-brand-yellow" : "text-white"
                    )}
                  >
                    {player.gamerTag}
                  </span>
                  {isChampion && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-brand-yellow/20 border border-brand-yellow/30 text-brand-yellow font-bold">
                      👑 Champion
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 truncate">{player.fullName}</div>
              </div>

              {/* Console */}
              <ConsoleBadge console={player.console} />

              {/* Status */}
              <Badge variant="status" status={isChampion ? "APPROVED" : isEliminated ? "REJECTED" : player.status}>
                {isChampion ? "Champion" : isEliminated ? "Eliminated" : player.status === "APPROVED" ? "Active" : player.status}
              </Badge>

              {/* Wins */}
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-black text-white font-display">{wins}</div>
                <div className="text-[10px] text-gray-600">wins</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
