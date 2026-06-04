import { CourseSidebarSkeleton } from "./course-sidebar-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignmentDashboardSkeleton } from "./assignment-dashboard-skeleton";
import { GlassContainer } from "@/components/glass-container";
import {
  BookMarked,
  CheckCircle2,
  ClipboardList,
  Megaphone,
} from "lucide-react";

export function DashboardSkeleton() {
  return (
    <>
      {/* Mobile: Tabs */}
      <div className="p-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] md:hidden">
        <Tabs defaultValue="assignments" className="w-full">
          <TabsContent value="courses" className="min-w-0" />
          <TabsContent value="assignments" className="min-w-0">
            <AssignmentDashboardSkeleton />
          </TabsContent>
          <TabsContent value="completed" className="min-w-0" />
          <TabsContent value="announcements" className="min-w-0" />
          <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-40 px-4">
            <GlassContainer className="mx-auto w-full max-w-xl p-1.5">
              <TabsList className="scrollbar-hide flex h-9 w-full justify-start gap-1 overflow-x-auto overflow-y-hidden bg-transparent p-0">
                <TabsTrigger
                  value="courses"
                  className="h-9 min-w-max shrink-0 rounded-lg border-0 px-4 text-sm"
                  disabled
                >
                  <BookMarked className="size-4" />
                  Courses
                </TabsTrigger>
                <TabsTrigger
                  value="assignments"
                  className="h-9 min-w-max shrink-0 border-0 px-4 text-sm"
                >
                  <ClipboardList className="size-4" />
                  Assignments
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="h-9 min-w-max shrink-0 border-0 px-4 text-sm"
                >
                  <CheckCircle2 className="size-4" />
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="announcements"
                  className="h-9 min-w-max shrink-0 border-0 px-4 text-sm"
                >
                  <Megaphone className="size-4" />
                  Announcements
                </TabsTrigger>
              </TabsList>
            </GlassContainer>
          </div>
        </Tabs>
      </div>

      {/* Desktop: Sidebar + Assignments */}
      <div className="hidden min-h-screen grid-cols-[320px_minmax(0,1fr)] gap-4 p-4 md:grid">
        <CourseSidebarSkeleton />
        <main className="min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            <Tabs defaultValue="assignments" className="w-full">
              <GlassContainer className="mb-4 w-full p-0">
                <TabsList className="w-full bg-inherit">
                  <TabsTrigger value="assignments" className="flex-1 border-0">
                    <ClipboardList className="size-4" />
                    Assignments
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1 border-0">
                    <CheckCircle2 className="size-4" />
                    Completed
                  </TabsTrigger>
                  <TabsTrigger
                    value="announcements"
                    className="flex-1 border-0"
                  >
                    <Megaphone className="size-4" />
                    Announcements
                  </TabsTrigger>
                </TabsList>
              </GlassContainer>
              <TabsContent value="assignments" className="min-w-0">
                <AssignmentDashboardSkeleton />
              </TabsContent>
              <TabsContent value="completed" className="min-w-0" />
              <TabsContent value="announcements" className="min-w-0" />
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
}
