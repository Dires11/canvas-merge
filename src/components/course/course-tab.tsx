"use client";
import type { UserCourse } from "../../lib/types";
import { CourseList } from "./course-list";
export function CourseTab({
  courses,
  onColorChange,
}: {
  courses: UserCourse[];
  onColorChange: (courseId: number, domain: string, newColor: any) => void;
}) {
  return (
    <div className="px-2">
      <CourseList courses={courses} onColorChange={onColorChange} />
    </div>
  );
}
