import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import {
  createPlannerOverride,
  deletePlannerOverride,
  updatePlannerOverride,
} from "@/lib/canvas";
import { getUserCanvasAccountsWithTokens } from "@/lib/data/canvas-account";
import { decryptToken } from "@/lib/server/crypto";
import { validateJson } from "@/lib/server/validate-json";

const OverrideSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("mark_complete"),
    accountId: z.string().min(1),
    plannableType: z.enum(["assignment", "discussion_topic", "quiz"]),
    plannableId: z.number().int().positive(),
    overrideId: z.number().int().positive().nullable(),
  }),
  z.object({
    action: z.literal("undo_update"),
    accountId: z.string().min(1),
    overrideId: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("undo_create"),
    accountId: z.string().min(1),
    overrideId: z.number().int().positive(),
  }),
]);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  const parsed = await validateJson(req, OverrideSchema);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error,
        fieldErrors: parsed.fieldErrors,
        formErrors: parsed.formErrors,
      },
      { status: parsed.status },
    );
  }

  const [account] = await getUserCanvasAccountsWithTokens(userId, [
    parsed.data.accountId,
  ]);

  if (!account) {
    return NextResponse.json(
      { ok: false, error: "Account not found." },
      { status: 404 },
    );
  }

  if (account.expiredAt) {
    return NextResponse.json(
      { ok: false, error: "Account token is expired." },
      { status: 401 },
    );
  }

  const domain = account.canvasDomain.baseUrl;
  const token = decryptToken(account.accessToken);

  const result =
    parsed.data.action === "mark_complete"
      ? parsed.data.overrideId
        ? await updatePlannerOverride(domain, token, parsed.data.overrideId, true)
        : await createPlannerOverride(
            domain,
            token,
            parsed.data.plannableType,
            parsed.data.plannableId,
            true,
          )
      : parsed.data.action === "undo_update"
        ? await updatePlannerOverride(domain, token, parsed.data.overrideId, false)
        : await deletePlannerOverride(domain, token, parsed.data.overrideId);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          result.error.message ??
          "Canvas could not update this planner override.",
      },
      { status: result.status || 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      overrideId: result.data.id,
      markedComplete: result.data.marked_complete,
    },
  });
}
