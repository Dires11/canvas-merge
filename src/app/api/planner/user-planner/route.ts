import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserPlanner } from "@/lib/services/planner/get-user-planner";
import { dedupeWithTtl } from "@/lib/utils/dedupe";
import type { PlannerItemFilter } from "@/lib/canvas";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const merge = req.nextUrl.searchParams.get("merge") === "true";
  const requestedFilter = req.nextUrl.searchParams.get("filter");
  const filter: PlannerItemFilter =
    requestedFilter === "complete_items" ? "complete_items" : "incomplete_items";

  const key = `weekly-assignments|user=${userId}|merge=${merge}|filter=${filter}`;
  console.log("---- API: received request for /api/planner/weekly-assignments");
  try {
    const { hit, data } = await dedupeWithTtl(key, 10_000, async () => {
      console.log("----API: computing /api/planner/weekly-assignments", {
        userId,
        merge,
        filter,
      });
      return await getUserPlanner(userId, merge, filter);
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "x-cache": hit,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch planner items";

    if (message === "No accounts found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
