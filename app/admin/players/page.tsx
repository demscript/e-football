export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { PlayersTable } from "@/components/admin/players-table";
import { Users, UserCheck, Clock, UserX } from "lucide-react";

async function getPlayers() {
  return prisma.player.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { wonMatches: true } },
    },
  });
}

export default async function PlayersPage() {
  const players = await getPlayers();

  const stats = {
    total: players.length,
    approved: players.filter((p) => p.status === "APPROVED").length,
    pending: players.filter((p) => p.status === "PENDING").length,
    rejected: players.filter((p) => p.status === "REJECTED" || p.status === "DISQUALIFIED").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Players</h1>
        <p className="text-gray-500 text-sm mt-1">Manage tournament registrations and approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Users className="w-4 h-4" />, label: "Total", value: stats.total, color: "text-white" },
          { icon: <UserCheck className="w-4 h-4" />, label: "Approved", value: stats.approved, color: "text-green-400" },
          { icon: <Clock className="w-4 h-4" />, label: "Pending", value: stats.pending, color: "text-yellow-400" },
          { icon: <UserX className="w-4 h-4" />, label: "Rejected", value: stats.rejected, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-dark-500/50 bg-dark-800/60 flex items-center gap-3">
            <div className={`${s.color} opacity-70`}>{s.icon}</div>
            <div>
              <div className={`text-xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <PlayersTable players={players as never} />
    </div>
  );
}
