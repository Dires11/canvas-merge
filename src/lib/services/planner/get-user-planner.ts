import {
  type CanvasAccountWithToken,
  getUserCanvasAccountsWithTokens,
  markAccountAsExpired,
  updateCanvasAccountInfo,
} from "@/lib/data/canvas-account";
import { getDetectedTimeZoneForUser } from "@/lib/data/user-settings";
import { decryptToken } from "@/lib/server/crypto";
import { getAccountInfo, getPlannerItems } from "@/lib/canvas";
import type {
  Announcement,
  Assignment,
  AccountSafeInfo,
  ItemBase,
  ItemsByAccount,
  ItemsByDomain,
  ItemsByType,
  MergedItems,
  MergedItemsByDomain,
  RawPlannerItem,
  SubmissionDetails,
  UserPlanner,
} from "@/lib/types";
import { DateTime } from "luxon";

function toSafeAccount(account: CanvasAccountWithToken): AccountSafeInfo {
  return {
    id: account.id,
    name: account.name,
    expiredAt: account.expiredAt,
    avatarUrl: account.avatarUrl,
    canvasId: account.canvasId,
    canvasDomain: account.canvasDomain,
  };
}

/**
 * ----------------------------
 * Date helpers
 * ----------------------------
 */

function getUTCWeekRange(timezone: string, baseDate: Date = new Date()) {
  const localDt = DateTime.fromJSDate(baseDate).setZone(timezone);

  const previousSaturday = localDt
    .set({ weekday: 1 })
    .minus({ days: 2 })
    .startOf("day");

  const sevenDays = localDt.plus({ days: 8 }).startOf("day");

  return {
    startISO: previousSaturday.toUTC().toISO() as string,
    endISO: sevenDays.toUTC().toISO() as string,
  };
}

/**
 * ----------------------------
 * Normalize + merge
 * ----------------------------
 */

const ASSIGNMENT_TYPE = new Set(["assignment", "discussion_topic", "quiz"]);

function normalize(
  accountId: string,
  baseUrl: string,
  domainSlug: string,
  domainName: string,
  items: RawPlannerItem[],
): ItemsByType {
  const itemsByType: ItemsByType = {
    account: accountId,
    assignments: [],
    announcements: [],
    other: [],
  };

  for (const item of items) {
    const title = item.plannable?.title?.trim() || "Untitled";
    const safeUrl = new URL(item.html_url, baseUrl).toString();

    const baseItem: ItemBase = {
      id: item.plannable_id,
      course_id: item.course_id,
      type: item.plannable_type,
      title,
      course_name: item.context_name,
      url: safeUrl,
      baseUrl,
      domainSlug,
      domainName,
    };

    if (item.plannable_type === "announcement") {
      const announcement: Announcement = {
        ...baseItem,
        posted_at: item.plannable_date ?? "",
      };
      itemsByType.announcements.push(announcement);
      continue;
    }

    if (ASSIGNMENT_TYPE.has(item.plannable_type)) {
      const assignment: Assignment = {
        ...baseItem,
        due_at: item.plannable?.due_at ?? null,
        points_possible: item.plannable?.points_possible ?? null,
        submission: {
          submitted: Boolean(item.submissions?.submitted),
          graded: Boolean(item.submissions?.graded),
          late: Boolean(item.submissions?.late),
          missing: Boolean(item.submissions?.missing),
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

function mergeItemsByDomain(itemsByAccount: ItemsByAccount): MergedItems {
  type MergedAssignment = MergedItems["assignments"][number];
  type MergedAnnouncement = MergedItems["announcements"][number];
  type MergedOther = MergedItems["other"][number];

  const assignmentsMap = new Map<string, MergedAssignment>();
  const announcementsMap = new Map<string, MergedAnnouncement>();
  const otherMap = new Map<string, MergedOther>();

  const makeKey = (id: string | number, courseId: string | number) =>
    `${id}:${courseId}`;

  for (const [accountId, items] of Object.entries(itemsByAccount)) {
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
        accountId,
        submission: assignment.submission,
      });
    }

    for (const announcement of items.announcements) {
      const key = makeKey(announcement.id, announcement.course_id);

      if (!announcementsMap.has(key)) {
        announcementsMap.set(key, announcement);
      }
    }

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

      existing.accounts.push({ accountId });
    }
  }

  const merged: MergedItems = {
    assignments: Array.from(assignmentsMap.values()),
    announcements: Array.from(announcementsMap.values()),
    other: Array.from(otherMap.values()),
  };

  merged.assignments.sort((a, b) => {
    const aDate = a.due_at ? new Date(a.due_at).getTime() : Infinity;
    const bDate = b.due_at ? new Date(b.due_at).getTime() : Infinity;

    if (aDate !== bDate) return aDate - bDate;

    const aName = a.title ?? "";
    const bName = b.title ?? "";

    return aName.localeCompare(bName);
  });

  return merged;
}

/**
 * ----------------------------
 * Main loader
 * ----------------------------
 */

export async function getUserPlanner(
  userId: string,
  merge: boolean = true,
): Promise<UserPlanner> {
  let allAccounts = await getUserCanvasAccountsWithTokens(userId);

  if (allAccounts.length === 0) {
    throw new Error("No accounts found");
  }

  const accountsWithErrors: string[] = [];

  const timezone = (await getDetectedTimeZoneForUser(userId)) || "UTC";
  const { startISO, endISO } = getUTCWeekRange(timezone);

  const fetchPromises = allAccounts.map(async (account) => {
    if (account.expiredAt !== null) {
      return {
        account,
        accountItems: null,
        error: { message: "Account expired" },
      };
    }

    const token = decryptToken(account.accessToken);
    const accountInfo = await getAccountInfo({
      baseUrl: account.canvasDomain.baseUrl,
      token,
    });
    let currentAccount = account;

    if (accountInfo.ok) {
      const changed =
        accountInfo.data.name !== account.name ||
        accountInfo.data.avatarUrl !== account.avatarUrl ||
        accountInfo.data.canvasId !== account.canvasId;

      if (changed) {
        const updated = await updateCanvasAccountInfo({
          accountId: account.id,
          userId,
          accountInfo: accountInfo.data,
        });

        if (updated.ok) {
          currentAccount = {
            ...account,
            name: accountInfo.data.name,
            avatarUrl: accountInfo.data.avatarUrl,
            canvasId: accountInfo.data.canvasId,
          };
        }
      }
    }

    const raw = await getPlannerItems(
      account.canvasDomain.baseUrl,
      token,
      startISO,
      endISO,
    );

    if (!raw.ok) {
      if (raw.error?.expiredAt) {
        await markAccountAsExpired({
          accountId: account.id,
          expiredAt: raw.error.expiredAt,
        });
      }

      return {
        account: currentAccount,
        accountItems: null,
        error: raw.error,
      };
    }

    const normalized = normalize(
      currentAccount.id,
      currentAccount.canvasDomain.baseUrl,
      currentAccount.canvasDomain.slug,
      currentAccount.canvasDomain.name,
      raw.data,
    );

    return {
      account: currentAccount,
      accountItems: normalized,
      error: null,
    };
  });

  const results = await Promise.allSettled(fetchPromises);
  allAccounts = results.map((result, index) =>
    result.status === "fulfilled" ? result.value.account : allAccounts[index],
  );
  const accountsSafeInfo = allAccounts.map(toSafeAccount);

  const itemsByDomain: ItemsByDomain = {};

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { account, accountItems, error } = result.value;

      if (accountItems) {
        // Keep successful accounts even if they have zero items.
        // This makes account-based filtering/UI state easier.
        if (!itemsByDomain[account.canvasDomain.slug]) {
          itemsByDomain[account.canvasDomain.slug] = {};
        }
        itemsByDomain[account.canvasDomain.slug][account.id] = accountItems;
      }

      if (error) {
        accountsWithErrors.push(account.id);
      }

      continue;
    }

    // Unexpected crash in a single account fetch
    console.error(
      "Promise rejected while fetching planner items:",
      result.reason,
    );
  }

  if (accountsWithErrors.length === allAccounts.length) {
    throw new Error(
      "All accounts failed to fetch planner items. Please make sure your connection tokens are valid.",
    );
  }

  if (merge) {
    const merged: MergedItemsByDomain = {};

    for (const [domain, accounts] of Object.entries(itemsByDomain)) {
      merged[domain] = mergeItemsByDomain(accounts);
    }

    return {
      merged,
      itemsByDomain,
      accountsSafeInfo,
      accountsWithErrors,
    };
  }

  return {
    itemsByDomain,
    accountsSafeInfo,
    accountsWithErrors,
  };
}
