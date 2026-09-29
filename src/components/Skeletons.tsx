export function SkeletonCard() {
  return (
    <div className="shrink-0 w-36 h-52 sm:w-40 sm:h-60">
      <div className="skeleton w-full h-full rounded-xl" />
    </div>
  );
}

export function SkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <div className="px-6 lg:px-12 py-4 flex gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="h-[70vh] min-h-[480px] w-full">
      <div className="skeleton w-full h-full" />
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="pt-16">
      <div className="skeleton w-full h-[50vh]" />
      <div className="px-6 lg:px-12 -mt-20 relative">
        <div className="flex gap-6">
          <div className="skeleton w-48 h-72 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3 mt-8">
            <div className="skeleton h-8 w-2/3 rounded-lg" />
            <div className="skeleton h-4 w-1/3 rounded-lg" />
            <div className="skeleton h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
