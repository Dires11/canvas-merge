import { AuthView } from "@neondatabase/auth/react";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export const dynamicParams = false;

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const { data: session } = await auth.getSession();

  if (session && path != "sign-out") {
    redirect("/");
  }

  return (
    <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
