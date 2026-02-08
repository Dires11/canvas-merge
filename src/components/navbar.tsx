"use client";
import { UserButton, SignedIn, SignedOut } from "@neondatabase/auth/react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <SignedIn>
      <nav className="my-8 max-w-7xl mx-auto flex items-center justify-between rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 shadow-lg backdrop-blur-xl dark:border-white/10 px-4 py-3">
        <div className="flex justify-between space-x-5 text-lg font-semibold tracking-tight text-foreground/80">
          <Link
            href="/"
            className={clsx(
              "hover:text-foreground",
              pathname === "/" && "text-foreground",
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
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          Change Theme
        </button>
        <UserButton size="icon" />
      </nav>
    </SignedIn>
  );
}
