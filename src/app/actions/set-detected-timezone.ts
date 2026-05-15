"use server";

import { prisma } from "@/db";
import { auth } from "@/lib/auth/server";

export async function setDetectedTimeZone(detectedTimezone: string) {
  console.log("setDetectedTimeZone called with:", detectedTimezone);
  // Validate basic shape (IANA TZ strings include "/")
  if (!detectedTimezone || detectedTimezone.length > 64) return;
  if (!detectedTimezone.includes("/")) return;

  // If user is not logged in, do nothing
  const { data: session } = await auth.getSession();
  if (!session?.user) return;

  const user = session.user;

  const existing = await prisma.userSettings.findUnique({
    where: { userId: user.id },
    select: { detectedTimezone: true },
  });

  // ✅ No-op if unchanged
  if (existing?.detectedTimezone === detectedTimezone) return;

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { detectedTimezone },
    create: { userId: user.id, detectedTimezone },
  });
}
