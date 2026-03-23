import { encryptToken } from "@/lib/server/crypto";
import { getAccountInfo } from "@/lib/canvas";
import {
  createCanvasAccount,
  deleteCanvasAccount,
  getUserCanvasAccount,
  updateCanvasAccountToken,
} from "@/lib/data/canvas-account";
import {
  createCanvasDomain,
  getUserDomainByBaseUrl,
} from "@/lib/data/canvas-domain";
import { getPrismaErrorMessage } from "@/lib/data/utils";
import { prisma } from "@/lib/prisma";
import { generateUrlSlug } from "@/lib/utils/generate-slug";
import type { AddAccountInput, CanvasAccountInfo } from "@/lib/types/account";
import type { DataResult, Result } from "@/lib/types/result";

async function testConnection(
  baseUrl: string,
  token: string,
): Promise<DataResult<CanvasAccountInfo>> {
  const result = await getAccountInfo({ baseUrl, token });
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.error.message ??
        "Failed to connect to Canvas. Make sure your token is valid.",
      status: result.status,
    };
  }

  return { ok: true, data: result.data };
}

export async function addCanvasAccountForUser(
  params: { userId: string } & AddAccountInput,
): Promise<DataResult<{ name: string; baseUrl: string }>> {
  const { userId, baseUrl, token, domainName } = params;

  const testConnectionResult = await testConnection(baseUrl, token);
  if (!testConnectionResult.ok) {
    return testConnectionResult;
  }
  const accountInfo: CanvasAccountInfo = testConnectionResult.data;
  const domainSlug = generateUrlSlug(baseUrl);
  const encryptedToken = encryptToken(token);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingDomain = await getUserDomainByBaseUrl(userId, baseUrl, tx);

      if (existingDomain && existingDomain.name !== domainName) {
        return {
          ok: false as const,
          error: `The domain "${existingDomain.baseUrl}" is already saved as "${existingDomain.name}". Please use that name instead.`,
          status: 409,
        };
      }

      let domainId: string;

      if (existingDomain) {
        domainId = existingDomain.id;
      } else {
        const createdDomain = await createCanvasDomain(
          {
            userId,
            baseUrl,
            name: domainName,
            slug: domainSlug,
          },
          tx,
        );

        if (!createdDomain.ok) {
          return createdDomain;
        }

        domainId = createdDomain.data.id;
      }

      const createdAccount = await createCanvasAccount(
        {
          userId,
          accessToken: encryptedToken,
          accountInfo,
          domainId,
        },
        tx,
      );

      if (!createdAccount.ok) {
        return createdAccount;
      }

      return {
        ok: true as const,
        data: {
          name: accountInfo.name,
          baseUrl,
        },
      };
    });

    return result;
  } catch (error) {
    console.error("addCanvasAccountForUser transaction failed:", error);

    const mapped = getPrismaErrorMessage(
      error,
      "Failed to save Canvas account.",
    );

    return { ok: false as const, ...mapped };
  }
}

export async function updateCanvasTokenForUser(
  userId: string,
  accountId: string,
  newToken: string,
): Promise<Result> {
  const account = await getUserCanvasAccount(userId, accountId);
  if (!account) {
    return {
      ok: false,
      error: "Account not found.",
      status: 404,
    };
  }
  const testConnectionResult = await testConnection(
    account.canvasDomain.baseUrl,
    newToken,
  );
  if (!testConnectionResult.ok) {
    return testConnectionResult;
  }

  const encryptedToken = encryptToken(newToken);
  return updateCanvasAccountToken({ accountId, userId, token: encryptedToken });
}

export async function deleteCanvasAccountForUser(
  userId: string,
  accountId: string,
): Promise<Result> {
  return deleteCanvasAccount(accountId, userId);
}
