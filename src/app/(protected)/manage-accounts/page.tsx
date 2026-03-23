import { loadAccountsServer } from "./actions";
import { ConnectAccountGuide } from "@/components/manage-accounts/connect-account-guide";
import ManageAccountsClient from "./client";
import { getUserDomains } from "@/lib/data/canvas-domain";
import { requireUser } from "@/lib/server/auth-server";

export const dynamic = "force-dynamic";

export default async function ManageAccountsPage() {
  const user = await requireUser();
  const accounts = await loadAccountsServer();
  if (accounts.length === 0) {
    return <ConnectAccountGuide />;
  } else {
    const domains = await getUserDomains(user.id);
    return <ManageAccountsClient accounts={accounts} domains={domains} />;
  }
}
