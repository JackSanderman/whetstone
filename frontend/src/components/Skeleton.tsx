export function Bar({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} />;
}

export function BenchSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,0.9fr)]" aria-hidden>
      <div className="raised bevel rounded-md p-6">
        <Bar className="h-3 w-28" />
        <Bar className="mt-5 h-40 w-40" />
        <Bar className="mt-6 h-3 w-full" />
        <Bar className="mt-2 h-3 w-3/4" />
      </div>
      <div className="space-y-3">
        <Bar className="h-16 w-full" />
        <Bar className="h-16 w-full" />
        <Bar className="h-16 w-2/3" />
      </div>
    </div>
  );
}

export function LineageSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <Bar key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
