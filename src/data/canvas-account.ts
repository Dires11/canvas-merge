import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "@/lib/prisma";
import type { AccountInfo } from "@/lib/types";
import { Prisma } from "@/generated/prisma/client";

export async function createCanvasAccount(
  userId: string,
  accessToken: string,
  accountInfo: AccountInfo,
) {
  try {
    await prisma.canvasAccount.create({
      data: { userId, accessToken, ...accountInfo },
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

export async function deleteCanvasAccount(accountId: string) {
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

export async function getUserDomains(userId: string): Promise<string[]> {
  const uniqueDomains = await prisma.canvasAccount.findMany({
    where: { userId, expired: false },
    distinct: ["domain"],

    select: {
      domain: true,
    },
  });
  return uniqueDomains.map((row) => row.domain);
}

export async function getUserCanvasAccounts(
  userId: string,
  includeTokens = false,
) {
  return prisma.canvasAccount.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      domain: true,
      expired: true,
      expiredAt: true,
      avatarUrl: true,
      accessToken: includeTokens,
    },
  });
}

export async function markAccountAsExpired(accountId: string, expiredAt: Date) {
  try {
    await prisma.canvasAccount.update({
      where: { id: accountId },
      data: {
        expired: true,
        expiredAt: expiredAt,
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("Failed to mark account as expired:", error);
    return { ok: false };
  }
}
