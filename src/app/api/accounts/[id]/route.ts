// app/api/accounts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserApi } from "@/lib/server/auth-server";
import { getAccountInfo } from "@/lib/canvas";
import {
  deleteCanvasAccount,
  getUserCanvasAccount,
  updateCanvasAccountToken,
} from "@/lib/data/canvas-account";
import { encryptToken } from "@/lib/server/crypto";
import { validateJson } from "@/lib/server/validate-json";

const UpdateBodySchema = z.object({
  token: z.string().min(10, "Personal access token is too short"),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUserApi();
  const { id } = await context.params;

  const result = await validateJson(req, UpdateBodySchema);
  if (!result.ok) return result;

  const token = result.data.token;

  const account = await getUserCanvasAccount(id, user.id);
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // verify token belongs to same Canvas account
  const testConnection = await getAccountInfo({
    baseUrl: account.canvasDomain.baseUrl,
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
  if (profileInfo.canvasId !== account.canvasId) {
    return NextResponse.json(
      { error: `Make sure the token belongs to ${account.name}.` },
      { status: 403 },
    );
  }

  const tokenEncrypted = encryptToken(token);

  const updated = await updateCanvasAccountToken({
    accountId: id,
    userId: user.id,
    token: tokenEncrypted,
  });

  if (!updated.ok) {
    return NextResponse.json(
      {
        error: updated.error,
      },
      { status: updated.status },
    );
  }

  const res = NextResponse.json(
    {
      ok: true,
      account: {
        id: account.id,
        name: account.name,
        domain: account.canvasDomain.baseUrl,
      },
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
  const user = await requireUserApi();
  const { id } = await context.params;
  const result = await deleteCanvasAccount(id, user.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to delete account" },
      { status: result.status ?? 400 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
