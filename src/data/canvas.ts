import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma";

export async function getUserCanvasAccounts(
  userId: string,
  includeTokens = false
) {
  return prisma.canvasAccount.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      domain: true,
      expired: true,
      accessToken: includeTokens,
    },
  });
}

export async function createCanvasAccount(
  userId: string,
  name: string,
  domain: string,
  accessToken: string
) {
  try {
    await prisma.canvasAccount.create({
      data: { userId, name, domain, accessToken },
    });
    return { ok: true };
  } catch (error: unknown) {
    console.error("createCanvasAccount failed:", error);

    if (error instanceof PrismaClientKnownRequestError) {
      // Prisma known error (constraint, invalid data, etc.)
      if (error.code === "P2002") {
        // Unique constraint violation (duplicate)
        return {
          ok: false,
          message: "Canvas account for this domain and token already exists.",
        };
      }
      return { ok: false, message: `Database error (${error.code})` };
    }

    // Unknown or runtime error
    return { ok: false, message: "Unexpected server error." };
  }
}

export async function deleteCanvasAccount(userId: string, accountId: string) {
  try {
    await prisma.canvasAccount.delete({
      where: { id: accountId },
    });
    return { ok: true };
  } catch (e: any) {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return { ok: false, error: "Account not found", status: 404 };
      }
      return {
        ok: false,
        error: `Failed to delete  account, code: ${e.code}`,
        status: 400,
      };
    } else {
      return { ok: false, error: "Failed to delete account.", status: 400 };
    }
  }
}
