import { loadAccountsServer } from "./actions";
import { ConnectAccountGuide } from "@/components/manage-accounts/connect-account-guide";
import ManageAccountsClient from "./client";

export default async function ManageAccountsPage() {
  const accounts = await loadAccountsServer();
  if (accounts.length === 0) {
    return <ConnectAccountGuide />;
  } else {
    return <ManageAccountsClient initialAccounts={accounts} />;
  }
}
