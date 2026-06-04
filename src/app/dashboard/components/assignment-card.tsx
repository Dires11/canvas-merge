import type { MergedAssignment } from "@/lib/types";
import type { AccountSafeInfo } from "@/lib/types";
import { convertToDark } from "@/lib/utils/colors/colors";
import {
  NotebookPen,
  CopyCheck,
  MessageSquareMore,
  ListTodo,
  CheckCircle2,
  ListFilter,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ClockAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { HoverOrTap } from "./hover-or-tap";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || "This Account";
}

type AssignmentAccount =
  | MergedAssignment["accountsNotSubmitted"][number]
  | MergedAssignment["accountsMissingSubmission"][number];

type OverrideResponse = {
  ok: boolean;
  data?: {
    overrideId: number;
    markedComplete: boolean;
  };
  error?: string;
};

async function updatePlannerOverride(body: Record<string, unknown>) {
  const response = await fetch("/api/planner/override", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = (await response.json().catch(() => null)) as
    | OverrideResponse
    | null;

  if (!response.ok || !json?.ok || !json.data) {
    throw new Error(json?.error ?? "Failed to update assignment status.");
  }

  return json.data;
}

function AccountAssignmentPopover({
  item,
  account,
  assignmentAccount,
  onPlannerChanged,
  onToggleAccountFilter,
  filteredAccountId,
}: {
  item: MergedAssignment;
  account: AccountSafeInfo;
  assignmentAccount: AssignmentAccount;
  onPlannerChanged?: () => void;
  onToggleAccountFilter?: (accountId: string) => void;
  filteredAccountId?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completeOverrideId, setCompleteOverrideId] = useState<number | null>(
    null,
  );
  const [changed, setChanged] = useState(false);

  const wasCreated = assignmentAccount.plannerOverrideId === null;
  const isMarkedComplete = completeOverrideId !== null;
  const isFilteredToAccount = filteredAccountId === account.id;
  const firstName = getFirstName(account.name);
  const statusLabel = isMarkedComplete ? "Marked complete" : "Not submitted";

  async function markComplete() {
    setPending(true);
    setError(null);

    try {
      const result = await updatePlannerOverride({
        action: "mark_complete",
        accountId: account.id,
        plannableType: item.type,
        plannableId: item.id,
        overrideId: assignmentAccount.plannerOverrideId,
      });

      setCompleteOverrideId(result.overrideId);
      setChanged(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark assignment complete.",
      );
    } finally {
      setPending(false);
    }
  }

  async function undo() {
    if (!completeOverrideId) return;

    setPending(true);
    setError(null);

    try {
      await updatePlannerOverride({
        action: wasCreated ? "undo_create" : "undo_update",
        accountId: account.id,
        overrideId: completeOverrideId,
      });

      setCompleteOverrideId(null);
      setChanged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to undo change.");
    } finally {
      setPending(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen && changed) {
      onPlannerChanged?.();
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ring-card-foreground/20 my-0.5 ml-0.5 rounded-full ring outline-none transition hover:scale-105 hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Open options for ${account.name}`}
        >
          <Avatar>
            <AvatarImage
              src={account.avatarUrl}
              alt={`${account.name}'s avatar`}
            />
            <AvatarFallback>{getInitials(account.name)}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={8}
        className="glass-border w-[min(26rem,calc(100vw-2rem))] rounded-xl bg-glass/25 p-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.45),0_18px_50px_rgb(15_23_42_/_0.18)] backdrop-blur-xl dark:bg-background/55 dark:shadow-xl"
      >
        <div className="flex min-w-0 items-start gap-3">
          <Avatar size="lg" className="ring-card-foreground/15 mt-0.5 ring">
            <AvatarImage src={account.avatarUrl} alt={account.name} />
            <AvatarFallback>{getInitials(account.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold tracking-tight">
                  {account.name}
                </h3>
                <p className="text-muted-foreground truncate text-xs">
                  {account.canvasDomain.name}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  isMarkedComplete
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                    : "bg-glass/15 text-muted-foreground",
                )}
              >
                {statusLabel}
              </span>
            </div>

          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-background/35 hover:bg-background/55 dark:bg-glass/5 dark:hover:bg-glass/15"
            onClick={() => {
              onToggleAccountFilter?.(account.id);
            }}
          >
            {isFilteredToAccount ? <RotateCcw /> : <ListFilter />}
            <span className="truncate">
              {isFilteredToAccount
                ? "Show All"
                : `${firstName}'s Only`}
            </span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant={isMarkedComplete ? "outline" : "default"}
            className={cn(
              "w-9 px-0 min-[420px]:w-auto min-[420px]:px-3",
              isMarkedComplete && "bg-glass/5 hover:bg-glass/15",
            )}
            disabled={pending}
            onClick={isMarkedComplete ? undo : markComplete}
          >
            {isMarkedComplete ? <RotateCcw /> : <CheckCircle2 />}
            <span className="hidden truncate min-[420px]:inline">
              {isMarkedComplete ? "Undo" : "Mark Complete"}
            </span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
  accountMap,
  color,
  onPlannerChanged,
  onToggleAccountFilter,
  filteredAccountId,
}: {
  item: MergedAssignment;
  accountMap: Record<string, AccountSafeInfo>;
  color: { l: number; c: number; h: number };
  onPlannerChanged?: () => void;
  onToggleAccountFilter?: (accountId: string) => void;
  filteredAccountId?: string | null;
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
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-card-foreground md:text-md text-sm font-bold hover:underline lg:text-lg"
        >
          {item.title}
        </a>
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
              <AccountAssignmentPopover
                key={acc.accountId}
                item={item}
                account={account}
                assignmentAccount={acc}
                onPlannerChanged={onPlannerChanged}
                onToggleAccountFilter={onToggleAccountFilter}
                filteredAccountId={filteredAccountId}
              />
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
