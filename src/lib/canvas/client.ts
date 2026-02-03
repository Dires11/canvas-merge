import type { Account, AccountInfo } from "@/lib/types";
import { readCanvasError } from "./errors";
import { ok } from "assert";

type CanvasError = {
  message?: string;
  expiredAt?: Date;
  raw: string;
};

type GetAccountInfoResult =
  | { ok: true; data: AccountInfo }
  | {
      ok: false;
      status: number;
      error: CanvasError;
    };
/**
 * Fetches basic account info from Canvas API using the provided account details
 * @param account The Canvas account with domain and token
 * @returns An object with either the account info or an error details
 *
 * e.g. { ok: true, data: { accountCanvasId, name, domain, avatarUrl } }
 *
 * or { ok: false, status, error: { message, expiredAt, raw } }
 */
export async function getAccountInfo(
  account: Account,
): Promise<GetAccountInfoResult> {
  const url = new URL("/api/v1/users/self", account.domain);
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${account.token}`,
    },
  });

  if (!res.ok) {
    const err = await readCanvasError(res);
    return { ok: false, status: res.status, error: err };
  }

  const raw = await res.json();
  return {
    ok: true,
    data: {
      accountCanvasId: raw.id,
      name: raw.name,
      domain: account.domain,
      avatarUrl: raw.avatar_url,
    },
  };
}
type getCourseTimezoneResult =
  | { ok: true; timezone: string }
  | {
      ok: false;
      status: number;
      error: CanvasError;
    };

/**
 *Fetches the timezone of the first course found for the user in IANA format
 * @param account The Canvas account with domain and token
 * @returns An object with either the timezone string or an error details
 */
async function getCourseTimezone(
  account: Account,
): Promise<getCourseTimezoneResult> {
  const url = new URL("/api/v1/users/self/courses", account.domain);
  url.searchParams.set("per_page", "1");
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${account.token}`,
    },
  });

  if (!res.ok) {
    return { ok: false, status: res.status, error: await readCanvasError(res) };
  }
  const courses = await res.json();
  if (courses.length === 0) {
    return {
      ok: false,
      status: 404,
      error: {
        message: "Was able to access api endpoint but no courses found",
        raw: "",
      },
    };
  }
  return { ok: true, timezone: courses[0].time_zone };
}
