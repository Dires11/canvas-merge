import { stackServerApp } from "@/stack/server";
import { Dashboard } from "@/components/dashboard";
import type { MergedItems } from "@/lib/types";
import { getWeeklyAssignments } from "./api/planner/weekly-assignments/route";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  return (
    <div className="bg-white">
      <main className="p-6 text-black min-h-screen max-w-7xl mx-auto">
        <Dashboard userId={user.id} />
      </main>
    </div>
  );
}
