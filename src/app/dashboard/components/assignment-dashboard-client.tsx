"use client";

import useSWR, { useSWRConfig } from "swr";
import { useEffect, useMemo, useState } from "react";
import { AssignmentCard } from "./assignment-card";
import type {
  MergedAssignment,
  UserCourse,
  AccountSafeInfo,
  Filters,
  FilterType,
} from "@/lib/types";
import { TriangleAlert, ChevronDown, RotateCw } from "lucide-react";
import {
  type ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Search, X } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type { UserPlanner } from "@/lib/types";
import Link from "next/link";
import { GlassContainer } from "@/components/glass-container";
import { AssignmentDashboardControls } from "./dashboard-controls";
import type { CanvasDomainInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePlannerOverride } from "./planner-override";

const EMPTY_ACCOUNTS: AccountSafeInfo[] = [];
const EMPTY_ACCOUNT_ERRORS: string[] = [];
type AssignmentViewMode = "active" | "completed";
type QuickFilter =
  | "all"
  | "overdue"
  | "due_today"
  | "this_week"
  | "no_due_date"
  | "graded"
  | "pending_grade"
  | "submitted_this_week";

const ACTIVE_QUICK_FILTERS: Array<{ value: QuickFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "due_today", label: "Due Today" },
  { value: "this_week", label: "This Week" },
  { value: "no_due_date", label: "No Due Date" },
];

const COMPLETED_QUICK_FILTERS: Array<{ value: QuickFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "graded", label: "Graded" },
  { value: "pending_grade", label: "Pending Grade" },
  { value: "submitted_this_week", label: "Submitted This Week" },
];

const fetcher = async (url: string): Promise<UserPlanner> => {
  const r = await fetch(url, { credentials: "include" });
  const json = await r.json().catch(() => null);

  if (!r.ok) {
    throw new Error(json?.error || `Failed to load planner (${r.status})`);
  }

  return json as UserPlanner;
};

function getLocalDayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function useDayKey() {
  const [key, setKey] = useState(() => getLocalDayKey());

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const timeout = nextMidnight.getTime() - now.getTime();

    const id = setTimeout(() => {
      setKey(getLocalDayKey());
    }, timeout);

    return () => clearTimeout(id);
  }, [key]);

  return key;
}

function getDueLabelLocal(due_at: string | null): string {
  if (!due_at) return "No due date";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(due_at);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffMs = dueDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due in ${diffDays} days`;
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function matchesSearch(
  assignment: MergedAssignment,
  query: string,
  accountMap: Record<string, AccountSafeInfo>,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const assignmentValues = [
    assignment.title,
    assignment.course_name,
    assignment.domainName,
    assignment.type,
  ];

  const assignmentMatches = assignmentValues.some((value) =>
    value.toLowerCase().includes(normalized),
  );

  if (assignmentMatches) return true;

  const assignmentAccounts = [
    ...assignment.accountsSubmitted,
    ...assignment.accountsMissingSubmission,
    ...assignment.accountsNotSubmitted,
  ];

  return assignmentAccounts.some((assignmentAccount) => {
    const account = accountMap[assignmentAccount.accountId];
    if (!account) return false;

    return [
      account.name,
      account.canvasDomain.name,
      account.canvasDomain.slug,
    ].some((value) => value.toLowerCase().includes(normalized));
  });
}

function matchesQuickFilter(
  assignment: MergedAssignment,
  mode: AssignmentViewMode,
  quickFilter: QuickFilter,
) {
  if (quickFilter === "all") return true;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (mode === "active") {
    const dueDate = assignment.due_at ? new Date(assignment.due_at) : null;
    const dueDay = dueDate
      ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
      : null;

    if (quickFilter === "overdue") {
      return dueDay ? dueDay.getTime() < today.getTime() : false;
    }

    if (quickFilter === "due_today") {
      return dueDay ? isSameLocalDay(dueDay, today) : false;
    }

    if (quickFilter === "this_week") {
      if (!dueDay) return false;
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return dueDay >= today && dueDay < nextWeek;
    }

    if (quickFilter === "no_due_date") {
      return !assignment.due_at;
    }

    return true;
  }

  if (quickFilter === "graded") {
    return assignment.accountsSubmitted.some(
      (account) => account.submission.graded,
    );
  }

  if (quickFilter === "pending_grade") {
    return assignment.accountsSubmitted.some(
      (account) => !account.submission.graded,
    );
  }

  if (quickFilter === "submitted_this_week") {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return assignment.accountsSubmitted.some((account) => {
      if (!account.submission.submittedAt) return false;
      return new Date(account.submission.submittedAt) >= weekStart;
    });
  }

  return true;
}

function groupAssignmentsByDueDateLocal(
  assignments: MergedAssignment[],
  mode: AssignmentViewMode,
) {
  const groups: Record<string, MergedAssignment[]> = {};

  for (const assignment of assignments) {
    if (mode === "active") {
      if (
        assignment.accountsNotSubmitted.length === 0 &&
        assignment.accountsMissingSubmission.length === 0
      ) {
        continue;
      }
    } else {
      if (assignment.accountsSubmitted.length === 0) continue;
    }

    const label =
      mode === "completed" ? "completed" : getDueLabelLocal(assignment.due_at);
    (groups[label] ??= []).push(assignment);
  }

  if (mode === "completed") {
    for (const assignments of Object.values(groups)) {
      assignments.sort((a, b) => {
        const aDueAt = a.due_at ? new Date(a.due_at).getTime() : -Infinity;
        const bDueAt = b.due_at ? new Date(b.due_at).getTime() : -Infinity;

        if (aDueAt !== bDueAt) {
          return bDueAt - aDueAt;
        }

        return a.title.localeCompare(b.title);
      });
    }
  }

  return groups;
}

type Props = {
  initialData?: UserPlanner | null;
  courses: UserCourse[];
  domains: CanvasDomainInfo[];
  mode?: AssignmentViewMode;
  dataEndpoint?: string;
  readOnly?: boolean;
};

type DomainMap = Record<string, CanvasDomainInfo>;

type AssignmentCacheTarget = {
  item: MergedAssignment;
  accountId: string;
  mode: AssignmentViewMode;
};

type AssignmentAccount =
  | MergedAssignment["accountsSubmitted"][number]
  | MergedAssignment["accountsMissingSubmission"][number]
  | MergedAssignment["accountsNotSubmitted"][number];

type AssignmentBucket =
  | "accountsSubmitted"
  | "accountsMissingSubmission"
  | "accountsNotSubmitted";

type AssignmentAccountViewTarget = AssignmentCacheTarget & {
  completed: boolean;
  overrideId: number | null;
};

function isSameAssignment(a: MergedAssignment, b: MergedAssignment) {
  return (
    a.id === b.id &&
    a.course_id === b.course_id &&
    a.domainSlug === b.domainSlug &&
    a.type === b.type
  );
}

function removeAccountFromCurrentView(
  planner: UserPlanner,
  target: AssignmentCacheTarget,
) {
  if (!planner?.merged) return planner;

  const domainItems = planner.merged[target.item.domainSlug];
  if (!domainItems) return planner;

  let changed = false;
  const assignments = domainItems.assignments.flatMap((assignment) => {
    if (!isSameAssignment(assignment, target.item)) return [assignment];

    const accountsSubmitted = assignment.accountsSubmitted.filter(
      (account) => account.accountId !== target.accountId,
    );
    const accountsMissingSubmission =
      assignment.accountsMissingSubmission.filter(
        (account) => account.accountId !== target.accountId,
      );
    const accountsNotSubmitted = assignment.accountsNotSubmitted.filter(
      (account) => account.accountId !== target.accountId,
    );

    const assignmentChanged =
      accountsSubmitted.length !== assignment.accountsSubmitted.length ||
      accountsMissingSubmission.length !==
        assignment.accountsMissingSubmission.length ||
      accountsNotSubmitted.length !== assignment.accountsNotSubmitted.length;

    if (!assignmentChanged) return [assignment];

    changed = true;

    const hasVisibleAccounts =
      target.mode === "completed"
        ? accountsSubmitted.length > 0
        : accountsMissingSubmission.length > 0 ||
          accountsNotSubmitted.length > 0;

    if (!hasVisibleAccounts) return [];

    return [
      {
        ...assignment,
        accountsSubmitted,
        accountsMissingSubmission,
        accountsNotSubmitted,
      },
    ];
  });

  if (!changed) return planner;

  return {
    ...planner,
    merged: {
      ...planner.merged,
      [target.item.domainSlug]: {
        ...domainItems,
        assignments,
      },
    },
  };
}

function findAssignmentAccount(
  assignment: MergedAssignment,
  accountId: string,
) {
  return [
    ...assignment.accountsSubmitted,
    ...assignment.accountsMissingSubmission,
    ...assignment.accountsNotSubmitted,
  ].find((account) => account.accountId === accountId);
}

function getVisibleAssignmentBucket(
  account: AssignmentAccount,
  mode: AssignmentViewMode,
): AssignmentBucket | null {
  if (mode === "completed") {
    return account.submission.submitted || account.plannerMarkedComplete
      ? "accountsSubmitted"
      : null;
  }

  if (account.submission.submitted || account.plannerMarkedComplete) {
    return null;
  }

  return account.submission.missing
    ? "accountsMissingSubmission"
    : "accountsNotSubmitted";
}

function emptyAssignmentBuckets() {
  return {
    accountsSubmitted: [],
    accountsMissingSubmission: [],
    accountsNotSubmitted: [],
  } satisfies Pick<
    MergedAssignment,
    "accountsSubmitted" | "accountsMissingSubmission" | "accountsNotSubmitted"
  >;
}

function upsertAccountInPlannerView(
  planner: UserPlanner,
  target: AssignmentAccountViewTarget,
) {
  const sourceAccount = findAssignmentAccount(target.item, target.accountId);
  if (!sourceAccount) return planner;

  const account = {
    ...sourceAccount,
    plannerOverrideId: target.overrideId,
    plannerMarkedComplete: target.completed,
  };
  const bucket = getVisibleAssignmentBucket(account, target.mode);

  if (!bucket) {
    return removeAccountFromCurrentView(planner, target);
  }

  const domainItems = planner.merged?.[target.item.domainSlug] ?? {
    assignments: [],
    announcements: [],
    other: [],
  };

  let found = false;
  const assignments = domainItems.assignments.map((assignment) => {
    if (!isSameAssignment(assignment, target.item)) return assignment;

    found = true;
    const nextAssignment = {
      ...assignment,
      accountsSubmitted: assignment.accountsSubmitted.filter(
        (current) => current.accountId !== target.accountId,
      ),
      accountsMissingSubmission: assignment.accountsMissingSubmission.filter(
        (current) => current.accountId !== target.accountId,
      ),
      accountsNotSubmitted: assignment.accountsNotSubmitted.filter(
        (current) => current.accountId !== target.accountId,
      ),
    };

    return {
      ...nextAssignment,
      [bucket]: [...nextAssignment[bucket], account],
    };
  });

  if (!found) {
    assignments.push({
      ...target.item,
      ...emptyAssignmentBuckets(),
      [bucket]: [account],
    });
  }

  return {
    ...planner,
    merged: {
      ...(planner.merged ?? {}),
      [target.item.domainSlug]: {
        ...domainItems,
        assignments,
      },
    },
  };
}

function filtersFromSearchParams(
  searchParams: ReadonlyURLSearchParams,
): Filters {
  return {
    domain: searchParams.getAll("domain"),
    account: searchParams.getAll("account"),
    course: searchParams.getAll("course"),
  };
}

function normalizeFilters(
  nextFilters: Filters,
  accounts: AccountSafeInfo[],
): Filters {
  const selectedDomains = [...new Set(nextFilters.domain)];

  const validAccountIds =
    selectedDomains.length === 0
      ? accounts.map((a) => a.id)
      : accounts
          .filter((a) => selectedDomains.includes(a.canvasDomain.slug))
          .map((a) => a.id);

  return {
    domain: selectedDomains,
    account: [...new Set(nextFilters.account)].filter((id) =>
      validAccountIds.includes(id),
    ),
    course: [...new Set(nextFilters.course)],
  };
}

export function AssignmentDashboardClient({
  initialData,
  courses,
  domains,
  mode = "active",
  dataEndpoint,
  readOnly = false,
}: Props) {
  const plannerFilter =
    mode === "completed" ? "complete_items" : "incomplete_items";
  const key =
    dataEndpoint ??
    `/api/planner/user-planner?merge=true&filter=${plannerFilter}`;

  const { data, error, isValidating, mutate } = useSWR(key, fetcher, {
    fallbackData: initialData ?? undefined,
    revalidateOnFocus: true,
    revalidateIfStale: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10_000,
    keepPreviousData: false,
  });
  const { mutate: mutatePlannerCache } = useSWRConfig();
  const oppositePlannerFilter =
    mode === "completed" ? "incomplete_items" : "complete_items";
  const oppositeKey = `/api/planner/user-planner?merge=true&filter=${oppositePlannerFilter}`;

  const dayKey = useDayKey();
  const accounts = data?.accountsSafeInfo ?? EMPTY_ACCOUNTS;
  const accountsWithErrors = data?.accountsWithErrors ?? EMPTY_ACCOUNT_ERRORS;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlFilters = filtersFromSearchParams(searchParams);
  const [filters, setFilters] = useState<Filters>(urlFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  function updateUrl(nextFilters: Filters) {
    const params = new URLSearchParams();

    for (const domain of nextFilters.domain) {
      params.append("domain", domain);
    }

    for (const account of nextFilters.account) {
      params.append("account", account);
    }

    for (const course of nextFilters.course) {
      params.append("course", course);
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function applyFilters(nextFilters: Filters) {
    const normalized = normalizeFilters(nextFilters, accounts);
    setFilters(normalized);
    updateUrl(normalized);
  }

  function onFilterChange(
    type: keyof Filters,
    value: string,
    pressed: boolean,
  ) {
    const current = filters[type];
    const nextValues = pressed
      ? current.includes(value)
        ? current
        : [...current, value]
      : current.filter((v) => v !== value);

    applyFilters({
      ...filters,
      [type]: nextValues,
    });
  }

  function clearAll(type?: FilterType) {
    if (!type) {
      applyFilters({
        domain: [],
        account: [],
        course: [],
      });
    } else {
      applyFilters({
        ...filters,
        [type]: [],
      });
    }
  }

  const filteredAccountId =
    filters.domain.length === 0 &&
    filters.course.length === 0 &&
    filters.account.length === 1
      ? filters.account[0]
      : null;

  function clearEveryFilter() {
    setSearchQuery("");
    setQuickFilter("all");
    clearAll();
  }

  function toggleAccountFilter(accountId: string) {
    if (filteredAccountId === accountId) {
      applyFilters({
        domain: [],
        account: [],
        course: [],
      });
      return;
    }

    applyFilters({
      domain: [],
      account: [accountId],
      course: [],
    });
  }

  function markAssignmentComplete({
    item,
    accountId,
    overrideId,
  }: {
    item: MergedAssignment;
    accountId: string;
    overrideId: number | null;
  }) {
    return updatePlannerOverride({
      action: "mark_complete",
      accountId,
      plannableType: item.type,
      plannableId: item.id,
      overrideId,
    });
  }

  function undoAssignmentCompletion({
    accountId,
    overrideId,
  }: {
    item: MergedAssignment;
    accountId: string;
    overrideId: number;
  }) {
    return updatePlannerOverride({
      action: "mark_incomplete",
      accountId,
      overrideId,
    });
  }

  async function handlePlannerChanged({
    item,
    accountId,
    completed,
    overrideId,
  }: {
    item: MergedAssignment;
    accountId: string;
    completed: boolean;
    overrideId: number | null;
  }) {
    await Promise.all([
      mutatePlannerCache<UserPlanner | undefined>(
        key,
        (current) =>
          current
            ? upsertAccountInPlannerView(current, {
                item,
                accountId,
                mode,
                completed,
                overrideId,
              })
            : current,
        {
          populateCache: true,
          revalidate: false,
        },
      ),
      mutatePlannerCache<UserPlanner | undefined>(
        oppositeKey,
        (current) =>
          current
            ? upsertAccountInPlannerView(current, {
                item,
                accountId,
                mode: mode === "completed" ? "active" : "completed",
                completed,
                overrideId,
              })
            : current,
        {
          populateCache: true,
          revalidate: false,
        },
      ),
    ]);

    void mutatePlannerCache(key);
    void mutatePlannerCache(oppositeKey);
  }

  const accountMap = useMemo<Record<string, AccountSafeInfo>>(() => {
    const map: Record<string, AccountSafeInfo> = {};

    for (const acc of accounts) {
      map[acc.id] = acc;
    }

    return map;
  }, [accounts]);

  const domainMap = useMemo<DomainMap>(() => {
    const map: DomainMap = {};

    for (const domain of domains) {
      map[domain.slug] = domain;
    }

    return map;
  }, [domains]);

  const coursesMap = useMemo(() => {
    const map = new Map<string, UserCourse>();

    for (const course of courses) {
      map.set(`${course.domainSlug}|${course.id}`, course);
    }

    return map;
  }, [courses]);

  const courseFilterMap = useMemo(() => {
    const map = new Map<string, UserCourse>();

    for (const course of courses) {
      map.set(`${course.domainSlug}-${course.id}`, course);
    }

    return map;
  }, [courses]);

  const quickFilters =
    mode === "completed" ? COMPLETED_QUICK_FILTERS : ACTIVE_QUICK_FILTERS;
  const activeQuickFilterLabel =
    quickFilters.find((filter) => filter.value === quickFilter)?.label ?? null;

  const groupedByDomain = useMemo(() => {
    void dayKey;

    const result: Record<string, Record<string, MergedAssignment[]>> = {};

    for (const [domainSlug, mergedItems] of Object.entries(
      data?.merged ?? {},
    )) {
      if (filters.domain.length > 0 && !filters.domain.includes(domainSlug)) {
        continue;
      }

      let assignments = mergedItems.assignments;

      if (filters.account.length > 0 || filters.course.length > 0) {
        const filteredAssignments: MergedAssignment[] = [];

        for (const assignment of mergedItems.assignments) {
          if (
            filters.course.length > 0 &&
            !filters.course.includes(`${domainSlug}-${assignment.course_id}`)
          ) {
            continue;
          }

          if (filters.account.length > 0) {
            const accountsSubmitted = assignment.accountsSubmitted.filter((a) =>
              filters.account.includes(a.accountId),
            );
            const accountsMissingSubmission =
              assignment.accountsMissingSubmission.filter((a) =>
                filters.account.includes(a.accountId),
              );
            const accountsNotSubmitted = assignment.accountsNotSubmitted.filter(
              (a) => filters.account.includes(a.accountId),
            );

            if (
              accountsSubmitted.length !== 0 ||
              accountsMissingSubmission.length !== 0 ||
              accountsNotSubmitted.length !== 0
            ) {
              filteredAssignments.push({
                ...assignment,
                accountsSubmitted,
                accountsMissingSubmission,
                accountsNotSubmitted,
              });
            }
          } else {
            filteredAssignments.push(assignment);
          }
        }

        assignments = filteredAssignments;
      }

      assignments = assignments.filter(
        (assignment) =>
          matchesSearch(assignment, searchQuery, accountMap) &&
          matchesQuickFilter(assignment, mode, quickFilter),
      );

      if (assignments.length > 0) {
        result[domainSlug] = groupAssignmentsByDueDateLocal(assignments, mode);
      }
    }

    return result;
  }, [
    data?.merged,
    dayKey,
    filters.account,
    filters.domain,
    filters.course,
    accountMap,
    quickFilter,
    searchQuery,
    mode,
  ]);

  const hasStructuredFilters =
    filters.domain.length > 0 ||
    filters.account.length > 0 ||
    filters.course.length > 0 ||
    searchQuery.trim().length > 0 ||
    quickFilter !== "all";

  if (error) {
    return (
      <div className="rounded-md border border-red-500 p-3 text-red-600">
        {error.message}
        <div className="mt-2">
          <button
            disabled={isValidating}
            className="rounded-md border px-3 py-1 disabled:opacity-50"
            onClick={() => void mutate()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <div>No data</div>;

  const hasAssignments = Object.keys(groupedByDomain).length > 0;

  return (
    <div className="text-foreground flex flex-col gap-4">
      <div className="glass-border bg-glass/10 flex flex-col gap-2 rounded-xl p-2 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              className="dark:bg-input/10 h-8 rounded-md border-slate-300/40 bg-white/40 pr-8 pl-8 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] dark:border-white/10 dark:shadow-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <AssignmentDashboardControls
            accounts={accounts}
            domains={domainMap}
            courses={courses}
            filters={filters}
            onFilterChange={onFilterChange}
            clearAll={clearAll}
            embedded
          />

          <button
            type="button"
            aria-label="Refresh assignments"
            disabled={isValidating}
            className="group dark:bg-glass/5 dark:hover:bg-glass/15 flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-300/40 bg-white/40 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] transition hover:cursor-pointer hover:bg-white/60 disabled:opacity-50 sm:w-auto sm:px-2 dark:border-white/10 dark:shadow-none"
            onClick={() => void mutate()}
          >
            <RotateCw
              className={cn(
                "size-4 transition-transform duration-200 group-hover:rotate-30",
                isValidating && "animate-spin",
              )}
            />
            <span className="ml-1.5 hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(5.75rem,1fr))] gap-1.5 px-1 sm:flex sm:flex-wrap sm:items-center">
          {quickFilters.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              size="xs"
              variant={quickFilter === filter.value ? "default" : "outline"}
              className={cn(
                "h-7 w-full rounded-md px-2 text-xs sm:w-auto sm:px-2.5",
                quickFilter !== filter.value &&
                  "dark:bg-glass/5 dark:hover:bg-glass/15 border-slate-300/35 bg-white/35 shadow-[0_1px_2px_rgb(15_23_42_/_0.06)] hover:bg-white/55 dark:border-white/10 dark:shadow-none",
              )}
              onClick={() => setQuickFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {hasStructuredFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-1 pt-2">
            {filters.domain.map((domainSlug) => (
              <button
                key={`domain-${domainSlug}`}
                type="button"
                className="bg-background/35 hover:bg-background/55 dark:bg-glass/5 dark:hover:bg-glass/15 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                onClick={() => onFilterChange("domain", domainSlug, false)}
              >
                {domainMap[domainSlug]?.name ?? domainSlug}
                <X className="size-3" />
              </button>
            ))}

            {filters.account.map((accountId) => (
              <button
                key={`account-${accountId}`}
                type="button"
                className="bg-background/35 hover:bg-background/55 dark:bg-glass/5 dark:hover:bg-glass/15 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                onClick={() => onFilterChange("account", accountId, false)}
              >
                {accountMap[accountId]?.name ?? accountId}
                <X className="size-3" />
              </button>
            ))}

            {filters.course.map((courseValue) => (
              <button
                key={`course-${courseValue}`}
                type="button"
                className="bg-background/35 hover:bg-background/55 dark:bg-glass/5 dark:hover:bg-glass/15 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                onClick={() => onFilterChange("course", courseValue, false)}
              >
                {courseFilterMap.get(courseValue)?.course_code ?? courseValue}
                <X className="size-3" />
              </button>
            ))}

            {searchQuery.trim() && (
              <button
                type="button"
                className="bg-background/35 hover:bg-background/55 dark:bg-glass/5 dark:hover:bg-glass/15 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                onClick={() => setSearchQuery("")}
              >
                Search: {searchQuery.trim()}
                <X className="size-3" />
              </button>
            )}

            {quickFilter !== "all" && activeQuickFilterLabel && (
              <button
                type="button"
                className="bg-background/35 hover:bg-background/55 dark:bg-glass/5 dark:hover:bg-glass/15 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                onClick={() => setQuickFilter("all")}
              >
                {activeQuickFilterLabel}
                <X className="size-3" />
              </button>
            )}

            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={clearEveryFilter}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {accountsWithErrors.length > 0 && (
        <div className="bg-destructive/20 text-destructive flex items-center justify-between rounded-2xl border border-white/20 px-4 py-2 shadow-lg hover:shadow-xl">
          <ul>
            <div className="flex items-center gap-1.5 font-bold">
              <TriangleAlert className="h-5 w-5" />
              <span>Accounts needing attention</span>
            </div>

            {accountsWithErrors.map((accountId) => {
              const account = accountMap[accountId];

              const expiredLabel = account?.expiredAt
                ? new Date(account.expiredAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null;

              return (
                <li key={accountId}>
                  {account?.name ?? accountId}
                  {expiredLabel ? ` - expired ${expiredLabel}` : ""}
                </li>
              );
            })}
          </ul>

          {readOnly ? (
            <span className="max-w-48 text-right text-sm">
              The user needs to reconnect these accounts.
            </span>
          ) : (
            <Link
              className="bg-destructive/70 text-destructive-foreground hover:bg-destructive/80 rounded-xl border border-white/10 px-4 py-2 font-semibold tracking-tight shadow-md transition"
              href="/manage-accounts"
            >
              Manage Accounts
            </Link>
          )}
        </div>
      )}

      {!hasAssignments && (
        <GlassContainer className="w-full">
          <p className="text-muted-foreground text-sm">
            {mode === "completed"
              ? "No completed assignments found for this view."
              : "No active assignments found for this view."}
          </p>
        </GlassContainer>
      )}

      {Object.entries(groupedByDomain).map(([domainSlug, groups]) => {
        const domainInfo = domainMap[domainSlug];

        return (
          <GlassContainer key={domainSlug} className="w-full">
            <Collapsible
              defaultOpen
              className="flex w-full flex-col gap-2 rounded-2xl"
            >
              <CollapsibleTrigger className="group flex items-center justify-between text-lg tracking-tight hover:cursor-pointer">
                {domainInfo?.name ?? domainSlug}
                <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>

              <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                {Object.entries(groups).map(([label, assignments]) => {
                  return (
                    <div key={label} className="mt-1">
                      {mode === "active" && (
                        <h2 className={cn("text-lg tracking-tight")}>
                          {label}
                        </h2>
                      )}
                      <div className="flex flex-col gap-1.5">
                        {assignments.map((assignment) => (
                          <AssignmentCard
                            key={`${assignment.course_id}:${assignment.id}`}
                            item={assignment}
                            color={
                              coursesMap.get(
                                `${domainSlug}|${assignment.course_id}`,
                              )?.color ?? { l: 0.7, c: 0.1, h: 250 }
                            }
                            accountMap={accountMap}
                            onMarkComplete={
                              readOnly ? undefined : markAssignmentComplete
                            }
                            onUndoComplete={
                              readOnly ? undefined : undoAssignmentCompletion
                            }
                            onPlannerChanged={
                              readOnly ? undefined : handlePlannerChanged
                            }
                            onToggleAccountFilter={toggleAccountFilter}
                            filteredAccountId={filteredAccountId}
                            mode={mode}
                            readOnly={readOnly}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </GlassContainer>
        );
      })}
    </div>
  );
}
