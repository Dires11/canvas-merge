// app/api/accounts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/server/auth-server";
import { getUserCanvasAccounts } from "@/lib/data/canvas-account";
import { AddSchema } from "@/lib/schemas/manage-accounts";
import { validateJson } from "@/lib/server/validate-json";
import { addCanvasAccountForUser } from "@/lib/services/manage-accounts";

export async function GET() {
  const user = await requireUserApi();
  try {
    const accounts = await getUserCanvasAccounts(user.id);
    return NextResponse.json({ accounts }, { status: 200 });
  } catch (e: any) {
    console.error("Failed to load Canvas accounts:", e);
    return NextResponse.json(
      { error: "Failed to load Canvas accounts." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await requireUserApi();

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
    userId: user.id,
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
