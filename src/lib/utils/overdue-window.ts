type DateWindow = { startISO: string; endISO: string };

/** Seven local calendar days before today; today's assignments are not overdue. */
export function getOverdueWindow(today: Date): DateWindow {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export function getActivePlannerWindow(
  selected: DateWindow,
  overdue: DateWindow,
  customRange: boolean,
  overdueOnly: boolean,
): DateWindow {
  if (overdueOnly) return overdue;
  if (customRange) return selected;
  return {
    startISO: new Date(
      Math.min(Date.parse(selected.startISO), Date.parse(overdue.startISO)),
    ).toISOString(),
    endISO: selected.endISO,
  };
}

export function matchesActivePlannerWindow(
  dueAt: string | null,
  selected: DateWindow,
  overdue: DateWindow,
  customRange: boolean,
  overdueOnly: boolean,
) {
  if (!dueAt) return !overdueOnly;
  const due = Date.parse(dueAt);
  if (!Number.isFinite(due)) return false;
  const recentOverdue =
    due >= Date.parse(overdue.startISO) && due < Date.parse(overdue.endISO);
  if (overdueOnly) return recentOverdue;
  const inSelection =
    due >= Date.parse(selected.startISO) && due < Date.parse(selected.endISO);
  // Explicit calendar selection allows historical browsing. The default view
  // hides older overdue work, even when a fixed fortnight contains those days.
  return customRange
    ? inSelection
    : recentOverdue || (inSelection && due >= Date.parse(overdue.endISO));
}
