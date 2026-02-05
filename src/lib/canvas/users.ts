import type { Account, AccountInfo } from "@/lib/types";
import { canvasFetchJson, CanvasResult } from "./fetch";

type CanvasUserSelf = {
  id: number;
  name: string;
  avatar_url: string;
};

/**
 * Fetches basic account info from Canvas API using the provided account details
 * @param account The Canvas account with domain and token
 * @returns An object with either the account info or an error details
 *
 * e.g. { ok: true, status: 200, data: { accountCanvasId, name, domain, avatarUrl } }
 *
 * or { ok: false, status: 401, error: { message, expiredAt, raw } }
 */
export async function getAccountInfo(
  account: Account,
): Promise<CanvasResult<AccountInfo>> {
  const res = await canvasFetchJson<CanvasUserSelf>(
    account.domain,
    "/api/v1/users/self",
    { token: account.token },
  );

  if (!res.ok) {
    return { ok: false, status: res.status, error: res.error };
  }

  const raw = res.data;
  return {
    ok: true,
    status: res.status,
    data: {
      accountCanvasId: raw.id,
      name: raw.name,
      domain: account.domain,
      avatarUrl: raw.avatar_url,
    },
  };
}

export async function getAccountCourses(
  account: Account,
): Promise<CanvasResult<any[]>> {
  const res = await canvasFetchJson<any[]>(
    account.domain,
    "/api/v1/users/self/courses",
    {
      token: account.token,
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

  return { ok: true, status: res.status, data: res.data };
}
