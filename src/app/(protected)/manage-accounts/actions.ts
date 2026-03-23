"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/server/auth-server";
import { getUserCanvasAccounts } from "@/lib/data/canvas-account";
import { AddSchema, UpdateTokenSchema } from "@/lib/schemas/manage-accounts";
import {
  addCanvasAccountForUser,
  deleteCanvasAccountForUser,
  updateCanvasTokenForUser,
} from "@/lib/services/manage-accounts";
import type { ActionResult } from "@/lib/types/action-result";

function validationError(error: z.ZodError): ActionResult<never> {
  const flat = z.flattenError(error);

  return {
    ok: false,
    error: "Invalid input",
    formErrors: flat.formErrors,
    fieldErrors: flat.fieldErrors,
    status: 400,
  };
}

/**
 * ----------------------------
 * Loader
 * ----------------------------
 * Throw on failure.
 */

export async function loadAccountsServer() {
  const user = await requireUser();
  return await getUserCanvasAccounts(user.id);
}

/**
 * ----------------------------
 * Add account
 * ----------------------------
 * Return ok:false for expected failures.
 * Throw only for unexpected/system failures.
 */

export async function addAccountAction(
  input: z.infer<typeof AddSchema>,
): Promise<ActionResult<{ name: string; baseUrl: string }>> {
  const user = await requireUser();

  const parsed = AddSchema.safeParse(input);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await addCanvasAccountForUser({
    userId: user.id,
    ...parsed.data,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/manage-accounts");

  return {
    ...result,
    message: "Account added successfully.",
  };
}

export async function updateAccountTokenAction(
  accountId: string,
  input: z.infer<typeof UpdateTokenSchema>,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = UpdateTokenSchema.safeParse(input);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await updateCanvasTokenForUser(
    user.id,
    accountId,
    parsed.data.token,
  );

  if (!result.ok) {
    return result;
  }

  revalidatePath("/manage-accounts");

  return { ok: true, message: "Token updated successfully." };
}

export async function deleteAccountAction(
  accountId: string,
): Promise<ActionResult> {
  const user = await requireUser();

  const result = await deleteCanvasAccountForUser(user.id, accountId);

  if (!result.ok) {
    return result;
  }

  revalidatePath("/manage-accounts");

  return { ok: true, message: "Account deleted successfully." };
}
