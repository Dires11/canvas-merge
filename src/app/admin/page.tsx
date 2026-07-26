import { MousePointerClick } from "lucide-react";
import { GlassContainer } from "@/components/glass-container";
import { getAdminDirectoryUsers, requireAdminPage } from "@/lib/admin";
import { AdminShell } from "./components/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminPage();
  const users = await getAdminDirectoryUsers();

  return (
    <AdminShell users={users}>
      <GlassContainer className="flex min-h-72 flex-col items-center justify-center text-center">
        <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-full">
          <MousePointerClick className="size-6" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Select a user</h2>
        <p className="text-muted-foreground mt-1 max-w-md text-sm">
          Choose an account from the user list to load their incomplete
          assignments for the current planner window.
        </p>
      </GlassContainer>
    </AdminShell>
  );
}
