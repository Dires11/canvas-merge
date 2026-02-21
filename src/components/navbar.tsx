"use client";
import { UserButton, SignedIn, SignedOut } from "@neondatabase/auth/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, SunMoon } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <SignedIn>
      <nav className="mx-auto my-8 flex max-w-7xl items-center justify-between rounded-2xl border border-white/20 bg-white/40 px-4 py-3 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="text-foreground/80 flex justify-between space-x-5 text-lg font-semibold tracking-tight">
          <Link
            href="/dashboard"
            className={clsx(
              "hover:text-foreground",
              pathname === "/dashboard" && "text-foreground",
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/manage-accounts"
            className={clsx(
              "hover:text-foreground",
              pathname === "/manage-accounts" && "text-foreground",
            )}
          >
            Manage Accounts
          </Link>
        </div>
        <div className="flex items-center space-x-5">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:cursor-pointer"
          >
            {theme === "dark" ? (
              <Moon className="text-foreground/80 hover:text-foreground size-5" />
            ) : (
              <Sun className="text-foreground/80 hover:text-foreground size-5" />
            )}
          </button>
          <UserButton size="icon" />
        </div>
      </nav>
    </SignedIn>
  );
}
