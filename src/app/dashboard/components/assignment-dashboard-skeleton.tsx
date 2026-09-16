import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentListSkeleton } from "./assignment-skeleton";

export function AssignmentDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="glass-border bg-glass/10 flex flex-col gap-2 rounded-xl p-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 min-w-0 flex-1 rounded-full" />
          {["sm:w-24", "sm:w-26", "sm:w-24", "sm:w-22"].map((width, index) => (
            <Skeleton key={index} className={`size-8 shrink-0 rounded-full ${width}`} />
          ))}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 px-1 py-1 sm:flex-nowrap sm:overflow-hidden">
          <Skeleton className="h-8 w-40 shrink-0 rounded-full sm:w-64" />
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-22 rounded-full" />
            <Skeleton className="h-7 w-22 rounded-full" />
            <span className="bg-foreground/10 mx-1 h-5 w-px" />
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Skeleton className="h-7 w-8 rounded-full sm:w-10" />
            <Skeleton className="h-7 w-14 rounded-full sm:w-20" />
            <Skeleton className="h-7 w-12 rounded-full sm:w-22" />
            <Skeleton className="hidden h-7 w-24 rounded-full sm:block" />
          </div>
        </div>
      </div>
      <AssignmentListSkeleton />
    </div>
  );
}
