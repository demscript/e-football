export default function BracketLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="w-40 h-7 bg-dark-700 rounded-lg animate-pulse" />
        <div className="w-36 h-9 bg-dark-700 rounded-xl animate-pulse" />
      </div>
      <div className="rounded-2xl border border-dark-500/60 bg-dark-900 p-8" style={{ minHeight: 500 }}>
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
  );
}
