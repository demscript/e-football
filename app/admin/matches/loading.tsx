export default function MatchesLoading() {
  return (
    <div className="space-y-6">
      <div className="w-32 h-7 bg-dark-700 rounded-lg animate-pulse" />
      <div className="rounded-2xl border border-dark-500/50 bg-dark-800/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="w-40 h-5 bg-dark-700 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-dark-600/40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-16 h-3 bg-dark-700 rounded animate-pulse" />
                <div className="w-20 h-6 bg-dark-600 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-10 bg-dark-700 rounded-xl animate-pulse" />
                <div className="w-8 h-4 bg-dark-600 rounded animate-pulse" />
                <div className="flex-1 h-10 bg-dark-700 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
