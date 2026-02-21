import { prisma } from "@/lib/prisma";

export async function getCourseMetadata(
  userId: string,
  courseId: number,
  domain: string,
) {
  return prisma.courseMetadata.findUnique({
    where: { courseId_domain_userId: { courseId, domain, userId } },
  });
}

export async function upsertCourseColor(params: {
  userId: string;
  courseId: number;
  domain: string;
  color: { l: number; c: number; h: number };
}) {
  const { userId, courseId, domain, color } = params;

  return await prisma.courseMetadata.upsert({
    where: {
      courseId_domain_userId: { courseId, domain, userId },
    },
    update: { l: color.l, c: color.c, h: color.h },
    create: { courseId, domain, userId, l: color.l, c: color.c, h: color.h },
  });
}

export async function deleteCourseMetadataMany(
  userId: string,
  keys: Array<{ domain: string; courseId: number }>,
) {
  await prisma.courseMetadata.deleteMany({
    where: {
      userId,
      OR: keys.map((k) => ({ domain: k.domain, courseId: k.courseId })),
    },
  });
}
