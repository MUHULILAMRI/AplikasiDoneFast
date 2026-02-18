export default function JokiLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-surface-2 mb-3" />
            <div className="h-6 w-20 bg-surface-2 rounded mb-2" />
            <div className="h-3 w-28 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="h-5 w-32 bg-surface-2 rounded mb-4" />
          <div className="h-40 bg-surface-2 rounded-xl" />
        </div>
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="h-5 w-32 bg-surface-2 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-surface-2 rounded-xl h-24" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
