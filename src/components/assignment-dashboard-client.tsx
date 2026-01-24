"use client";

import { useMemo } from "react";
import { AssignmentCard } from "./assignment-card";
import type {
  MergedItemsByDomain,
  AccountSafeInfo,
  MergedAssignment,
} from "@/lib/types";

function getDueLabelLocal(due_at: string | null): string {
  if (!due_at) return "No due date";

  const now = new Date();

  // Today in *user's local* timezone (time set to midnight)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const due = new Date(due_at); // Canvas UTC → converted to local time

  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffMs = dueDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === 2) return "Due in 2 days";
  return `Due in ${diffDays} days`;
}

function groupAssignmentsByDueDateLocal(assignments: any[]) {
  const groups: Record<string, typeof assignments> = {};

  for (const assignment of assignments) {
    const label = getDueLabelLocal(assignment.due_at);

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(assignment);
  }

  return groups;
}

type Props = {
  plannerData: MergedItemsByDomain;
  accounts: AccountSafeInfo[];
};

export function AssignmentDashboardClient({ plannerData, accounts }: Props) {
  // build map on client
  const accountMap = useMemo<Map<string, AccountSafeInfo>>(
    () => new Map(accounts.map((acc) => [acc.id, acc])),
    [accounts],
  );

  const groupedByDomain = useMemo(() => {
    const result: {
      [domain: string]: {
        [label: string]: MergedAssignment[];
      };
    } = {};

    for (const [domain, mergedItems] of Object.entries(plannerData)) {
      const assignments = mergedItems.assignments.filter(
        (assignment) => assignment.accountsNotSubmitted.length != 0,
      );

      if (assignments.length > 0) {
        result[domain] = groupAssignmentsByDueDateLocal(assignments);
      }
    }

    return result;
  }, [plannerData]);

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(groupedByDomain).map(([domain, groups]) => (
        <div key={domain} className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">{domain}</h1>

          {Object.entries(groups).map(([label, assignments]) => (
            <div key={label} className="mt-1">
              <h2 className="text-lg font-semibold ">{label}</h2>

              <div className="flex flex-col gap-1.5">
                {assignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    item={assignment}
                    accountMap={accountMap}
                    merged={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
