import { getUserOr401 } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";
import { getUserCanvasAccounts } from "@/data/canvas";
import type {
  Announcement,
  Assignment,
  ItemBase,
  ItemsByType,
  MergedItems,
} from "@/lib/types";

function weekBoundsUTC() {
  const now = new Date();
  const day = now.getUTCDay();
  const mondayOffset = (day + 6) % 7;
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - mondayOffset,
      8,
      0,
      0,
      0
    )
  );
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

const ASSIGNMENT_TYPE = new Set(["assignment", "discussion_topic", "quiz"]);

async function getPlannerItems(
  domain: string,
  token: string,
  startISO: string,
  endISO: string
) {
  const url = new URL("/api/v1/planner/items", domain);
  url.searchParams.set("start_date", startISO);
  url.searchParams.set("end_date", endISO);
  url.searchParams.set("per_page", "100");

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }, // PAT
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Canvas ${domain} ${r.status}: ${text.slice(0, 200)}`);
  }
  return r.json();
}

function normalize(accountId: string, domain: string, items: any) {
  const itemsByType: ItemsByType = {
    account: accountId,
    assignments: [],
    announcements: [],
    other: [],
  };

  if (!items || !Array.isArray(items)) {
    return itemsByType;
  }

  for (const item of items) {
    const baseItem: ItemBase = {
      id: item.plannable_id,
      course_id: item.course_id,
      type: item.plannable_type,
      title: item.plannable.title,
      course_name: item.context_name,
      url: new URL(item.html_url, domain).toString(),
    };
    if (item.plannable_type === "announcement") {
      const announcement: Announcement = {
        ...baseItem,
        posted_at: item.plannable_date,
      };
      itemsByType.announcements.push(announcement);
      continue;
    } else if (ASSIGNMENT_TYPE.has(item.plannable_type)) {
      const assignment: Assignment = {
        ...baseItem,
        due_at: item.plannable.due_at,
        points_possible: item.plannable.points_possible,
        submission: {
          submitted: item.submissions?.submitted || false,
          graded: item.submissions?.graded || false,
          late: item.submissions?.late || false,
          missing: item.submissions?.missing || false,
        },
      };
      itemsByType.assignments.push(assignment);
      continue;
    } else {
      itemsByType.other.push(baseItem);
      continue;
    }
  }

  itemsByType.assignments.sort((a, b) => {
    if (a.due_at && b.due_at) {
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    } else if (a.due_at) {
      return -1;
    } else if (b.due_at) {
      return 1;
    } else {
      return 0;
    }
  });

  itemsByType.announcements.sort((a, b) => {
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  return itemsByType;
}

function mergeItemsByDomain(itemsByDomain: ItemsByType[]): MergedItems {
  const merged: MergedItems = {
    assignments: [],
    announcements: [],
    other: [],
  };
  for (const items of itemsByDomain) {
    for (const assignment of items.assignments) {
      const existsing = merged.assignments.find(
        (a) => a.id === assignment.id && a.course_id === assignment.course_id
      );
      if (existsing) {
        existsing.accounts.push({
          accountId: items.account,
          submission: assignment.submission,
        });
      } else {
        merged.assignments.push({
          ...assignment,
          accounts: [
            { accountId: items.account, submission: assignment.submission },
          ],
        });
      }
    }
    for (const announcement of items.announcements) {
      const existing = merged.announcements.find(
        (a) =>
          a.id === announcement.id && a.course_id === announcement.course_id
      );
      if (!existing) {
        merged.announcements.push(announcement);
      }
    }
    for (const other of items.other) {
      const existing = merged.other.find(
        (o) => o.id === other.id && o.course_id === other.course_id
      );
      if (existing) {
        existing.accounts.push({ accountId: items.account });
      } else {
        merged.other.push({
          ...other,
          accounts: [{ accountId: items.account }],
        });
      }
    }
  }
  merged.assignments.sort((a, b) => {
    if (a.due_at && b.due_at) {
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    } else if (a.due_at) {
      return -1;
    } else if (b.due_at) {
      return 1;
    } else {
      return 0;
    }
  });
  merged.announcements.sort((a, b) => {
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });
  merged.other.sort((a, b) => {
    return a.title.localeCompare(b.title);
  });
  return merged;
}

type ItemsByDomain = {
  [key: string]: ItemsByType[];
};

export async function GET(req: NextRequest) {
  const { user, response } = await getUserOr401();
  if (response) return response;
  const params = req.nextUrl.searchParams;
  const merge = params.get("merge") === "true";

  const accounts = await getUserCanvasAccounts(user.id, true);
  if (accounts.length === 0) {
    return NextResponse.json({ error: "No accounts found" }, { status: 404 });
  }
  const accountsWithErrors = [];
  const { startISO, endISO } = weekBoundsUTC();

  let itemsByDomain: ItemsByDomain = {};
  for (const account of accounts) {
    if (account.expired) {
      accountsWithErrors.push(account);
      continue;
    }
    try {
      const raw = await getPlannerItems(
        account.domain,
        account.accessToken,
        startISO,
        endISO
      );
      const accountItems = normalize(account.id, account.domain, raw);
      if (
        accountItems.assignments.length === 0 &&
        accountItems.announcements.length === 0 &&
        accountItems.other.length === 0
      ) {
        continue;
      }
      if (!itemsByDomain[account.domain]) {
        itemsByDomain[account.domain] = [];
      }
      itemsByDomain[account.domain].push(accountItems);
    } catch (error) {
      console.error(
        `Error fetching planner items for account ${account.id} (${account.domain}):`,
        error
      );
      accountsWithErrors.push(account);
      continue;
    }
  }
  if (accountsWithErrors.length == accounts.length) {
    return NextResponse.json(
      { error: "All accounts failed to fetch planner items" },
      { status: 500 }
    );
  }
  if (merge) {
    const itemsByDomainMerged: { [key: string]: MergedItems } = {};
    for (const domain in itemsByDomain) {
      itemsByDomainMerged[domain] = mergeItemsByDomain(itemsByDomain[domain]);
    }
    return NextResponse.json(itemsByDomainMerged, { status: 200 });
  }
  return NextResponse.json(itemsByDomain, { status: 200 });
}
