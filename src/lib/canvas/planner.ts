import { Plannable, RawPlannerItem } from "../types";
import { canvasFetchJson, CanvasResult } from "./fetch";

export type PlannerItemFilter = "incomplete_items" | "complete_items";

export type PlannerOverride = {
  id: number;
  plannable_type: string;
  plannable_id: number;
  user_id: number;
  assignment_id?: number | null;
  workflow_state: string;
  marked_complete: boolean;
  dismissed: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type CanvasSubmission = {
  grade: string | null;
  score: number | null;
  submitted_at: string | null;
  entered_grade?: string | null;
  entered_score?: number | null;
  graded_at?: string | null;
};

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
  filter: PlannerItemFilter = "incomplete_items",
): Promise<CanvasResult<RawPlannerItem[]>> {
  return canvasFetchJson<RawPlannerItem[]>(domain, "/api/v1/planner/items", {
    token,
    searchParams: {
      start_date: startISO,
      end_date: endISO,
      per_page: 100,
      filter,
    },
  });
}

export async function getAssignmentSubmission(
  domain: string,
  token: string,
  courseId: number,
  assignmentId: number,
): Promise<CanvasResult<CanvasSubmission>> {
  return canvasFetchJson<CanvasSubmission>(
    domain,
    `/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/self`,
    {
      token,
    },
  );
}

export async function markPlannerItem(
  domain: string,
  token: string,
  plannable_type: Plannable,
  plannable_id: number,
  marked_complete: boolean,
) {
  return createPlannerOverride(
    domain,
    token,
    plannable_type,
    plannable_id,
    marked_complete,
  );
}

export async function createPlannerOverride(
  domain: string,
  token: string,
  plannable_type: Plannable,
  plannable_id: number,
  marked_complete: boolean,
): Promise<CanvasResult<PlannerOverride>> {
  return canvasFetchJson<PlannerOverride>(domain, "/api/v1/planner/overrides", {
    method: "POST",
    token,
    body: {
      plannable_type,
      plannable_id,
      marked_complete,
    },
  });
}

export async function updatePlannerOverride(
  domain: string,
  token: string,
  overrideId: number,
  marked_complete: boolean,
): Promise<CanvasResult<PlannerOverride>> {
  return canvasFetchJson<PlannerOverride>(
    domain,
    `/api/v1/planner/overrides/${overrideId}`,
    {
      method: "PUT",
      token,
      body: {
        marked_complete,
      },
    },
  );
}

export async function deletePlannerOverride(
  domain: string,
  token: string,
  overrideId: number,
): Promise<CanvasResult<PlannerOverride>> {
  return canvasFetchJson<PlannerOverride>(
    domain,
    `/api/v1/planner/overrides/${overrideId}`,
    {
      method: "DELETE",
      token,
    },
  );
}
