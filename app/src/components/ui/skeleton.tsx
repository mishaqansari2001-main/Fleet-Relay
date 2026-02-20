import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-[#EEF0F2] dark:bg-[#18191E]", className)}
      {...props}
    />
  )
}

export { Skeleton }
