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
    const result = await upsertCourseColor({ userId, courseId, domain, color });
    if (!result.ok) throw new Error("Failed to save course color");
  } catch (error) {
    console.error("Error updating course color:", error);
    throw new Error("Failed to update course color");
  }
  revalidatePath("/dashboard");
}
