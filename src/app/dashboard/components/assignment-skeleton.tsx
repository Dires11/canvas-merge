import { GlassContainer } from "@/components/glass-container";
import { Skeleton } from "@/components/ui/skeleton";

const placeholder = "bg-foreground/10 motion-reduce:animate-none";

export function AssignmentSkeleton() {
  return (
    <div className="glass-border glass-card-rim relative flex items-stretch gap-4 overflow-hidden rounded-2xl">
      <div className="bg-foreground/5 flex shrink-0 items-center justify-center px-2 md:px-5">
        <Skeleton className={`${placeholder} size-9 rounded-xl lg:size-10`} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-2 md:py-3">
        <Skeleton className={`${placeholder} my-1 h-2.5 w-3/4 max-w-lg`} />
        <Skeleton className={`${placeholder} my-1 h-4 w-4/5 max-w-sm lg:h-5`} />
        <Skeleton className={`${placeholder} mt-1 h-3 w-28 md:hidden`} />
        <div className="mt-2 flex min-w-0 items-center gap-1.5 overflow-hidden py-0.5">
          {[0, 1, 2, 3].map((avatar) => (
            <Skeleton key={avatar} className={`${placeholder} size-8 shrink-0 rounded-full`} />
          ))}
        </div>
      </div>
      <div className="hidden shrink-0 flex-col items-end justify-center gap-2 pr-2 md:flex">
        <Skeleton className={`${placeholder} h-4 w-12`} />
        <Skeleton className={`${placeholder} h-3 w-32`} />
      </div>
    </div>
  );
}

/** Shared by route loading and date-range refreshes. */
export function AssignmentListSkeleton({ showDateGroups = true }: { showDateGroups?: boolean }) {
  return (
    <GlassContainer aria-hidden="true" className="flex w-full flex-col gap-2 rounded-2xl">
      <div className="flex h-7 items-center justify-between">
        <Skeleton className={`${placeholder} h-5 w-20`} />
        <Skeleton className={`${placeholder} size-4 rounded-full`} />
      </div>
      {[2, 1].map((count, group) => (
        <div key={group} className="mt-1">
          {showDateGroups && <Skeleton className={`${placeholder} mb-2 h-5 w-28`} />}
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: count }, (_, index) => <AssignmentSkeleton key={index} />)}
          </div>
        </div>
      ))}
    </GlassContainer>
  );
}
