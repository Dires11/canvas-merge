import { Prisma } from "@db/client";

import { prisma } from "@/lib/prisma";
import { getPrismaErrorMessage } from "./utils";
import type { Result, DataResult } from "@/lib/types/result";

type DbClient = typeof prisma | Prisma.TransactionClient;

type CreateCanvasDomainParams = {
  userId: string;
  baseUrl: string;
  name: string;
  slug: string;
};

const canvasDomainSelect = {
  id: true,
  baseUrl: true,
  name: true,
  slug: true,
} satisfies Prisma.CanvasDomainSelect;

export type CanvasDomainInfo = Prisma.CanvasDomainGetPayload<{
  select: typeof canvasDomainSelect;
}>;

export async function createCanvasDomain(
  params: CreateCanvasDomainParams,
  db: DbClient = prisma,
): Promise<DataResult<{ id: string }>> {
  const { userId, baseUrl, name, slug } = params;

  try {
    const domain = await db.canvasDomain.create({
      data: {
        userId,
        baseUrl,
        name,
        slug,
      },
      select: { id: true },
    });

    return { ok: true, data: { id: domain.id } };
  } catch (error) {
    console.error("createCanvasDomain failed:", error);

    const mapped = getPrismaErrorMessage(
      error,
      "Failed to create Canvas domain.",
    );

    return { ok: false, ...mapped };
  }
}

export async function deleteUserDomain(
  userId: string,
  id: string,
  db: DbClient = prisma,
): Promise<Result> {
  try {
    const deleted = await db.canvasDomain.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      return { ok: false, error: "Domain not found.", status: 404 };
    }

    return { ok: true };
  } catch (error) {
    console.error("deleteUserDomain failed:", error);

    const mapped = getPrismaErrorMessage(
      error,
      "Failed to delete Canvas domain.",
    );

    return { ok: false, ...mapped };
  }
}

export async function getUserDomains(
  userId: string,
  slugs?: string[],
  db: DbClient = prisma,
): Promise<CanvasDomainInfo[]> {
  return db.canvasDomain.findMany({
    where: {
      userId,
      ...(slugs?.length ? { slug: { in: slugs } } : {}),
    },
    select: canvasDomainSelect,
    orderBy: {
      name: "asc",
    },
  });
}

export async function getUserDomainById(
  userId: string,
  id: string,
  db: DbClient = prisma,
): Promise<CanvasDomainInfo | null> {
  return db.canvasDomain.findFirst({
    where: { id, userId },
    select: canvasDomainSelect,
  });
}

export async function getUserDomainByBaseUrl(
  userId: string,
  baseUrl: string,
  db: DbClient = prisma,
): Promise<CanvasDomainInfo | null> {
  return db.canvasDomain.findUnique({
    where: {
      userId_baseUrl: {
        userId,
        baseUrl,
      },
    },
    select: canvasDomainSelect,
  });
}
