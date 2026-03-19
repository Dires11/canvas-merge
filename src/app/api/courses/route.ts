// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";

import { requireUserApi } from "@/lib/server/auth-server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { getUserCourses } from "@/lib/services/planner/get-user-courses";
import type { ApiResponse } from "@/lib/types/api-response";

type CoursesResponseData = {
  courses: Awaited<ReturnType<typeof getUserCourses>>["courses"];
  failures: Awaited<ReturnType<typeof getUserCourses>>["failures"];
  meta: {
    accountsRequested: number;
    coursesReturned: number;
    failures: number;
  };
};

export async function GET(req: NextRequest) {
  const user = await requireUserApi();

  const url = new URL(req.url);
  const accountIds = url.searchParams.getAll("accountIds");
  const filteredIds = accountIds.length > 0 ? accountIds : undefined;

  try {
    const { courses, failures } = await getUserCourses(user.id, filteredIds);

    const allFailed = courses.length === 0 && failures.length > 0;

    if (allFailed) {
      return NextResponse.json<ApiResponse>(
        apiError("Failed to load courses from all accounts.", 502),
        {
          status: 502,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const data: CoursesResponseData = {
      courses,
      failures,
      meta: {
        accountsRequested: filteredIds?.length ?? 0,
        coursesReturned: courses.length,
        failures: failures.length,
      },
    };

    return NextResponse.json<ApiResponse<CoursesResponseData>>(apiOk(data), {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to load courses:", error);

    return NextResponse.json<ApiResponse>(
      apiError(
        error instanceof Error
          ? error.message
          : "Failed to load Canvas courses.",
        500,
      ),
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
