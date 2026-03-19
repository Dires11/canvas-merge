"use client";

import { useState } from "react";
import useSWR from "swr";

import { GlassContainer } from "@/components/glass-container";
import { ConnectAccountGuide } from "@/components/manage-accounts/connect-account-guide";
import type { AccountSafeInfo } from "@/lib/types/index";

import {
  addAccountAction,
  // deleteAccountAction,
  // updateAccountTokenAction,
} from "./actions";
import { AddSchema } from "@/lib/schemas/manage-accounts";
import { z } from "zod";
import { FormModal } from "./components/form-modal";
import { Button } from "@/components/ui/button";
import { AddAccountForm } from "./components/add-account-form";

type ModalState = { open: boolean; accountId?: string; domain?: string };

const KEY = "/api/accounts";

type AccountsResponse = {
  accounts: AccountSafeInfo[];
};

const fetcher = async (url: string): Promise<AccountsResponse> => {
  const r = await fetch(url, { credentials: "include" });
  const json = await r.json().catch(() => null);

  if (!r.ok) {
    throw new Error(json?.error || `Failed to load accounts (${r.status})`);
  }

  return json as AccountsResponse;
};

export default function ManageAccountsClient({
  initialAccounts,
}: {
  initialAccounts: AccountSafeInfo[];
}) {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>({ open: false });

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    KEY,
    fetcher,
    {
      fallbackData: { accounts: initialAccounts },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: false,
      dedupingInterval: 1_000,
      keepPreviousData: true,
    },
  );

  const accounts = data?.accounts ?? [];

  // async function handleDelete(id: string) {
  //   if (deletingIds.has(id)) return;

  //   setServerMsg(null);
  //   setDeletingIds((prev) => {
  //     const next = new Set(prev);
  //     next.add(id);
  //     return next;
  //   });

  //   const previous = data;

  //   await mutate(
  //     async (current) => {
  //       const result = await deleteAccountAction(id);

  //       if (!result.ok) {
  //         throw new Error(result.error);
  //       }

  //       setServerMsg(result.message ?? "Account deleted successfully.");

  //       return {
  //         accounts: (current?.accounts ?? []).filter((a) => a.id !== id),
  //       };
  //     },
  //     {
  //       optimisticData: (current) => ({
  //         accounts: (current?.accounts ?? []).filter((a) => a.id !== id),
  //       }),
  //       rollbackOnError: true,
  //       populateCache: true,
  //       revalidate: true,
  //     },
  //   ).catch((e: unknown) => {
  //     const message =
  //       e instanceof Error ? e.message : "Failed to delete account.";
  //     setServerMsg(message);
  //     void mutate(previous, { revalidate: false });
  //   });

  //   setDeletingIds((prev) => {
  //     const next = new Set(prev);
  //     next.delete(id);
  //     return next;
  //   });
  // }

  async function submitAdd(data: z.infer<typeof AddSchema>) {
    const result = await addAccountAction(data);

    if (!result.ok) {
      throw new Error(result.error);
    }

    setServerMsg(result.message ?? "Account added successfully.");
  }

  // async function submitUpdate(
  //   accountId: string,
  //   data: { token: string },
  //   _signal: AbortSignal,
  // ) {
  //   setServerMsg(null);

  //   const result = await updateAccountTokenAction(accountId, data);

  //   if (!result.ok) {
  //     throw new Error(result.error);
  //   }

  //   setServerMsg(result.message ?? "Account updated successfully.");
  // }

  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <main className="space-y-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Linked Accounts
            </h2>

            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                disabled={isValidating}
                onClick={() => mutate()}
              >
                Refresh
              </button>
              <FormModal
                trigger={<Button>Link New Account</Button>}
                title="Link Canvas Account"
              >
                {({ close }) => (
                  <AddAccountForm
                    onSubmit={async (values) => {
                      await submitAdd(values);
                      close();
                      await mutate();
                    }}
                  />
                )}
              </FormModal>
            </div>
          </div>

          {serverMsg && (
            <div className="rounded-2xl border border-white/20 bg-white/30 px-4 py-3 text-sm shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              {serverMsg}
            </div>
          )}

          {/* {modal.open && (
            <Modal onClose={() => setModal({ open: false })}>
              <ManageAccountForm
                accountId={modal.accountId}
                initialDomain={modal.domain}
                onSubmit={(formData, signal) => {
                  if (modal.accountId) {
                    return submitUpdate(
                      modal.accountId,
                      { token: formData.token },
                      signal,
                    );
                  }

                  return submitAdd(
                    { domain: formData.domain!, token: formData.token },
                    signal,
                  );
                }}
                onSuccess={async () => {
                  setModal({ open: false });
                  await mutate();
                }}
              />
            </Modal>
          )} */}

          {error && (
            <p className="mb-4 text-sm text-red-600">{error.message}</p>
          )}

          {!isLoading && !error && accounts.length === 0 && (
            <ConnectAccountGuide />
          )}

          {accounts.length > 0 && (
            <GlassContainer>
              <ul className="space-y-4">
                {accounts.map((account) => (
                  <li
                    key={account.id}
                    className="glass-border bg-glass/5 hover:bg-glass/10 flex items-center justify-between gap-4 rounded-2xl p-5 shadow-sm transition-colors hover:shadow-md"
                  >
                    <div>
                      <h3 className="text-foreground/90 font-semibold">
                        {account.name}
                      </h3>
                      <p className="text-foreground/60 text-sm">
                        {account.canvasDomain.baseUrl}
                      </p>

                      {account.expiredAt !== null && (
                        <span className="text-foreground/90 mt-2 inline-flex items-center rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium">
                          Token expired
                        </span>
                      )}
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/40 px-3 py-1.5 text-xs font-medium text-blue-700 backdrop-blur transition-all hover:border-blue-300/70 hover:bg-blue-100/70 hover:shadow-md dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/20"
                        // onClick={() => openUpdate(account.id, account.canvasDomain.baseUrl)}
                      >
                        Update
                      </button>

                      <button
                        className="inline-flex transform items-center gap-1.5 rounded-full border border-red-200/60 bg-red-50/40 px-3 py-1.5 text-xs font-medium text-red-700 backdrop-blur transition-all hover:border-red-300/70 hover:bg-red-100/70 hover:shadow-md disabled:pointer-events-none disabled:opacity-60 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-400/30 dark:hover:bg-red-500/20"
                        // onClick={() => handleDelete(account.id)}
                        disabled={deletingIds.has(account.id)}
                      >
                        {deletingIds.has(account.id) ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassContainer>
          )}
        </main>
      </div>
    </div>
  );
}
