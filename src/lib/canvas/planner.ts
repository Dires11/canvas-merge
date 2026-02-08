import { canvasFetchJson, CanvasResult } from "./fetch";

/**
 * Fetches planner items from Canvas API within the specified date range
 * @param domain The Canvas domain (e.g., "https://canvas.instructure.com")
 * @param token The API token for authentication
 * @param startISO The start date in ISO format (e.g., "2026-01-01T00:00:00Z")
 * @param endISO The end date in ISO format (e.g., "2026-01-31T23:59:59Z")
 * @param opts Optional parameters including ifNoneMatch for ETag handling
 * @returns An object with either the planner items or an error details
 *
 *
 * e.g. { ok: true, status: 200, data: [ ...plannerItems ] }
 *
 * or { ok: false, status: 401, error: { message, expiredAt, raw } }
 *
 * - If opts.ifNoneMatch is provided, Canvas may return 304 Not Modified.
 *   In that case, this returns { ok: true, status: 304, data: undefined, etag }
 */
export async function getPlannerItems(
  domain: string,
  token: string,
  startISO: string,
  endISO: string,
  opts?: { ifNoneMatch?: string },
): Promise<CanvasResult<any[]>> {
  const r = await canvasFetchJson<any[]>(domain, "/api/v1/planner/items", {
    token,
    ifNoneMatch: opts?.ifNoneMatch,
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

  // Preserve etag + status exactly (200 or 304)
  return { ok: true, status: r.status, data: r.data, etag: r.etag };
}
