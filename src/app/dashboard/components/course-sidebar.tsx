"use client";
import type { UserCourse } from "@/lib/types";
import { GlassContainer } from "@/components/glass-container";
import { CourseList } from "./course-list";

export function CourseSidebar({
  courses,
  onColorChange,
}: {
  courses: UserCourse[];
  onColorChange: (
    courseId: number,
    domainSlug: string,
    newColor: UserCourse["color"],
  ) => void;
}) {
  return (
    <aside className="sticky top-6 h-fit w-[320px] shrink-0">
      <GlassContainer className="ml-4 px-0">
        <h2 className="mb-4 px-4 text-xl tracking-wide">
          Courses{" "}
          <span className="text-foreground/60 text-md">({courses.length})</span>
        </h2>

        <div className="sidebar-scroll max-h-[calc(100vh-120px)] overflow-y-auto px-2">
          <CourseList courses={courses} onColorChange={onColorChange} />
        </div>
      </GlassContainer>
    </aside>
  );
}
