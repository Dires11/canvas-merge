import { DashboardClient } from "./client";
import { GlassContainer } from "@/components/glass-container";
import { ConnectAccountGuideWrapper } from "./connect-account-guide-wrapper";
import { getUserCanvasAccounts } from "@/lib/data/canvas-account";
import { requireUser } from "@/lib/server/auth-server";
import { getUserCourses } from "@/lib/services/planner/get-user-courses";
import { getUserPlanner } from "@/lib/services/planner/get-user-planner";
import type { UserCourse, CourseFailure, UserPlanner, CanvasDomainInfo } from "@/lib/types";
import { getUserDomains } from "@/lib/data/canvas-domain";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser();

  const accounts = await getUserCanvasAccounts(user.id);
  if (accounts.length === 0) {
    return (
      <GlassContainer className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-semibold">
          Welcome to Canvas Merge dashboard!
        </h2>
        <p className="mb-4">You don't have any accounts connected yet.</p>
        <ConnectAccountGuideWrapper />
      </GlassContainer>
    );
  }

  const [coursesResult, plannerResult, domainsResult] =
    await Promise.allSettled([
      getUserCourses(user.id),
      getUserPlanner(user.id, true),
      getUserDomains(user.id), // prefetch domains for better performance in manage accounts page
    ]);

  let courses: UserCourse[] = [];
  let courseFailures: CourseFailure[] = [];
  let courseError: string | null = null;
  let plannerData: UserPlanner | null = null;
  let plannerError: string | null = null;
  let domainsData: CanvasDomainInfo[] = [];
  let domainsError: string | null = null;

  if (domainsResult.status === "fulfilled") {
    domainsData = domainsResult.value;
  } else {
    console.error("Failed to load domains:", domainsResult.reason);
    domainsError =
      domainsResult.reason instanceof Error
        ? domainsResult.reason.message
        : "Unknown error loading domains";
  }

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

  return (
    <DashboardClient
      initialCourses={courses}
      plannerData={plannerData}
      domainsData={domainsData}
    />
  );
}
