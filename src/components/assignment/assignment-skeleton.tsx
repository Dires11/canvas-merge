import { GlassContainer } from "../glass-container";
import { Skeleton } from "../ui/skeleton";

export function AssignmentSkeleton() {
  return (
    <GlassContainer className="flex h-24 w-full animate-pulse items-center justify-between gap-4 overflow-hidden md:h-28">
      <Skeleton className="size-20 shrink-0 rounded-2xl" />
      <div className="w-fit flex-1 gap-2 self-start">
        <Skeleton className="mb-2 h-2 w-48" />
        <Skeleton className="mb-2 h-3 w-64" />
        <Skeleton className="h-2 w-32 md:hidden" />
      </div>
      <div className="flex flex-col items-end justify-center gap-2">
        <Skeleton className="hidden h-4 w-3 md:block" />
        <Skeleton className="hidden h-3 w-16 md:block" />
      </div>
    </GlassContainer>
  );
}
