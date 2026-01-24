import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ManageAccountFormProps = {
  onSuccess: () => void;
};

export function ManageAccountForm({ onSuccess }: ManageAccountFormProps) {
  const FormSchema = z.object({
    domain: z.url({ message: "Please enter a valid URL for the institution" }),
    token: z
      .string()
      .min(10, "Personal token too short. Make sure it's correct."),
  });
  type FormValues = z.infer<typeof FormSchema>;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: FormValues) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15_000);

    try {
      const r = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: ac.signal,
      });

      let json = await r.json();

      if (!r.ok) {
        setError("root", { type: "server", message: json.error });
        return;
      }

      onSuccess();

      reset((prev) => ({ ...prev, token: "" }));
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

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">
          Institution URL
        </label>
        <input
          type="url"
          placeholder="e.g. canvas.mycollege.edu"
          className={`form-input ${errors.domain ? "form-input-error" : ""}`}
          {...register("domain")}
        />
        <p className="mt-1 min-h-5 text-sm text-red-600">
          {errors.domain?.message ?? ""}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-900">
          Canvas Personal Access Token
        </label>
        <input
          type="password"
          placeholder="Paste your PAT"
          className={`form-input ${errors.token ? "form-input-error" : ""}`}
          autoComplete="new-password"
          {...register("token")}
        />

        <p className="mt-1 min-h-5 text-sm text-red-600">
          {errors.token?.message ?? ""}
        </p>
        <p className="text-xs text-gray-700 mt-2">
          We never store your token in plain text. It's encrypted at rest and
          validated once before saving.
        </p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl w-full px-4 py-2 disabled:opacity-60 disabled:pointer-events-none bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition"
      >
        {isSubmitting ? "Linking…" : "Link Canvas Account"}
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
