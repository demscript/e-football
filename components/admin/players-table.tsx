"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search, CheckCircle, XCircle, Trash2, Edit,
  Filter, ChevronDown, ShieldX,
} from "lucide-react";
import type { Player } from "@prisma/client";
import { Badge, ConsoleBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { timeAgo } from "@/lib/utils";

type PlayerWithCount = Player & { _count: { wonMatches: number } };

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DISQUALIFIED", label: "Disqualified" },
];

const CONSOLE_FILTER_OPTIONS = [
  { value: "", label: "All Consoles" },
  { value: "PS5", label: "PS5" },
  { value: "PS4", label: "PS4" },
  { value: "PC", label: "PC" },
  { value: "MOBILE", label: "Mobile" },
];

export function PlayersTable({ players }: { players: PlayerWithCount[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [consoleFilter, setConsoleFilter] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [editPlayer, setEditPlayer] = useState<PlayerWithCount | null>(null);
  const [editName, setEditName] = useState("");
  const [editTag, setEditTag] = useState("");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.gamerTag.toLowerCase().includes(q) ||
        p.playerId.toLowerCase().includes(q) ||
        p.phone.includes(q);
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesConsole = !consoleFilter || p.console === consoleFilter;
      return matchesSearch && matchesStatus && matchesConsole;
    });
  }, [players, search, statusFilter, consoleFilter]);

  async function updateStatus(id: string, status: string) {
    setLoading(id + status);
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Player ${status.toLowerCase()}`);
      router.refresh();
    } catch {
      toast.error("Failed to update player status");
    } finally {
      setLoading(null);
    }
  }

  async function deletePlayer(id: string) {
    if (!confirm("Remove this player from the tournament?")) return;
    setLoading(id + "delete");
    try {
      const res = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Player removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove player");
    } finally {
      setLoading(null);
    }
  }

  async function saveEdit() {
    if (!editPlayer) return;
    setLoading("edit");
    try {
      const res = await fetch(`/api/players/${editPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: editName, gamerTag: editTag }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Player updated");
      setEditPlayer(null);
      router.refresh();
    } catch {
      toast.error("Failed to update player");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-dark-600 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-700/80 border border-dark-500 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-brand-blue/50 cursor-pointer"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={consoleFilter}
              onChange={(e) => setConsoleFilter(e.target.value)}
              className="bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-brand-blue/50 cursor-pointer"
            >
              {CONSOLE_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Count */}
        <div className="px-5 py-2 bg-dark-700/20 border-b border-dark-600">
          <span className="text-xs text-gray-500">
            Showing <span className="text-white font-semibold">{filtered.length}</span> of {players.length} players
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-600">
                {["Player ID", "Gamer Tag", "Full Name", "Phone", "Console", "Status", "Wins", "Joined", "Actions"].map(
                  (h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/40">
              <AnimatePresence>
                {filtered.map((player) => (
                  <motion.tr
                    key={player.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 font-semibold">
                      {player.playerId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue-light text-xs font-bold flex-shrink-0">
                          {player.gamerTag.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{player.gamerTag}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">{player.fullName}</td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{player.phone}</td>
                    <td className="px-5 py-3.5">
                      <ConsoleBadge console={player.console} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="status" status={player.status}>
                        {player.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-white">
                      {player._count.wonMatches}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                      {timeAgo(player.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {player.status === "PENDING" && (
                          <>
                            <ActionBtn
                              onClick={() => updateStatus(player.id, "APPROVED")}
                              loading={loading === player.id + "APPROVED"}
                              color="green"
                              icon={<CheckCircle className="w-3.5 h-3.5" />}
                              title="Approve"
                            />
                            <ActionBtn
                              onClick={() => updateStatus(player.id, "REJECTED")}
                              loading={loading === player.id + "REJECTED"}
                              color="red"
                              icon={<XCircle className="w-3.5 h-3.5" />}
                              title="Reject"
                            />
                          </>
                        )}
                        {player.status === "APPROVED" && (
                          <ActionBtn
                            onClick={() => updateStatus(player.id, "DISQUALIFIED")}
                            loading={loading === player.id + "DISQUALIFIED"}
                            color="orange"
                            icon={<ShieldX className="w-3.5 h-3.5" />}
                            title="Disqualify"
                          />
                        )}
                        <ActionBtn
                          onClick={() => {
                            setEditPlayer(player);
                            setEditName(player.fullName);
                            setEditTag(player.gamerTag);
                          }}
                          loading={false}
                          color="blue"
                          icon={<Edit className="w-3.5 h-3.5" />}
                          title="Edit"
                        />
                        <ActionBtn
                          onClick={() => deletePlayer(player.id)}
                          loading={loading === player.id + "delete"}
                          color="red"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          title="Remove"
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-600">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No players found matching your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={!!editPlayer}
        onClose={() => setEditPlayer(null)}
        title="Edit Player"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="Gamer Tag"
            value={editTag}
            onChange={(e) => setEditTag(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={saveEdit} loading={loading === "edit"} className="flex-1">
              Save Changes
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditPlayer(null)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function ActionBtn({
  onClick, loading, color, icon, title,
}: {
  onClick: () => void;
  loading: boolean;
  color: "green" | "red" | "blue" | "orange";
  icon: React.ReactNode;
  title: string;
}) {
  const colors = {
    green: "hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30",
    red: "hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30",
    blue: "hover:bg-brand-blue/10 hover:text-brand-blue-light hover:border-brand-blue/30",
    orange: "hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      className={`p-1.5 rounded-lg border border-transparent text-gray-600 transition-all ${colors[color]} disabled:opacity-40`}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
    </button>
  );
}
