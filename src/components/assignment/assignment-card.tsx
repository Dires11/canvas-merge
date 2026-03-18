import type {
  MergedAssignment,
  Assignment,
  AccountSafeInfo,
} from "@/lib/types";
import Link from "next/link";
import { HoverOrTap } from "../hover-or-tap";
import { convertToDark } from "@/lib/colors/colors";
import {
  NotebookPen,
  CopyCheck,
  MessageSquareMore,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClockAlert } from "lucide-react";

function DueLabel({
  dueDate,
  isDueAtMidnight,
  className,
}: {
  dueDate: string | null;
  isDueAtMidnight: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-card-foreground/50 flex items-center gap-1 text-xs tracking-tight md:text-sm",
        className,
      )}
    >
      <span>Due: {dueDate}</span>

      {!isDueAtMidnight && (
        <HoverOrTap
          trigger={
            <ClockAlert strokeWidth={2} className="size-4 text-red-400" />
          }
        >
          <span>Not due at midnight.</span>
        </HoverOrTap>
      )}
    </p>
  );
}

export function AssignmentCard({
  item,
  merged,
  accountMap,
  color,
}: {
  item: MergedAssignment;
  merged: boolean;
  accountMap: Record<string, AccountSafeInfo>;
  color: { l: number; c: number; h: number };
}) {
  const IconMap: Record<string, LucideIcon> = {
    assignment: NotebookPen,
    quiz: CopyCheck,
    discussion_topic: MessageSquareMore,
  };

  const IconComponent = IconMap[item.type] || ListTodo;
  const unsubmittedAccounts = [
    ...item.accountsNotSubmitted,
    ...item.accountsMissingSubmission,
  ];

  let dueDate = null;
  let isDueAtMidnight = false;

  if (item.due_at) {
    const date = new Date(item.due_at);

    dueDate = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    isDueAtMidnight = date.getHours() === 23 && date.getMinutes() === 59;
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
        <DueLabel
          dueDate={dueDate}
          isDueAtMidnight={isDueAtMidnight}
          className="md:hidden"
        />
        <div className="scrollbar-hide mt-2 flex min-w-0 gap-1.5 overflow-x-auto">
          {unsubmittedAccounts.map((acc) => {
            const account = accountMap[acc.accountId];
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
        <p className="text-card-foreground/60 text-base font-medium lg:text-lg">
          {item.points_possible ? ` ${item.points_possible} pts` : ""}
        </p>
        <DueLabel dueDate={dueDate} isDueAtMidnight={isDueAtMidnight} />
      </div>
    </div>
  );
}
