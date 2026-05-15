import { prisma } from "@/db";
import { getPrismaErrorMessage } from "./utils";
import type { Result, DataResult } from "@/lib/types/result";

export async function getCourseMetadata(
  userId: string,
  courseId: number,
  domain: string,
) {
  return prisma.courseMetadata.findUnique({
    where: {
      courseId_domain_userId: { courseId, domain, userId },
    },
  });
}

export async function upsertCourseColor(params: {
  userId: string;
  courseId: number;
  domain: string;
  color: { l: number; c: number; h: number };
}): Promise<DataResult<{ courseId: number; domain: string; userId: string }>> {
  const { userId, courseId, domain, color } = params;

  try {
    const metadata = await prisma.courseMetadata.upsert({
      where: {
        courseId_domain_userId: { courseId, domain, userId },
      },
      update: {
        l: color.l,
        c: color.c,
        h: color.h,
      },
      create: {
        courseId,
        domain,
        userId,
        l: color.l,
        c: color.c,
        h: color.h,
      },
      select: {
        courseId: true,
        domain: true,
        userId: true,
      },
    });

    return { ok: true, data: metadata };
  } catch (error) {
    console.error("upsertCourseColor failed:", error);

    const mapped = getPrismaErrorMessage(error, "Failed to save course color.");

    return { ok: false, ...mapped };
  }
}

export async function deleteCourseMetadataMany(
  userId: string,
  keys: Array<{ domain: string; courseId: number }>,
): Promise<Result> {
  if (keys.length === 0) {
    return { ok: true };
  }

  try {
    await prisma.courseMetadata.deleteMany({
      where: {
        userId,
        OR: keys.map((k) => ({
          domain: k.domain,
          courseId: k.courseId,
        })),
      },
    });

    return { ok: true };
  } catch (error) {
    console.error("deleteCourseMetadataMany failed:", error);

    const mapped = getPrismaErrorMessage(
      error,
      "Failed to delete course metadata.",
    );

    return { ok: false, ...mapped };
  }
}
