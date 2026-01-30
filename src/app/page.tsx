import { Dashboard } from "@/components/dashboard";
import { requireUser } from "@/lib/auth-server";

export default async function Home() {
  const user = await requireUser();

  return (
    <main className="p-6 text-black min-h-screen max-w-7xl mx-auto">
      <Dashboard userId={user.id} />
    </main>
  );
}
