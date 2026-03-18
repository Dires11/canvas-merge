import { Prisma } from "@db/client";

import { prisma } from "@/lib/prisma";
import type { CanvasAccountInfo } from "@/lib/types/account";

export async function createCanvasAccount(
  userId: string,
  accessToken: string,
  accountInfo: CanvasAccountInfo,
  domainName: string,
  domainSlug: string,
) {
  try {
    await prisma.canvasAccount.create({
      data: { userId, accessToken, ...accountInfo, domainName, domainSlug },
    });
    return { ok: true };
  } catch (error: unknown) {
    console.error("createCanvasAccount failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

export async function deleteCanvasAccount(accountId: string, userId: string) {
  try {
    await prisma.canvasAccount.delete({
      where: { id: accountId, userId },
    });
    return { ok: true };
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
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

export async function updateCanvasAccountToken(
  accountID: string,
  userId: string,
  token: string,
) {
  if (!accountID || typeof accountID !== "string") {
    throw new Error("updateCanvasAccountToken: accountID is missing/invalid");
  }
  return prisma.canvasAccount.updateMany({
    where: { id: accountID, userId },
    data: {
      accessToken: token,
      expiredAt: null,
    },
  });
}

export async function getUserDomains(userId: string): Promise<string[]> {
  const uniqueDomains = await prisma.canvasAccount.findMany({
    where: { userId, expiredAt: null },
    distinct: ["domain"],

    select: {
      domain: true,
    },
  });
  return uniqueDomains.map((row: { domain: string }) => row.domain);
}

export async function getUserCanvasAccounts(
  userId: string,
  includeTokens = false,
  accountIds?: string[],
) {
  return prisma.canvasAccount.findMany({
    where: {
      userId,
      ...(accountIds?.length && { id: { in: accountIds } }),
    },
    orderBy: [{ domain: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      domain: true,
      domainName: true,
      domainSlug: true,
      expiredAt: true,
      avatarUrl: true,
      canvasId: true,
      accessToken: includeTokens,
    },
  });
}

export async function markAccountAsExpired(accountId: string, expiredAt: Date) {
  try {
    await prisma.canvasAccount.update({
      where: { id: accountId },
      data: {
        expiredAt: expiredAt,
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("Failed to mark account as expired:", error);
    return { ok: false };
  }
}

export async function getUserCanvasAccount(accountID: string, userId: string) {
  return prisma.canvasAccount.findFirst({
    where: { id: accountID, userId },
    select: {
      id: true,
      name: true,
      domain: true,
      canvasId: true,
    },
  });
}
