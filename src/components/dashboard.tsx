// Dashboard (Server Component)
import { requireUser } from "@/lib/auth-server";
import { AssignmentDashboardClient } from "./assignment-dashboard-client";
import { getWeeklyAssignmentsForUser } from "@/lib/planner/weekly-assignments";

export async function Dashboard() {
  const user = await requireUser();
  const data = await getWeeklyAssignmentsForUser(user.id, true);
  if (!("merged" in data)) {
    throw new Error("Expected merged planner result");
  }

  return <AssignmentDashboardClient initialData={data} />;
}
