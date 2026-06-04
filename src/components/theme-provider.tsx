"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "canvas-merge-theme-change";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme, systemTheme: "light" | "dark") {
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function subscribeSystemTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    getStoredTheme,
    (): Theme => "system",
  );
  const systemTheme = useSyncExternalStore<"light" | "dark">(
    subscribeSystemTheme,
    getSystemTheme,
    (): "light" | "dark" => "light",
  );

  useEffect(() => {
    applyTheme(theme, systemTheme);
  }, [systemTheme, theme]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    },
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme: theme === "system" ? systemTheme : theme,
    }),
    [setTheme, systemTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return value;
}
