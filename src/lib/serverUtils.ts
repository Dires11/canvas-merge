import { NextRequest, NextResponse } from "next/server";
import type { Account } from "@/lib/types";

export function isValidDomain(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "https:"; // require HTTPS
  } catch {
    return false;
  }
}

export async function getAccountInfo(account: Account) {
  const url = new URL("/api/v1/users/self", account.domain);
  const accountInfo = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${account.token}`,
    },
  });
  if (!accountInfo.ok) {
    const text = await accountInfo.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Failed to get account info",
        domain: account.domain,
        status: accountInfo.status,
        details: text.slice(0, 200),
      },
      { status: accountInfo.status }
    );
  }
  const rawAccountInfo = await accountInfo.json();
  const cleanedAccountInfo = {
    id: rawAccountInfo.id,
    name: rawAccountInfo.name,
    email: rawAccountInfo.email,
    avatar_url: rawAccountInfo.avatar_url,
  };

  return NextResponse.json(cleanedAccountInfo);
}
