export type FieldErrors = Record<string, string[] | undefined>;

export type ActionResult<T = void> =
  | {
      ok: true;
      data?: T;
      message?: string;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: FieldErrors;
      formErrors?: string[];
      status?: number;
      expiredAt?: Date | null;
    };
