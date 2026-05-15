import { Skeleton } from "@/components/ui/skeleton";

export function AssignmentSkeleton() {
  return (
    <div className="glass-border flex items-stretch gap-4 overflow-hidden rounded-2xl">
      <Skeleton className="w-12 shrink-0 self-stretch rounded-none rounded-l-2xl md:w-16" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-2 md:py-3">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2.5 w-28 md:hidden" />
        <div className="mt-1 flex gap-1.5">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
      <div className="hidden flex-none flex-col items-end justify-center gap-2 pr-2 md:flex">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
