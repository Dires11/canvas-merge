"use client";
import { useUser, UserButton } from "@stackframe/stack";
import { useEffect, useState } from "react";

import { loadAccounts } from "@/lib/accounts";
import { ManageAccountForm } from "@/components/manage-account-form";
import { Modal } from "@/components/modal";

type ModalState = { open: boolean; accountId?: string; domain?: string };

export default function ManageAccountsPage() {
  const user = useUser({ or: "redirect" });
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<any>>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [accountsLoading, setAccountsLoading] = useState<boolean>(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const [modal, setModal] = useState<ModalState>({ open: false });

  // const [manageAccountFormOpen, setManageAccountFormOpen] = useState(false);
  // const [domainUpdate, setDomainUpdate] = useState(null);

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
      const r = await fetch(`/api/accounts/${id}`, {
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
          : (e?.message ?? "Network error. Please try again."),
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

  function openAdd() {
    setModal({ open: true });
  }

  function openUpdate(accountId: string, domain: string) {
    console.log("openUpdate:", accountId, domain);
    setModal({ open: true, accountId, domain });
  }

  async function submitAdd(
    data: { domain: string; token: string },
    signal: AbortSignal,
  ) {
    console.log("submitting for accountId:", modal.accountId);
    const r = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal,
    });

    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(json.error ?? "Failed to add account");
    }
  }

  async function submitUpdate(
    accountId: string,
    data: { token: string },
    signal: AbortSignal,
  ) {
    console.log("submitting for accountId:", modal.accountId);
    const r = await fetch(`/api/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.token }),
      signal,
    });

    const json = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(json.error ?? "Failed to update token");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen text-black dark:text-white">
      {/* background */}
      {/* <div className="fixed inset-0 -z-10 bg-linear-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
      <div className="fixed inset-0 -z-10 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.30),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.18),transparent_45%)]" /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="mb-8 flex items-center justify-between rounded-2xl border border-white/20 bg-background/50 px-5 py-3 shadow-lg backdrop-blur-xl dark:border-white/10">
          <h1 className="text-xl font-semibold tracking-tight">
            Hi {user.displayName}!
          </h1>
          <UserButton />
        </nav>
        <main className="space-y-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold tracking-tight">
              Linked Accounts
            </h2>
            <button
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:bg-primary-hover transition active:scale-[0.99]"
              onClick={() => openAdd()}
            >
              Add Account
            </button>
          </div>
          {serverMsg && (
            <div className="rounded-2xl border border-white/20 bg-white/30 px-4 py-3 text-sm shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              {serverMsg}
            </div>
          )}
          {modal.open && (
            <Modal onClose={() => setModal({ open: false })}>
              <ManageAccountForm
                accountId={modal.accountId}
                initialDomain={modal.domain}
                onSubmit={(data, signal) => {
                  if (modal.accountId) {
                    return submitUpdate(
                      modal.accountId,
                      { token: data.token },
                      signal,
                    );
                  }
                  return submitAdd(
                    { domain: data.domain!, token: data.token },
                    signal,
                  );
                }}
                onSuccess={() => {
                  setModal({ open: false });
                  load();
                }}
              />
            </Modal>
          )}
          {accountsLoading && !hasLoadedOnce && <p>Loading accounts…</p>}
          {accountsError && (
            <p className="text-sm text-red-600 mb-4">{accountsError}</p>
          )}
          {!accountsLoading &&
            hasLoadedOnce &&
            accounts.length === 0 &&
            !accountsError && (
              <p className="text-sm text-gray-600 mb-4">
                No linked Canvas accounts yet.
              </p>
            )}
          {accounts.length > 0 && (
            <div className="rounded-2xl border border-white/20 bg-background/50 p-4 shadow-sm backdrop-blur-xl dark:border-white/10">
              <ul className="space-y-4">
                {accounts.map((account) => (
                  <li
                    key={account.id}
                    className="
                    rounded-2xl p-5
                    border border-white/30 dark:border-white/10
                    bg-card/30 dark:bg-white/5
                    shadow-lg backdrop-blur-sm
                    flex items-center justify-between gap-4
                    transition
                    hover:bg-white/50 hover:shadow-xl
                    dark:hover:bg-white/10
                  "
                  >
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-700/80 dark:text-gray-300/80">
                        {account.domain}
                      </p>
                      {account.expired && (
                        <span className="mt-2 inline-flex items-center rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white dark:text-gray-900">
                          Token expired
                        </span>
                      )}
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        className="
                         inline-flex items-center gap-1.5
                         rounded-full px-3 py-1.5 text-xs font-medium
                         text-blue-700 dark:text-blue-300
                         border border-blue-200/60 dark:border-blue-500/20
                         bg-blue-50/40 dark:bg-blue-500/10
                         backdrop-blur transition-all
                         hover:bg-blue-100/70 hover:border-blue-300/70 hover:shadow-md
                         dark:hover:bg-blue-500/20 dark:hover:border-blue-400/30
                       "
                        onClick={() => openUpdate(account.id, account.domain)}
                      >
                        Update
                      </button>

                      <button
                        className="
                          inline-flex items-center gap-1.5
                          rounded-full px-3 py-1.5 text-xs font-medium
                          text-red-700 dark:text-red-300
                          border border-red-200/60 dark:border-red-500/20
                          bg-red-50/40 dark:bg-red-500/10
                          backdrop-blur transition-all transform
                          hover:bg-red-100/70 hover:border-red-300/70 hover:shadow-md 
                          dark:hover:bg-red-500/20 dark:hover:border-red-400/30
                          disabled:opacity-60 disabled:pointer-events-none
                          "
                        onClick={() => handleDelete(account.id)}
                        disabled={deletingIds.has(account.id)}
                      >
                        {deletingIds.has(account.id) ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
