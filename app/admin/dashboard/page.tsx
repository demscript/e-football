export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Users, Trophy, Swords, Activity, Clock, CheckCircle, XCircle, Zap } from "lucide-react";
import { StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardActions } from "@/components/admin/dashboard-actions";
import { RecentActivity } from "@/components/admin/recent-activity";
import { formatNaira } from "@/lib/utils";

async function getDashboardData() {
  const [
    totalPlayers,
    approvedPlayers,
    pendingPlayers,
    rejectedPlayers,
    tournament,
    recentPlayers,
    completedMatches,
    totalMatches,
  ] = await Promise.all([
    prisma.player.count(),
    prisma.player.count({ where: { status: "APPROVED" } }),
    prisma.player.count({ where: { status: "PENDING" } }),
    prisma.player.count({ where: { status: "REJECTED" } }),
    prisma.tournament.findFirst({
      include: {
        rounds: { include: { matches: true } },
      },
    }),
    prisma.player.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.match.count({ where: { status: "COMPLETED" } }),
    prisma.match.count(),
  ]);

  return {
    totalPlayers,
    approvedPlayers,
    pendingPlayers,
    rejectedPlayers,
    tournament,
    recentPlayers,
    completedMatches,
    totalMatches,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const currentRoundMatches =
    data.tournament?.rounds.find(
      (r) => r.roundNumber === data.tournament!.currentRound
    )?.matches ?? [];

  const pendingCurrentRound = currentRoundMatches.filter(
    (m) => m.status === "PENDING" || m.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">eFootball City Cup 2025 — Tournament Control</p>
        </div>
        <TournamentStatusBadge status={data.tournament?.status ?? "UPCOMING"} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Registered"
          value={data.totalPlayers}
          sub="All registrations"
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Approved Players"
          value={data.approvedPlayers}
          sub="Ready to play"
          color="green"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pending Approval"
          value={data.pendingPlayers}
          sub={data.pendingPlayers > 0 ? "Needs your attention" : "All clear"}
          color="yellow"
        />
        <StatCard
          icon={<Swords className="w-5 h-5" />}
          label="Matches Played"
          value={`${data.completedMatches}/${data.totalMatches || 0}`}
          sub="Completed / Total"
          color="purple"
        />
      </div>

      {/* Tournament info + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tournament info */}
        <div className="lg:col-span-2 rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-brand-yellow" />
              <h2 className="font-bold text-white">Tournament Status</h2>
            </div>
            {data.tournament && (
              <Badge variant="status" status={data.tournament.status}>
                {data.tournament.status.replace("_", " ")}
              </Badge>
            )}
          </div>
          <div className="p-6">
            {data.tournament ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Current Round",
                      value:
                        data.tournament.currentRound > 0
                          ? `Round ${data.tournament.currentRound}`
                          : "Not Started",
                    },
                    {
                      label: "Total Rounds",
                      value: data.tournament.totalRounds || "—",
                    },
                    {
                      label: "Pending Matches",
                      value: pendingCurrentRound,
                    },
                    {
                      label: "Prize Pool",
                      value: formatNaira(18000),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-3 rounded-xl bg-dark-700/60 border border-dark-500/40">
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className="font-bold text-white text-lg font-display">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Round progress */}
                {data.tournament.totalRounds > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Tournament Progress</span>
                      <span>
                        Round {data.tournament.currentRound} of {data.tournament.totalRounds}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-dark-600 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-blue-light transition-all duration-700"
                        style={{
                          width: `${(data.tournament.currentRound / data.tournament.totalRounds) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p>No tournament created yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-600 flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-yellow" />
            <h2 className="font-bold text-white">Quick Actions</h2>
          </div>
          <div className="p-4">
            <DashboardActions
              tournamentId={data.tournament?.id ?? "main-tournament"}
              tournamentStatus={data.tournament?.status ?? "UPCOMING"}
              approvedCount={data.approvedPlayers}
              currentRound={data.tournament?.currentRound ?? 0}
              totalRounds={data.tournament?.totalRounds ?? 0}
              pendingMatches={pendingCurrentRound}
            />
          </div>
        </div>
      </div>

      {/* Recent registrations */}
      <div className="rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-blue-light" />
            <h2 className="font-bold text-white">Recent Registrations</h2>
          </div>
          <a
            href="/admin/players"
            className="text-xs text-brand-blue-light hover:text-white transition-colors font-medium"
          >
            View all →
          </a>
        </div>
        <RecentActivity players={data.recentPlayers} />
      </div>
    </div>
  );
}

function TournamentStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: string }> = {
    UPCOMING: { label: "Upcoming", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
    REGISTRATION_OPEN: { label: "Registration Open", color: "text-green-400 bg-green-500/10 border-green-500/30" },
    IN_PROGRESS: { label: "Live", color: "text-brand-blue-light bg-brand-blue/10 border-brand-blue/30" },
    PAUSED: { label: "Paused", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
    COMPLETED: { label: "Completed", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  };
  const s = statusMap[status] ?? statusMap.UPCOMING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${s.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {s.label}
    </span>
  );
}
