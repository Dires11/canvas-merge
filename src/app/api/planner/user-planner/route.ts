import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserPlanner } from "@/lib/services/planner/get-user-planner";
import { dedupeWithTtl } from "@/lib/utils/dedupe";
import type { PlannerItemFilter } from "@/lib/canvas";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  const merge = req.nextUrl.searchParams.get("merge") === "true";
  const requestedFilter = req.nextUrl.searchParams.get("filter");
  const filter: PlannerItemFilter =
    requestedFilter === "complete_items"
      ? "complete_items"
      : "incomplete_items";

  const start = req.nextUrl.searchParams.get("start");
  const end = req.nextUrl.searchParams.get("end");
  let range: { startISO: string; endISO: string } | undefined;
  if (start !== null || end !== null) {
    const startTime = start ? Date.parse(start) : NaN;
    const endTime = end ? Date.parse(end) : NaN;
    if (
      !Number.isFinite(startTime) ||
      !Number.isFinite(endTime) ||
      endTime <= startTime ||
      endTime - startTime > 367 * 86400000
    ) {
      return NextResponse.json(
        { error: "Provide a valid date range of up to one year." },
        { status: 400 },
      );
    }
    range = {
      startISO: new Date(startTime).toISOString(),
      endISO: new Date(endTime).toISOString(),
    };
  }
  const key = `weekly-assignments|user=${userId}|merge=${merge}|filter=${filter}|start=${range?.startISO ?? "default"}|end=${range?.endISO ?? "default"}`;
  console.log("---- API: received request for /api/planner/weekly-assignments");
  try {
    const { hit, data } = await dedupeWithTtl(key, 10_000, async () => {
      console.log("----API: computing /api/planner/weekly-assignments", {
        userId,
        merge,
        filter,
      });
      return await getUserPlanner(userId, merge, filter, range);
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
