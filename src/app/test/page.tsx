// app/page.tsx
"use client";
import { useState } from "react";
import type { Account, ItemsByType } from "@/lib/types";

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      domain: "https://ilearn.laccd.edu",
      token:
        "5785~HPGV8hBfDZNnk2kXD7JmExezfXvh2mwuFF3exRa3PWUnKK4487mUyyF4zr2tVM3T",
    },
  ]);
  const [items, setItems] = useState<ItemsByType | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const addRow = () => setAccounts((a) => [...a, { domain: "", token: "" }]);
  const update = (i: number, key: keyof Account, val: string) =>
    setAccounts((a) =>
      a.map((r, idx) => (idx === i ? { ...r, [key]: val } : r))
    );

  const fetchWeekly = async () => {
    setLoading(true);
    const res = await fetch("/api/canvas/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accounts }),
    });
    const data = await res.json();
    setItems(
      data.itemsByType ?? { assignments: [], announcements: [], other: [] }
    );
    setLoading(false);
  };

  const fetchProfile = async () => {
    setLoading(true);
    const res = await fetch("/api/canvas/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(accounts[0]),
    });
    const data = await res.json();
    setProfile(data);
    setLoading(false);
    return data;
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Canvas Weekly To-Do (PAT)</h1>
      <div className="space-y-4">
        {accounts.map((acc, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 border rounded-xl p-4">
            <input
              className="border rounded px-3 py-2"
              placeholder="https://school.instructure.com"
              value={acc.domain}
              onChange={(e) => update(i, "domain", e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Personal Access Token"
              type="password"
              value={acc.token}
              onChange={(e) => update(i, "token", e.target.value)}
            />
          </div>
        ))}
        <button onClick={addRow} className="border rounded px-3 py-2">
          + Add another account
        </button>
      </div>
      <button
        onClick={fetchWeekly}
        disabled={loading}
        className="bg-black text-white rounded px-4 py-2"
      >
        {loading ? "Loading..." : "Load this week"}
      </button>
      <button
        onClick={fetchProfile}
        disabled={loading}
        className="bg-black text-white rounded px-4 py-2"
      >
        {loading ? "Loading..." : "Load profile"}
      </button>
      {profile && (
        <section className="space-y-4">
          <h1>Profile</h1>
          <div className="border rounded-xl p-4">
            <div className="font-medium">{profile.name}</div>
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full mt-2"
              />
            )}
          </div>
        </section>
      )}
      {items?.assignments && (
        <section className="space-y-4">
          <h1>Assignments</h1>
          {items.assignments.map(
            (it) =>
              !it.submissions.submitted && (
                <div key={it.id} className="border rounded-xl p-4">
                  <div className="font-medium">
                    {it.html_url ? (
                      <a href={it.html_url} target="_blank">
                        {it.title}
                      </a>
                    ) : (
                      it.title
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {it.type} ·{" "}
                    {it.points_possible !== null
                      ? `${it.points_possible} pts · `
                      : ""}
                    {it.course || it.domain.replace(/^https?:\/\//, "")}
                  </div>
                  <div className="text-sm">
                    {it.due_at
                      ? new Date(it.due_at).toLocaleString()
                      : "No due date"}
                  </div>
                </div>
              )
          )}
        </section>
      )}
    </main>
  );
}
