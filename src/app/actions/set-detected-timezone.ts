"use server";

import { prisma } from "@/db";
import { auth } from "@clerk/nextjs/server";

export async function setDetectedTimeZone(detectedTimezone: string) {
  if (!detectedTimezone || detectedTimezone.length > 64) return;
  if (!detectedTimezone.includes("/")) return;

  const { userId } = await auth();
  if (!userId) return;

  const existing = await prisma.userSettings.findUnique({
    where: { userId },
    select: { detectedTimezone: true },
  });

  if (existing?.detectedTimezone === detectedTimezone) return;

  await prisma.userSettings.upsert({
    where: { userId },
    update: { detectedTimezone },
    create: { userId, detectedTimezone },
  });
}
