import type {
  MergedAssignment,
  Assignment,
  AccountSafeInfo,
} from "@/lib/types";
import Link from "next/link";
import { HoverOrTap } from "./hover-or-tap";
import { convertToDark } from "@/lib/colors/colors";
import {
  NotebookPen,
  CopyCheck,
  MessageSquareMore,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

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
  const IconMap: Record<string, LucideIcon> = {
    assignment: NotebookPen,
    quiz: CopyCheck,
    discussion_topic: MessageSquareMore,
  };

  const IconComponent = IconMap[item.type] || ListTodo;
  const unsubmittedAccounts = item.accountsNotSubmitted;
  if (unsubmittedAccounts.length == 0) {
    return;
  }
  const dark = convertToDark(color);

  return (
    <div
      className="glass-border flex items-stretch gap-4 overflow-hidden rounded-2xl bg-[oklch(var(--c-light)/0.07)] shadow-sm dark:bg-[oklch(var(--c-dark)/0.05)]"
      style={
        {
          "--c-light": `${color.l} ${color.c} ${color.h}`,
          "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
        } as React.CSSProperties
      }
    >
      <div className="border-glass/10 flex flex-none items-center justify-center border-r bg-[oklch(var(--c-light)/0.5)] px-2 md:px-5 dark:bg-[oklch(var(--c-dark)/0.5)]">
        <IconComponent
          className="size-9 opacity-80 lg:size-10"
          strokeWidth={1.5}
          aria-label={`Assignment type: ${item.type}`}
        />
      </div>

      <div className="flex min-w-0 flex-5 flex-col py-2 md:py-3">
        <p className="text-card-foreground/40 block truncate text-xs font-semibold">
          {item.course_name}
        </p>
        <Link
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-card-foreground md:text-md text-sm font-bold hover:underline lg:text-lg"
        >
          {item.title}
        </Link>
        <p className="text-card-foreground/70 text-xs md:hidden">
          {item.points_possible ? ` ${item.points_possible} pts | ` : ""}
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
        <div className="scrollbar-hide mt-2 flex min-w-0 gap-1.5 overflow-x-auto">
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
                    className="ring-card-foreground/20 size-8 rounded-full ring"
                  />
                }
              >
                <p>{account.name}</p>
              </HoverOrTap>
            );
          })}
        </div>
      </div>
      <div className="hidden flex-none flex-col items-end self-center pr-2 md:flex">
        <p className="text-card-foreground/70 text-md font-medium lg:text-lg">
          {item.points_possible ? ` ${item.points_possible} pts` : ""}
        </p>
        <p className="text-card-foreground/50 text-xs md:text-sm">
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
