import type { Account, AccountInfo } from "@/lib/types";
import { type CanvasError, readCanvasError } from "./errors";
import { canvasFetchJson, CanvasResult } from "./fetch";

/**
 * Fetches planner items from Canvas API within the specified date range
 * @param domain The Canvas domain (e.g., "https://canvas.instructure.com")
 * @param token The API token for authentication
 * @param startISO The start date in ISO format (e.g., "2026-01-01T00:00:00Z")
 * @param endISO The end date in ISO format (e.g., "2026-01-31T23:59:59Z")
 * @returns An object with either the planner items or an error details
 *
 * e.g. { ok: true, status: 200, data: [ ...plannerItems ] }
 *
 * or { ok: false, status: 401, error: { message, expiredAt, raw } }
 */
export async function getPlannerItems(
  domain: string,
  token: string,
  startISO: string,
  endISO: string,
): Promise<CanvasResult<any[]>> {
  const r = await canvasFetchJson<any[]>(domain, "/api/v1/planner/items", {
    token,
    searchParams: {
      start_date: startISO,
      end_date: endISO,
      per_page: 100,
      filter: "incomplete_items",
    },
  });
  if (!r.ok) {
    return { ok: false, status: r.status, error: r.error };
  }
  return { ok: true, status: r.status, data: r.data };
}
