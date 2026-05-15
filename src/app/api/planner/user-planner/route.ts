import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserPlanner } from "@/lib/services/planner/get-user-planner";
import { dedupeWithTtl } from "@/lib/utils/dedupe";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const merge = req.nextUrl.searchParams.get("merge") === "true";

  const key = `weekly-assignments|user=${userId}|merge=${merge}`;
  console.log("---- API: received request for /api/planner/weekly-assignments");
  try {
    const { hit, data } = await dedupeWithTtl(key, 10_000, async () => {
      console.log("----API: computing /api/planner/weekly-assignments", {
        userId,
        merge,
      });
      return await getUserPlanner(userId, merge);
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "x-cache": hit,
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
