// app/api/accounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserCanvasAccounts } from "@/lib/data/canvas-account";
import { AddSchema } from "@/lib/schemas/manage-accounts";
import { validateJson } from "@/lib/server/validate-json";
import { addCanvasAccountForUser } from "@/lib/services/manage-accounts";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  try {
    const accounts = await getUserCanvasAccounts(userId);
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error) {
    console.error("Failed to load Canvas accounts:", error);
    return NextResponse.json(
      { error: "Failed to load Canvas accounts." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  const parsed = await validateJson(req, AddSchema);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error,
        fieldErrors: parsed.fieldErrors,
        formErrors: parsed.formErrors,
        status: parsed.status,
      },
      { status: parsed.status },
    );
  }

  const result = await addCanvasAccountForUser({
    userId,
    ...parsed.data,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        status: result.status,
      },
      { status: result.status ?? 400 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: result.data,
      message: "Account added successfully.",
    },
    {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
