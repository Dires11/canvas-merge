import { auth } from "@clerk/nextjs/server";
import { loadAccountsServer } from "./actions";
import ManageAccountsClient from "./components/client";
import { getUserDomains } from "@/lib/data/canvas-domain";

export const dynamic = "force-dynamic";

export default async function ManageAccountsPage() {
  const { userId } = await auth();
  const [accounts, domains] = await Promise.all([
    loadAccountsServer(),
    getUserDomains(userId!),
  ]);
  return <ManageAccountsClient accounts={accounts} domains={domains} />;
}
