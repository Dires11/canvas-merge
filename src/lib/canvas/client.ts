import type { Account, AccountInfo } from "@/lib/types";
import { readCanvasError } from "./errors";

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
