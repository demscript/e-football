import type { Player } from "@prisma/client";
import { Badge, ConsoleBadge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export function RecentActivity({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return (
      <div className="py-12 text-center text-gray-600">
        <p className="text-sm">No registrations yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-dark-600/50">
      {players.map((player) => (
        <div key={player.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-dark-700/30 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue-light font-bold text-sm flex-shrink-0">
            {player.gamerTag.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm truncate">{player.gamerTag}</span>
              <span className="text-xs text-gray-600 font-mono">{player.playerId}</span>
            </div>
            <div className="text-xs text-gray-500 truncate">{player.fullName}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ConsoleBadge console={player.console} />
            <Badge variant="status" status={player.status}>
              {player.status}
            </Badge>
          </div>
          <div className="text-xs text-gray-600 flex-shrink-0 hidden sm:block">
            {timeAgo(player.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
