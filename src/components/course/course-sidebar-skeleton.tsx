import { GlassContainer } from "../glass-container";
import { Skeleton } from "../ui/skeleton";
export function CourseSidebarSkeleton() {
  return (
    <aside className="sticky top-6 h-fit w-[320px] shrink-0">
      <GlassContainer className="ml-4 px-0">
        <h2 className="mb-4 px-4 text-xl tracking-wide">Courses </h2>

        <div className="sidebar-scroll max-h-[calc(100vh-120px)] overflow-y-auto px-2">
          <Skeleton className="mb-2 h-20 w-full animate-pulse rounded-xl" />
          <Skeleton className="mb-2 h-20 w-full animate-pulse rounded-xl" />
          <Skeleton className="mb-2 h-20 w-full animate-pulse rounded-xl" />
          <Skeleton className="mb-2 h-20 w-full animate-pulse rounded-xl" />
          <Skeleton className="mb-2 h-20 w-full animate-pulse rounded-xl" />
          <Skeleton className="mb-2 h-20 w-full animate-pulse rounded-xl" />
        </div>
      </GlassContainer>
    </aside>
  );
}
