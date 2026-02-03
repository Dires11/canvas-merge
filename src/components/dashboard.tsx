import { getWeeklyAssignments } from "@/app/api/planner/weekly-assignments/route";
import type { MergedItems, MergedItemsByDomain } from "@/lib/types";
import { AssignmentDashboardClient } from "./assignment-dashboard-client";

export async function Dashboard({ userId }: { userId: string }) {
  let errorMessage = null;

  async function loadPlanner({ merge }: { merge: boolean }) {
    try {
      return await getWeeklyAssignments(userId, merge);
    } catch (error) {
      if (error instanceof Error) {
        errorMessage = error.message;
      }
    }
  }

  const resp = await loadPlanner({ merge: true });
  const plannerData = (resp?.merged as MergedItemsByDomain) || null;
  const accounts = resp?.accountsSafeInfo || [];
  const accountsWithErrors = resp?.accountsWithErrors || [];

  return (
    <div>
      <h1>Dashboard</h1>
      {accountsWithErrors.length > 0 && (
        <div className="bg-red-500 text-white p-2 rounded-md">
          <h2>Accounts with errors</h2>
          <ul>
            {accountsWithErrors.map((accountId) => {
              const account = accounts.find((acc) => acc.id === accountId);
              return (
                <li key={accountId}>
                  {account?.name}
                  {account?.expiredAt?.toLocaleString()}{" "}
                  {account?.expiredAt !== null ? "expired" : "not expired"}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {plannerData && (
        <AssignmentDashboardClient
          plannerData={plannerData}
          accounts={accounts}
        />
      )}
    </div>
  );
}

{
  /* <div key={domain}>
            <h2>{domain} - Merged Planner Data</h2>
            <h3>Assignments</h3>

            <ul className="list-disc list-inside">
              {mergedItems.assignments &&
                mergedItems.assignments.length > 0 &&
                mergedItems.assignments.map((assignment) => {
                  const unsubmittedAccountIds = assignment.accounts
                    .filter((account) => !account.submission.submitted)
                    .map((account) => account.accountId);
                  if (unsubmittedAccountIds.length > 0) {
                    return (
                      <div
                        key={assignment.id}
                        className="border-red-500 border-2"
                      >
                        <li>
                          {assignment.title}{" "}
                          {assignment.due_at
                            ? "Due: " +
                              new Date(assignment.due_at).toLocaleString()
                            : "No due Date"}
                        </li>
                        <li>
                          Accounts:{" "}
                          {unsubmittedAccountIds &&
                            unsubmittedAccountIds.map((id) => {
                              const account = accountMap.get(id);
                              if (account) {
                                return account.name;
                              }
                            })}
                        </li>
                      </div>
                    );
                  }
                })}
              <h3>Announcements</h3>
              {mergedItems.announcements &&
                mergedItems.announcements.length > 0 &&
                mergedItems.announcements.map((announcement) => (
                  <li key={announcement.id}>{announcement.title}</li>
                ))}
              <h3>Other</h3>
              {mergedItems.other &&
                mergedItems.other.length > 0 &&
                mergedItems.other.map((other) => (
                  <li key={other.id}>{other.title}</li>
                ))}
            </ul>
          </div> */
}
