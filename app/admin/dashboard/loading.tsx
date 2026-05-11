export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="w-48 h-7 bg-dark-700 rounded-lg animate-pulse" />
        <div className="w-64 h-4 bg-dark-700/60 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-dark-500/50 bg-dark-800/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-20 h-3 bg-dark-600 rounded animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-dark-600 animate-pulse" />
            </div>
            <div className="w-16 h-8 bg-dark-600 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-dark-500/50 bg-dark-800/60 p-6 space-y-4">
            <div className="w-32 h-5 bg-dark-700 rounded animate-pulse" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-dark-600 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-32 h-3 bg-dark-600 rounded animate-pulse" />
                  <div className="w-20 h-2.5 bg-dark-700 rounded animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-dark-600 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
