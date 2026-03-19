// lib/types/api-response.ts

export type ApiResponse<T = void> =
  | {
      ok: true;
      data?: T;
      message?: string;
    }
  | {
      ok: false;
      error: string;
      status?: number;
      code?: string; // optional: for frontend error handling
    };
