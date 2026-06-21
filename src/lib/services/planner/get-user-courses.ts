import { getUserCanvasAccountsWithTokens } from "@/lib/data/canvas-account";
import { getAccountCourses } from "../../canvas";
import { decryptToken } from "../../server/crypto";
import { CourseFailure, UserCourse } from "../../types";
import { prisma } from "@/db";
import { resolveCourseColor } from "../../utils/colors/colors";
import { deleteCourseMetadataMany } from "@/lib/data/course-metadata";
import { after } from "next/server";

export async function getUserCourses(userId: string, accountIds?: string[]) {
  const [accounts, dbMetadata] = await Promise.all([
    getUserCanvasAccountsWithTokens(userId, accountIds),
    prisma.courseMetadata.findMany({ where: { userId } }),
  ]);

  if (!accounts) {
    throw new Error("Could not load Canvas accounts.");
  }
  if (accounts.length === 0) {
    throw new Error("No Canvas accounts found.");
  }

  const metadataMap = new Map(
    dbMetadata.map((m) => [`${m.domain}|${m.courseId}`, m]),
  );

  // Fetch all accounts in parallel
  const results = await Promise.all(
    accounts.map((a) =>
      getAccountCourses({
        baseUrl: a.canvasDomain.baseUrl,
        token: decryptToken(a.accessToken),
      }),
    ),
  );

  // Build a single deduped list
  const seen = new Map<string, UserCourse>();

  const failures: CourseFailure[] = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const a = accounts[i];

    if (!r.ok) {
      failures.push({
        accountId: a.id,
        baseUrl: a.canvasDomain.baseUrl,
        status: r.status,
        error: r.error,
      });
      continue;
    }

    for (const course of r.data) {
      const key = `${a.canvasDomain.baseUrl}|${course.id}`;
      // console.log(
      //   `Processing course for account ${a.name}: ${JSON.stringify(course)}`,
      // );
      if (!course.term.end_at || new Date(course.term.end_at) <= new Date()) {
        continue;
      }

      const existing = seen.get(key);
      if (!existing) {
        const resolvedColor = resolveCourseColor(
          course.id,
          a.canvasDomain.slug,
          metadataMap.get(`${a.canvasDomain.slug}|${course.id}`),
        );
        seen.set(key, {
          ...course,
          baseUrl: a.canvasDomain.baseUrl,
          domainName: a.canvasDomain.name,
          domainSlug: a.canvasDomain.slug,
          accountIds: [a.id],
          color: resolvedColor,
        });
      } else {
        existing.accountIds.push(a.id);
      }
    }
  }

  // Convert to array and sort
  const courses = Array.from(seen.values()).sort((a, b) => {
    // favor course name
    const an = a.name.toLowerCase();
    const bn = b.name.toLowerCase();
    return an.localeCompare(bn);
  });

  const allFailed = courses.length === 0 && failures.length > 0;
  if (allFailed) {
    throw new Error(`Failed to load courses from all accounts`);
  }

  // BACKGROUND TASK: Delete course metadata for courses that no longer exist
  after(async () => {
    const keysToDelete: Array<{ domain: string; courseId: number }> = [];

    for (const meta of dbMetadata) {
      const exists = seen.has(`${meta.domain}|${meta.courseId}`);
      if (!exists) {
        const daysSinceUpdate = Math.floor(
          (Date.now() - meta.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        // If the course hasn't been updated for over 30 days, delete the metadata
        if (daysSinceUpdate > 30) {
          console.log(
            `Deleting metadata for course ${meta.courseId} on ${meta.domain} (last updated ${daysSinceUpdate} days ago)`,
          );
          keysToDelete.push({
            domain: meta.domain,
            courseId: meta.courseId,
          });
        }
      }
    }
    try {
      console.log(`Metadata cleanup: ${keysToDelete.length} keys to delete`);
      if (keysToDelete.length > 0) {
        await deleteCourseMetadataMany(userId, keysToDelete);
      }
    } catch (error) {
      console.error("Error during metadata cleanup:", error);
    }
  });
  return { courses, failures };
}
