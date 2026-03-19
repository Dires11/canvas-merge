export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/server/auth-server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}
