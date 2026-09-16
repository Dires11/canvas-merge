"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "canvas-merge-show-support-spaces";
const CHANGE_EVENT = "canvas-merge-grades-settings-change";
let memoryPreference = false;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? memoryPreference : stored === "on";
  } catch {
    return memoryPreference;
  }
}

function setPreference(enabled: boolean) {
  memoryPreference = enabled;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Preserve the preference in memory when storage is unavailable.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useSupportSpaces() {
  const showSupportSpaces = useSyncExternalStore(subscribe, getPreference, () => false);
  return { showSupportSpaces, setShowSupportSpaces: setPreference };
}

export function GradesSettings() {
  const { showSupportSpaces, setShowSupportSpaces } = useSupportSpaces();
  return (
    <section aria-labelledby="grades-settings-heading" className="border-foreground/10 mt-2 border-t pt-5">
      <h2 id="grades-settings-heading" className="text-base font-semibold">Grades</h2>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <label htmlFor="show-support-spaces" className="cursor-pointer font-medium">
            Show support spaces
          </label>
          <p id="support-spaces-description" className="text-muted-foreground mt-1 text-sm">
            Include student hubs and support centers in course and student grade views.
          </p>
        </div>
        <button
          id="show-support-spaces"
          type="button"
          role="switch"
          aria-checked={showSupportSpaces}
          aria-describedby="support-spaces-description"
          onClick={() => setShowSupportSpaces(!showSupportSpaces)}
          className={`focus-visible:ring-ring relative mt-0.5 h-7 w-12 shrink-0 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 ${showSupportSpaces ? "bg-primary" : "bg-foreground/20"}`}
        >
          <span className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${showSupportSpaces ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>
    </section>
  );
}
