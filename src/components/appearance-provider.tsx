"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

import { usePointerGlass } from "@/components/use-pointer-glass";

const CHANGE_EVENT = "canvas-merge-appearance-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

const POINTER_STORAGE_KEY = "canvas-merge-pointer-reflections";
let pointerPreference = true;

function getPointerReflections() {
  try {
    const stored = localStorage.getItem(POINTER_STORAGE_KEY);
    return stored === null ? pointerPreference : stored !== "off";
  } catch {
    return pointerPreference;
  }
}

function setPointerReflections(enabled: boolean) {
  pointerPreference = enabled;
  try {
    localStorage.setItem(POINTER_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Fall back to the in-memory preference for this session.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const AppearanceContext = createContext({
  pointerReflections: true,
  setPointerReflections,
  reducedMotion: false,
});

export function AppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pointerReflections = useSyncExternalStore(
    subscribe,
    getPointerReflections,
    () => true,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  usePointerGlass(pointerReflections && !reducedMotion);

  return (
    <AppearanceContext.Provider
      value={{
        pointerReflections,
        setPointerReflections,
        reducedMotion,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
