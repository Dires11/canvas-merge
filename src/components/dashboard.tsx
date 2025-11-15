"use client";
import { useEffect, useState, useTransition } from "react";
export function Dashboard() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [plannerData, setPlannerData] = useState<any>(null);

  async function loadPlanner(params: { merge: boolean }) {
    const res = await fetch(
      `/api/planner/weekly-assignments?merge=${params.merge}`
    );
    if (!res.ok) {
      if (res.status === 404) {
        setServerMessage("No accounts found");
        return null;
      }
      if (res.status === 400) {
        setServerMessage("Failed to fetch planner data");
        return null;
      }
    }
    return res.json();
  }

  useEffect(() => {
    startTransition(async () => {
      const fetched = await loadPlanner({ merge: true });
      setPlannerData(fetched);
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {isPending && <p>Loading planner data...</p>}
      {plannerData && (
        <div>
          <h2>Merged Planner Data</h2>
          <pre>{JSON.stringify(plannerData, null, 2)}</pre>
        </div>
      )}
      {serverMessage && <p>{serverMessage}</p>}
    </div>
  );
}
