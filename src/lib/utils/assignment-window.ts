export const ASSIGNMENT_WINDOWS = [
  { value: "rolling7", label: "Moving 7 days" },
  { value: "week", label: "Fixed week" },
  { value: "rolling14", label: "Moving 14 days" },
  { value: "fortnight", label: "Fixed 2 weeks" },
] as const;
export type AssignmentWindow = (typeof ASSIGNMENT_WINDOWS)[number]["value"];
export function isAssignmentWindow(value: unknown): value is AssignmentWindow {
  return ASSIGNMENT_WINDOWS.some((option) => option.value === value);
}

/** Local calendar arithmetic preserves midnight boundaries through DST changes. */
export function getAssignmentWindow(
  view: AssignmentWindow,
  today: Date,
  offset = 0,
) {
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const days = view === "rolling14" || view === "fortnight" ? 14 : 7;
  if (view === "week" || view === "fortnight") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    if (view === "fortnight") {
      // Stable consecutive two-week blocks anchored to Monday, January 5, 1970.
      const day =
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()) /
        86400000;
      const week = Math.floor((day - 4) / 7);
      start.setDate(start.getDate() - (((week % 2) + 2) % 2) * 7);
    }
  }
  start.setDate(start.getDate() + offset * days);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  const last = new Date(end);
  last.setDate(last.getDate() - 1);
  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    start,
    last,
    days,
  };
}
