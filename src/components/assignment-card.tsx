import type {
  MergedAssignment,
  Assignment,
  AccountSafeInfo,
} from "@/lib/types";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AssignmentCard({
  item,
  merged,
  accountMap,
}: {
  item: MergedAssignment;
  merged: boolean;
  accountMap: Map<string, AccountSafeInfo>;
}) {
  const unsubmittedAccounts = item.accountsNotSubmitted;
  if (unsubmittedAccounts.length == 0) {
    return;
  }

  return (
    <div className="bg-gray-white rounded-md border-2">
      <Link
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-300 underline"
      >
        {item.title}
      </Link>
      {unsubmittedAccounts.map((acc) => {
        const account = accountMap.get(acc.accountId);
        if (!account) return;
        return (
          <div key={account.id} className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <img
                  src={account.avatarUrl}
                  alt={`${account.name}'s avatar`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{account.name}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
