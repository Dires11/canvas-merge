"use client";

import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { AssignmentCard } from "./assignment-card";
import type {
  MergedItemsByDomain,
  AccountSafeInfo,
  MergedAssignment,
} from "@/lib/types";

import { useTheme } from "next-themes";
import { getBuiltInPaletteCss } from "@/lib/colors/get-palette";
import type { WeeklyAssignmentsMergedResponse } from "@/lib/planner/weekly-assignments";

const KEY = "/api/planner/weekly-assignments?merge=true";

const fetcher = async (
  url: string,
): Promise<WeeklyAssignmentsMergedResponse> => {
  const r = await fetch(url, { credentials: "include" });
  const json = await r.json().catch(() => null);

  if (!r.ok) {
    throw new Error(json?.error || `Failed to load planner (${r.status})`);
  }

  return json as WeeklyAssignmentsMergedResponse;
};

function useDayKey() {
  const [key, setKey] = useState(() => new Date().toDateString());

  useEffect(() => {
    const id = setInterval(() => {
      const next = new Date().toDateString();
      setKey((prev) => (prev === next ? prev : next));
    }, 60_000); // check once per minute

    return () => clearInterval(id);
  }, []);

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
  if (diffDays === 2) return "Due in 2 days";
  return `Due in ${diffDays} days`;
}

function groupAssignmentsByDueDateLocal(assignments: MergedAssignment[]) {
  const groups: Record<string, MergedAssignment[]> = {};
  for (const assignment of assignments) {
    const label = getDueLabelLocal(assignment.due_at);
    (groups[label] ??= []).push(assignment);
  }
  return groups;
}

type Props = {
  initialData?: WeeklyAssignmentsMergedResponse | null;
};

export function AssignmentDashboardClient({ initialData }: Props) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    KEY,
    fetcher,
    {
      fallbackData: initialData ?? undefined, // instant render
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10_000,
      keepPreviousData: true,
    },
  );

  // UI states
  if (!data && isLoading) return <div>Loading…</div>;
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

  const accounts = data.accountsSafeInfo;
  const accountsWithErrors = data.accountsWithErrors;

  // build map on client
  const accountMap = useMemo<Map<string, AccountSafeInfo>>(() => {
    console.log("Building account map");

    return new Map(accounts.map((acc) => [acc.id, acc]));
  }, [data.signature]);

  const dayKey = useDayKey();

  const groupedByDomain = useMemo(() => {
    const result: Record<string, Record<string, MergedAssignment[]>> = {};
    for (const [domain, mergedItems] of Object.entries(data.merged)) {
      const assignments = mergedItems.assignments.filter(
        (a) => a.accountsNotSubmitted.length !== 0,
      );

      if (assignments.length > 0) {
        console.log("Building grouped assignments for domain", domain);
        result[domain] = groupAssignmentsByDueDateLocal(assignments);
      }
    }
    return result;
  }, [data.signature, dayKey]);

  const { theme } = useTheme();

  const vars = useMemo(() => {
    const colors = getBuiltInPaletteCss(
      "builtin:bright",
      theme === "dark" ? "dark" : "light",
    );
    const style: Record<string, string> = {};
    colors.forEach((c, i) => {
      style[`--course-${String(i + 1)}`] = c;
    });
    return style;
  }, [theme]);

  let assignmentIndex = 0;

  return (
    <div className="flex flex-col gap-4 text-foreground" style={vars}>
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

      {accountsWithErrors.length > 0 && (
        <div className="rounded-md bg-red-500 p-2 text-white">
          <h2>Accounts with errors</h2>
          <ul>
            {accountsWithErrors.map((accountId) => {
              const account = accounts.find((acc) => acc.id === accountId);

              // NOTE: expiredAt coming from API is a string|null, not Date
              const expiredLabel = account?.expiredAt
                ? new Date(account.expiredAt as any).toLocaleString()
                : null;

              return (
                <li key={accountId}>
                  {account?.name ?? accountId}{" "}
                  {expiredLabel ? `${expiredLabel} expired` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {Object.entries(groupedByDomain).map(([domain, groups]) => (
        <div key={domain} className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">{domain}</h1>

          {Object.entries(groups).map(([label, assignments]) => (
            <div key={label} className="mt-1">
              <h2 className="text-lg font-semibold">{label}</h2>

              <div className="flex flex-col gap-1.5">
                {assignments.map((assignment) => {
                  assignmentIndex++;
                  return (
                    <AssignmentCard
                      key={`${assignment.course_id}:${assignment.id}`}
                      item={assignment}
                      backgroundColor={
                        "oklch(from var(--course-" +
                        String((assignmentIndex % 30) + 1) +
                        ") l c h / 0.5)"
                      }
                      accountMap={accountMap}
                      merged={true}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
