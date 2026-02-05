// lib/planner/weekly-assignments.ts
import {
  getUserCanvasAccounts,
  markAccountAsExpired,
} from "@/data/canvas-account";
import { getDetectedTimeZoneForUser } from "@/data/user-settings";
import { decryptToken } from "@/lib/crypto";
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
import { DateTime } from "luxon";
import { getPlannerItems } from "@/lib/canvas";
import { LRUCache } from "lru-cache";

/**
 * ----------------------------
 * In-memory caches (per instance)
 * ----------------------------
 */

type PerAccountPlannerCacheEntry = {
  etag?: string;
  normalized?: ItemsByType; // output of normalize()
  ts: number;
};

const perAccountPlannerCache = new LRUCache<
  string,
  PerAccountPlannerCacheEntry
>({
  max: 2000,
  ttl: 2 * 60 * 60 * 1000, // 2 hours
  updateAgeOnGet: true,
});

type MergedCacheEntry = {
  signature: string;
  merged: MergedItemsByDomain;
  ts: number;
};

const mergedCache = new LRUCache<string, MergedCacheEntry>({
  max: 300,
  ttl: 15 * 60 * 1000, // 15 minutes
  updateAgeOnGet: true,
});

function makePerAccountKey(params: {
  userId: string;
  accountId: string;
  domain: string;
  startISO: string;
  endISO: string;
}) {
  return [
    params.userId,
    params.accountId,
    params.domain,
    params.startISO,
    params.endISO,
    "planner/items",
    "filter=incomplete_items",
    "per_page=100",
  ].join("|");
}

function makeMergedKey(params: {
  userId: string;
  startISO: string;
  endISO: string;
  merge: boolean;
}) {
  return [
    params.userId,
    params.startISO,
    params.endISO,
    `merge=${params.merge}`,
  ].join("|");
}

type AccountOutcome =
  | {
      accountId: string;
      state: "expired";
    }
  | {
      accountId: string;
      state: "error";
      message: string;
    }
  | {
      accountId: string;
      state: "ok";
      etag?: string;
    };

function buildSignature(outcomes: AccountOutcome[]) {
  return outcomes
    .slice()
    .sort((a, b) => a.accountId.localeCompare(b.accountId))
    .map((o) => {
      if (o.state === "expired") return `${o.accountId}:EXPIRED`;
      if (o.state === "error") return `${o.accountId}:ERR:${o.message}`;
      return `${o.accountId}:OK:${o.etag ?? "no-etag"}`;
    })
    .join("|");
}

/**
 * ----------------------------
 * Date helpers
 * ----------------------------
 */

function getUTCWeekRange(timezone: string, baseDate: Date = new Date()) {
  const localDt = DateTime.fromJSDate(baseDate).setZone(timezone);
  const startOfMondayLocal = localDt.set({ weekday: 1 }).startOf("day");
  const nextMondayLocal = startOfMondayLocal.plus({ days: 7 });

  return {
    startISO: startOfMondayLocal.toUTC().toISO() as string,
    endISO: nextMondayLocal.toUTC().toISO() as string,
  };
}

/**
 * ----------------------------
 * Normalize + merge
 * ----------------------------
 */

const ASSIGNMENT_TYPE = new Set(["assignment", "discussion_topic", "quiz"]);

function normalize(accountId: string, domain: string, items: any): ItemsByType {
  const itemsByType: ItemsByType = {
    account: accountId,
    assignments: [],
    announcements: [],
    other: [],
  };

  if (!items || !Array.isArray(items)) return itemsByType;

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
    }

    if (ASSIGNMENT_TYPE.has(item.plannable_type)) {
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
    }

    itemsByType.other.push(baseItem);
  }

  itemsByType.assignments.sort((a, b) => {
    if (a.due_at && b.due_at) return +new Date(a.due_at) - +new Date(b.due_at);
    if (a.due_at) return -1;
    if (b.due_at) return 1;
    return 0;
  });

  itemsByType.announcements.sort(
    (a, b) => +new Date(b.posted_at) - +new Date(a.posted_at),
  );

  return itemsByType;
}

type BucketKey =
  | "accountsSubmitted"
  | "accountsMissingSubmission"
  | "accountsNotSubmitted";

function getBucket(submission: SubmissionDetails): BucketKey {
  if (submission.submitted) return "accountsSubmitted";
  if (submission.missing) return "accountsMissingSubmission";
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

      const bucket = getBucket(assignment.submission);
      existing[bucket].push({
        accountId: items.account,
        submission: assignment.submission,
      });
    }

    for (const announcement of items.announcements) {
      const key = makeKey(announcement.id, announcement.course_id);
      if (!announcementsMap.has(key)) announcementsMap.set(key, announcement);
    }

    for (const other of items.other) {
      const key = makeKey(other.id, other.course_id);
      let existing = otherMap.get(key);

      if (!existing) {
        existing = { ...other, accounts: [] };
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

  merged.assignments.sort((a, b) => {
    if (a.due_at && b.due_at) return +new Date(a.due_at) - +new Date(b.due_at);
    if (a.due_at) return -1;
    if (b.due_at) return 1;
    return 0;
  });

  return merged;
}

export type WeeklyAssignmentsMergedResponse = {
  merged: MergedItemsByDomain;
  accountsSafeInfo: AccountSafeInfo[];
  accountsWithErrors: string[];
  signature: string;
};

export type WeeklyAssignmentsRawResponse = {
  itemsByDomain: ItemsByDomain;
  accountsSafeInfo: AccountSafeInfo[];
  accountsWithErrors: string[];
  signature: string;
};

export type WeeklyAssignmentsResult =
  | WeeklyAssignmentsMergedResponse
  | WeeklyAssignmentsRawResponse;

export async function getWeeklyAssignmentsForUser(
  userId: string,
  merge: boolean = true,
): Promise<WeeklyAssignmentsResult> {
  const allAccounts = await getUserCanvasAccounts(userId, true);
  if (allAccounts.length === 0) throw new Error("No accounts found");

  const accountsSafeInfo: AccountSafeInfo[] = allAccounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    avatarUrl: acc.avatarUrl,
    expiredAt: acc.expiredAt,
  }));

  const accountsWithErrors: string[] = [];

  const timezone = (await getDetectedTimeZoneForUser(userId)) || "UTC";
  const { startISO, endISO } = getUTCWeekRange(timezone);

  const fetchPromises = allAccounts.map(async (account) => {
    if (account.expiredAt !== null) {
      return {
        account,
        accountItems: null as ItemsByType | null,
        outcome: { accountId: account.id, state: "expired" } as AccountOutcome,
        error: { message: "Account expired" },
      };
    }

    const perKey = makePerAccountKey({
      userId,
      accountId: account.id,
      domain: account.domain,
      startISO,
      endISO,
    });

    const cached = perAccountPlannerCache.get(perKey);

    const raw = await getPlannerItems(
      account.domain,
      decryptToken(account.accessToken),
      startISO,
      endISO,
      { ifNoneMatch: cached?.etag },
    );

    if (!raw.ok) {
      if (raw.error?.expiredAt) {
        await markAccountAsExpired(account.id, raw.error.expiredAt);
      }

      const msg = String(raw.error?.message ?? "Canvas error");
      return {
        account,
        accountItems: null as ItemsByType | null,
        outcome: {
          accountId: account.id,
          state: "error",
          message: msg,
        } as AccountOutcome,
        error: raw.error,
      };
    }

    // 304: Not Modified → reuse normalized cache if present
    if (raw.status === 304) {
      if (cached?.normalized) {
        return {
          account,
          accountItems: cached.normalized,
          outcome: {
            accountId: account.id,
            state: "ok",
            etag: cached.etag,
          } as AccountOutcome,
          error: null,
        };
      }

      // Cold-start edge case: instance lost cache but Canvas returns 304.
      // Safest fallback: refetch without If-None-Match.
      const raw2 = await getPlannerItems(
        account.domain,
        decryptToken(account.accessToken),
        startISO,
        endISO,
      );

      if (!raw2.ok) {
        if (raw2.error?.expiredAt) {
          await markAccountAsExpired(account.id, raw2.error.expiredAt);
        }
        const msg = String(raw2.error?.message ?? "Canvas error");
        return {
          account,
          accountItems: null as ItemsByType | null,
          outcome: {
            accountId: account.id,
            state: "error",
            message: msg,
          } as AccountOutcome,
          error: raw2.error,
        };
      }

      const normalized = normalize(account.id, account.domain, raw2.data);
      perAccountPlannerCache.set(perKey, {
        etag: raw2.etag,
        normalized,
        ts: Date.now(),
      });

      return {
        account,
        accountItems: normalized,
        outcome: {
          accountId: account.id,
          state: "ok",
          etag: raw2.etag,
        } as AccountOutcome,
        error: null,
      };
    }

    // 200: new data
    const normalized = normalize(account.id, account.domain, raw.data);
    perAccountPlannerCache.set(perKey, {
      etag: raw.etag,
      normalized,
      ts: Date.now(),
    });

    return {
      account,
      accountItems: normalized,
      outcome: {
        accountId: account.id,
        state: "ok",
        etag: raw.etag,
      } as AccountOutcome,
      error: null,
    };
  });

  const results = await Promise.allSettled(fetchPromises);

  const itemsByDomain: ItemsByDomain = {};
  const outcomes: AccountOutcome[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { account, accountItems, outcome, error } = result.value;
      outcomes.push(outcome);

      if (accountItems) {
        const hasAny =
          accountItems.assignments.length > 0 ||
          accountItems.announcements.length > 0 ||
          accountItems.other.length > 0;

        if (hasAny) {
          (itemsByDomain[account.domain] ??= []).push(accountItems);
        }
      }

      if (error) {
        accountsWithErrors.push(account.id);
      }

      continue;
    }

    // rejected: unexpected crash in a single account fetch
    console.error("Promise rejected:", result.reason);
  }

  if (accountsWithErrors.length === allAccounts.length) {
    throw new Error("All accounts failed to fetch planner items");
  }

  if (merge) {
    const mergedKey = makeMergedKey({ userId, startISO, endISO, merge: true });
    const signature = buildSignature(outcomes);

    const cachedMerged = mergedCache.get(mergedKey);
    if (cachedMerged && cachedMerged.signature === signature) {
      console.log("----Using merged cache for user", userId);
      return {
        merged: cachedMerged.merged,
        accountsSafeInfo,
        accountsWithErrors,
        signature,
      };
    }

    console.log("----Making fresh data for user", userId);
    const merged: MergedItemsByDomain = {};
    for (const domain in itemsByDomain) {
      merged[domain] = mergeItemsByDomain(itemsByDomain[domain]);
    }

    mergedCache.set(mergedKey, { signature, merged, ts: Date.now() });

    return { merged, accountsSafeInfo, accountsWithErrors, signature };
  }

  return {
    itemsByDomain,
    accountsSafeInfo,
    accountsWithErrors,
    signature: buildSignature(outcomes),
  };
}
