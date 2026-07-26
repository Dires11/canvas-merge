import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import type { AdminDirectoryUser } from "@/lib/admin";
import { UserSelector } from "./user-selector";

export function AdminShell({
  users,
  selectedUserId,
  children,
}: {
  users: AdminDirectoryUser[];
  selectedUserId?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <header className="mb-5">
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck className="text-primary size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin User Todos
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Select a registered user to inspect their current Canvas assignments.
          This view is read-only.
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <UserSelector users={users} selectedUserId={selectedUserId} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
