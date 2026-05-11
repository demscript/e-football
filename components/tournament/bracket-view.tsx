"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, ZoomIn, ZoomOut, Maximize2, Crown, Flame } from "lucide-react";
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

const AVATAR_COLORS = [
  "from-blue-500 to-blue-700",
  "from-purple-500 to-purple-700",
  "from-pink-500 to-pink-700",
  "from-orange-500 to-orange-700",
  "from-teal-500 to-teal-700",
  "from-red-500 to-red-700",
  "from-green-500 to-green-700",
  "from-yellow-500 to-yellow-700",
];

function getAvatarColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function BracketView({ tournament, isAdmin }: BracketViewProps) {
  const [zoom, setZoom] = useState(1);
  const [liveMatches, setLiveMatches] = useState<Record<string, Partial<MatchWithPlayers>>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(CHANNELS.MATCHES);
    channel.bind(EVENTS.MATCH_UPDATED, (data: MatchUpdatedEvent) => {
      setLiveMatches((prev) => ({ ...prev, [data.match.id]: data.match }));
    });
    return () => { channel.unbind_all(); pusher.unsubscribe(CHANNELS.MATCHES); };
  }, []);

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

  const roundColors = [
    "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
    "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
    "from-pink-500/20 to-pink-600/5 border-pink-500/30 text-pink-400",
    "from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400",
    "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400",
  ];

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 border border-dark-500">
            <Swords className="w-4 h-4 text-brand-blue-light" />
            <span className="text-sm font-bold text-white">{completedMatches}</span>
            <span className="text-xs text-gray-500">/ {totalMatches} played</span>
          </div>
          {champion && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-yellow/10 border border-brand-yellow/40"
              style={{ boxShadow: "0 0 20px rgba(255,215,0,0.15)" }}
            >
              <Crown className="w-4 h-4 text-brand-yellow" />
              <span className="text-sm font-black text-brand-yellow">{champion.gamerTag}</span>
              <span className="text-xs text-gray-500">Champion</span>
            </motion.div>
          )}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-800 border border-dark-600">
          <button onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-all">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-all">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setZoom(1)} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-all">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bracket canvas */}
      <div
        ref={containerRef}
        className="overflow-auto rounded-2xl border border-dark-500/60 bg-dark-900"
        style={{ minHeight: 480, maxHeight: "78vh", background: "radial-gradient(ellipse at top, #0a0f1e 0%, #050709 100%)" }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />

        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s ease" }}
          className="p-10 inline-flex gap-0 items-start min-w-max"
        >
          {rounds.map((round, roundIdx) => (
            <div key={round.id} className="flex flex-col items-center">
              {/* Round label */}
              <div className="mb-6 px-4">
                <div className={cn(
                  "px-4 py-1.5 rounded-full border bg-gradient-to-r text-xs font-black uppercase tracking-widest",
                  roundColors[roundIdx % roundColors.length]
                )}>
                  {round.name}
                </div>
              </div>

              {/* Matches */}
              <div
                className="flex flex-col"
                style={{
                  gap: `${Math.pow(2, roundIdx) * 28}px`,
                  paddingTop: `${Math.pow(2, roundIdx) * 14 - 14}px`,
                  paddingBottom: `${Math.pow(2, roundIdx) * 14 - 14}px`,
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

          {/* Champion slot */}
          {champion && (
            <div className="flex flex-col items-center justify-center pl-6 self-center">
              <div className="mb-4 text-xs font-black uppercase tracking-widest text-brand-yellow">
                🏆 Champion
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.6, stiffness: 200 }}
                className="w-52 p-5 rounded-2xl border-2 border-brand-yellow/60 text-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.05))", boxShadow: "0 0 40px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-brand-yellow/10 to-transparent pointer-events-none" />
                <Crown className="w-10 h-10 text-brand-yellow mx-auto mb-3 drop-shadow-lg" />
                <div className="font-black text-brand-yellow text-xl font-display tracking-wide">{champion.gamerTag}</div>
                <div className="text-xs text-gray-400 mt-1">{champion.fullName}</div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 px-1">
        {[
          { dot: "bg-brand-yellow", label: "Winner" },
          { dot: "bg-brand-blue animate-pulse", label: "Live" },
          { dot: "bg-dark-500", label: "Pending" },
          { dot: "bg-red-500/50", label: "Eliminated" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", item.dot)} />
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: roundIdx * 0.08 + matchIdx * 0.04, duration: 0.4 }}
        className={cn(
          "w-52 rounded-2xl border overflow-hidden relative transition-all duration-300",
          isInProgress
            ? "border-brand-blue/60 shadow-[0_0_20px_rgba(0,87,255,0.25)]"
            : isCompleted
            ? "border-dark-400/40"
            : "border-dark-500/50",
        )}
        style={{
          background: isInProgress
            ? "linear-gradient(135deg, rgba(0,87,255,0.08), rgba(0,40,120,0.06))"
            : "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))",
        }}
      >
        {/* Top accent line */}
        <div className={cn(
          "h-0.5 w-full",
          isInProgress ? "bg-gradient-to-r from-brand-blue via-brand-blue-light to-transparent" :
          isCompleted ? "bg-gradient-to-r from-brand-yellow/40 to-transparent" :
          "bg-gradient-to-r from-dark-500 to-transparent"
        )} />

        {/* Match header */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1">
          <span className="text-[10px] text-gray-600 font-mono font-semibold">M{match.matchNumber}</span>
          {isInProgress && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-blue/20 border border-brand-blue/30">
              <Flame className="w-2.5 h-2.5 text-brand-blue-light" />
              <span className="text-[9px] text-brand-blue-light font-black tracking-wider">LIVE</span>
            </div>
          )}
          {match.isBye && (
            <span className="text-[9px] text-gray-600 font-bold bg-dark-600 px-2 py-0.5 rounded-full">BYE</span>
          )}
          {isCompleted && !match.isBye && (
            <span className="text-[9px] text-green-500/70 font-bold">DONE</span>
          )}
        </div>

        {/* Players */}
        <div className="px-2 pb-2 space-y-1.5">
          <PlayerSlot
            player={match.player1}
            isWinner={match.winnerId === match.player1?.id}
            isEliminated={isCompleted && match.winnerId !== match.player1?.id && !!match.player1}
            score={match.score1}
            isBye={match.isBye && !match.player1}
          />

          {/* VS divider */}
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px bg-dark-600/80" />
            <span className="text-[9px] font-black text-gray-600 tracking-widest">VS</span>
            <div className="flex-1 h-px bg-dark-600/80" />
          </div>

          <PlayerSlot
            player={match.player2}
            isWinner={match.winnerId === match.player2?.id}
            isEliminated={isCompleted && match.winnerId !== match.player2?.id && !!match.player2}
            score={match.score2}
            isBye={match.isBye && !match.player2}
          />
        </div>
      </motion.div>

      {/* Connector */}
      {!isLast && (
        <div className="w-10 flex items-center relative">
          <div className="w-full h-px bg-gradient-to-r from-dark-400 to-transparent" />
          <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-dark-400" />
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
      <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-dark-800/40 border border-dark-600/30 opacity-25">
        <div className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center">
          <span className="text-[9px] text-gray-600">—</span>
        </div>
        <span className="text-xs text-gray-600">{isBye ? "BYE" : "TBD"}</span>
      </div>
    );
  }

  const initials = player.gamerTag.slice(0, 2).toUpperCase();
  const avatarColor = getAvatarColor(player.gamerTag);

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-2 rounded-xl border transition-all duration-300",
        isWinner
          ? "bg-gradient-to-r from-brand-yellow/15 to-brand-yellow/5 border-brand-yellow/40 shadow-[0_0_10px_rgba(255,215,0,0.1)]"
          : isEliminated
          ? "bg-dark-800/20 border-dark-700/30 opacity-35"
          : "bg-dark-800/50 border-dark-600/40 hover:border-dark-500/60"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 bg-gradient-to-br text-white shadow-sm",
        isWinner ? "from-yellow-400 to-orange-500" : avatarColor
      )}>
        {initials}
      </div>

      {/* Name */}
      <span className={cn(
        "text-xs font-bold flex-1 truncate",
        isWinner ? "text-brand-yellow" : isEliminated ? "text-gray-600" : "text-gray-200"
      )}>
        {player.gamerTag}
      </span>

      {/* Score + icon */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {score !== null && score !== undefined && (
          <span className={cn(
            "text-sm font-black min-w-[18px] text-right tabular-nums",
            isWinner ? "text-brand-yellow" : "text-gray-500"
          )}>
            {score}
          </span>
        )}
        {isWinner && <Trophy className="w-3 h-3 text-brand-yellow drop-shadow-sm" />}
      </div>
    </div>
  );
}
