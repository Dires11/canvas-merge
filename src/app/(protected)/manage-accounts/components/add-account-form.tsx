"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/input";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { AddSchema } from "@/lib/schemas/manage-accounts";
import { set, z } from "zod";
import { addAccountAction } from "../actions";
import { Button } from "@/components/ui/button";

// type ManageAccountFormProps = {
//   accountId?: string; // if present → update mode
//   initialDomain?: string;
//   onSubmit: (
//     data: { domain?: string; token: string },
//     signal: AbortSignal,
//   ) => Promise<void>;
//   onSuccess: () => void;
// };

export function AddAccountForm({
  onSubmit,
}: {
  onSubmit: (data: z.infer<typeof AddSchema>) => Promise<void>;
}) {
  // schema depends on mode, but form type stays the same
  const schema = AddSchema;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // async function onSubmit(values: z.infer<typeof schema>) {
  //   try {
  //     const result = await addAccountAction(values);

  //     if (result.ok) {
  //       onSuccess();
  //     } else {
  //       setError("root", { message: result.error });
  //     }
  //   } catch (error) {
  //     setError("root", { message: "An unexpected error occurred" });
  //   }
  // }
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        try {
          await onSubmit(values);
          set;
        } catch (error: any) {
          setError("root", {
            message:
              error?.message ||
              "An unexpected error occurred. Please try again.",
          });
        }
      })}
      className="text-card-foreground space-y-4"
    >
      <FieldGroup className="gap-1">
        {/* Canvas URL */}
        <Field className="gap-0.5">
          <FieldLabel htmlFor="domain">College Canvas URL</FieldLabel>
          <Input
            id="domain"
            autoComplete="true"
            autoCapitalize="false"
            spellCheck="false"
            placeholder="e.g. canvas.instructure.edu"
            error={!!errors.domain}
            {...register("domain")}
          />
          <FieldDescription>
            The base URL of your institution's Canvas instance.
          </FieldDescription>
          <FieldError>{errors.domain?.message ?? ""}</FieldError>
        </Field>
        {/* Domain Name */}
        <Field className="gap-0.5">
          <FieldLabel htmlFor="domainName">College Name</FieldLabel>
          <Input
            id="domainName"
            autoComplete="true"
            placeholder="e.g CSUN"
            error={!!errors.domainName}
            {...register("domainName")}
          />
          <FieldDescription>
            This is going to be used for your reference.
          </FieldDescription>
          <FieldError>{errors.domainName?.message ?? ""}</FieldError>
        </Field>
        {/* API Token */}
        <Field className="gap-0.5">
          <FieldLabel htmlFor="token">Canvas API Token</FieldLabel>
          <Input
            id="token"
            placeholder="e.g. abc123"
            error={!!errors.token}
            {...register("token")}
          />
          <FieldDescription>
            The tokens are encrypted before being stored.
          </FieldDescription>
          <FieldError>{errors.token?.message ?? ""}</FieldError>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-3">
          Connect Account
        </Button>
        {errors.root && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            aria-live="polite"
          >
            {errors.root.message}
          </p>
        )}
      </FieldGroup>
    </form>
  );
}
