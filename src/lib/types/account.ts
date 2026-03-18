import { z } from "zod";
import { AddSchema, UpdateSchema } from "@/lib/schemas/manage-accounts";

export type AddAccountInput = z.infer<typeof AddSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateSchema>;

export type CanvasAccountInfo = {
  canvasId: number;
  name: string;
  domain: string;
  avatarUrl: string;
};

export type AccountBaseInfo = {
  id: string;
  name: string;
  domain: string;
  domainName: string;
  domainSlug: string;
  canvasId: number;
  avatarUrl: string;
  expiredAt: Date | null;
};

export type AccountSafeInfo = AccountBaseInfo;

export type AccountInfo = AccountBaseInfo & {
  token: string;
};
