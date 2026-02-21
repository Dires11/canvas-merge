"use client";
import type { UserCourse } from "../../lib/types";
import { CourseList } from "./course-list";
export function CourseSidebar({
  courses,
  onColorChange,
}: {
  courses: UserCourse[];
  onColorChange: (courseId: number, domain: string, newColor: any) => void;
}) {
  return (
    <aside className="ml-4 h-fit shrink-0 overflow-y-auto rounded-2xl border border-black/10 bg-white/40 py-4 shadow-lg backdrop-blur-xl dark:bg-white/5">
      <h2 className="mb-2 px-2 text-xl font-bold">COURSES</h2>

      <div className="sidebar-scroll max-h-[80vh] overflow-y-auto px-2">
        <CourseList courses={courses} onColorChange={onColorChange} />
      </div>
    </aside>
  );
}
