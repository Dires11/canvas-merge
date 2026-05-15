"use server";

import { auth } from "@clerk/nextjs/server";
import { upsertCourseColor } from "@/lib/data/course-metadata";
import { revalidatePath } from "next/cache";

export async function updateCourseColor(
  courseId: number,
  domain: string,
  color: { l: number; c: number; h: number },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHORIZED");

  try {
    await upsertCourseColor({ userId, courseId, domain, color });
  } catch (error) {
    console.error("Error updating course color:", error);
    throw new Error("Failed to update course color");
  }
  revalidatePath("/dashboard");
}
