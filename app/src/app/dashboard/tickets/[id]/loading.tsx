import { Skeleton } from "@/components/ui/skeleton";

export default function TicketDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="ml-auto h-6 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content - messages */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-xl border border-[#DFE2E6] bg-white p-6 dark:border-[#222429] dark:bg-[#111316]">
            <Skeleton className="h-5 w-28" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}>
                  <div className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? "" : "items-end"}`}>
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-16 w-64 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
            {/* Message input */}
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ticket details */}
          <div className="rounded-xl border border-[#DFE2E6] bg-white p-5 dark:border-[#222429] dark:bg-[#111316]">
            <Skeleton className="h-5 w-24" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* Driver info */}
          <div className="rounded-xl border border-[#DFE2E6] bg-white p-5 dark:border-[#222429] dark:bg-[#111316]">
            <Skeleton className="h-5 w-20" />
            <div className="mt-4 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
