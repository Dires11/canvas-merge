"use client";

import { useSyncExternalStore } from "react";
import {
  ASSIGNMENT_WINDOWS,
  isAssignmentWindow,
  type AssignmentWindow,
} from "@/lib/utils/assignment-window";

const KEY = "canvas-merge-assignment-window";
const EVENT = "canvas-merge-assignment-window-change";
let memory: AssignmentWindow = "rolling7";
function read(): AssignmentWindow {
  try {
    const value = localStorage.getItem(KEY);
    return isAssignmentWindow(value) ? value : memory;
  } catch {
    return memory;
  }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}
function setWindow(value: AssignmentWindow) {
  memory = value;
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* Session-only fallback. */
  }
  window.dispatchEvent(new Event(EVENT));
}
export function useAssignmentWindow() {
  const defaultWindow = useSyncExternalStore(
    subscribe,
    read,
    () => "rolling7" as const,
  );
  return { defaultWindow, setDefaultWindow: setWindow };
}
export function AssignmentWindowSettings() {
  const { defaultWindow, setDefaultWindow } = useAssignmentWindow();
  return (
    <section
      aria-labelledby="assignment-settings-heading"
      className="border-foreground/10 mt-2 border-t pt-5"
    >
      <h2 id="assignment-settings-heading" className="text-base font-semibold">
        Assignments
      </h2>
      <label
        htmlFor="default-assignment-window"
        className="mt-4 block text-sm font-medium"
      >
        Default date range
      </label>
      <select
        id="default-assignment-window"
        value={defaultWindow}
        onChange={(event) => {
          if (isAssignmentWindow(event.target.value))
            setDefaultWindow(event.target.value);
        }}
        className="glass-control mt-2 w-full px-3 py-2 text-sm outline-none"
      >
        {ASSIGNMENT_WINDOWS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <p className="text-muted-foreground mt-2 text-sm">
        Moving ranges start today. Fixed ranges start Monday; two-week blocks
        stay anchored to the calendar. Saved in this browser.
      </p>
    </section>
  );
}
