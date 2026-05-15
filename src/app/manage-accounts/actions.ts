"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export async function loadAccountsServer() {
  const { userId } = await auth();
  return await getUserCanvasAccounts(userId!);
}

export async function addAccountAction(
  input: z.infer<typeof AddSchema>,
): Promise<ActionResult<{ name: string; baseUrl: string }>> {
  const { userId } = await auth();

  const parsed = AddSchema.safeParse(input);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await addCanvasAccountForUser({
    userId: userId!,
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
  const { userId } = await auth();

  const parsed = UpdateTokenSchema.safeParse(input);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const result = await updateCanvasTokenForUser(
    userId!,
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
  const { userId } = await auth();

  const result = await deleteCanvasAccountForUser(userId!, accountId);

  if (!result.ok) {
    return result;
  }

  revalidatePath("/manage-accounts");

  return { ok: true, message: "Account deleted successfully." };
}
