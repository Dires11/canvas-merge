import { auth } from "@clerk/nextjs/server";
import { DashboardClient } from "./components/client";
import { GlassContainer } from "@/components/glass-container";
import { ConnectAccountGuideWrapper } from "./components/connect-account-guide-wrapper";
import { getUserCanvasAccounts } from "@/lib/data/canvas-account";
import { getUserCourses } from "@/lib/services/planner/get-user-courses";
import { getUserPlanner } from "@/lib/services/planner/get-user-planner";
import type { UserCourse, UserPlanner, CanvasDomainInfo } from "@/lib/types";
import { getUserDomains } from "@/lib/data/canvas-domain";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { userId } = await auth();

  const accounts = await getUserCanvasAccounts(userId!);
  if (accounts.length === 0) {
    return (
      <GlassContainer className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-semibold">
          Welcome to Canvas Merge dashboard!
        </h2>
        <p className="mb-4">You don&apos;t have any accounts connected yet.</p>
        <ConnectAccountGuideWrapper />
      </GlassContainer>
    );
  }

  const [coursesResult, plannerResult, completedPlannerResult, domainsResult] =
    await Promise.allSettled([
      getUserCourses(userId!),
      getUserPlanner(userId!, true, "incomplete_items"),
      getUserPlanner(userId!, true, "complete_items"),
      getUserDomains(userId!),
    ]);

  let courses: UserCourse[] = [];
  let plannerData: UserPlanner | null = null;
  let completedPlannerData: UserPlanner | null = null;
  let domainsData: CanvasDomainInfo[] = [];

  if (domainsResult.status === "fulfilled") {
    domainsData = domainsResult.value;
  } else {
    console.error("Failed to load domains:", domainsResult.reason);
  }

  if (coursesResult.status === "fulfilled") {
    courses = coursesResult.value.courses ?? [];
  } else {
    console.error("Failed to load courses:", coursesResult.reason);
  }

  if (plannerResult.status === "fulfilled") {
    plannerData = plannerResult.value;
  } else {
    console.error("Failed to load planner data:", plannerResult.reason);
  }

  if (completedPlannerResult.status === "fulfilled") {
    completedPlannerData = completedPlannerResult.value;
  } else {
    console.error(
      "Failed to load completed planner data:",
      completedPlannerResult.reason,
    );
  }

  return (
    <DashboardClient
      initialCourses={courses}
      plannerData={plannerData}
      completedPlannerData={completedPlannerData}
      domainsData={domainsData}
    />
  );
}
