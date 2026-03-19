import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/server/auth-server";
import { getUserPlanner } from "@/lib/services/planner/get-user-planner";
import { dedupeWithTtl } from "@/lib/utils/dedupe";

export async function GET(req: NextRequest) {
  const user = await requireUserApi();
  const merge = req.nextUrl.searchParams.get("merge") === "true";

  // Dedupe per user + merge (10s)
  const key = `weekly-assignments|user=${user.id}|merge=${merge}`;
  console.log("---- API: received request for /api/planner/weekly-assignments");
  try {
    const { hit, data } = await dedupeWithTtl(key, 10_000, async () => {
      // Only logs when we truly run the full pipeline (not cache/inflight)
      console.log("----API: computing /api/planner/weekly-assignments", {
        userId: user.id,
        merge,
      });
      return await getUserPlanner(user.id, merge);
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "x-cache": hit, // helpful in Network tab
      },
    });
  } catch (error: any) {
    if (error?.message === "No accounts found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to fetch planner items" },
      { status: 500 },
    );
  }
}
