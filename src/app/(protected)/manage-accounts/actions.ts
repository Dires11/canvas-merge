"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/server/auth-server";
import { getAccountInfo } from "@/lib/canvas";
import { encryptToken } from "@/lib/server/crypto";
import {
  createCanvasAccount,
  deleteCanvasAccount,
  getUserCanvasAccounts,
  updateCanvasAccountToken,
} from "@/lib/data/canvas-account";
import { AddSchema, UpdateSchema } from "@/lib/schemas/manage-accounts";
import { addCanvasAccountForUser } from "@/lib/services/manage-accounts";
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
    ok: true,
    data: result.data,
    message: "Account added successfully.",
  };
}

/**
 * ----------------------------
 * Update token
 * ----------------------------
 * Re-tests connection before saving new token.
 */

// export async function updateAccountTokenAction(
//   accountId: string,
//   input: unknown,
// ): Promise<ActionResult<{ name: string; domain: string }>> {
//   const user = await requireUser();

//   const parsed = UpdateSchema.safeParse(input);

//   if (!parsed.success) {
//     return validationError(parsed.error);
//   }

//   const { token } = parsed.data;

//   const accounts = await getUserCanvasAccounts(user.id);
//   const existing = accounts.find((acc) => acc.id === accountId);

//   if (!existing) {
//     return {
//       ok: false,
//       error: "Account not found.",
//       status: 404,
//     };
//   }

//   let testConnection;
//   try {
//     testConnection = await getAccountInfo({
//       domain: existing.domain,
//       token,
//     });
//   } catch (error) {
//     console.error("Unexpected Canvas connection test failure:", error);
//     throw error;
//   }

//   if (!testConnection.ok) {
//     return {
//       ok: false,
//       error: testConnection.error.message ?? "Failed to connect to Canvas",
//       expiredAt: testConnection.error.expiredAt ?? null,
//       status: testConnection.status,
//     };
//   }

//   const encryptedToken = encryptToken(token);

//   try {
//     await updateCanvasAccountToken(accountId, user.id, encryptedToken);
//   } catch (error) {
//     console.error("Unexpected database failure while updating token:", error);
//     throw error;
//   }

//   revalidatePath("/manage-accounts");

//   return {
//     ok: true,
//     data: {
//       name: testConnection.data.name,
//       domain: existing.domain,
//     },
//     message: "Account updated successfully.",
//   };
// }

/**
 * ----------------------------
 * Rename account/domain label
 * ----------------------------
 * This only changes the user-editable name.
 * Slug should stay stable.
 */

// export async function renameAccountAction(
//   input: unknown,
// ): Promise<ActionResult> {
//   const user = await requireUser();

//   const parsed = RenameSchema.safeParse(input);
//   if (!parsed.success) {
//     return validationError(parsed.error);
//   }

//   const { accountId, domainName } = parsed.data;

//   const accounts = await getUserCanvasAccounts(user.id);
//   const existing = accounts.find((acc) => acc.id === accountId);

//   if (!existing) {
//     return {
//       ok: false,
//       error: "Account not found.",
//       status: 404,
//     };
//   }

//   try {
//     await updateCanvasAccountName({
//       userId: user.id,
//       accountId,
//       domainName,
//     });
//   } catch (error) {
//     console.error("Unexpected database failure while renaming account:", error);
//     throw error;
//   }

//   revalidatePath("/manage-accounts");

//   return {
//     ok: true,
//     message: "Account name updated successfully.",
//   };
// }

/**
 * ----------------------------
 * Delete account
 * ----------------------------
 */

// export async function deleteAccountAction(
//   accountId: string,
// ): Promise<ActionResult> {
//   const user = await requireUser();

//   const parsed = z
//     .string()
//     .min(1, "Account id is required")
//     .safeParse(accountId);
//   if (!parsed.success) {
//     return validationError(parsed.error);
//   }

//   try {
//     const deleted = await deleteCanvasAccount(parsed.data, user.id);

//     if (!deleted.ok) {
//       return {
//         ok: false,
//         error: deleted.error ?? "Failed to delete account.",
//         status: 400,
//       };
//     }
//   } catch (error) {
//     console.error("Unexpected database failure while deleting account:", error);
//     throw error;
//   }

//   revalidatePath("/manage-accounts");

//   return {
//     ok: true,
//     message: "Account deleted successfully.",
//   };
// }
