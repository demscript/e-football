export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import { timeAgo } from "@/lib/utils";

async function getLogs() {
  return prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export default async function LogsPage() {
  const logs = await getLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Audit Logs</h1>
        <p className="text-gray-500 text-sm mt-1">All admin actions are recorded here</p>
      </div>

      <div className="rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-bold text-white text-sm">{logs.length} recent actions</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-gray-600 text-sm">No audit logs yet</div>
        ) : (
          <div className="divide-y divide-dark-600/40">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-dark-700/20 transition-colors">
                <div className="w-2 h-2 rounded-full bg-brand-blue flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{log.action}</span>
                    <span className="text-xs text-gray-600">on</span>
                    <span className="text-xs font-mono text-brand-blue-light">{log.entity}</span>
                    {log.entityId && (
                      <span className="text-xs font-mono text-gray-600 truncate max-w-[100px]">
                        {log.entityId}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">{log.user.name ?? log.user.email}</div>
                </div>
                <div className="text-xs text-gray-600 flex-shrink-0">{timeAgo(log.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
