"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { AssignmentCard } from "./assignment-card";
import type {
  AccountSafeInfo,
  MergedAssignment,
  UserCourse,
} from "@/lib/types";
import { TriangleAlert, ChevronDown } from "lucide-react";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type { UserPlanner } from "@/lib/planner/get-user-planner";
import Link from "next/link";
import { GlassContainer } from "../glass-container";
import { AssignmentDashboardControls } from "./dashboard-controls";

const KEY = "/api/planner/user-planner?merge=true";

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

function groupAssignmentsByDueDateLocal(assignments: MergedAssignment[]) {
  const groups: Record<string, MergedAssignment[]> = {};

  for (const assignment of assignments) {
    if (
      assignment.accountsNotSubmitted.length === 0 &&
      assignment.accountsMissingSubmission.length === 0
    ) {
      continue;
    }
    const label = getDueLabelLocal(assignment.due_at);
    (groups[label] ??= []).push(assignment);
  }

  return groups;
}

type Props = {
  initialData?: UserPlanner | null;
  courses: UserCourse[];
};

type FilterType = "domain" | "account" | "course";
export type Filters = Record<FilterType, string[]>;

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
  const selectedDomains = nextFilters.domain;

  const validAccountIds =
    selectedDomains.length === 0
      ? accounts.map((a) => a.id)
      : accounts
          .filter((a) => selectedDomains.includes(a.domain))
          .map((a) => a.id);

  return {
    domain: [...new Set(nextFilters.domain)],
    account: [...new Set(nextFilters.account)].filter((id) =>
      validAccountIds.includes(id),
    ),
    course: [...new Set(nextFilters.course)],
  };
}

export function AssignmentDashboardClient({ initialData, courses }: Props) {
  const { data, error, isValidating, mutate } = useSWR(KEY, fetcher, {
    fallbackData: initialData ?? undefined,
    revalidateOnFocus: true,
    revalidateIfStale: false,
    revalidateOnReconnect: true,
    dedupingInterval: 10_000,
    keepPreviousData: false,
  });

  const dayKey = useDayKey();
  const accounts = data?.accountsSafeInfo ?? [];
  const accountsWithErrors = data?.accountsWithErrors ?? [];

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

  const accountMap = useMemo(() => {
    return new Map<string, AccountSafeInfo>(
      accounts.map((acc) => [acc.id, acc]),
    );
  }, [accounts]);

  const coursesMap = useMemo(() => {
    const map = new Map<string, UserCourse>();

    for (const course of courses) {
      map.set(`${course.domain}|${course.id}`, course);
    }

    return map;
  }, [courses]);

  const groupedByDomain = useMemo(() => {
    const result: Record<string, Record<string, MergedAssignment[]>> = {};

    for (const [domain, mergedItems] of Object.entries(data?.merged ?? {})) {
      if (filters.domain.length > 0 && !filters.domain.includes(domain)) {
        continue;
      }
      let assignments = mergedItems.assignments;

      // If there are account filters, we need to filter the accounts in each assignment
      if (filters.account.length > 0 || filters.course.length > 0) {
        const filteredAssignments: MergedAssignment[] = [];
        for (const assignment of mergedItems.assignments) {
          if (
            filters.course.length > 0 &&
            !filters.course.includes(`${domain}-${assignment.course_id}`)
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
        result[domain] = groupAssignmentsByDueDateLocal(assignments);
      }
    }
    return result;
  }, [data?.merged, dayKey, filters.account, filters.domain, filters.course]);

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

  return (
    <div className="text-foreground flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          disabled={isValidating}
          className="rounded-md border px-3 py-1 disabled:opacity-50"
          onClick={() => mutate(undefined, { revalidate: true })}
        >
          Refresh
        </button>
        {isValidating && <span className="text-sm opacity-70">Updating…</span>}
      </div>
      <AssignmentDashboardControls
        accounts={accounts}
        domains={Object.keys(data.merged ?? {})}
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
              const account = accountMap.get(accountId);

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
      {Object.entries(groupedByDomain).map(([domain, groups]) => (
        <GlassContainer key={domain} className="w-full">
          <Collapsible
            defaultOpen
            className="flex w-full flex-col gap-2 rounded-2xl"
          >
            <CollapsibleTrigger className="group flex items-center justify-between text-lg tracking-tight hover:cursor-pointer">
              {domain}
              <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>

            <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
              {Object.entries(groups).map(([label, assignments]) => {
                return (
                  <div key={label} className="mt-1">
                    <h2 className="text-lg tracking-tight">{label}</h2>
                    <div className="flex flex-col gap-1.5">
                      {assignments.map((assignment) => (
                        <AssignmentCard
                          key={`${assignment.course_id}:${assignment.id}`}
                          item={assignment}
                          color={
                            coursesMap.get(`${domain}|${assignment.course_id}`)
                              ?.color ?? { l: 0.7, c: 0.1, h: 250 }
                          }
                          accountMap={accountMap}
                          merged={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </GlassContainer>
      ))}
    </div>
  );
}
