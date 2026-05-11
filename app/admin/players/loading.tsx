export default function PlayersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="w-24 h-7 bg-dark-700 rounded-lg animate-pulse" />
          <div className="w-40 h-4 bg-dark-700/60 rounded animate-pulse" />
        </div>
        <div className="w-32 h-9 bg-dark-700 rounded-xl animate-pulse" />
      </div>
      <div className="rounded-2xl border border-dark-500/50 bg-dark-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600 flex gap-3">
          <div className="flex-1 h-9 bg-dark-700 rounded-xl animate-pulse" />
          <div className="w-28 h-9 bg-dark-700 rounded-xl animate-pulse" />
        </div>
        <div className="divide-y divide-dark-600/40">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-dark-600 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="w-32 h-3.5 bg-dark-600 rounded animate-pulse" />
                <div className="w-20 h-3 bg-dark-700 rounded animate-pulse" />
              </div>
              <div className="w-20 h-6 bg-dark-600 rounded-full animate-pulse" />
              <div className="w-16 h-8 bg-dark-700 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
