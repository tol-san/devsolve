export default function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden>
      <div className="h-32 rounded-2xl bg-muted" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="h-80 rounded-2xl bg-muted md:order-2 md:h-88" />
        <div className="h-80 rounded-2xl bg-muted md:order-1" />
        <div className="h-80 rounded-2xl bg-muted md:order-3" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted" />
        ))}
      </div>

      <div className="space-y-px overflow-hidden rounded-2xl bg-border">
        <div className="h-12 bg-muted" />
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-16 bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
