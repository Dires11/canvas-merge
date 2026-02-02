// src/app/(protected)/layout.tsx
export const dynamic = "force-dynamic";

import { requireUser } from "@/lib/auth-server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return <>{children}</>;
}
