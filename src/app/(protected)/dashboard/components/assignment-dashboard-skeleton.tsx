import { ChevronDown } from "lucide-react";
import { GlassContainer } from "@/components/glass-container";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignmentSkeleton } from "./assignment-skeleton";

export function AssignmentDashboardSkeleton() {
  return (
    <GlassContainer className="flex w-full flex-col gap-2">
      <h1 className="flex items-center justify-between">
        <Skeleton className="h-6 w-60 animate-pulse" />
        <ChevronDown className="h-5 w-5 transition-transform" />
      </h1>
      <div className="mt-2">
        <Skeleton className="mb-2 h-5 w-24 animate-pulse" />
        <div className="flex flex-col gap-2">
          <AssignmentSkeleton />
          <AssignmentSkeleton />
          <AssignmentSkeleton />
          <AssignmentSkeleton />
        </div>
      </div>
    </GlassContainer>
  );
}
