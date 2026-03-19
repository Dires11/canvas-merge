"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AddSchema } from "@/lib/schemas/manage-accounts";
import type { AddAccountInput } from "@/lib/types/account";

type Props = {
  onSubmit: (data: AddAccountInput) => Promise<void>;
};

export function AddAccountForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddAccountInput>({
    resolver: zodResolver(AddSchema),
    defaultValues: {
      baseUrl: "",
      domainName: "",
      token: "",
    },
  });

  async function handleFormSubmit(values: AddAccountInput) {
    try {
      await onSubmit(values);
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      className="text-card-foreground space-y-4"
    >
      <FieldGroup className="gap-1">
        <Field className="gap-0.5">
          <FieldLabel htmlFor="baseUrl">College Canvas URL</FieldLabel>
          <Input
            id="baseUrl"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. https://canvas.instructure.edu"
            error={!!errors.baseUrl}
            {...register("baseUrl")}
          />
          <FieldDescription>
            The base URL of your institution&apos;s Canvas instance.
          </FieldDescription>
          <FieldError>{errors.baseUrl?.message ?? ""}</FieldError>
        </Field>

        <Field className="gap-0.5">
          <FieldLabel htmlFor="domainName">College Name</FieldLabel>
          <Input
            id="domainName"
            autoComplete="organization"
            placeholder="e.g. CSUN"
            error={!!errors.domainName}
            {...register("domainName")}
          />
          <FieldDescription>
            This is used as the display name for this Canvas domain.
          </FieldDescription>
          <FieldError>{errors.domainName?.message ?? ""}</FieldError>
        </Field>

        <Field className="gap-0.5">
          <FieldLabel htmlFor="token">Canvas API Token</FieldLabel>
          <Input
            id="token"
            type="password"
            placeholder="e.g. abc123"
            error={!!errors.token}
            {...register("token")}
          />
          <FieldDescription>
            Your token is encrypted before it is stored.
          </FieldDescription>
          <FieldError>{errors.token?.message ?? ""}</FieldError>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="mt-3">
          {isSubmitting ? "Connecting..." : "Connect Account"}
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
