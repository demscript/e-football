"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Swords, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { Match, Player, Round, Tournament } from "@/generated/prisma";
import { cn, getRoundName } from "@/lib/utils";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import type { MatchUpdatedEvent } from "@/types";

type MatchWithPlayers = Match & { player1: Player | null; player2: Player | null; winner: Player | null };
type RoundWithMatches = Round & { matches: MatchWithPlayers[] };
type FullTournament = Tournament & { rounds: RoundWithMatches[] };

interface BracketViewProps {
  tournament: FullTournament;
  isAdmin?: boolean;
}

export function BracketView({ tournament, isAdmin }: BracketViewProps) {
  const [zoom, setZoom] = useState(1);
  const [liveMatches, setLiveMatches] = useState<Record<string, Partial<MatchWithPlayers>>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Realtime updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(CHANNELS.MATCHES);

    channel.bind(EVENTS.MATCH_UPDATED, (data: MatchUpdatedEvent) => {
      setLiveMatches((prev) => ({
        ...prev,
        [data.match.id]: data.match,
      }));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.MATCHES);
    };
  }, []);

  // Merge live updates with static data
  const rounds = tournament.rounds.map((round) => ({
    ...round,
    matches: round.matches.map((match) => ({
      ...match,
      ...(liveMatches[match.id] ?? {}),
    })),
  }));

  const totalMatches = rounds.reduce((sum, r) => sum + r.matches.length, 0);
  const completedMatches = rounds.reduce(
    (sum, r) => sum + r.matches.filter((m) => m.status === "COMPLETED" || m.status === "WALKOVER").length,
    0
  );

  const champion = rounds.at(-1)?.matches[0]?.winner;

  return (
    <div className="space-y-4">
      {/* Bracket header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-500 text-xs text-gray-400">
            <span className="font-semibold text-white">{completedMatches}</span>/{totalMatches} matches
          </div>
          {champion && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/30 text-xs">
              <Trophy className="w-3.5 h-3.5 text-brand-yellow" />
              <span className="text-brand-yellow font-bold">{champion.gamerTag}</span>
              <span className="text-gray-500">— Champion</span>
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="p-2 rounded-lg bg-dark-700 border border-dark-500 text-gray-400 hover:text-white hover:border-dark-400 transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="p-2 rounded-lg bg-dark-700 border border-dark-500 text-gray-400 hover:text-white hover:border-dark-400 transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 rounded-lg bg-dark-700 border border-dark-500 text-gray-400 hover:text-white hover:border-dark-400 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable bracket container */}
      <div
        ref={containerRef}
        className="overflow-x-auto overflow-y-auto rounded-2xl border border-dark-400/50 bg-dark-900/80"
        style={{ minHeight: 400, maxHeight: "75vh" }}
      >
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s" }}
          className="p-8 inline-flex gap-0 items-start min-w-max"
        >
          {rounds.map((round, roundIdx) => (
            <div key={round.id} className="flex flex-col">
              {/* Round label */}
              <div className="text-center mb-4 px-6">
                <span className="inline-block px-3 py-1 rounded-full bg-dark-700 border border-dark-500 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {round.name}
                </span>
              </div>

              {/* Matches column */}
              <div
                className="flex flex-col"
                style={{
                  gap: `${Math.pow(2, roundIdx) * 24}px`,
                  paddingTop: `${Math.pow(2, roundIdx) * 12 - 12}px`,
                  paddingBottom: `${Math.pow(2, roundIdx) * 12 - 12}px`,
                }}
              >
                {round.matches.map((match, matchIdx) => (
                  <BracketMatch
                    key={match.id}
                    match={match}
                    isLast={roundIdx === rounds.length - 1}
                    isFirst={roundIdx === 0}
                    matchIdx={matchIdx}
                    roundIdx={roundIdx}
                    totalRounds={rounds.length}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Champion display */}
          {champion && (
            <div className="flex flex-col justify-center pl-8">
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-xs font-bold text-brand-yellow uppercase tracking-wider">
                  Champion
                </span>
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
                className="w-48 p-4 rounded-2xl border-2 border-brand-yellow/60 bg-brand-yellow/10 text-center"
                style={{ boxShadow: "0 0 30px rgba(255,215,0,0.2)" }}
              >
                <Trophy className="w-8 h-8 text-brand-yellow mx-auto mb-2" />
                <div className="font-black text-brand-yellow text-lg font-display">{champion.gamerTag}</div>
                <div className="text-xs text-gray-500 mt-0.5">{champion.fullName}</div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {[
          { color: "bg-brand-yellow/30 border-brand-yellow/50", label: "Winner / Advancing" },
          { color: "bg-brand-blue/20 border-brand-blue/40", label: "In Progress" },
          { color: "bg-dark-600 border-dark-500", label: "Pending" },
          { color: "bg-red-500/10 border-red-500/30", label: "Eliminated" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded border", item.color)} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketMatch({
  match,
  isLast,
  matchIdx,
  roundIdx,
  totalRounds,
  isAdmin,
}: {
  match: MatchWithPlayers;
  isLast: boolean;
  isFirst: boolean;
  matchIdx: number;
  roundIdx: number;
  totalRounds: number;
  isAdmin?: boolean;
}) {
  const isCompleted = match.status === "COMPLETED" || match.status === "WALKOVER";
  const isInProgress = match.status === "IN_PROGRESS";

  return (
    <div className="relative flex items-center">
      {/* Match card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: roundIdx * 0.1 + matchIdx * 0.05 }}
        className={cn(
          "w-44 rounded-xl border overflow-hidden transition-all duration-300",
          isCompleted
            ? "border-dark-400/60 bg-dark-700/80"
            : isInProgress
            ? "border-brand-blue/40 bg-brand-blue/5"
            : "border-dark-500/60 bg-dark-800/60",
          "hover:border-dark-300/70"
        )}
        style={isInProgress ? { boxShadow: "0 0 15px rgba(0,87,255,0.15)" } : {}}
      >
        {/* Match number */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-dark-600/60">
          <span className="text-[10px] text-gray-600 font-mono">#{match.matchNumber}</span>
          {isInProgress && (
            <div className="flex items-center gap-1 text-[10px] text-brand-blue-light font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              LIVE
            </div>
          )}
          {match.isBye && (
            <span className="text-[10px] text-gray-600 font-semibold">BYE</span>
          )}
        </div>

        {/* Player slots */}
        <PlayerSlot
          player={match.player1}
          isWinner={match.winnerId === match.player1?.id}
          isEliminated={isCompleted && match.winnerId !== match.player1?.id && !!match.player1}
          score={match.score1}
          isBye={match.isBye && !match.player1}
        />
        <div className="h-px bg-dark-600/60" />
        <PlayerSlot
          player={match.player2}
          isWinner={match.winnerId === match.player2?.id}
          isEliminated={isCompleted && match.winnerId !== match.player2?.id && !!match.player2}
          score={match.score2}
          isBye={match.isBye && !match.player2}
        />
      </motion.div>

      {/* Connector line */}
      {!isLast && (
        <div className="w-8 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-dark-500 to-transparent" />
        </div>
      )}
    </div>
  );
}

function PlayerSlot({
  player,
  isWinner,
  isEliminated,
  score,
  isBye,
}: {
  player: Player | null;
  isWinner: boolean;
  isEliminated: boolean;
  score: number | null;
  isBye: boolean;
}) {
  if (isBye || !player) {
    return (
      <div className="px-3 py-2 flex items-center gap-2 opacity-30">
        <div className="w-5 h-5 rounded bg-dark-600" />
        <span className="text-xs text-gray-600">{isBye ? "BYE" : "TBD"}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-3 py-2 flex items-center gap-2 transition-all",
        isWinner && "bg-brand-yellow/10",
        isEliminated && "opacity-40"
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded flex items-center justify-center text-[9px] font-black flex-shrink-0",
          isWinner ? "bg-brand-yellow/20 text-brand-yellow" : "bg-dark-600 text-gray-500"
        )}
      >
        {player.gamerTag.slice(0, 2).toUpperCase()}
      </div>
      <span
        className={cn(
          "text-xs font-semibold flex-1 truncate",
          isWinner ? "text-brand-yellow" : isEliminated ? "text-gray-600" : "text-gray-300"
        )}
      >
        {player.gamerTag}
      </span>
      {score !== null && score !== undefined && (
        <span
          className={cn(
            "text-xs font-black min-w-[16px] text-right",
            isWinner ? "text-brand-yellow" : "text-gray-500"
          )}
        >
          {score}
        </span>
      )}
      {isWinner && <Trophy className="w-3 h-3 text-brand-yellow flex-shrink-0" />}
    </div>
  );
}
