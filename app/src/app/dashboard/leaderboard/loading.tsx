import { Skeleton } from "@/components/ui/skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 py-6">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-28 rounded-t-lg" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-32 w-28 rounded-t-lg" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-20 w-28 rounded-t-lg" />
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-[#DFE2E6] bg-white dark:border-[#222429] dark:bg-[#111316]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#DFE2E6] px-5 py-3 last:border-0 dark:border-[#222429]"
          >
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
