import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePlayerId(count: number): string {
  const padded = String(count).padStart(3, "0");
  return `EFB-${padded}`;
}

export function getRoundName(totalPlayers: number, roundNumber: number): string {
  const playersInRound = Math.pow(2, Math.ceil(Math.log2(totalPlayers)) - roundNumber + 1);
  if (playersInRound === 2) return "Grand Final";
  if (playersInRound === 4) return "Semi Finals";
  if (playersInRound === 8) return "Quarter Finals";
  if (playersInRound === 16) return "Round of 16";
  if (playersInRound === 32) return "Round of 32";
  if (playersInRound === 64) return "Round of 64";
  return `Round ${roundNumber}`;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function getConsoleLabel(console: string): string {
  const map: Record<string, string> = {
    PS4: "PlayStation 4",
    PS5: "PlayStation 5",
    PC: "PC",
    MOBILE: "Mobile",
  };
  return map[console] ?? console;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    APPROVED: "text-green-400 bg-green-400/10 border-green-400/30",
    REJECTED: "text-red-400 bg-red-400/10 border-red-400/30",
    DISQUALIFIED: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    IN_PROGRESS: "text-blue-400 bg-blue-400/10 border-blue-400/30",
    COMPLETED: "text-purple-400 bg-purple-400/10 border-purple-400/30",
    UPCOMING: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
    WALKOVER: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  };
  return map[status] ?? "text-gray-400 bg-gray-400/10";
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
