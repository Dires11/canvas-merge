"use client";

import { ConnectAccountGuide } from "@/components/manage-accounts/connect-account-guide";
import { addAccountAction } from "@/app/manage-accounts/actions";
import type { AddSchema } from "@/lib/schemas/manage-accounts";
import type { z } from "zod";

export function ConnectAccountGuideWrapper() {
  async function handleSubmit(data: z.infer<typeof AddSchema>) {
    const result = await addAccountAction(data);
    if (!result.ok) throw new Error(result.error);
  }

  return <ConnectAccountGuide onSubmit={handleSubmit} />;
}
