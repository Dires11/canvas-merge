import type { Course } from "@/lib/types";
import type { CanvasAccountInfo } from "@/lib/types/index";
import { canvasFetchJson, CanvasResult } from "./fetch";

type CanvasUserSelf = {
  id: number;
  name: string;
  avatar_url: string;
};

type CanvasCredentials = {
  baseUrl: string;
  token: string;
};

/**
 * Fetches basic account info from Canvas API using the provided account details
 * @param account The Canvas account with domain and token
 * @returns An object with either the account info or an error details
 *
 * e.g. { ok: true, status: 200, data: { canvasId, name, domain, avatarUrl } }
 *
 * or { ok: false, status: 401, error: { message, expiredAt, raw } }
 */
export async function getAccountInfo({
  baseUrl,
  token,
}: CanvasCredentials): Promise<CanvasResult<CanvasAccountInfo>> {
  const res = await canvasFetchJson<CanvasUserSelf>(
    baseUrl,
    "/api/v1/users/self",
    { token: token },
  );

  if (!res.ok) {
    if (res.status === 0) {
      return {
        ok: false as const,
        status: 400,
        error: {
          message:
            "This URL doesn't appear to host Canvas. Please make sure to include the full URL.",
          raw: res.error.raw,
        },
      };
    }
    return { ok: false as const, status: res.status, error: res.error };
  }

  const raw = res.data;
  return {
    ok: true as const,
    status: res.status,
    data: {
      canvasId: raw.id,
      name: raw.name,
      avatarUrl: raw.avatar_url,
    },
  };
}

export async function getAccountCourses({
  baseUrl,
  token,
}: CanvasCredentials): Promise<CanvasResult<Course[]>> {
  const res = await canvasFetchJson<Course[]>(
    baseUrl,
    "/api/v1/users/self/courses",
    {
      token,
      searchParams: {
        include: "term",
        enrollment_state: "active",
        per_page: 100,
      },
    },
  );

  if (!res.ok) {
    return { ok: false, status: res.status, error: res.error };
  }
  const raw = res.data;
  return {
    ok: true,
    status: res.status,
    data: raw.map((course) => ({
      id: course.id,
      name: course.name,
      course_code: course.course_code,
      term: {
        id: course.term.id,
        name: course.term.name,
        start_at: course.term.start_at,
        end_at: course.term.end_at,
      },
    })),
  };
}
