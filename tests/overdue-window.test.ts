import assert from "node:assert/strict";
import { test } from "node:test";
import { getAssignmentWindow } from "../src/lib/utils/assignment-window";
import {
  getOverdueWindow,
  getActivePlannerWindow,
  matchesActivePlannerWindow,
} from "../src/lib/utils/overdue-window";
const today = new Date("2026-09-16T12:00:00");
const overdue = getOverdueWindow(today);
const selected = getAssignmentWindow("rolling7", today);
const visible = (due: string | null, custom = false, only = false) =>
  matchesActivePlannerWindow(due, selected, overdue, custom, only);

test("default view includes seven overdue days and excludes older work", () => {
  assert.equal(visible("2026-09-08T23:59:59"), false);
  assert.equal(visible("2026-09-09T00:00:00"), true);
  assert.equal(visible("2026-09-15T23:59:59"), true);
  assert.equal(visible("2026-09-16T00:00:00"), true);
  assert.equal(visible("2026-09-23T00:00:00"), false);
  assert.equal(visible(null), true);
  assert.equal(visible("invalid"), false);
});
test("overdue pill ignores selected future range and excludes today and undated work", () => {
  assert.equal(visible("2026-09-15T23:59:59", true, true), true);
  assert.equal(visible("2026-09-16T00:00:00", false, true), false);
  assert.equal(visible(null, false, true), false);
  assert.deepEqual(
    getActivePlannerWindow(selected, overdue, true, true),
    overdue,
  );
});
test("requests include overdue work only for default or overdue-only views", () => {
  assert.equal(
    getActivePlannerWindow(selected, overdue, false, false).startISO,
    overdue.startISO,
  );
  assert.deepEqual(
    getActivePlannerWindow(selected, overdue, true, false),
    selected,
  );
  const historical = getAssignmentWindow("week", today, -3);
  const due = new Date(historical.start);
  due.setHours(12);
  assert.equal(
    matchesActivePlannerWindow(
      due.toISOString(),
      historical,
      overdue,
      true,
      false,
    ),
    true,
  );
  assert.equal(
    matchesActivePlannerWindow(
      due.toISOString(),
      historical,
      overdue,
      false,
      false,
    ),
    false,
  );
});
test("seven-day cutoff advances at midnight and preserves local days through DST", () => {
  assert.equal(
    matchesActivePlannerWindow(
      "2026-09-09T23:59:59",
      selected,
      getOverdueWindow(new Date("2026-09-17T00:00:00")),
      false,
      false,
    ),
    false,
  );
  const previous = process.env.TZ;
  process.env.TZ = "America/Los_Angeles";
  try {
    const spring = getOverdueWindow(new Date("2026-03-10T12:00:00"));
    assert.equal(new Date(spring.startISO).getDate(), 3);
    assert.equal(new Date(spring.startISO).getHours(), 0);
    assert.equal(
      Date.parse(spring.endISO) - Date.parse(spring.startISO),
      167 * 3600000,
    );
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
