"use client";
import { useUser, UserButton } from "@stackframe/stack";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loadAccounts } from "@/lib/accounts";

const FormSchema = z.object({
  domain: z.url({ message: "Please enter a valid URL for the institution" }),
  token: z.string().min(10, "Personal access token is required"),
});
type FormValues = z.infer<typeof FormSchema>;

export default function ManageAccountsPage() {
  const user = useUser({ or: "redirect" });
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<any>>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [accountsLoading, setAccountsLoading] = useState<boolean>(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  async function load() {
    setAccountsLoading(true);
    const result = await loadAccounts();
    if (!result.ok) {
      setAccountsError(result.error);
    } else {
      setAccounts(result.accounts);
      setAccountsError(null);
    }
    setHasLoadedOnce(true);

    setAccountsLoading(false);
  }

  async function handleDelete(id: string) {
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // 2) optimistic UI update: remove immediately
    const prevAccounts = accounts;
    setAccounts((prev) => prev.filter((a) => a.id !== id));

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15_000);
    try {
      const r = await fetch(`/api/accounts?id=${id}`, {
        method: "DELETE",
        signal: ac.signal,
      });
      if (!r.ok) {
        let json = await r.json();
        console.error("Delete failed:", json.error);

        // 3) rollback UI on error
        setAccounts(prevAccounts);
        setServerMsg(json.error ?? "Failed to delete account.");
        return;
      }
      setServerMsg("Account deleted successfully.");
    } catch (e: any) {
      setServerMsg(
        e?.name === "AbortError"
          ? "Request timed out. Please try again."
          : e?.message ?? "Network error. Please try again."
      );
    } finally {
      clearTimeout(t);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function onSubmit(data: FormValues) {
    setServerMsg(null);

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15_000);

    try {
      const r = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: ac.signal,
      });

      let json = await r.json();

      if (!r.ok) {
        setError("root", { type: "server", message: json.error });
        return;
      }

      setServerMsg(`Linked ${json.name}'s account successfully.`);
      await load();
      reset((prev) => ({ ...prev, token: "" }));
    } catch (e: any) {
      setError("root", {
        type: "server",
        message:
          e?.name === "AbortError"
            ? "Request timed out. Please try again."
            : e?.message ?? "Network error. Please try again.",
      });
    } finally {
      clearTimeout(t);
    }
  }

  useEffect(() => {
    load();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 max-w-7xl mx-auto text-black dark:bg-gray-900 dark:text-white">
      <nav className="flex justify-between items-baseline mb-8 bg-gray-800 px-5 py-2">
        <h1 className="text-2xl font-bold mb-4">Hi {user.displayName}!</h1>
        <UserButton />
      </nav>
      <main className="px-5">
        <h2>Linked Accounts</h2>
        {accountsLoading && !hasLoadedOnce && <p>Loading accounts…</p>}
        {accountsError && (
          <p className="text-sm text-red-600 mb-4">{accountsError}</p>
        )}
        {/* {accountsLoading && hasLoadedOnce && (
          <p className="text-xs text-gray-500 mb-2">Refreshing accounts…</p>
        )} */}
        {!accountsLoading &&
          hasLoadedOnce &&
          accounts.length === 0 &&
          !accountsError && (
            <p className="text-sm text-gray-600 mb-4">
              No linked Canvas accounts yet.
            </p>
          )}
        {accounts.length > 0 && (
          <ul className="mb-8 space-y-4">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="border rounded-2xl p-4 bg-white dark:bg-gray-800 flex justify-between items-baseline"
              >
                <div>
                  <h3 className="text-lg font-medium">{account.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {account.domain}
                  </p>
                  {account.expired && (
                    <p className="text-sm text-red-600 mt-1">Token expired</p>
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <button className="bg-orange-600 text-white px-3 py-1 rounded-2xl mt-4 hover:bg-red-700 text-sm hover:cursor-pointer">
                    Update
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded-2xl mt-4 hover:bg-red-700 text-sm hover:cursor-pointer"
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingIds.has(account.id)}
                  >
                    {deletingIds.has(account.id) ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl p-4 border"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Institution URL
            </label>
            <input
              type="url"
              placeholder="e.g. canvas.mycollege.edu"
              className="w-full rounded-xl border px-3 py-2"
              {...register("domain")}
            />
            {errors.domain && (
              <p className="text-sm text-red-600 mt-1">
                {errors.domain.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Canvas Personal Access Token
            </label>
            <input
              type="password"
              placeholder="Paste your PAT"
              className="w-full rounded-xl border px-3 py-2"
              autoComplete="new-password"
              {...register("token")}
            />
            {errors.token && (
              <p className="text-sm text-red-600 mt-1">
                {errors.token.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              We never store your token in plain text. It's encrypted at rest
              and validated once before saving.
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl px-4 py-2 border shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? "Linking…" : "Link Canvas Account"}
          </button>
          {errors.root && (
            <p className="text-sm text-red-600 mt-2" aria-live="polite">
              {errors.root.message}
            </p>
          )}
          {serverMsg && (
            <p className="text-sm mt-2 text-green-600" aria-live="polite">
              {serverMsg}
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
