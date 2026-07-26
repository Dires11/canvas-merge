"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Users } from "lucide-react";
import type { AdminDirectoryUser } from "@/lib/admin";
import { GlassContainer } from "@/components/glass-container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserSelector({
  users,
  selectedUserId,
}: {
  users: AdminDirectoryUser[];
  selectedUserId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized),
    );
  }, [query, users]);

  return (
    <GlassContainer className="flex max-h-[min(24rem,50vh)] min-h-0 flex-col lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-5" />
          <h2 className="font-semibold tracking-tight">Users</h2>
        </div>
        <span className="text-muted-foreground text-xs">
          {users.length} total
        </span>
      </div>

      <div className="relative mb-3">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          aria-label="Search users"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name or email"
          className="bg-background/35 pl-9"
        />
      </div>

      <div
        role="listbox"
        aria-label="Registered users"
        className="scrollbar-hide flex min-h-0 flex-col gap-1 overflow-y-auto"
      >
        {filteredUsers.map((user) => {
          const selected = user.id === selectedUserId;

          return (
            <button
              key={user.id}
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition",
                selected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-background/35 dark:hover:bg-glass/10",
              )}
              onClick={() => {
                router.push(`/admin/users/${encodeURIComponent(user.id)}`);
              }}
            >
              <Avatar className="ring-foreground/10 ring-1">
                <AvatarImage src={user.imageUrl} alt="" />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">
                    {user.name}
                  </span>
                  {user.isAdmin && (
                    <ShieldCheck
                      aria-label="Admin"
                      className="size-3.5 shrink-0"
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "block truncate text-xs",
                    selected
                      ? "text-primary-foreground/75"
                      : "text-muted-foreground",
                  )}
                >
                  {user.email}
                </span>
              </span>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <p className="text-muted-foreground px-2 py-8 text-center text-sm">
            No users match your search.
          </p>
        )}
      </div>
    </GlassContainer>
  );
}
