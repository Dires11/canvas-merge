import { CourseSidebarSkeleton } from "../course/course-sidebar-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AssignmentDashboardSkeleton } from "../assignment/dashboard-skeleton";

export function DashboardSkeleton() {
  return (
    <>
      {/* ✅ Mobile: Tabs */}
      <div className="p-4 md:hidden">
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="mb-4 w-full" variant="line">
            <TabsTrigger value="courses" className="flex-1" disabled={true}>
              Courses
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex-1">
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="min-w-0"></TabsContent>
          <TabsContent value="assignments" className="min-w-0">
            <button className="mb-2 rounded-md border px-3 py-1">
              Refresh
            </button>
            <AssignmentDashboardSkeleton />
          </TabsContent>
        </Tabs>
      </div>

      {/* ✅ Desktop: Sidebar + Assignments */}
      <div className="hidden min-h-screen grid-cols-[320px_minmax(0,1fr)] gap-4 p-4 md:grid">
        <CourseSidebarSkeleton />
        <main className="min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            <button className="mb-2 rounded-md border px-3 py-1">
              Refresh
            </button>
            <AssignmentDashboardSkeleton />
          </div>
        </main>
      </div>
    </>
  );
}
