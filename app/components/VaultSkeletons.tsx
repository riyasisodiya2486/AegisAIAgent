"use client";

export function VaultMetricsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/2 p-4">
            <div className="h-3 w-16 bg-white/10 rounded mb-2" />
            <div className="h-6 w-24 bg-white/20 rounded" />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl border border-white/5 bg-white/2 p-6 space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-3 w-32 bg-white/10 rounded" />
            <div className="h-7 w-48 bg-white/20 rounded" />
          </div>
          <div className="h-4 w-12 bg-white/10 rounded" />
        </div>

        <div className="space-y-2">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-white/10 rounded-full" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function VaultFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
        </div>
      ))}
      <div className="h-12 w-full bg-white/20 rounded-xl mt-4" />
    </div>
  );
}