// app/api/accounts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserOr401 } from "@/lib/auth-server";
import { getAccountInfo } from "@/lib/canvas";
import {
  deleteCanvasAccount,
  getUserCanvasAccount,
  updateCanvasAccountToken,
} from "@/data/canvas-account";
import { encryptToken } from "@/lib/crypto";
import { validateJson } from "../route"; // reuse helper from parent route.ts

const UpdateBodySchema = z.object({
  token: z.string().min(10, "Personal access token is too short"),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await getUserOr401();
  if (response) return response;
  const { id } = await context.params;

  const result = await validateJson(req, UpdateBodySchema);
  if (!result.ok) return result.response;

  const token = result.data.token;

  const account = await getUserCanvasAccount(id, user.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  console.log(
    "===================================================================",
  );

  console.log("DOMAIN: ", account.domain, "TOKEN: ", token, "ACCOUND ID: ", id);
  console.log(
    "===================================================================",
  );

  // verify token belongs to same Canvas account
  const testConnection = await getAccountInfo({
    domain: account.domain,
    token,
  });
  if (!testConnection.ok) {
    return NextResponse.json(
      {
        error: testConnection.error.message ?? "Failed to connect to Canvas",
        expiredAt: testConnection.error.expiredAt,
      },
      { status: testConnection.status },
    );
  }

  const profileInfo = testConnection.data;
  if (profileInfo.accountCanvasId !== account.accountCanvasId) {
    return NextResponse.json(
      { error: `Make sure the token belongs to ${account.name}.` },
      { status: 403 },
    );
  }

  const tokenEncrypted = encryptToken(token);

  const updated = await updateCanvasAccountToken(id, user.id, tokenEncrypted);

  if (updated.count === 0) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const res = NextResponse.json(
    {
      ok: true,
      account: { id: account.id, name: account.name, domain: account.domain },
    },
    { status: 200 },
  );
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { user, response } = await getUserOr401();
  if (response) return response;

  const { id } = await context.params;
  // IMPORTANT: ensure the delete function enforces user ownership internally,
  // or switch to a deleteMany({ where: { id: params.id, userId: user.id } })
  const result = await deleteCanvasAccount(id, user.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to delete account" },
      { status: result.status ?? 400 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
