"use client";
import { UserButton, SignedIn, SignedOut } from "@neondatabase/auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <SignedIn>
      <nav className="my-8 max-w-7xl mx-auto flex items-center justify-between rounded-2xl border border-white/20 bg-white/40 dark:bg-white/5 shadow-lg backdrop-blur-xl dark:border-white/10 px-4 py-3">
        <div className="flex justify-between space-x-5 text-lg font-semibold tracking-tight text-foreground/80 transition-all duration-300">
          <Link href="/" className="hover:text-foreground transition">
            Home
          </Link>
          <Link
            href="/manage-accounts"
            className="hover:text-foreground transition"
          >
            Manage Accounts
          </Link>
        </div>
        <UserButton size="icon" />
      </nav>
    </SignedIn>
  );
}
