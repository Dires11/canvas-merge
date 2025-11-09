import prisma from "../prisma";

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
  return prisma.canvasAccount.create({
    data: {
      userId,
      domain,
      accessToken,
    },
  });
}
