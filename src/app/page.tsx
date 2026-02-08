import { Dashboard } from "@/components/dashboard";
import { requireUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireUser();

  return (
    <main className="p-6 text-black min-h-screen max-w-7xl mx-auto">
      <Dashboard />
    </main>
  );
}
