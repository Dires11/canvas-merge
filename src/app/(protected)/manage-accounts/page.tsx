import { loadAccountsServer } from "./actions";
import ManageAccountsClient from "./components/client";
import { getUserDomains } from "@/lib/data/canvas-domain";
import { requireUser } from "@/lib/server/auth-server";

export const dynamic = "force-dynamic";

export default async function ManageAccountsPage() {
  const user = await requireUser();
  const [accounts, domains] = await Promise.all([
    loadAccountsServer(),
    getUserDomains(user.id),
  ]);
  return <ManageAccountsClient accounts={accounts} domains={domains} />;
}
