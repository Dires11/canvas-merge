import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import {
  createPlannerOverride,
  getPlannerOverrides,
  type PlannerOverride,
  updatePlannerOverride,
} from "@/lib/canvas";
import { getUserCanvasAccountsWithTokens } from "@/lib/data/canvas-account";
import { decryptToken } from "@/lib/server/crypto";
import { validateJson } from "@/lib/server/validate-json";
import { invalidateDedupeWithPrefix } from "@/lib/utils/dedupe";

const OverrideSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("mark_complete"),
    accountId: z.string().min(1),
    plannableType: z.enum(["assignment", "discussion_topic", "quiz"]),
    plannableId: z.number().int().positive(),
    overrideId: z.number().int().positive().nullable(),
  }),
  z.object({
    action: z.literal("mark_incomplete"),
    accountId: z.string().min(1),
    overrideId: z.number().int().positive(),
  }),
]);

function normalizePlannableType(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
}

function isMatchingPlannerOverride(
  override: PlannerOverride,
  plannableType: string,
  plannableId: number,
) {
  return (
    (override.plannable_id === plannableId &&
      normalizePlannableType(override.plannable_type) ===
        normalizePlannableType(plannableType)) ||
    override.assignment_id === plannableId
  );
}

function getUserFacingError(action: z.infer<typeof OverrideSchema>["action"]) {
  return action === "mark_complete"
    ? "Canvas could not mark this assignment complete. Please refresh and try again."
    : "Canvas could not undo this completion. Please refresh and try again.";
}

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

  let result = await (parsed.data.action === "mark_complete"
    ? parsed.data.overrideId
      ? updatePlannerOverride(domain, token, parsed.data.overrideId, true)
      : createPlannerOverride(
          domain,
          token,
          parsed.data.plannableType,
          parsed.data.plannableId,
          true,
        )
    : updatePlannerOverride(domain, token, parsed.data.overrideId, false));

  if (
    parsed.data.action === "mark_complete" &&
    !parsed.data.overrideId &&
    !result.ok
  ) {
    const { plannableId, plannableType } = parsed.data;
    const overrides = await getPlannerOverrides(domain, token);

    if (overrides.ok) {
      const matchingOverride = overrides.data.find((override) =>
        isMatchingPlannerOverride(override, plannableType, plannableId),
      );

      if (matchingOverride) {
        result = await updatePlannerOverride(
          domain,
          token,
          matchingOverride.id,
          true,
        );
      }
    }
  }

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: getUserFacingError(parsed.data.action),
      },
      { status: result.status || 400 },
    );
  }

  invalidateDedupeWithPrefix(`weekly-assignments|user=${userId}|`);

  return NextResponse.json({
    ok: true,
    data: {
      overrideId: result.data.id,
      markedComplete:
        parsed.data.action === "mark_complete"
          ? result.data.marked_complete
          : false,
    },
  });
}
