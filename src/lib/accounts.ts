export async function loadAccounts() {
  try {
    const res = await fetch("/api/accounts", { cache: "no-store" });
    const json = await res.json();

    if (!res.ok) {
      console.error("Failed to load accounts:", json);
      return { ok: false, error: json.error };
    }
    return { ok: true, accounts: json.accounts };
  } catch {
    return { ok: false, error: "Network error loading accounts." };
  }
}
