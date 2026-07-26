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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { HoverOrTap } from "./hover-or-tap";
import {
  updatePlannerOverride,
  type PlannerOverrideResult,
} from "./planner-override";

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

function formatPoints(value: number) {
  if (Number.isInteger(value)) return String(value);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatGrade(value: string | number) {
  if (typeof value === "number") return formatPoints(value);

  const parsed = Number(value);
  if (Number.isFinite(parsed) && value.trim() !== "") {
    return formatPoints(parsed);
  }

  return value;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type AssignmentAccount =
  | MergedAssignment["accountsNotSubmitted"][number]
  | MergedAssignment["accountsMissingSubmission"][number]
  | MergedAssignment["accountsSubmitted"][number];

type MarkCompletePayload = {
  item: MergedAssignment;
  accountId: string;
  overrideId: number | null;
};

type UndoCompletePayload = {
  item: MergedAssignment;
  accountId: string;
  overrideId: number;
};

type PlannerChangedPayload = {
  item: MergedAssignment;
  accountId: string;
  completed: boolean;
  overrideId: number | null;
};

function AccountAssignmentPopover({
  item,
  account,
  assignmentAccount,
  onMarkComplete,
  onUndoComplete,
  onPlannerChanged,
  onToggleAccountFilter,
  filteredAccountId,
  mode,
  readOnly,
}: {
  item: MergedAssignment;
  account: AccountSafeInfo;
  assignmentAccount: AssignmentAccount;
  onMarkComplete?: (
    payload: MarkCompletePayload,
  ) => Promise<PlannerOverrideResult>;
  onUndoComplete?: (
    payload: UndoCompletePayload,
  ) => Promise<PlannerOverrideResult>;
  onPlannerChanged?: (payload: PlannerChangedPayload) => void;
  onToggleAccountFilter?: (accountId: string) => void;
  filteredAccountId?: string | null;
  mode: "active" | "completed";
  readOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [avatarTooltipOpen, setAvatarTooltipOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overrideId, setOverrideId] = useState<number | null>(
    assignmentAccount.plannerOverrideId,
  );
  const [markedComplete, setMarkedComplete] = useState(
    assignmentAccount.plannerMarkedComplete,
  );
  const [changed, setChanged] = useState(false);

  const isMarkedComplete = markedComplete;
  const isFilteredToAccount = filteredAccountId === account.id;
  const firstName = getFirstName(account.name);
  const postedGrade =
    assignmentAccount.submission.grade ?? assignmentAccount.submission.score;
  const maxPoints =
    item.points_possible != null ? formatPoints(item.points_possible) : null;
  const gradeLabel =
    assignmentAccount.submission.graded && postedGrade != null
      ? maxPoints
        ? `${formatGrade(postedGrade)}/${maxPoints}`
        : `Grade: ${formatGrade(postedGrade)}`
      : maxPoints
        ? `-/${maxPoints}`
        : "-";
  const submittedLabel = assignmentAccount.submission.submittedAt
    ? `Submitted: ${formatDateTime(assignmentAccount.submission.submittedAt)}`
    : "Submitted: Unknown";
  const statusLabel =
    mode === "completed"
      ? gradeLabel
      : isMarkedComplete
        ? "Marked complete"
        : "Not submitted";
  const canToggleCompletion =
    mode === "active" || assignmentAccount.plannerMarkedComplete;
  const comments = assignmentAccount.submission.comments;

  async function markComplete() {
    setPending(true);
    setError(null);

    try {
      const result = onMarkComplete
        ? await onMarkComplete({
            item,
            accountId: account.id,
            overrideId,
          })
        : await updatePlannerOverride({
            action: "mark_complete",
            accountId: account.id,
            plannableType: item.type,
            plannableId: item.id,
            overrideId,
          });

      setOverrideId(result.overrideId);
      setMarkedComplete(result.markedComplete);
      setChanged(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark assignment complete.",
      );
    } finally {
      setPending(false);
    }
  }

  async function undo() {
    if (!overrideId) return;

    setPending(true);
    setError(null);

    try {
      await (onUndoComplete
        ? onUndoComplete({
            item,
            accountId: account.id,
            overrideId,
          })
        : updatePlannerOverride({
            action: "mark_incomplete",
            accountId: account.id,
            overrideId,
          }));

      setOverrideId(overrideId);
      setMarkedComplete(false);
      setChanged(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to undo change.");
    } finally {
      setPending(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && pending) return;

    if (nextOpen) setAvatarTooltipOpen(false);
    setOpen(nextOpen);

    if (!nextOpen && changed) {
      onPlannerChanged?.({
        item,
        accountId: account.id,
        completed: markedComplete,
        overrideId,
      });
      setChanged(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip open={avatarTooltipOpen && !open}>
        <PopoverTrigger asChild>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="ring-card-foreground/20 focus-visible:ring-ring my-0.5 ml-0.5 rounded-full ring transition outline-none hover:scale-105 hover:cursor-pointer focus-visible:ring-2"
              aria-label={`Open options for ${account.name}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  setAvatarTooltipOpen(true);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setAvatarTooltipOpen(false);
                }
              }}
              onClick={() => setAvatarTooltipOpen(false)}
            >
              <Avatar>
                <AvatarImage
                  src={account.avatarUrl}
                  alt={`${account.name}'s avatar`}
                />
                <AvatarFallback>{getInitials(account.name)}</AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
        </PopoverTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="max-w-56 px-2.5 py-1.5 text-xs font-medium"
        >
          <span className="block truncate">{account.name}</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={8}
        className="glass-border bg-glass/25 dark:bg-background/55 w-[min(26rem,calc(100vw-2rem))] rounded-xl p-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.45),0_18px_50px_rgb(15_23_42_/_0.18)] backdrop-blur-xl dark:shadow-xl"
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
                {mode === "completed" && (
                  <p className="text-muted-foreground truncate text-xs">
                    {submittedLabel}
                  </p>
                )}
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
          <p className="border-destructive/30 bg-destructive/10 text-destructive mt-3 rounded-md border px-3 py-2 text-xs">
            {error}
          </p>
        )}

        {mode === "completed" && (
          <div className="glass-border bg-background/25 dark:bg-glass/5 mt-3 rounded-lg px-3 py-2">
            <p className="text-muted-foreground text-xs font-medium">
              Teacher comments
            </p>
            {comments.length > 0 ? (
              <div className="mt-2 flex max-h-32 flex-col gap-2 overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div key={comment.id} className="text-xs">
                    <div className="text-muted-foreground flex items-center justify-between gap-2">
                      <span className="truncate">
                        {comment.author_name ?? "Teacher"}
                      </span>
                      <span className="shrink-0">
                        {formatDateTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-foreground/90 mt-1 whitespace-pre-wrap">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mt-1 text-xs">
                No comments yet.
              </p>
            )}
          </div>
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
              {isFilteredToAccount ? "Show All" : `${firstName}'s Only`}
            </span>
          </Button>

          {!readOnly && (
            <Button
              type="button"
              size="sm"
              variant={isMarkedComplete ? "outline" : "default"}
              className={cn(
                "w-9 px-0 min-[420px]:w-auto min-[420px]:px-3",
                isMarkedComplete && "bg-glass/5 hover:bg-glass/15",
              )}
              disabled={pending || !canToggleCompletion}
              onClick={isMarkedComplete ? undo : markComplete}
            >
              {isMarkedComplete ? <RotateCcw /> : <CheckCircle2 />}
              <span className="hidden truncate min-[420px]:inline">
                {isMarkedComplete
                  ? "Undo"
                  : mode === "completed"
                    ? "Completed"
                    : "Mark Complete"}
              </span>
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DueLabel({
  dueDate,
  isDueAtMidnight,
  pointsLabel,
  className,
}: {
  dueDate: string | null;
  isDueAtMidnight: boolean;
  pointsLabel?: string | null;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-card-foreground/50 flex items-center gap-1 text-xs tracking-tight md:text-sm",
        className,
      )}
    >
      <span>
        Due: {dueDate}
        {pointsLabel && <> · {pointsLabel}</>}
      </span>

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
  onMarkComplete,
  onUndoComplete,
  onPlannerChanged,
  onToggleAccountFilter,
  filteredAccountId,
  mode = "active",
  readOnly = false,
}: {
  item: MergedAssignment;
  accountMap: Record<string, AccountSafeInfo>;
  color: { l: number; c: number; h: number };
  onMarkComplete?: (
    payload: MarkCompletePayload,
  ) => Promise<PlannerOverrideResult>;
  onUndoComplete?: (
    payload: UndoCompletePayload,
  ) => Promise<PlannerOverrideResult>;
  onPlannerChanged?: (payload: PlannerChangedPayload) => void;
  onToggleAccountFilter?: (accountId: string) => void;
  filteredAccountId?: string | null;
  mode?: "active" | "completed";
  readOnly?: boolean;
}) {
  const IconMap: Record<string, LucideIcon> = {
    assignment: NotebookPen,
    quiz: CopyCheck,
    discussion_topic: MessageSquareMore,
  };

  const IconComponent = IconMap[item.type] || ListTodo;
  const visibleAccounts =
    mode === "completed"
      ? item.accountsSubmitted
      : [...item.accountsNotSubmitted, ...item.accountsMissingSubmission];

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
  const pointsLabel =
    item.points_possible != null
      ? `${formatPoints(item.points_possible)} pts`
      : null;

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
          pointsLabel={pointsLabel}
          className="md:hidden"
        />
        <div className="scrollbar-hide mt-2 flex min-w-0 gap-1.5 overflow-x-auto">
          {visibleAccounts.map((acc) => {
            const account = accountMap[acc.accountId];
            if (!account) return;
            return (
              <AccountAssignmentPopover
                key={acc.accountId}
                item={item}
                account={account}
                assignmentAccount={acc}
                onMarkComplete={onMarkComplete}
                onUndoComplete={onUndoComplete}
                onPlannerChanged={onPlannerChanged}
                onToggleAccountFilter={onToggleAccountFilter}
                filteredAccountId={filteredAccountId}
                mode={mode}
                readOnly={readOnly}
              />
            );
          })}
        </div>
      </div>
      <div className="hidden flex-none flex-col items-end self-center pr-2 md:flex">
        <p className="text-card-foreground/60 text-base font-medium lg:text-lg">
          {pointsLabel}
        </p>
        <DueLabel dueDate={dueDate} isDueAtMidnight={isDueAtMidnight} />
      </div>
    </div>
  );
}
