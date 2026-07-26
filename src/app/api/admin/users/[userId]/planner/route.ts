import { NextResponse } from "next/server";
import { getAdminAuthorization, getAdminDirectoryUser } from "@/lib/admin";
import { getUserPlanner } from "@/lib/services/planner/get-user-planner";
import { dedupeWithTtl } from "@/lib/utils/dedupe";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const authorization = await getAdminAuthorization();

  if (authorization.status === "unauthenticated") {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  if (authorization.status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const selectedUser = await getAdminDirectoryUser(userId);

  if (!selectedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const key = `admin-planner|user=${userId}|filter=incomplete_items`;

  try {
    const { hit, data } = await dedupeWithTtl(key, 10_000, () =>
      getUserPlanner(userId, true, "incomplete_items"),
    );

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "x-cache": hit,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch planner items";

    if (message === "No accounts found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to load user todo list" },
      { status: 502 },
    );
  }
}
