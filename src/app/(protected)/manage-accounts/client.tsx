"use client";

import { useState, useOptimistic, startTransition, useEffect } from "react";

import { GlassContainer } from "@/components/glass-container";
import { ConnectAccountGuide } from "@/components/manage-accounts/connect-account-guide";
import type { AccountSafeInfo, CanvasDomainInfo } from "@/lib/types/index";

import {
  addAccountAction,
  deleteAccountAction,
  updateAccountTokenAction,
} from "./actions";
import { AddSchema, UpdateTokenSchema } from "@/lib/schemas/manage-accounts";
import { z } from "zod";
import { FormModal } from "./components/form-modal";
import { Button } from "@/components/ui/button";
import { AddAccountForm } from "./components/add-account-form";
import { UpdateAccountForm } from "./components/update-account-form";

export default function ManageAccountsClient({
  accounts,
  domains,
}: {
  accounts: AccountSafeInfo[];
  domains: CanvasDomainInfo[];
}) {
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [optimisticAccounts, setOptimisticAccounts] = useOptimistic(accounts);

  useEffect(() => {
    if (!serverMsg) return;
    const id = setTimeout(() => setServerMsg(null), 4000);
    return () => clearTimeout(id);
  }, [serverMsg]);

  async function submitAdd(data: z.infer<typeof AddSchema>) {
    const result = await addAccountAction(data);
    if (!result.ok) {
      throw new Error(result.error);
    }
    setServerMsg(result.message ?? "Account added successfully.");
  }

  async function submitUpdate(
    accountId: string,
    data: z.infer<typeof UpdateTokenSchema>,
  ) {
    const result = await updateAccountTokenAction(accountId, data);
    if (!result.ok) {
      throw new Error(result.error);
    }
    setServerMsg(result.message ?? "Token updated successfully.");
  }

  async function handleDelete(accountId: string) {
    setDeletingId(accountId);
    startTransition(async () => {
      setOptimisticAccounts((prev) => prev.filter((a) => a.id !== accountId));
      const result = await deleteAccountAction(accountId);
      setDeletingId(null);
      if (!result.ok) {
        setServerMsg(result.error);
        return;
      }
      setServerMsg("Account deleted successfully.");
    });
  }

  return (
    <div className="min-h-screen text-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <main className="space-y-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Linked Accounts
            </h2>

            {optimisticAccounts.length > 0 && (
              <FormModal
                trigger={<Button>Link New Account</Button>}
                title="Link Canvas Account"
              >
                {({ close }) => (
                  <AddAccountForm
                    onSubmit={async (values) => {
                      await submitAdd(values);
                      close();
                    }}
                    domains={domains}
                  />
                )}
              </FormModal>
            )}
          </div>

          {serverMsg && (
            <div className="rounded-2xl border border-white/20 bg-white/30 px-4 py-3 text-sm shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              {serverMsg}
            </div>
          )}

          {optimisticAccounts.length === 0 && (
            <ConnectAccountGuide onSubmit={submitAdd} />
          )}

          {optimisticAccounts.length > 0 && (
            <GlassContainer>
              <ul className="space-y-4">
                {optimisticAccounts.map((account) => (
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
                      <FormModal
                        trigger={
                          <button className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/40 px-3 py-1.5 text-xs font-medium text-blue-700 backdrop-blur transition-all hover:border-blue-300/70 hover:bg-blue-100/70 hover:shadow-md dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:border-blue-400/30 dark:hover:bg-blue-500/20">
                            Update
                          </button>
                        }
                        title="Update Account Token"
                      >
                        {({ close }) => (
                          <UpdateAccountForm
                            onSubmit={async (values) => {
                              await submitUpdate(account.id, values);
                              close();
                            }}
                          />
                        )}
                      </FormModal>

                      <button
                        className="inline-flex transform items-center gap-1.5 rounded-full border border-red-200/60 bg-red-50/40 px-3 py-1.5 text-xs font-medium text-red-700 backdrop-blur transition-all hover:border-red-300/70 hover:bg-red-100/70 hover:shadow-md disabled:pointer-events-none disabled:opacity-60 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-400/30 dark:hover:bg-red-500/20"
                        disabled={deletingId === account.id}
                        onClick={() => handleDelete(account.id)}
                      >
                        Delete
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
