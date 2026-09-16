import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export function AccountAttentionCard({
  accounts,
  readOnly = false,
}: {
  accounts: { id: string; name: string; expiredAt?: Date | string | null }[];
  readOnly?: boolean;
}) {
  if (!accounts.length) return null;

  return (
    <div
      role="alert"
      data-glass-pointer=""
      className="bg-destructive/20 text-destructive relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 px-4 py-2 shadow-lg hover:shadow-xl"
    >
      <div>
        <div className="flex items-center gap-1.5 font-bold">
          <TriangleAlert className="h-5 w-5" />
          <span>Accounts needing attention</span>
        </div>
        <ul>
          {accounts.map((account) => {
            const expiredLabel = account.expiredAt
              ? new Date(account.expiredAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;
            return (
              <li key={account.id}>
                {account.name}
                {expiredLabel ? ` - expired ${expiredLabel}` : ""}
              </li>
            );
          })}
        </ul>
      </div>
      {readOnly ? (
        <span className="max-w-48 text-right text-sm">
          The user needs to reconnect these accounts.
        </span>
      ) : (
        <Link
          className="glass-control bg-destructive/70 text-destructive-foreground hover:bg-destructive/80 shrink-0 rounded-xl border border-white/10 px-4 py-2 font-semibold tracking-tight shadow-md transition"
          href="/manage-accounts"
        >
          Manage Accounts
        </Link>
      )}
    </div>
  );
}
