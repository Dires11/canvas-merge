import { CourseSidebarSkeleton } from "./course-sidebar-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignmentDashboardSkeleton } from "./assignment-dashboard-skeleton";
import { GlassContainer } from "@/components/glass-container";

export function DashboardSkeleton() {
  return (
    <>
      {/* Mobile: Tabs */}
      <div className="p-4 md:hidden">
        <Tabs defaultValue="assignments" className="w-full">
          <GlassContainer className="mb-4 w-full p-0">
            <TabsList className="w-full bg-inherit">
              <TabsTrigger
                value="courses"
                className="flex-1 rounded-lg border-0"
                disabled
              >
                Courses
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex-1 border-0">
                Assignments
              </TabsTrigger>
            </TabsList>
          </GlassContainer>

          <TabsContent value="courses" className="min-w-0" />
          <TabsContent value="assignments" className="min-w-0">
            <AssignmentDashboardSkeleton />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Sidebar + Assignments */}
      <div className="hidden min-h-screen grid-cols-[320px_minmax(0,1fr)] gap-4 p-4 md:grid">
        <CourseSidebarSkeleton />
        <main className="min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            <AssignmentDashboardSkeleton />
          </div>
        </main>
      </div>
    </>
  );
}
