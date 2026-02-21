import { auth } from "@/lib/auth/server";
import { AuthView } from "@neondatabase/auth/react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  const { data: session } = await auth.getSession();
  console.log("Inside /auth pathname- ", path, "SESSION", session);
  if (session && path != "sign-out") {
    redirect("/");
  }

  return (
    <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
