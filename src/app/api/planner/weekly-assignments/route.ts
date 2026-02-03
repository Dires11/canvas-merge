import { NextRequest, NextResponse } from "next/server";
import {
  getUserCanvasAccounts,
  markAccountAsExpired,
} from "@/data/canvas-account";
import type {
  AccountSafeInfo,
  Announcement,
  Assignment,
  ItemBase,
  ItemsByDomain,
  ItemsByType,
  MergedItems,
  MergedItemsByDomain,
  SubmissionDetails,
} from "@/lib/types";
import { decryptToken } from "@/lib/crypto";
import { requireUserApi } from "@/lib/auth-server";
import { DateTime } from "luxon";
import { getDetectedTimeZoneForUser } from "@/data/user-settings";

function getUTCWeekRange(timezone: string, baseDate: Date = new Date()) {
  // 1. Create the time in the target timezone
  const localDt = DateTime.fromJSDate(baseDate).setZone(timezone);

  // 2. Find the start of the week (Monday 00:00) in that timezone
  const startOfMondayLocal = localDt.startOf("week");
  const nextMondayLocal = startOfMondayLocal.plus({ days: 7 });

  // 3. Convert both to UTC
  return {
    startISO: startOfMondayLocal.toUTC().toISO() as string,
    endISO: nextMondayLocal.toUTC().toISO() as string,
  };
}

const ASSIGNMENT_TYPE = new Set(["assignment", "discussion_topic", "quiz"]);

async function getPlannerItems(
  domain: string,
  token: string,
  startISO: string,
  endISO: string,
) {
  const url = new URL("/api/v1/planner/items", domain);
  url.searchParams.set("start_date", startISO);
  url.searchParams.set("end_date", endISO);
  url.searchParams.set("per_page", "100");

  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }, // PAT
  });

  if (!r.ok) {
    let errorBody: any;

    const contentType = r.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      errorBody = await r.json();
    } else {
      const text = await r.text().catch(() => "");
      errorBody = { raw: text };
    }
    const expiredAt = errorBody?.errors?.[0]?.expired_at
      ? new Date(errorBody.errors[0].expired_at)
      : null;

    const message =
      errorBody?.errors?.[0]?.message ?? `Canvas ${domain} ${r.status}`;

    const error = new Error(message);

    // attach useful metadata
    (error as any).status = r.status;
    (error as any).expiredAt = expiredAt;
    (error as any).errorBody = errorBody;

    throw error;
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

type BucketKey =
  | "accountsSubmitted"
  | "accountsMissingSubmission"
  | "accountsNotSubmitted";

function getBucket(submission: SubmissionDetails): BucketKey {
  if (submission.submitted) return "accountsSubmitted";
  if (!submission.submitted && submission.missing)
    return "accountsMissingSubmission";
  return "accountsNotSubmitted";
}

function mergeItemsByDomain(itemsByDomain: ItemsByType[]): MergedItems {
  type MergedAssignment = MergedItems["assignments"][number];
  type MergedAnnouncement = MergedItems["announcements"][number];
  type MergedOther = MergedItems["other"][number];

  const assignmentsMap = new Map<string, MergedAssignment>();
  const announcementsMap = new Map<string, MergedAnnouncement>();
  const otherMap = new Map<string, MergedOther>();

  const makeKey = (id: string | number, courseId: string | number) =>
    `${id}:${courseId}`;

  for (const items of itemsByDomain) {
    // ASSIGNMENTS
    for (const assignment of items.assignments) {
      const key = makeKey(assignment.id, assignment.course_id);
      let existing = assignmentsMap.get(key);

      if (!existing) {
        existing = {
          ...assignment,
          accountsSubmitted: [],
          accountsMissingSubmission: [],
          accountsNotSubmitted: [],
        };
        assignmentsMap.set(key, existing);
      }

      const bucket = getBucket(assignment.submission); // "accountsSubmitted" | "accountsMissingSubmission" | "accountsNotSubmitted"

      existing[bucket].push({
        accountId: items.account,
        submission: assignment.submission,
      });
    }

    // ANNOUNCEMENTS
    for (const announcement of items.announcements) {
      const key = makeKey(announcement.id, announcement.course_id);
      if (!announcementsMap.has(key)) {
        announcementsMap.set(key, announcement);
      }
    }

    // OTHER
    for (const other of items.other) {
      const key = makeKey(other.id, other.course_id);
      let existing = otherMap.get(key);

      if (!existing) {
        existing = {
          ...other,
          accounts: [],
        };
        otherMap.set(key, existing);
      }

      existing.accounts.push({ accountId: items.account });
    }
  }

  const merged: MergedItems = {
    assignments: Array.from(assignmentsMap.values()),
    announcements: Array.from(announcementsMap.values()),
    other: Array.from(otherMap.values()),
  };

  // Sort by due date
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
  // Sort by date posted
  merged.announcements.sort((a, b) => {
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  // Sort by title
  merged.other.sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  return merged;
}

export async function getWeeklyAssignments(
  userId: string,
  merge: boolean = true,
) {
  const allAccounts = await getUserCanvasAccounts(userId, true);
  if (allAccounts.length === 0) {
    throw new Error("No accounts found");
  }

  const accountsSafeInfo: AccountSafeInfo[] = allAccounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    avatarUrl: acc.avatarUrl,
    expiredAt: acc.expiredAt,
  }));

  const accountsWithErrors: string[] = [];
  const { startISO, endISO } = getUTCWeekRange(
    (await getDetectedTimeZoneForUser(userId)) || "UTC",
  );

  let itemsByDomain: ItemsByDomain = {};
  const fetchPromises = allAccounts.map(async (account) => {
    if (account.expiredAt !== null) {
      return {
        account,
        accountItems: null,
        error: { message: "Account expired" },
      };
    }
    try {
      const raw = await getPlannerItems(
        account.domain,
        decryptToken(account.accessToken),
        startISO,
        endISO,
      );
      const accountItems = normalize(account.id, account.domain, raw);
      return { account, accountItems, error: null };
    } catch (error: any) {
      if (error.expiredAt) {
        await markAccountAsExpired(account.id, error.expiredAt);
      }
      return { account, accountItems: null, error };
    }
  });

  const results = await Promise.allSettled(fetchPromises);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.accountItems) {
      const { account, accountItems } = result.value;
      if (
        accountItems.assignments.length > 0 ||
        accountItems.announcements.length > 0 ||
        accountItems.other.length > 0
      ) {
        if (!itemsByDomain[account.domain]) {
          itemsByDomain[account.domain] = [];
        }
        itemsByDomain[account.domain].push(accountItems);
      }
    } else if (result.status === "fulfilled" && result.value.error) {
      accountsWithErrors.push(result.value.account.id);
    } else if (result.status === "rejected") {
      // Handle rejected promise (uncaught error)
      console.error("Promise rejected:", result.reason);
    }
  }
  if (accountsWithErrors.length == allAccounts.length) {
    throw new Error("All accounts failed to fetch planner items");
  }

  if (merge) {
    const itemsByDomainMerged: { [key: string]: MergedItems } = {};
    for (const domain in itemsByDomain) {
      itemsByDomainMerged[domain] = mergeItemsByDomain(itemsByDomain[domain]);
    }
    return {
      merged: itemsByDomainMerged,
      accountsSafeInfo,
      accountsWithErrors,
    };
  }
  return { itemsByDomain, accountsSafeInfo, accountsWithErrors };
}

export async function GET(req: NextRequest) {
  const user = await requireUserApi();
  const params = req.nextUrl.searchParams;
  const merge = params.get("merge") === "true";

  try {
    const result = await getWeeklyAssignments(user.id, merge);
    if (merge && result.merged) {
      return NextResponse.json(result, { status: 200 });
    }
    if (result.itemsByDomain) {
      return NextResponse.json(result, { status: 200 });
    }
    return NextResponse.json({ error: "No data available" }, { status: 404 });
  } catch (error: any) {
    if (error.message === "No accounts found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch planner items" },
      { status: 500 },
    );
  }
}
