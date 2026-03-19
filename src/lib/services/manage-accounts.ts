import { encryptToken } from "@/lib/server/crypto";
import { getAccountInfo } from "@/lib/canvas";
import { createCanvasAccount } from "@/lib/data/canvas-account";
import {
  createCanvasDomain,
  getUserDomainByBaseUrl,
} from "@/lib/data/canvas-domain";
import { getPrismaErrorMessage } from "@/lib/data/utils";
import { prisma } from "@/lib/prisma";
import { generateUrlSlug } from "@/lib/utils/generate-slug";
import type { AddAccountInput, CanvasAccountInfo } from "@/lib/types/account";
import type { DataResult } from "@/lib/types/result";

export async function addCanvasAccountForUser(
  params: { userId: string } & AddAccountInput,
): Promise<DataResult<{ name: string; baseUrl: string }>> {
  const { userId, baseUrl, token, domainName } = params;

  let testConnection;
  try {
    testConnection = await getAccountInfo({ baseUrl, token });
  } catch (error) {
    console.error("Unexpected Canvas connection test failure:", error);
    return {
      ok: false,
      error: "Failed to connect to Canvas.",
      status: 500,
    };
  }

  if (!testConnection.ok) {
    return {
      ok: false,
      error: testConnection.error.message ?? "Failed to connect to Canvas.",
      status: testConnection.status,
    };
  }

  const accountInfo: CanvasAccountInfo = testConnection.data;
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
