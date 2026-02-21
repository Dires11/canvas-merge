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
import { HoverOrTap } from "./hover-or-tap";
import { convertToDark } from "@/lib/colors/colors";

export function AssignmentCard({
  item,
  merged,
  accountMap,
  color,
}: {
  item: MergedAssignment;
  merged: boolean;
  accountMap: Map<string, AccountSafeInfo>;
  color: { l: number; c: number; h: number };
}) {
  const unsubmittedAccounts = item.accountsNotSubmitted;
  if (unsubmittedAccounts.length == 0) {
    return;
  }
  const dark = convertToDark(color);

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl border bg-[oklch(var(--c-light)/0.7)] px-5 py-3 shadow-lg backdrop-blur-sm transition hover:shadow-xl dark:bg-[oklch(var(--c-dark)/0.7)]"
      style={
        {
          "--c-light": `${color.l} ${color.c} ${color.h}`,
          "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
        } as React.CSSProperties
      }
    >
      <div className="flex min-w-0 flex-col space-y-1.5">
        <div>
          <p className="text-card-foreground/40 block truncate text-sm font-semibold">
            {item.course_name}
          </p>
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-card-foreground text-lg font-bold hover:underline"
          >
            {item.title}
          </Link>
        </div>
        <div className="scrollbar-hide flex min-w-0 space-x-2 overflow-x-auto">
          {unsubmittedAccounts.map((acc) => {
            const account = accountMap.get(acc.accountId);
            if (!account) return;
            return (
              <HoverOrTap
                key={acc.accountId}
                trigger={
                  <img
                    src={account.avatarUrl}
                    alt={`${account.name}'s avatar`}
                    width={35}
                    height={35}
                    className="ring-card-foreground/20 rounded-full ring"
                  />
                }
              >
                <p>{account.name}</p>
              </HoverOrTap>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="text-card-foreground/70 text-lg font-medium">
          {item.points_possible ? ` ${item.points_possible} pts` : ""}
        </p>
        <p className="text-card-foreground/50 text-sm">
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
    </div>
  );
}
