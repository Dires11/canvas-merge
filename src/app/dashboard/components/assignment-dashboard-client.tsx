"use client";

import useSWR from "swr";
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

const EMPTY_ACCOUNTS: AccountSafeInfo[] = [];
const EMPTY_ACCOUNT_ERRORS: string[] = [];
type AssignmentViewMode = "active" | "completed";

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

    const label = mode === "completed" ? "completed" : getDueLabelLocal(assignment.due_at);
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
};

type DomainMap = Record<string, CanvasDomainInfo>;

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
}: Props) {
  const plannerFilter =
    mode === "completed" ? "complete_items" : "incomplete_items";
  const key = `/api/planner/user-planner?merge=true&filter=${plannerFilter}`;

  const { data, error, isValidating, mutate } = useSWR(key, fetcher, {
    fallbackData: initialData ?? undefined,
    revalidateOnFocus: true,
    revalidateIfStale: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10_000,
    keepPreviousData: false,
  });

  const dayKey = useDayKey();
  const accounts = data?.accountsSafeInfo ?? EMPTY_ACCOUNTS;
  const accountsWithErrors = data?.accountsWithErrors ?? EMPTY_ACCOUNT_ERRORS;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlFilters = filtersFromSearchParams(searchParams);
  const [filters, setFilters] = useState<Filters>(urlFilters);

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
    mode,
  ]);

  if (error) {
    return (
      <div className="rounded-md border border-red-500 p-3 text-red-600">
        {error.message}
        <div className="mt-2">
          <button
            disabled={isValidating}
            className="rounded-md border px-3 py-1 disabled:opacity-50"
            onClick={() => mutate(undefined, { revalidate: true })}
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
      <div className="flex items-center gap-3">
        <button
          disabled={isValidating}
          className="glass-border group bg-glass/10 flex items-center gap-2 rounded-md border px-3 py-1 hover:cursor-pointer disabled:opacity-50"
          onClick={() => mutate(undefined, { revalidate: true })}
        >
          <RotateCw className="h-4 w-4 transition-transform duration-200 group-hover:rotate-30" />
          Refresh
        </button>
        {isValidating && <span className="text-sm opacity-70">Updating…</span>}
      </div>

      <AssignmentDashboardControls
        accounts={accounts}
        domains={domainMap}
        courses={courses}
        filters={filters}
        onFilterChange={onFilterChange}
        clearAll={clearAll}
      />

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

          <Link
            className="bg-destructive/70 text-destructive-foreground hover:bg-destructive/80 rounded-xl border border-white/10 px-4 py-2 font-semibold tracking-tight shadow-md transition"
            href="/manage-accounts"
          >
            Manage Accounts
          </Link>
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
                            onPlannerChanged={() =>
                              mutate(undefined, { revalidate: true })
                            }
                            onToggleAccountFilter={toggleAccountFilter}
                            filteredAccountId={filteredAccountId}
                            mode={mode}
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
