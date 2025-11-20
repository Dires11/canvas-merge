import { NextRequest, NextResponse } from "next/server";
import type { Account, AccountInfo } from "@/lib/types";
import { stackServerApp } from "@/stack/server";

export async function requireUser() {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
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
        error: "Failed to connect to Canvas API",
        domain: account.domain,
        status: accountInfo.status,
        details: text.slice(0, 200),
      },
      { status: accountInfo.status }
    );
  }
  const rawAccountInfo = await accountInfo.json();
  const cleanedAccountInfo: AccountInfo = {
    accountCanvasId: rawAccountInfo.id,
    name: rawAccountInfo.name,
    domain: account.domain,
    avatarUrl: rawAccountInfo.avatar_url,
  };

  return NextResponse.json(cleanedAccountInfo, { status: 200 });
}
