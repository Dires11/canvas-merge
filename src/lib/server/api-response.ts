import type { ApiResponse } from "@/lib/types/api-response";

export function apiOk<T>(data?: T, message?: string): ApiResponse<T> {
  return {
    ok: true,
    data,
    message,
  };
}

export function apiError(
  error: string,
  status?: number,
  code?: string,
): ApiResponse {
  return {
    ok: false,
    error,
    status,
    code,
  };
}
