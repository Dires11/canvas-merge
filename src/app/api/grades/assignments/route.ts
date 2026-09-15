import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserCanvasAccountsWithTokens } from "@/lib/data/canvas-account";
import { decryptToken } from "@/lib/server/crypto";
import { getGradeAssignments } from "@/lib/canvas/grades";
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = req.nextUrl.searchParams.get("accountId");
  const courseId = Number(req.nextUrl.searchParams.get("courseId"));
  if (!accountId || !Number.isSafeInteger(courseId) || courseId <= 0)
    return NextResponse.json(
      { error: "Invalid course or account" },
      { status: 400 },
    );
  try {
    const [account] = await getUserCanvasAccountsWithTokens(userId, [
      accountId,
    ]);
    if (!account)
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    const result = await getGradeAssignments(
      account.canvasDomain.baseUrl,
      decryptToken(account.accessToken),
      courseId,
    );
    if (!result.ok)
      return NextResponse.json(
        { error: "Unable to load assignments from Canvas. Please try again." },
        { status: 502 },
      );
    return NextResponse.json(result.data, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load assignments. Please try again." },
      { status: 502 },
    );
  }
}
