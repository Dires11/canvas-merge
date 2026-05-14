import { Plannable, RawPlannerItem } from "../types";
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
): Promise<CanvasResult<RawPlannerItem[]>> {
  return canvasFetchJson<RawPlannerItem[]>(domain, "/api/v1/planner/items", {
    token,
    searchParams: {
      start_date: startISO,
      end_date: endISO,
      per_page: 100,
      filter: "incomplete_items",
    },
  });
}

export async function markPlannerItem(
  domain: string,
  token: string,
  plannable_type: Plannable,
  plannable_id: number,
  marked_complete: boolean,
) {
  return canvasFetchJson(domain, `/api/v1/planner/overrides/`, {
    method: "POST",
    token,
    body: {
      plannable_type,
      plannable_id,
      marked_complete,
    },
  });
}
