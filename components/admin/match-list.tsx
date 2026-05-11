"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Swords, Trophy, ChevronDown, RotateCcw } from "lucide-react";
import type { Match, Player, Round } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PinModal } from "@/components/admin/pin-modal";
import { cn } from "@/lib/utils";

type MatchWithRelations = Match & { player1: Player | null; player2: Player | null; winner: Player | null; round: Round };

interface MatchListProps {
  byRound: Record<string, MatchWithRelations[]>;
  tournamentId: string;
}

export function MatchList({ byRound }: MatchListProps) {
  const router = useRouter();
  const [scoreModal, setScoreModal] = useState<MatchWithRelations | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [winnerId, setWinnerId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(Object.keys(byRound)[0] ?? null);
  const [pinOpen, setPinOpen] = useState(false);

  async function submitScore() {
    if (!scoreModal || !winnerId) {
      toast.error("Please select a winner");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${scoreModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2, winnerId, notes }),
      });
      if (!res.ok) throw new Error("Failed to update match");
      toast.success("Match result recorded!");
      setScoreModal(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function resetMatch(matchId: string) {
    if (!confirm("Reset this match result back to PENDING?")) return;
    setResetting(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      if (!res.ok) throw new Error("Failed to reset match");
      toast.success("Match reset to pending");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setResetting(null);
    }
  }

  const sortedRounds = Object.entries(byRound).sort(([a], [b]) => {
    const numA = parseInt(a.split(":")[0]);
    const numB = parseInt(b.split(":")[0]);
    return numA - numB;
  });

  return (
    <>
      <div className="space-y-4">
        {sortedRounds.map(([roundKey, matches]) => {
          const [, roundName] = roundKey.split(":");
          const isOpen = expanded === roundKey;
          const completed = matches.filter((m) => m.status === "COMPLETED" || m.status === "WALKOVER").length;

          return (
            <div key={roundKey} className="rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : roundKey)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-dark-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-blue/10">
                    <Swords className="w-4 h-4 text-brand-blue-light" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">{roundName}</div>
                    <div className="text-xs text-gray-500">
                      {completed}/{matches.length} matches completed
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 rounded-full bg-dark-600 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-blue transition-all"
                      style={{ width: `${(completed / matches.length) * 100}%` }}
                    />
                  </div>
                  <ChevronDown
                    className={cn("w-4 h-4 text-gray-500 transition-transform", isOpen && "rotate-180")}
                  />
                </div>
              </button>

              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className="border-t border-dark-600 divide-y divide-dark-600/40"
                >
                  {matches.map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      resetting={resetting === match.id}
                      onScore={() => {
                        setScoreModal(match);
                        setScore1(match.score1 ?? 0);
                        setScore2(match.score2 ?? 0);
                        setWinnerId(match.winnerId ?? "");
                        setNotes(match.notes ?? "");
                      }}
                      onReset={() => resetMatch(match.id)}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* PIN verification modal */}
      <PinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={submitScore}
        action="record match result"
      />

      {/* Score Modal */}
      <Modal
        open={!!scoreModal}
        onClose={() => setScoreModal(null)}
        title="Record Match Result"
        size="md"
      >
        {scoreModal && (
          <div className="space-y-5">
            {/* Players */}
            <div className="flex items-center gap-4">
              <PlayerCard player={scoreModal.player1} />
              <div className="text-brand-blue-light font-black text-xl font-display">VS</div>
              <PlayerCard player={scoreModal.player2} />
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  {scoreModal.player1?.gamerTag ?? "Player 1"} Score
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={score1}
                  onChange={(e) => setScore1(Number(e.target.value))}
                  className="w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-3 text-center text-2xl font-bold text-white focus:outline-none focus:border-brand-blue/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  {scoreModal.player2?.gamerTag ?? "Player 2"} Score
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={score2}
                  onChange={(e) => setScore2(Number(e.target.value))}
                  className="w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-3 text-center text-2xl font-bold text-white focus:outline-none focus:border-brand-blue/50"
                />
              </div>
            </div>

            {/* Winner */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Winner *</label>
              <div className="grid grid-cols-2 gap-2">
                {[scoreModal.player1, scoreModal.player2].filter(Boolean).map((p) => (
                  <button
                    key={p!.id}
                    onClick={() => setWinnerId(p!.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all",
                      winnerId === p!.id
                        ? "border-brand-yellow/60 bg-brand-yellow/10 text-brand-yellow"
                        : "border-dark-400 bg-dark-700 text-gray-400 hover:border-dark-300"
                    )}
                  >
                    {winnerId === p!.id && <Trophy className="w-4 h-4" />}
                    {p!.gamerTag}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any incidents, disconnects, etc..."
                rows={2}
                className="w-full bg-dark-600 border border-dark-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue/50 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setPinOpen(true)} loading={loading} className="flex-1" variant="yellow">
                <Trophy className="w-4 h-4" />
                Save Result
              </Button>
              <Button variant="secondary" onClick={() => setScoreModal(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function MatchRow({
  match,
  onScore,
  onReset,
  resetting,
}: {
  match: MatchWithRelations;
  onScore: () => void;
  onReset: () => void;
  resetting: boolean;
}) {
  const isDone = match.status === "COMPLETED" || match.status === "WALKOVER";

  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-dark-700/20 transition-colors">
      <div className="text-xs text-gray-600 font-mono w-8">#{match.matchNumber}</div>

      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 text-right">
          <span className={cn(
            "font-semibold text-sm",
            match.winnerId === match.player1Id ? "text-brand-yellow" : "text-gray-400"
          )}>
            {match.player1?.gamerTag ?? "BYE"}
          </span>
        </div>

        <div className="flex items-center gap-2 min-w-[80px] justify-center">
          {isDone ? (
            <span className="font-black text-white text-lg font-display">
              {match.score1 ?? 0} — {match.score2 ?? 0}
            </span>
          ) : (
            <span className="text-gray-600 text-xs font-semibold">vs</span>
          )}
        </div>

        <div className="flex-1">
          <span className={cn(
            "font-semibold text-sm",
            match.winnerId === match.player2Id ? "text-brand-yellow" : "text-gray-400"
          )}>
            {match.player2?.gamerTag ?? "BYE"}
          </span>
        </div>
      </div>

      <Badge variant="status" status={match.status}>
        {match.status}
      </Badge>

      {!isDone && match.player1 && match.player2 && (
        <Button size="sm" variant="outline" onClick={onScore}>
          <Swords className="w-3.5 h-3.5" />
          Score
        </Button>
      )}

      {isDone && (
        <div className="flex items-center gap-2">
          {match.winner && (
            <div className="flex items-center gap-1.5 text-xs text-brand-yellow font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              {match.winner.gamerTag}
            </div>
          )}
          <button
            onClick={onReset}
            disabled={resetting}
            title="Reset match result"
            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
          >
            <RotateCcw className={cn("w-3.5 h-3.5", resetting && "animate-spin")} />
          </button>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player }: { player: Player | null }) {
  return (
    <div className="flex-1 p-3 rounded-xl bg-dark-700 border border-dark-500 text-center">
      <div className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue-light text-xs font-bold mx-auto mb-1">
        {player?.gamerTag?.slice(0, 2).toUpperCase() ?? "??"}
      </div>
      <div className="text-sm font-bold text-white truncate">{player?.gamerTag ?? "—"}</div>
      <div className="text-xs text-gray-600 truncate">{player?.fullName ?? "BYE"}</div>
    </div>
  );
}
