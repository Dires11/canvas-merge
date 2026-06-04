"use client";

import { useState } from "react";
import type { UserCourse, UserPlanner } from "@/lib/types";
import { CourseSidebar } from "./course-sidebar";
import { AssignmentDashboardClient } from "./assignment-dashboard-client";
import { updateCourseColor } from "@/app/actions/course-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseTab } from "./course-tab";
import { useRouter } from "next/navigation";
import { GlassContainer } from "@/components/glass-container";
import type { CanvasDomainInfo } from "@/lib/types";
type CourseColor = UserCourse["color"];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "";
}

export function DashboardClient({
  initialCourses,
  plannerData,
  completedPlannerData,
  domainsData,
}: {
  initialCourses: UserCourse[];
  plannerData: UserPlanner | null;
  completedPlannerData: UserPlanner | null;
  domainsData: CanvasDomainInfo[];
}) {
  const [courses, setCourses] = useState<UserCourse[]>(initialCourses);
  const router = useRouter();

  const handleColorChange = async (
    courseId: number,
    domainSlug: string,
    newColor: CourseColor,
  ) => {
    const prevCourses = courses;

    // optimistic UI
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId && c.domainSlug === domainSlug
          ? { ...c, color: newColor }
          : c,
      ),
    );

    // persist
    try {
      await updateCourseColor(courseId, domainSlug, newColor);
    } catch (error: unknown) {
      if (getErrorMessage(error).includes("UNAUTHORIZED")) {
        router.push("/auth/sign-in");
        return;
      }

      console.error("Failed to update course color:", error);
      setCourses(prevCourses); // rollback
    }
  };

  return (
    <>
      {/* Mobile: Tabs */}
      <div className="p-4 md:hidden">
        <Tabs defaultValue="assignments" className="w-full">
          <GlassContainer className="mb-4 w-full p-0">
            <TabsList className="w-full bg-inherit">
              <TabsTrigger
                value="courses"
                className=":bg-red-500 flex-1 rounded-lg border-0"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex-1 border-0">
                Assignments
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1 border-0">
                Completed
              </TabsTrigger>
            </TabsList>
          </GlassContainer>
          <TabsContent value="courses" className="min-w-0">
            <CourseTab courses={courses} onColorChange={handleColorChange} />
          </TabsContent>
          <TabsContent value="assignments" className="min-w-0">
            <AssignmentDashboardClient
              initialData={plannerData}
              courses={courses}
              domains={domainsData}
            />
          </TabsContent>
          <TabsContent value="completed" className="min-w-0">
            <AssignmentDashboardClient
              initialData={completedPlannerData}
              courses={courses}
              domains={domainsData}
              mode="completed"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Sidebar + Assignment Tabs */}
      <div className="hidden min-h-screen grid-cols-[320px_minmax(0,1fr)] gap-4 p-4 md:grid">
        <CourseSidebar courses={courses} onColorChange={handleColorChange} />
        <main className="min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            <Tabs defaultValue="assignments" className="w-full">
              <GlassContainer className="mb-4 w-full p-0">
                <TabsList className="w-full bg-inherit">
                  <TabsTrigger value="assignments" className="flex-1 border-0">
                    Assignments
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1 border-0">
                    Completed
                  </TabsTrigger>
                </TabsList>
              </GlassContainer>
              <TabsContent value="assignments" className="min-w-0">
                <AssignmentDashboardClient
                  initialData={plannerData}
                  courses={courses}
                  domains={domainsData}
                />
              </TabsContent>
              <TabsContent value="completed" className="min-w-0">
                <AssignmentDashboardClient
                  initialData={completedPlannerData}
                  courses={courses}
                  domains={domainsData}
                  mode="completed"
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
}
