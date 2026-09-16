import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAssignmentWindow,
  isAssignmentWindow,
} from "../src/lib/utils/assignment-window";

const date = (value: string) => new Date(`${value}T12:00:00`);
const localDay = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

test("rolling windows include today and exactly 7 or 14 calendar days", () => {
  for (const [view, last] of [
    ["rolling7", "2026-09-21"],
    ["rolling14", "2026-09-28"],
  ] as const) {
    const range = getAssignmentWindow(view, date("2026-09-15"));
    assert.equal(localDay(range.start), "2026-09-15");
    assert.equal(localDay(range.last), last);
    assert.equal(range.start.getHours(), 0);
  }
});
test("fixed weeks run Monday through Sunday including across years", () => {
  const range = getAssignmentWindow("week", date("2027-01-03"));
  assert.equal(localDay(range.start), "2026-12-28");
  assert.equal(localDay(range.last), "2027-01-03");
  assert.equal(
    localDay(getAssignmentWindow("week", date("2027-01-04")).start),
    "2027-01-04",
  );
});
test("fixed fortnights stay in the same block for both weeks and page without gaps", () => {
  const range = getAssignmentWindow("fortnight", date("2026-09-15"));
  const secondWeek = new Date(range.start);
  secondWeek.setDate(secondWeek.getDate() + 10);
  assert.equal(
    getAssignmentWindow("fortnight", secondWeek).startISO,
    range.startISO,
  );
  assert.equal(
    getAssignmentWindow("fortnight", date("2026-09-15"), 1).startISO,
    range.endISO,
  );
  assert.equal(
    getAssignmentWindow("fortnight", date("2026-09-15"), -1).endISO,
    range.startISO,
  );
});
test("calendar boundaries remain midnight across daylight saving changes", () => {
  for (const day of ["2026-03-06", "2026-10-30"]) {
    const range = getAssignmentWindow("rolling7", date(day));
    assert.equal(new Date(range.endISO).getHours(), 0);
    assert.equal(range.last.getHours(), 0);
    assert.equal(
      getAssignmentWindow("rolling7", date(day), 1).startISO,
      range.endISO,
    );
  }
});
test("stored window values are validated", () => {
  assert.equal(isAssignmentWindow("fortnight"), true);
  assert.equal(isAssignmentWindow("unexpected"), false);
  assert.equal(isAssignmentWindow(null), false);
});
