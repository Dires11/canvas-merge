import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserGrades } from "@/lib/services/grades/get-user-grades";
export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await getUserGrades(userId), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load grades. Please try again." },
      { status: 502 },
    );
  }
}
