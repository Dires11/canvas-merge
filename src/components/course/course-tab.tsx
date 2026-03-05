"use client";
import type { UserCourse } from "../../lib/types";
import { GlassContainer } from "../glass-container";
import { CourseList } from "./course-list";
export function CourseTab({
  courses,
  onColorChange,
}: {
  courses: UserCourse[];
  onColorChange: (courseId: number, domain: string, newColor: any) => void;
}) {
  return (
    <GlassContainer>
      <CourseList courses={courses} onColorChange={onColorChange} />
    </GlassContainer>
  );
}
