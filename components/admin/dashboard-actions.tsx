"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Shuffle, ChevronRight, Play, Pause, RotateCcw, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PinModal } from "@/components/admin/pin-modal";
import { cn } from "@/lib/utils";

interface Props {
  tournamentId: string;
  tournamentStatus: string;
  approvedCount: number;
  currentRound: number;
  totalRounds: number;
  pendingMatches: number;
}

export function DashboardActions({
  tournamentId,
  tournamentStatus,
  approvedCount,
  currentRound,
  totalRounds,
  pendingMatches,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinPending, setPinPending] = useState<{ key: string; fn: () => Promise<void>; label: string } | null>(null);

  async function apiCall(endpoint: string, method = "POST", body?: object) {
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Request failed");
    return data;
  }

  async function handleAction(key: string, fn: () => Promise<void>) {
    setLoading(key);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  function requirePin(key: string, label: string, fn: () => Promise<void>) {
    setPinPending({ key, fn, label });
    setPinOpen(true);
  }

  async function onPinSuccess() {
    if (!pinPending) return;
    await handleAction(pinPending.key, pinPending.fn);
    setPinPending(null);
  }

  const canGenerate =
    (tournamentStatus === "REGISTRATION_OPEN" || tournamentStatus === "REGISTRATION_CLOSED") &&
    approvedCount >= 2;

  const canAdvance =
    tournamentStatus === "IN_PROGRESS" && pendingMatches === 0 && currentRound < totalRounds;

  const canPause = tournamentStatus === "IN_PROGRESS";
  const canResume = tournamentStatus === "PAUSED";

  const actions = [
    {
      key: "generate",
      label: "Generate Bracket",
      icon: <Shuffle className="w-4 h-4" />,
      desc: `${approvedCount} approved players`,
      disabled: !canGenerate,
      variant: "yellow" as const,
      fn: async () => {
        await apiCall("/api/tournament/generate", "POST", { tournamentId });
        toast.success("🎮 Bracket generated! Tournament is live.");
      },
    },
    {
      key: "advance",
      label: "Advance to Next Round",
      icon: <ChevronRight className="w-4 h-4" />,
      desc: pendingMatches === 0 ? "All matches done" : `${pendingMatches} matches pending`,
      disabled: !canAdvance,
      variant: "primary" as const,
      fn: async () => {
        await apiCall("/api/tournament/advance", "POST", { tournamentId });
        toast.success("🏆 Next round generated!");
      },
    },
    {
      key: "pause",
      label: canResume ? "Resume Tournament" : "Pause Tournament",
      icon: canResume ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />,
      desc: "Toggle tournament state",
      disabled: !canPause && !canResume,
      variant: "secondary" as const,
      fn: async () => {
        await apiCall("/api/tournament/pause", "POST", { tournamentId });
        toast.success(canResume ? "Tournament resumed" : "Tournament paused");
      },
    },
    {
      key: "export",
      label: "Export Data",
      icon: <Download className="w-4 h-4" />,
      desc: "CSV download",
      disabled: false,
      variant: "ghost" as const,
      fn: async () => {
        window.location.href = "/api/export";
      },
    },
  ];

  const PIN_PROTECTED = new Set(["generate", "advance"]);

  return (
    <>
    <PinModal
      open={pinOpen}
      onClose={() => { setPinOpen(false); setPinPending(null); }}
      onSuccess={onPinSuccess}
      action={pinPending?.label ?? "this action"}
    />
    <div className="space-y-2">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={() => {
            if (action.disabled) return;
            if (PIN_PROTECTED.has(action.key)) {
              requirePin(action.key, action.label, action.fn);
            } else {
              handleAction(action.key, action.fn);
            }
          }}
          disabled={action.disabled || loading === action.key}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200",
            action.disabled
              ? "opacity-40 cursor-not-allowed bg-dark-700/40 border-dark-600"
              : action.variant === "yellow"
              ? "bg-brand-yellow/10 border-brand-yellow/30 hover:bg-brand-yellow/20 text-brand-yellow hover:border-brand-yellow/50"
              : action.variant === "primary"
              ? "bg-brand-blue/10 border-brand-blue/30 hover:bg-brand-blue/20 text-brand-blue-light hover:border-brand-blue/50"
              : "bg-dark-700/60 border-dark-500 hover:bg-dark-600 text-gray-300 hover:text-white hover:border-dark-400"
          )}
        >
          <div
            className={cn(
              "p-1.5 rounded-lg",
              action.disabled ? "bg-dark-600" :
              action.variant === "yellow" ? "bg-brand-yellow/20" :
              action.variant === "primary" ? "bg-brand-blue/20" : "bg-dark-600"
            )}
          >
            {loading === action.key ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              action.icon
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{action.label}</div>
            <div className="text-xs text-gray-600 truncate">{action.desc}</div>
          </div>
        </button>
      ))}
    </div>
    </>
  );
}
