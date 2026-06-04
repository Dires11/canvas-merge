import { BookMarked, ChevronDown, CircleUser, RotateCw, School, Search } from "lucide-react";
import { GlassContainer } from "@/components/glass-container";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentSkeleton } from "./assignment-skeleton";

export function AssignmentDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="glass-border bg-glass/10 flex flex-col gap-2 rounded-xl p-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <Skeleton className="relative h-9 min-w-0 flex-1 rounded-md border border-white/10 bg-background/20">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-0" />
          </Skeleton>

          <div className="flex shrink-0 items-center gap-1">
            <Skeleton className="flex size-9 items-center justify-center rounded-md border border-white/10 bg-background/20 sm:w-28">
              <School className="size-4 opacity-0" />
            </Skeleton>
            <Skeleton className="flex size-9 items-center justify-center rounded-md border border-white/10 bg-background/20 sm:w-30">
              <CircleUser className="size-4 opacity-0" />
            </Skeleton>
            <Skeleton className="flex size-9 items-center justify-center rounded-md border border-white/10 bg-background/20 sm:w-26">
              <BookMarked className="size-4 opacity-0" />
            </Skeleton>
          </div>

          <Skeleton className="flex size-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-background/20 sm:w-24">
            <RotateCw className="size-4 opacity-0" />
          </Skeleton>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(5.75rem,1fr))] gap-1.5 px-1 sm:flex sm:flex-wrap sm:items-center">
          <Skeleton className="h-7 w-full rounded-md sm:w-16" />
          <Skeleton className="h-7 w-full rounded-md sm:w-22" />
          <Skeleton className="h-7 w-full rounded-md sm:w-24" />
          <Skeleton className="h-7 w-full rounded-md sm:w-24" />
          <Skeleton className="h-7 w-full rounded-md sm:w-28" />
        </div>
      </div>

      {/* Domain group */}
      <GlassContainer className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-60" />
          <ChevronDown className="h-5 w-5 opacity-30" />
        </div>
        <div className="mt-2">
          <Skeleton className="mb-2 h-5 w-24" />
          <div className="flex flex-col gap-1.5">
            <AssignmentSkeleton />
            <AssignmentSkeleton />
            <AssignmentSkeleton />
            <AssignmentSkeleton />
          </div>
        </div>
      </GlassContainer>
    </div>
  );
}
