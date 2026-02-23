"use client";

import { useState } from "react";
import type { UserCourse } from "@/lib/types";
import type { WeeklyAssignmentsMergedResponse } from "@/lib/planner/weekly-assignments";
import { CourseSidebar } from "@/components/course/course-sidebar";
import { AssignmentDashboardClient } from "@/components/assignment-dashboard-client";
import { updateCourseColor } from "@/app/actions/course-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseTab } from "./course/course-tab";
import { useRouter } from "next/navigation";

export function DashboardShell({
  initialCourses,
  assignmentData,
}: {
  initialCourses: UserCourse[];
  assignmentData: WeeklyAssignmentsMergedResponse | null;
}) {
  const [courses, setCourses] = useState<UserCourse[]>(initialCourses);
  const router = useRouter();

  const handleColorChange = async (
    courseId: number,
    domain: string,
    newColor: any,
  ) => {
    const prevCourses = courses;

    // optimistic UI
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId && c.domain === domain
          ? { ...c, color: newColor }
          : c,
      ),
    );

    // persist
    try {
      await updateCourseColor(courseId, domain, newColor);
    } catch (error: any) {
      if (error?.message?.includes("UNAUTHORIZED")) {
        router.push("/auth/sign-in");
        return;
      }

      console.error("Failed to update course color:", error);
      setCourses(prevCourses); // rollback
    }
  };

  return (
    <>
      {/* ✅ Mobile: Tabs */}
      <div className="p-4 md:hidden">
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="mb-4 w-full" variant="line">
            <TabsTrigger value="courses" className="flex-1">
              Courses
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex-1">
              Assignments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="min-w-0">
            <CourseTab courses={courses} onColorChange={handleColorChange} />
          </TabsContent>
          <TabsContent value="assignments" className="min-w-0">
            <AssignmentDashboardClient
              initialData={assignmentData}
              courses={courses}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ✅ Desktop: Sidebar + Assignments */}
      <div className="hidden min-h-screen grid-cols-[320px_minmax(0,1fr)] gap-4 p-4 md:grid">
        <CourseSidebar courses={courses} onColorChange={handleColorChange} />

        <main className="min-w-0">
          <div className="mx-auto w-full max-w-4xl">
            <AssignmentDashboardClient
              initialData={assignmentData}
              courses={courses}
            />
          </div>
        </main>
      </div>
    </>
  );
}
