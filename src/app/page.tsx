"use client";
import { useUser } from "@stackframe/stack";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  const user = useUser();

  return (
    <main className="max-w-7xl mx-auto p-6 bg-gray-900  text-white min-h-screen">
      <div>
        {user
          ? `Hello, ${user.displayName ?? "anon"}`
          : "You are not logged in"}
      </div>
      <div>
        <h1>Assignments</h1>
        <Dashboard />
      </div>
    </main>
  );
}
