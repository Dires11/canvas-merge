import type {
  MergedAssignment,
  Assignment,
  AccountSafeInfo,
} from "@/lib/types";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AssignmentCard({
  item,
  merged,
  accountMap,
  backgroundColor,
}: {
  item: MergedAssignment;
  merged: boolean;
  accountMap: Map<string, AccountSafeInfo>;
  backgroundColor: string;
}) {
  const course = item.course_name.split(" ");
  const courseDisplayName =
    course[0] + " " + course[1] + " " + course[course.length - 1];
  const unsubmittedAccounts = item.accountsNotSubmitted;
  if (unsubmittedAccounts.length == 0) {
    return;
  }

  return (
    <div
      className="  rounded-2xl px-5 py-3
                    border border-white/30 dark:border-white/10
                    bg-card/30 dark:bg-white/5
                    shadow-lg items-center backdrop-blur-sm
                    flex justify-between gap-4
                    transition hover:bg-white/50 hover:shadow-xl
                    dark:hover:bg-white/10"
      style={{ backgroundColor }}
    >
      <div className="flex flex-col space-y-1.5">
        <div>
          <p className="text-sm font-semibold text-card-foreground/40">
            {courseDisplayName}
          </p>
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-card-foreground font-bold text-lg"
          >
            {item.title}
          </Link>
        </div>
        {unsubmittedAccounts.map((acc) => {
          const account = accountMap.get(acc.accountId);
          if (!account) return;
          return (
            <div key={account.id} className="flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={account.avatarUrl}
                    alt={`${account.name}'s avatar`}
                    width={35}
                    height={35}
                    className="rounded-full"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{account.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-end">
        <p className="font-medium text-lg text-card-foreground/70">
          {item.points_possible ? ` ${item.points_possible} pts` : ""}
        </p>
        <p className="text-sm text-card-foreground/50">
          Due:{" "}
          {item.due_at
            ? new Date(item.due_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : " No due date"}
        </p>
      </div>

      {/* {unsubmittedAccounts.map((acc) => {
        const account = accountMap.get(acc.accountId);
        if (!account) return;
        return (
          <div key={account.id} className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <img
                  src={account.avatarUrl}
                  alt={`${account.name}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{account.name}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })} */}
    </div>
  );
}
