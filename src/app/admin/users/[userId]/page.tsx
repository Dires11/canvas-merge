import { notFound } from "next/navigation";
import { Link2Off, TriangleAlert } from "lucide-react";
import { AdminShell } from "@/app/admin/components/admin-shell";
import { AssignmentDashboardClient } from "@/app/dashboard/components/assignment-dashboard-client";
import { GlassContainer } from "@/components/glass-container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserCanvasAccounts } from "@/lib/data/canvas-account";
import { getUserDomains } from "@/lib/data/canvas-domain";
import { getAdminDirectoryUsers, requireAdminPage } from "@/lib/admin";
import { getUserCourses } from "@/lib/services/planner/get-user-courses";
import { getUserPlanner } from "@/lib/services/planner/get-user-planner";
import type { CanvasDomainInfo, UserCourse, UserPlanner } from "@/lib/types";

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function AdminUserTodosPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdminPage();

  const { userId } = await params;
  const users = await getAdminDirectoryUsers();
  const selectedUser = users.find((user) => user.id === userId);

  if (!selectedUser) {
    notFound();
  }

  const accounts = await getUserCanvasAccounts(userId);

  if (accounts.length === 0) {
    return (
      <AdminShell users={users} selectedUserId={userId}>
        <SelectedUserHeader
          name={selectedUser.name}
          email={selectedUser.email}
          imageUrl={selectedUser.imageUrl}
          accountCount={0}
        />
        <GlassContainer className="flex min-h-60 flex-col items-center justify-center text-center">
          <div className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
            <Link2Off className="size-6" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            No Canvas accounts connected
          </h2>
          <p className="text-muted-foreground mt-1 max-w-md text-sm">
            This user is registered, but they have not connected a Canvas
            account yet.
          </p>
        </GlassContainer>
      </AdminShell>
    );
  }

  const [coursesResult, plannerResult, domainsResult] =
    await Promise.allSettled([
      getUserCourses(userId),
      getUserPlanner(userId, true, "incomplete_items"),
      getUserDomains(userId),
    ]);

  const courses: UserCourse[] =
    coursesResult.status === "fulfilled"
      ? (coursesResult.value.courses ?? [])
      : [];
  const plannerData: UserPlanner | null =
    plannerResult.status === "fulfilled" ? plannerResult.value : null;
  const domainsData: CanvasDomainInfo[] =
    domainsResult.status === "fulfilled" ? domainsResult.value : [];

  return (
    <AdminShell users={users} selectedUserId={userId}>
      <SelectedUserHeader
        name={selectedUser.name}
        email={selectedUser.email}
        imageUrl={selectedUser.imageUrl}
        accountCount={accounts.length}
      />

      {plannerResult.status === "rejected" ? (
        <GlassContainer className="border-destructive/30 bg-destructive/10">
          <div className="text-destructive flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold tracking-tight">
                Could not load this user&apos;s todos
              </h2>
              <p className="mt-1 text-sm">
                Canvas did not return planner data for the connected accounts.
                Reload the page to try again.
              </p>
            </div>
          </div>
        </GlassContainer>
      ) : (
        <AssignmentDashboardClient
          initialData={plannerData}
          courses={courses}
          domains={domainsData}
          dataEndpoint={`/api/admin/users/${encodeURIComponent(userId)}/planner`}
          readOnly
        />
      )}
    </AdminShell>
  );
}

function SelectedUserHeader({
  name,
  email,
  imageUrl,
  accountCount,
}: {
  name: string;
  email: string;
  imageUrl: string;
  accountCount: number;
}) {
  return (
    <GlassContainer className="mb-4 flex items-center gap-3">
      <Avatar size="lg" className="ring-foreground/10 ring-1">
        <AvatarImage src={imageUrl} alt="" />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold tracking-tight">{name}</h2>
        <p className="text-muted-foreground truncate text-sm">{email}</p>
      </div>
      <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2.5 py-1 text-xs font-medium">
        {accountCount} {accountCount === 1 ? "account" : "accounts"}
      </span>
    </GlassContainer>
  );
}
