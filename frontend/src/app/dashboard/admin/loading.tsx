export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-surface-2 mb-3" />
            <div className="h-6 w-20 bg-surface-2 rounded mb-2" />
            <div className="h-3 w-28 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="glass rounded-2xl p-6">
        <div className="h-5 w-40 bg-surface-2 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-2" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-surface-2 rounded mb-2" />
                <div className="h-3 w-32 bg-surface-2 rounded" />
              </div>
              <div className="h-6 w-20 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
