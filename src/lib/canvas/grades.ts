import { canvasFetchAll } from "./fetch";
import type { GradeAssignment } from "@/lib/types/grades";

export type CanvasGradeCourse = {
  id: number;
  name: string;
  course_code: string;
  hide_final_grades?: boolean;
  enrollments?: {
    type: string;
    computed_current_score?: number | null;
    computed_current_grade?: string | null;
  }[];
};
export function getGradeCourses(baseUrl: string, token: string) {
  return canvasFetchAll<CanvasGradeCourse>(baseUrl, "/api/v1/courses", {
    token,
    searchParams: {
      "include[]": "total_scores",
      enrollment_type: "student",
      enrollment_state: "active",
      per_page: 100,
    },
  });
}
export type CanvasGradeAssignment = {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number | null;
  submission?: {
    score?: number | null;
    grade?: string | null;
    graded_at?: string | null;
    submitted_at?: string | null;
    excused?: boolean;
    missing?: boolean;
    workflow_state?: string;
  };
};
export function normalizeAssignment(a: CanvasGradeAssignment): GradeAssignment {
  const s = a.submission;
  const excused = s?.excused === true;
  return {
    id: a.id,
    name: a.name,
    dueAt: a.due_at,
    gradedAt: s?.graded_at ?? null,
    pointsPossible: a.points_possible,
    score: excused ? null : (s?.score ?? null),
    grade: excused ? null : (s?.grade ?? null),
    status: excused
      ? "Excused"
      : s?.score != null || s?.grade != null
        ? "Graded"
        : s?.missing
          ? "Missing"
          : s?.submitted_at || s?.workflow_state === "pending_review"
            ? "Submitted"
            : "Not submitted",
  };
}
export async function getGradeAssignments(
  baseUrl: string,
  token: string,
  courseId: number,
) {
  const result = await canvasFetchAll<CanvasGradeAssignment>(
    baseUrl,
    `/api/v1/courses/${courseId}/assignments`,
    {
      token,
      searchParams: { "include[]": "submission", per_page: 100 },
    },
  );
  if (!result.ok) return result;
  return { ...result, data: result.data.map(normalizeAssignment) };
}
