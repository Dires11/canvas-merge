export type PlannerOverrideResult = {
  overrideId: number;
  markedComplete: boolean;
};

type OverrideResponse = {
  ok: boolean;
  data?: PlannerOverrideResult;
  error?: string;
};

export async function updatePlannerOverride(body: Record<string, unknown>) {
  const response = await fetch("/api/planner/override", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json = (await response
    .json()
    .catch(() => null)) as OverrideResponse | null;

  if (!response.ok || !json?.ok || !json.data) {
    throw new Error(json?.error ?? "Failed to update assignment status.");
  }

  return json.data;
}
