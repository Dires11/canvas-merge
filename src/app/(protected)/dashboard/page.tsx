import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth-server";
import { getUserCourses } from "@/lib/planner/user-courses";
import { getWeeklyAssignmentsForUser } from "@/lib/planner/weekly-assignments";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser();
  const [coursesResult, assignmentsResult] = await Promise.allSettled([
    getUserCourses(user.id),
    getWeeklyAssignmentsForUser(user.id, true),
  ]);

  // Extract data or handle errors
  const { courses = [], failures = [] } =
    coursesResult.status === "fulfilled" ? coursesResult.value : {};
  const assignmentData =
    assignmentsResult.status === "fulfilled" ? assignmentsResult.value : null;

  return (
    <DashboardShell initialCourses={courses} assignmentData={assignmentData} />
  );
}
