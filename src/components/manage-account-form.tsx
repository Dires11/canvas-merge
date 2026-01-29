"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const UpdateSchema = z.object({
  token: z
    .string()
    .min(10, "Personal token too short. Make sure it's correct."),
  // allow domain but ignore it
  domain: z.string().optional(),
});

const AddSchema = z.object({
  domain: z.url({
    message: "Please enter a valid URL for the institution",
  }),
  token: z
    .string()
    .min(10, "Personal token too short. Make sure it's correct."),
});

type FormValues = {
  domain: string; // always present in form type
  token: string;
};

type ManageAccountFormProps = {
  accountId?: string; // if present → update mode
  initialDomain?: string;
  onSubmit: (
    data: { domain?: string; token: string },
    signal: AbortSignal,
  ) => Promise<void>;
  onSuccess: () => void;
};

export function ManageAccountForm({
  accountId,
  initialDomain,
  onSubmit,
  onSuccess,
}: ManageAccountFormProps) {
  const isUpdate = !!accountId;

  // schema depends on mode, but form type stays the same
  const schema = isUpdate ? UpdateSchema : AddSchema;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema as any), // zodResolver typing can be strict; this keeps it simple
    defaultValues: {
      domain: initialDomain ?? "",
      token: "",
    },
  });

  async function handleFormSubmit(values: FormValues) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15_000);

    try {
      await onSubmit(
        isUpdate
          ? { token: values.token }
          : { domain: values.domain, token: values.token },
        ac.signal,
      );

      reset({ domain: initialDomain ?? "", token: "" });
      onSuccess();
    } catch (e: any) {
      setError("root", {
        type: "server",
        message:
          e?.name === "AbortError"
            ? "Request timed out. Please try again."
            : (e?.message ?? "Network error. Please try again."),
      });
    } finally {
      clearTimeout(t);
    }
  }

  // return (
  //   <form
  //     noValidate
  //     onSubmit={handleSubmit(handleFormSubmit)}
  //     className="space-y-2"
  //   >
  //     <div>
  //       <label className="block text-sm font-medium mb-1 text-gray-900">
  //         Institution URL
  //       </label>
  //       <input
  //         type="url"
  //         placeholder="e.g. canvas.mycollege.edu"
  //         className={`form-input ${errors.domain ? "form-input-error" : ""}`}
  //         {...register("domain")}
  //       />
  //       <p className="mt-1 min-h-5 text-sm text-red-600">
  //         {errors.domain?.message ?? ""}
  //       </p>
  //     </div>
  //     <div>
  //       <label className="block text-sm font-medium mb-1 text-gray-900">
  //         Canvas Personal Access Token
  //       </label>
  //       <input
  //         type="password"
  //         placeholder="Paste your PAT"
  //         className={`form-input ${errors.token ? "form-input-error" : ""}`}
  //         autoComplete="new-password"
  //         {...register("token")}
  //       />

  //       <p className="mt-1 min-h-5 text-sm text-red-600">
  //         {errors.token?.message ?? ""}
  //       </p>
  //       <p className="text-xs text-gray-700 mt-2">
  //         We never store your token in plain text. It's encrypted at rest and
  //         validated once before saving.
  //       </p>
  //     </div>
  //     <button
  //       type="submit"
  //       disabled={isSubmitting}
  //       className="rounded-xl w-full px-4 py-2 disabled:opacity-60 disabled:pointer-events-none bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition"
  //     >
  //       {isSubmitting ? "Linking…" : "Link Canvas Account"}
  //     </button>
  //     {errors.root && (
  //       <div
  //         className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
  //         aria-live="polite"
  //       >
  //         {errors.root.message}
  //       </div>
  //     )}
  //   </form>

  // );
  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4 text-card-foreground"
    >
      {!isUpdate && (
        <div>
          <label className="block text-sm font-medium  dark:text-white">
            Institution URL
          </label>
          <input
            type="url"
            placeholder="e.g. canvas.mycollege.edu"
            className={`form-input ${errors.domain ? "form-input-error" : ""}`}
            {...register("domain")}
          />
          <p className="min-h-5 text-sm text-red-600">
            {errors.domain?.message ?? ""}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb- dark:text-white">
          Canvas Personal Access Token
        </label>
        <input
          type="password"
          placeholder="Paste your PAT"
          autoComplete="new-password"
          className={`form-input ${errors.token ? "form-input-error" : ""}`}
          {...register("token")}
        />
        <p className="min-h-5 text-sm text-red-600">
          {errors.token?.message ?? ""}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl px-4 py-2 bg-primary text-white font-medium shadow-lg disabled:opacity-60 disabled:pointer-events-none hover:bg-primary-hover transition"
      >
        {isSubmitting
          ? isUpdate
            ? "Updating…"
            : "Linking…"
          : isUpdate
            ? "Update Token"
            : "Link Canvas Account"}
      </button>

      {errors.root && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          aria-live="polite"
        >
          {errors.root.message}
        </div>
      )}
    </form>
  );
}
