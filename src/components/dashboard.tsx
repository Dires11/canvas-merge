// Dashboard (Server Component)
import { requireUser } from "@/lib/auth-server";
import { AssignmentDashboardClient } from "./assignment-dashboard-client";
import { getWeeklyAssignmentsForUser } from "@/lib/planner/weekly-assignments";

export async function Dashboard() {
  const user = await requireUser();
  try {
    const data = await getWeeklyAssignmentsForUser(user.id, true);
    if (!("merged" in data)) {
      throw new Error("Expected merged planner result");
    }
    return <AssignmentDashboardClient initialData={data} />;
  } catch (e: any) {
    return <h1 className="text-foreground text-2xl ">{e.message}</h1>;
  }
}
