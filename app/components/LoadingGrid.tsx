export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/5 bg-white/3 p-5 space-y-3 animate-pulse"
        >
          <div className="h-3 w-20 bg-white/8 rounded" />
          <div className="h-7 w-24 bg-white/6 rounded" />
        </div>
      ))}
    </div>
  );
}