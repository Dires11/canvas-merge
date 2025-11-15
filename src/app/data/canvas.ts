import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import prisma from "../lib/prisma";

export async function getUserCanvasAccounts(userId: string) {
  return prisma.canvasAccount.findMany({
    where: { userId },
  });
}

export async function createCanvasAccount(
  userId: string,
  domain: string,
  accessToken: string
) {
  try {
    const account = await prisma.canvasAccount.create({
      data: { userId, domain, accessToken },
    });
    return { ok: true, account };
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      // Prisma known error (constraint, invalid data, etc.)
      if (error.code === "P2002") {
        // Unique constraint violation (duplicate)
        return {
          ok: false,
          message: "Canvas account for this domain already exists.",
        };
      }
      return { ok: false, message: `Database error (${error.code})` };
    }

    // Unknown or runtime error
    return { ok: false, message: "Unexpected server error." };
  }
}
