"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, SunMoon } from "lucide-react";
import { GlassContainer } from "./glass-container";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="mx-auto my-8 max-w-7xl">
      <GlassContainer className="flex items-center justify-between py-3">
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
            {!mounted ? (
              <SunMoon className="text-foreground/80 hover:text-foreground size-5" />
            ) : theme === "dark" ? (
              <Moon className="text-foreground/80 hover:text-foreground size-5" />
            ) : (
              <Sun className="text-foreground/80 hover:text-foreground size-5" />
            )}
          </button>
          <UserButton
            appearance={{
              elements: {
                userButtonPopoverCard: "backdrop-blur-lg",
              },
            }}
          />
        </div>
      </GlassContainer>
    </nav>
  );
}
