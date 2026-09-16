import { prisma } from "@/db";
import { getUserCanvasAccountsWithTokens } from "@/lib/data/canvas-account";
import { decryptToken } from "@/lib/server/crypto";
import { getGradeCourses } from "@/lib/canvas/grades";
import type { GradesData } from "@/lib/types/grades";

export async function getUserGrades(userId: string): Promise<GradesData> {
  const accounts = await getUserCanvasAccountsWithTokens(userId);
  const colors = await prisma.courseMetadata.findMany({
    where: { userId },
    select: { courseId: true, domain: true, l: true, c: true, h: true },
  });
  const colorMap = new Map(
    colors.map((color) => [
      `${color.domain}|${color.courseId}`,
      { l: color.l, c: color.c, h: color.h },
    ]),
  );
  const data: GradesData = {
    grades: [],
    failures: [],
    updatedAt: new Date().toISOString(),
  };
  await Promise.all(
    accounts.map(async (account) => {
      try {
        const result = await getGradeCourses(
          account.canvasDomain.baseUrl,
          decryptToken(account.accessToken),
        );
        if (!result.ok)
          throw new Error(
            "Canvas could not load grades. Check the account connection and try again.",
          );
        for (const course of result.data) {
          const enrollment = course.enrollments?.find(
            (e) => e.type === "student",
          );
          data.grades.push({
            accountId: account.id,
            studentName: account.name,
            avatarUrl: account.avatarUrl,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.course_code,
            color: colorMap.get(`${account.canvasDomain.slug}|${course.id}`),
            baseUrl: account.canvasDomain.baseUrl,
            school: account.canvasDomain.name,
            score: course.hide_final_grades
              ? null
              : (enrollment?.computed_current_score ?? null),
            grade: course.hide_final_grades
              ? null
              : (enrollment?.computed_current_grade ?? null),
          });
        }
      } catch {
        data.failures.push({
          accountId: account.id,
          studentName: account.name,
          expiredAt: account.expiredAt?.toISOString() ?? null,
          message:
            "Could not load grades. Check this account’s connection and try again.",
        });
      }
    }),
  );
  data.grades.sort(
    (a, b) =>
      a.courseName.localeCompare(b.courseName) ||
      a.studentName.localeCompare(b.studentName),
  );
  return data;
}
