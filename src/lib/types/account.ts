import { z } from "zod";
import { AddSchema } from "@/lib/schemas/manage-accounts";
import { CanvasDomainInfo } from "./canvas-domain";

export type AddAccountInput = z.infer<typeof AddSchema>;

export type CanvasAccountInfo = {
  canvasId: number;
  name: string;
  avatarUrl: string;
};

export type AccountBaseInfo = {
  id: string;
  name: string;
  canvasDomain: CanvasDomainInfo;
  canvasId: number;
  avatarUrl: string;
  expiredAt: Date | null;
};

export type AccountSafeInfo = AccountBaseInfo;

export type AccountInfo = AccountBaseInfo & {
  token: string;
};
