"use client";
import { useUser } from "@stackframe/stack";

export default function Home() {
  const user = useUser();

  return (
    <main className="max-w-3xl mx-auto p-6 bg-red-200 text-black">
      <div>
        {user
          ? `Hello, ${user.displayName ?? "anon"}`
          : "You are not logged in"}
      </div>
      ;{" "}
    </main>
  );
}
