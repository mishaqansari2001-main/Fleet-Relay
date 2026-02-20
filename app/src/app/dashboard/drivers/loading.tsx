import { Skeleton } from "@/components/ui/skeleton";

export default function DriversLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Driver cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#DFE2E6] bg-white p-5 dark:border-[#222429] dark:bg-[#111316]"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-1 h-5 w-8" />
              </div>
              <div>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-1 h-5 w-8" />
              </div>
              <div>
                <Skeleton className="h-3 w-12" />
                <Skeleton className="mt-1 h-5 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
