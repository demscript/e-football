"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, ShieldAlert, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function ResetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"current" | "all" | null>(null);
  const [confirm, setConfirm] = useState<"current" | "all" | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [done, setDone] = useState<string | null>(null);

  async function handleReset(scope: "current" | "all") {
    setLoading(scope);
    try {
      const res = await fetch("/api/admin/reset-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      setDone(data.message);
      setConfirm(null);
      setConfirmText("");
      toast.success(data.message);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-display">Score Reset</h1>
          <p className="text-gray-500 text-sm mt-1">
            Use this if scores were tampered with. All resets are logged in Audit Logs.
          </p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300/80 leading-relaxed">
          <span className="font-bold text-yellow-400">Change your password first</span> — go to Settings and update it before resetting scores, otherwise the attacker can tamper again.
        </p>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-green-500/10 border border-green-500/30"
        >
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400 font-semibold">{done}</p>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Reset current round */}
        <div className="rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-brand-blue-light" />
                  Reset Current Round
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Clears all scores in the current round only. Other rounds stay intact.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setConfirm("current"); setConfirmText(""); }}
                disabled={!!loading}
              >
                Reset Round
              </Button>
            </div>

            {confirm === "current" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-dark-600 space-y-3"
              >
                <p className="text-xs text-gray-400">
                  Type <span className="font-mono font-bold text-white">RESET</span> to confirm
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type RESET"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue/50"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="yellow"
                    loading={loading === "current"}
                    disabled={confirmText !== "RESET"}
                    onClick={() => handleReset("current")}
                    className="flex-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Confirm Reset
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirm(null)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Full reset */}
        <div className={cn(
          "rounded-2xl border overflow-hidden",
          "border-red-500/30 bg-red-500/5"
        )}>
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Reset ALL Scores
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Clears every score across all rounds and resets the tournament back to Round 1. <span className="text-red-400 font-semibold">This cannot be undone.</span>
                </p>
              </div>
              <Button
                size="sm"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-400 flex-shrink-0"
                variant="outline"
                onClick={() => { setConfirm("all"); setConfirmText(""); }}
                disabled={!!loading}
              >
                Full Reset
              </Button>
            </div>

            {confirm === "all" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-red-500/20 space-y-3"
              >
                <p className="text-xs text-gray-400">
                  Type <span className="font-mono font-bold text-red-400">RESET ALL</span> to confirm full wipe
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder='Type RESET ALL'
                  className="w-full bg-dark-900 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/60"
                />
                <div className="flex gap-2">
                  <button
                    disabled={confirmText !== "RESET ALL" || loading === "all"}
                    onClick={() => handleReset("all")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      confirmText === "RESET ALL" && !loading
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-dark-700 text-gray-600 cursor-not-allowed"
                    )}
                  >
                    {loading === "all" ? (
                      <RotateCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    Confirm Full Reset
                  </button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirm(null)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
