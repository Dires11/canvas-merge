import { prisma } from "@/db";

export async function getDetectedTimeZoneForUser(
  userId: string,
): Promise<string | null> {
  const tz = await prisma.userSettings.findUnique({
    where: { userId },
    select: { detectedTimezone: true },
  });

  return tz?.detectedTimezone ?? null;
}
