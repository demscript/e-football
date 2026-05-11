export default function TournamentLoading() {
  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header skeleton */}
      <header className="border-b border-dark-600 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-4 bg-dark-600 rounded animate-pulse" />
            <div className="h-4 w-px bg-dark-500" />
            <div className="w-28 h-4 bg-dark-600 rounded animate-pulse" />
          </div>
          <div className="w-24 h-6 bg-dark-600 rounded-full animate-pulse" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-64 h-8 bg-dark-700 rounded-lg animate-pulse" />
            <div className="w-48 h-4 bg-dark-700/60 rounded animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="w-28 h-10 bg-dark-700 rounded-xl animate-pulse" />
            <div className="w-36 h-10 bg-dark-700 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Bracket skeleton */}
        <div className="space-y-4">
          <div className="w-40 h-5 bg-dark-700 rounded animate-pulse" />
          <div className="rounded-2xl border border-dark-500/60 bg-dark-900 p-8" style={{ minHeight: 480 }}>
            <div className="space-y-6">
              <div className="w-32 h-7 bg-dark-700 rounded-full animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-dark-500/50 bg-dark-800/60 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-dark-600 animate-pulse" />
                      <div className="flex-1 h-3 bg-dark-600 rounded animate-pulse" />
                    </div>
                    <div className="h-px bg-dark-600/60" />
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-dark-600 animate-pulse" />
                      <div className="flex-1 h-3 bg-dark-600 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
