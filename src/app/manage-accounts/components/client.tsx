"use client";

import {
  useState,
  useOptimistic,
  startTransition,
  useEffect,
  useMemo,
} from "react";

import { GlassContainer } from "@/components/glass-container";
import { ConnectAccountGuide } from "@/components/manage-accounts/connect-account-guide";
import type { AccountSafeInfo, CanvasDomainInfo } from "@/lib/types/index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  addAccountAction,
  deleteAccountAction,
  updateAccountTokenAction,
} from "../actions";
import { AddSchema, UpdateTokenSchema } from "@/lib/schemas/manage-accounts";
import { z } from "zod";
import { FormModal } from "./form-modal";
import { Button } from "@/components/ui/button";
import { AddAccountForm } from "./add-account-form";
import { UpdateAccountForm } from "./update-account-form";
import { CircleUser, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "CM";
}

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return optimisticAccounts;

    return optimisticAccounts.filter((account) =>
      [
        account.name,
        account.canvasDomain.name,
        account.canvasDomain.baseUrl,
        account.canvasDomain.slug,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [optimisticAccounts, searchQuery]);

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
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <main className="space-y-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-lg">
              Linked Accounts
            </h2>

            {optimisticAccounts.length > 0 && (
              <FormModal
                trigger={
                  <Button className="w-full text-sm sm:w-auto">
                    Link New Account
                  </Button>
                }
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
            <GlassContainer className="space-y-4 p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-foreground/90 text-sm font-medium">
                    {optimisticAccounts.length} linked{" "}
                    {optimisticAccounts.length === 1 ? "account" : "accounts"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Search by account, school, or Canvas URL.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-sm">
                  <Search
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    strokeWidth={1.8}
                  />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search accounts"
                    className="h-10 py-2 pr-3 pl-9"
                    aria-label="Search linked accounts"
                  />
                </div>
              </div>

              <ul className="space-y-4">
                {filteredAccounts.map((account) => (
                  <li
                    key={account.id}
                    className="glass-border bg-glass/5 hover:bg-glass/10 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 rounded-2xl p-3 shadow-sm transition-colors hover:shadow-md sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-5"
                  >
                    <Avatar
                      size="lg"
                      className="size-10 border border-white/20 bg-white/10 dark:border-white/10 sm:size-12"
                    >
                      <AvatarImage
                        src={account.avatarUrl}
                        alt={`${account.name}'s profile picture`}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {account.name ? (
                          getInitials(account.name)
                        ) : (
                          <CircleUser
                            className="text-foreground size-5"
                            strokeWidth={1.5}
                          />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 leading-tight">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-foreground/90 truncate text-base font-semibold sm:text-lg">
                          {account.name}
                        </h3>

                        {account.expiredAt !== null && (
                          <span className="text-foreground/90 inline-flex items-center rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium">
                            Token expired
                          </span>
                        )}
                      </div>

                      <p className="text-muted-foreground mt-1 text-sm">
                        {account.canvasDomain.name}
                      </p>
                      <p className="text-foreground/60 truncate text-xs sm:text-sm">
                        {account.canvasDomain.baseUrl}
                      </p>
                    </div>

                    <div className="col-start-2 flex shrink-0 items-center justify-start gap-2 sm:col-start-auto sm:justify-end">
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

              {filteredAccounts.length === 0 && (
                <div className="glass-border bg-glass/5 rounded-2xl px-4 py-8 text-center">
                  <p className="text-foreground/90 text-sm font-medium">
                    No linked accounts match your search.
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Try searching by a name, school, or Canvas URL.
                  </p>
                </div>
              )}
            </GlassContainer>
          )}
        </main>
      </div>
    </div>
  );
}
