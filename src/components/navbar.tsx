"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Monitor, Moon, Sun } from "lucide-react";
import { GlassContainer } from "./glass-container";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun, iconClassName: "" },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    iconClassName: "",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    iconClassName: "",
  },
] as const;

type ThemeOption = (typeof THEME_OPTIONS)[number]["value"];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const activeTheme: ThemeOption =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";
  const activeThemeOption =
    THEME_OPTIONS.find((option) => option.value === activeTheme) ??
    THEME_OPTIONS[1];
  const ActiveThemeIcon = activeThemeOption.icon;
  const inactiveThemeOptions = THEME_OPTIONS.filter(
    (option) => option.value !== activeTheme,
  );

  return (
    <nav className="mx-auto my-4 max-w-7xl px-3 sm:my-8 sm:px-6 lg:px-8">
      <GlassContainer className="flex items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        {/* Logo + nav links — all left-aligned */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link href="/dashboard" className="flex shrink-0 items-center justify-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: isLight ? "#6366f1" : "#fff" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isLight ? "#fff" : "#0f0f13"} strokeWidth="2.5" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </Link>

          {/* Nav links */}
          <div className="text-foreground/80 flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight sm:gap-5 sm:text-base lg:text-lg">
            <Link
              href="/dashboard"
              className={clsx("hover:text-foreground", pathname === "/dashboard" && "text-foreground")}
            >
              Dashboard
            </Link>
            <Link
              href="/manage-accounts"
              className={clsx("hover:text-foreground", pathname === "/manage-accounts" && "text-foreground")}
            >
              <span className="sm:hidden">Accounts</span>
              <span className="hidden sm:inline">Manage Accounts</span>
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Current theme: ${activeThemeOption.label}`}
                className="glass-border bg-primary flex size-8 items-center justify-center rounded-full shadow-[0_1px_4px_rgb(15_23_42_/_0.08)] transition hover:cursor-pointer hover:brightness-105 sm:hidden dark:shadow-none"
              >
                <ActiveThemeIcon
                  key={activeTheme}
                  className={cn(
                    "text-primary-foreground size-4 animate-[theme-icon-pop_350ms_cubic-bezier(0.34,1.56,0.64,1)] fill-current/45 stroke-[2.8]",
                    activeThemeOption.iconClassName,
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="glass-border min-w-28 rounded-xl bg-white/60 p-1.5 shadow-lg backdrop-blur-xl dark:bg-background/70"
            >
              {inactiveThemeOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <DropdownMenuItem
                    key={option.value}
                    className="rounded-lg"
                    onClick={() => setTheme(option.value)}
                  >
                    <Icon className="size-4" />
                    {option.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            aria-label="Theme preference"
            className="glass-border hidden w-[5.75rem] grid-cols-3 rounded-full bg-white/35 p-1 shadow-[0_1px_4px_rgb(15_23_42_/_0.08)] backdrop-blur-lg sm:grid dark:bg-glass/5 dark:shadow-none"
          >
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = activeTheme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-label={`Use ${option.label.toLowerCase()} theme`}
                  aria-pressed={isActive}
                  title={option.label}
                  className={cn(
                    "group flex size-7 items-center justify-center rounded-full transition-all duration-300 ease-out hover:cursor-pointer",
                    isActive
                      ? "bg-primary shadow-sm"
                      : "hover:bg-background/30 dark:hover:bg-glass/15",
                  )}
                  onClick={() => setTheme(option.value)}
                >
                  <Icon
                    key={`${option.value}-${isActive ? "active" : "idle"}`}
                    className={cn(
                      "size-4 transition-all duration-300 ease-out group-hover:scale-110",
                      isActive
                        ? "text-primary-foreground animate-[theme-icon-pop_350ms_cubic-bezier(0.34,1.56,0.64,1)] fill-current/45 stroke-[2.8] drop-shadow-[0_0_8px_rgb(255_255_255_/_0.32)]"
                        : "text-foreground/70 fill-transparent stroke-[2] -rotate-6 group-hover:text-foreground",
                      option.iconClassName,
                    )}
                  />
                </button>
              );
            })}
          </div>

          <UserButton
            appearance={{
              elements: {
                userButtonPopoverCard: "backdrop-blur-lg",
              },
            }}
            userProfileProps={{
              appearance: {
                elements: {
                  modalBackdrop:
                    "bg-slate-950/65 backdrop-blur-sm dark:bg-slate-950/75",
                  modalContent:
                    "bg-background text-foreground shadow-2xl backdrop-blur-none dark:bg-slate-950",
                  card: "bg-background text-foreground shadow-none dark:bg-slate-950",
                  navbar:
                    "bg-muted/70 text-foreground backdrop-blur-none dark:bg-slate-900",
                  pageScrollBox:
                    "bg-background text-foreground backdrop-blur-none dark:bg-slate-950",
                  profilePage: "bg-background dark:bg-slate-950",
                },
              },
            }}
          />
        </div>
      </GlassContainer>
    </nav>
  );
}
