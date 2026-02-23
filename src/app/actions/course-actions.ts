// lib/actions/course-actions.ts
"use server";

import { requireUserAction } from "@/lib/auth-server";
import { upsertCourseColor } from "@/data/course-metadata";
import { revalidatePath } from "next/cache";

export async function updateCourseColor(
  courseId: number,
  domain: string,
  color: { l: number; c: number; h: number },
) {
  const user = await requireUserAction();
  try {
    console.log("Updating course color for user", {
      userId: user.id,
      courseId,
      domain,
      color,
    });
    await upsertCourseColor({ userId: user.id, courseId, domain, color });
  } catch (error) {
    console.error("Error updating course color:", error);
    throw new Error("Failed to update course color");
  }
  // 3. Clear the cache
  revalidatePath("/dashboard");
}
