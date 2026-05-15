import { ChevronDown, RotateCw } from "lucide-react";
import { GlassContainer } from "@/components/glass-container";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentSkeleton } from "./assignment-skeleton";

export function AssignmentDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Refresh button */}
      <div>
        <Skeleton className="glass-border bg-glass/10 flex w-fit items-center gap-2 rounded-md px-3 py-1">
          <RotateCw className="h-4 w-4 opacity-0" />
          <span className="text-sm opacity-0">Refresh</span>
        </Skeleton>
      </div>

      {/* Menubar controls */}
      <div className="glass-border bg-glass/10 flex items-center gap-1.5 rounded-lg px-2 py-3">
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-7 w-24 rounded-md" />
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
