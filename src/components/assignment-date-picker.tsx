"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassPill } from "@/components/ui/glass-pill";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAssignmentWindow } from "@/lib/utils/assignment-window";

export type AssignmentDateRange = {
  start: Date;
  last: Date;
  startISO: string;
  endISO: string;
};
export function calendarRange(start: Date, last: Date): AssignmentDateRange {
  const end = new Date(last);
  end.setDate(end.getDate() + 1);
  return {
    start,
    last,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
  };
}
const label = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function AssignmentDatePicker({
  value,
  onChange,
  today,
}: {
  value: AssignmentDateRange;
  onChange: (value: AssignmentDateRange) => void;
  today: Date;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    new Date(value.start.getFullYear(), value.start.getMonth(), 1),
  );
  const [start, setStart] = useState<Date>(value.start);
  const [last, setLast] = useState<Date | null>(value.last);
  const [choosingEnd, setChoosingEnd] = useState(false);
  const leading = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const tooLong =
    last !== null && last.getTime() - start.getTime() > 365 * 86400000;
  function selectDate(date: Date) {
    if (!choosingEnd) {
      setStart(date);
      setLast(null);
      setChoosingEnd(true);
    } else {
      setStart(date < start ? date : start);
      setLast(date < start ? start : date);
      setChoosingEnd(false);
    }
  }
  const weekShortcuts = (
    [
      [-1, "Previous week"],
      [0, "This week"],
      [1, "Next week"],
    ] as const
  ).map(([offset, text]) => {
    const week = getAssignmentWindow("week", today, offset);
    const selected =
      week.startISO === value.startISO && week.endISO === value.endISO;
    return (
      <GlassPill
        key={offset}
        active={selected}
        size="xs"
        aria-pressed={selected}
        data-glass-pointer=""
        onClick={() => {
          onChange(week);
          setOpen(false);
        }}
      >
        {text}
      </GlassPill>
    );
  });
  return (
    <div
      className="flex shrink-0 items-center gap-2"
      aria-label="Assignment date range"
    >
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setStart(value.start);
            setLast(value.last);
            setChoosingEnd(false);
            setMonth(
              new Date(value.start.getFullYear(), value.start.getMonth(), 1),
            );
          }
        }}
      >
        <PopoverTrigger asChild>
          <GlassPill
            size="sm"
            data-glass-pointer=""
            className="h-8"
            aria-label={`Select date range: ${label(value.start)} – ${label(value.last)}`}
          >
            <CalendarDays />
            <span className="hidden sm:inline">
              {label(value.start)} – {label(value.last)}
            </span>
            <span className="sm:hidden">
              {value.start.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}{" "}
              –{" "}
              {value.last.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </GlassPill>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="settings-glass w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-4"
          aria-label="Choose assignment dates"
        >
          <div className="mb-3 flex items-center justify-between gap-1 sm:hidden">
            {weekShortcuts}
          </div>
          <div className="mb-3 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Previous month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              <ChevronLeft />
            </Button>
            <h3 className="text-sm font-semibold" aria-live="polite">
              {month.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Next month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day} className="text-muted-foreground py-2">
                {day}
              </span>
            ))}
            {Array.from({ length: leading }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const date = new Date(
                month.getFullYear(),
                month.getMonth(),
                i + 1,
              );
              const isStart = dateKey(date) === dateKey(start);
              const isEnd = last !== null && dateKey(date) === dateKey(last);
              const endpoint = isStart || isEnd;
              const inside = last && date >= start && date <= last;
              return (
                <div
                  key={i}
                  className={
                    inside && start.getTime() !== last?.getTime()
                      ? `bg-blue-500/15 ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`
                      : ""
                  }
                >
                  <button
                    type="button"
                    aria-label={label(date)}
                    aria-pressed={Boolean(endpoint || inside)}
                    aria-current={
                      dateKey(date) === dateKey(today) ? "date" : undefined
                    }
                    onClick={() => selectDate(date)}
                    className={`focus-visible:outline-primary relative h-9 w-full text-sm transition-colors focus-visible:z-10 focus-visible:outline-2 ${endpoint ? "rounded-full bg-blue-600 text-white" : inside ? "hover:bg-blue-500/10" : "hover:bg-foreground/10 rounded-full"} ${dateKey(date) === dateKey(today) ? "font-bold underline underline-offset-4" : ""}`}
                  >
                    {i + 1}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="sr-only" aria-live="polite">
            {choosingEnd
              ? `Start: ${label(start)}. Select an end date.`
              : "Select a start date, then an end date."}
          </p>
          {tooLong && (
            <p role="alert" className="text-destructive mt-2 text-xs">
              Choose a range of up to one year.
            </p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="glass-primary relative"
              data-glass-pointer=""
              disabled={!last || tooLong}
              onClick={() => {
                if (last) {
                  onChange(calendarRange(start, last));
                  setOpen(false);
                }
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <div className="hidden items-center gap-2 sm:flex">{weekShortcuts}</div>
    </div>
  );
}
