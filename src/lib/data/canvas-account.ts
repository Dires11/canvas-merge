import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/db";
import type { CanvasAccountInfo } from "@/lib/types/account";
import type { Result } from "@/lib/types/result";
import { getPrismaErrorMessage } from "./utils";

type DbClient = typeof prisma | Prisma.TransactionClient;

type CreateCanvasAccountParams = {
  userId: string;
  accessToken: string;
  accountInfo: CanvasAccountInfo;
  domainId: string;
};

type UpdateCanvasAccountTokenParams = {
  accountId: string;
  userId: string;
  token: string;
  accountInfo: CanvasAccountInfo;
};

type UpdateCanvasAccountInfoParams = {
  accountId: string;
  userId: string;
  accountInfo: CanvasAccountInfo;
};

type MarkCanvasAccountExpiredParams = {
  accountId: string;
  expiredAt: Date;
};

const canvasDomainSelect = {
  id: true,
  baseUrl: true,
  name: true,
  slug: true,
} satisfies Prisma.CanvasDomainSelect;

const canvasAccountBaseSelect = {
  id: true,
  name: true,
  expiredAt: true,
  avatarUrl: true,
  canvasId: true,
  canvasDomain: {
    select: canvasDomainSelect,
  },
} satisfies Prisma.CanvasAccountSelect;

const canvasAccountWithTokenSelect = {
  ...canvasAccountBaseSelect,
  accessToken: true,
} satisfies Prisma.CanvasAccountSelect;

const canvasAccountSummarySelect = {
  id: true,
  name: true,
  canvasId: true,
  canvasDomain: {
    select: canvasDomainSelect,
  },
} satisfies Prisma.CanvasAccountSelect;

export type CanvasAccountBaseInfo = Prisma.CanvasAccountGetPayload<{
  select: typeof canvasAccountBaseSelect;
}>;

export type CanvasAccountWithToken = Prisma.CanvasAccountGetPayload<{
  select: typeof canvasAccountWithTokenSelect;
}>;

export type CanvasAccountSummary = Prisma.CanvasAccountGetPayload<{
  select: typeof canvasAccountSummarySelect;
}>;

export async function createCanvasAccount(
  params: CreateCanvasAccountParams,
  db: DbClient = prisma,
): Promise<Result> {
  const { userId, accessToken, accountInfo, domainId } = params;

  try {
    await db.canvasAccount.create({
      data: {
        userId,
        accessToken,
        ...accountInfo,
        canvasDomain: {
          connect: { id: domainId },
        },
      },
    });

    return { ok: true };
  } catch (error) {
    console.error("createCanvasAccount failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          ok: false,
          error: "Canvas account already exists for this user/domain/account.",
          status: 409,
        };
      }
    }

    const mapped = getPrismaErrorMessage(
      error,
      "Failed to create Canvas account.",
    );

    return { ok: false, ...mapped };
  }
}

export async function deleteCanvasAccount(
  accountId: string,
  userId: string,
): Promise<Result> {
  try {
    await prisma.$transaction(async (tx) => {
      const account = await tx.canvasAccount.findFirst({
        where: { id: accountId, userId },
        select: { domainId: true },
      });

      if (!account) {
        throw Object.assign(new Error("Account not found."), { status: 404 });
      }

      await tx.canvasAccount.delete({
        where: { id: accountId },
      });

      const remaining = await tx.canvasAccount.count({
        where: { domainId: account.domainId },
      });

      if (remaining === 0) {
        await tx.canvasDomain.delete({
          where: { id: account.domainId },
        });
      }
    });

    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Account not found.") {
      return { ok: false, error: "Account not found.", status: 404 };
    }

    console.error("deleteCanvasAccount failed:", error);
    const mapped = getPrismaErrorMessage(
      error,
      "Failed to delete Canvas account.",
    );
    return { ok: false, ...mapped };
  }
}

export async function updateCanvasAccountToken(
  params: UpdateCanvasAccountTokenParams,
  db: DbClient = prisma,
): Promise<Result> {
  const { accountId, userId, token, accountInfo } = params;

  try {
    const result = await db.canvasAccount.updateMany({
      where: { id: accountId, userId },
      data: {
        accessToken: token,
        name: accountInfo.name,
        avatarUrl: accountInfo.avatarUrl,
        canvasId: accountInfo.canvasId,
        expiredAt: null,
      },
    });

    if (result.count === 0) {
      return { ok: false, error: "Account not found.", status: 404 };
    }

    return { ok: true };
  } catch (error) {
    console.error("updateCanvasAccountToken failed:", error);

    const mapped = getPrismaErrorMessage(
      error,
      "Failed to update Canvas account token.",
    );

    return { ok: false, ...mapped };
  }
}

export async function updateCanvasAccountInfo(
  params: UpdateCanvasAccountInfoParams,
  db: DbClient = prisma,
): Promise<Result> {
  const { accountId, userId, accountInfo } = params;

  try {
    const result = await db.canvasAccount.updateMany({
      where: { id: accountId, userId },
      data: {
        name: accountInfo.name,
        avatarUrl: accountInfo.avatarUrl,
        canvasId: accountInfo.canvasId,
      },
    });

    if (result.count === 0) {
      return { ok: false, error: "Account not found.", status: 404 };
    }

    return { ok: true };
  } catch (error) {
    console.error("updateCanvasAccountInfo failed:", error);

    const mapped = getPrismaErrorMessage(
      error,
      "Failed to update Canvas account info.",
    );

    return { ok: false, ...mapped };
  }
}

export async function markAccountAsExpired(
  params: MarkCanvasAccountExpiredParams,
  db: DbClient = prisma,
): Promise<Result> {
  const { accountId, expiredAt } = params;

  try {
    const result = await db.canvasAccount.updateMany({
      where: { id: accountId },
      data: { expiredAt },
    });

    if (result.count === 0) {
      return { ok: false, error: "Account not found.", status: 404 };
    }

    return { ok: true };
  } catch (error) {
    console.error("markAccountAsExpired failed:", error);

    const mapped = getPrismaErrorMessage(
      error,
      "Failed to mark account as expired.",
    );

    return { ok: false, ...mapped };
  }
}

export async function getUserCanvasAccounts(
  userId: string,
  accountIds?: string[],
  db: DbClient = prisma,
): Promise<CanvasAccountBaseInfo[]> {
  return db.canvasAccount.findMany({
    where: {
      userId,
      ...(accountIds?.length ? { id: { in: accountIds } } : {}),
    },
    orderBy: [{ canvasDomain: { name: "asc" } }, { name: "asc" }],
    select: canvasAccountBaseSelect,
  });
}

export async function getUserCanvasAccountsWithTokens(
  userId: string,
  accountIds?: string[],
  db: DbClient = prisma,
): Promise<CanvasAccountWithToken[]> {
  return db.canvasAccount.findMany({
    where: {
      userId,
      ...(accountIds?.length ? { id: { in: accountIds } } : {}),
    },
    orderBy: [{ canvasDomain: { name: "asc" } }, { name: "asc" }],
    select: canvasAccountWithTokenSelect,
  });
}

export async function getUserCanvasAccount(
  userId: string,
  accountId: string,
  db: DbClient = prisma,
): Promise<CanvasAccountSummary | null> {
  return db.canvasAccount.findFirst({
    where: { id: accountId, userId },
    select: canvasAccountSummarySelect,
  });
}
