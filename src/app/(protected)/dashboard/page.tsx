import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth-server";
import {
  type CourseFailure,
  getUserCourses,
} from "@/lib/planner/get-user-courses";
import { getUserPlanner, UserPlanner } from "@/lib/planner/get-user-planner";
import type { UserCourse } from "@/lib/types";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser();

  const [coursesResult, plannerResult] = await Promise.allSettled([
    getUserCourses(user.id),
    getUserPlanner(user.id, true),
  ]);

  let courses: UserCourse[] = [];
  let courseFailures: CourseFailure[] = [];
  let courseError: string | null = null;
  let plannerData: UserPlanner | null = null;
  let plannerError: string | null = null;

  if (coursesResult.status === "fulfilled") {
    courses = coursesResult.value.courses ?? [];
    courseFailures = coursesResult.value.failures ?? [];
  } else {
    console.error("Failed to load courses:", coursesResult.reason);
    courseError =
      coursesResult.reason instanceof Error
        ? coursesResult.reason.message
        : "Unknown error loading courses";
  }

  if (plannerResult.status === "fulfilled") {
    plannerData = plannerResult.value;
  } else {
    console.error("Failed to load planner data:", plannerResult.reason);
    plannerError =
      plannerResult.reason instanceof Error
        ? plannerResult.reason.message
        : "Unknown error loading planner data";
  }

  return <DashboardShell initialCourses={courses} plannerData={plannerData} />;
}
