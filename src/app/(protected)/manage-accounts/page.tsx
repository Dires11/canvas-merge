"use client";
import { useEffect, useState } from "react";

import { loadAccounts } from "@/lib/accounts";
import { ManageAccountForm } from "@/components/manage-account-form";
import { Modal } from "@/components/modal";

type ModalState = { open: boolean; accountId?: string; domain?: string };

export default function ManageAccountsPage() {
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
    const resp = await fetch("/api/accounts");
    const result = await resp.json();
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
    setModal({ open: true, accountId, domain });
  }

  async function submitAdd(
    data: { domain: string; token: string },
    signal: AbortSignal,
  ) {
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
    <>
      <div className="min-h-screen text-black dark:text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <main className="space-y-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Linked Accounts
              </h2>
              <button
                className="bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary-hover inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium shadow-lg transition active:scale-[0.99]"
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
              <p className="mb-4 text-sm text-red-600">{accountsError}</p>
            )}
            {!accountsLoading &&
              hasLoadedOnce &&
              accounts.length === 0 &&
              !accountsError && (
                <p className="mb-4 text-sm text-gray-600">
                  No linked Canvas accounts yet.
                </p>
              )}
            {accounts.length > 0 && (
              <div className="bg-background/50 rounded-2xl border border-white/20 p-4 shadow-sm backdrop-blur-xl dark:border-white/10">
                <ul className="space-y-4">
                  {accounts.map((account) => (
                    <li
                      key={account.id}
                      className="bg-card/30 flex items-center justify-between gap-4 rounded-2xl border border-white/30 p-5 shadow-lg backdrop-blur-sm transition hover:bg-white/50 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {account.name}
                        </h3>
                        <p className="text-sm text-gray-700/80 dark:text-gray-300/80">
                          {account.domain}
                        </p>
                        {account.expiredAt !== null && (
                          <span className="mt-2 inline-flex items-center rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white dark:text-gray-900">
                            Token expired
                          </span>
                        )}
                      </div>
                      <div className="flex items-end gap-2">
                        <button
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/40 px-3 py-1.5 text-xs font-medium text-blue-700 backdrop-blur transition-all hover:border-blue-300/70 hover:bg-blue-100/70 hover:shadow-md dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/20"
                          onClick={() => openUpdate(account.id, account.domain)}
                        >
                          Update
                        </button>

                        <button
                          className="inline-flex transform items-center gap-1.5 rounded-full border border-red-200/60 bg-red-50/40 px-3 py-1.5 text-xs font-medium text-red-700 backdrop-blur transition-all hover:border-red-300/70 hover:bg-red-100/70 hover:shadow-md disabled:pointer-events-none disabled:opacity-60 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-400/30 dark:hover:bg-red-500/20"
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
    </>
  );
}
