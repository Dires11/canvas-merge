import { NextRequest, NextResponse } from "next/server";
import type { Account } from "@/lib/types";

import { isValidDomain } from "@/lib/canvas";

async function getAccountInfo(account: Account) {
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
    avatar_url: rawAccountInfo.avatar_url,
  };

  return NextResponse.json(cleanedAccountInfo);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Account;
  if (!body.domain || !body.token) {
    return NextResponse.json(
      { error: "Missing domain or token" },
      { status: 400 }
    );
  }
  if (!isValidDomain(body.domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  return getAccountInfo(body);
}
