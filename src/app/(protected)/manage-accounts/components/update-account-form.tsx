"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { UpdateTokenSchema } from "@/lib/schemas/manage-accounts";

type FormValues = z.infer<typeof UpdateTokenSchema>;

type Props = {
  onSubmit: (data: FormValues) => Promise<void>;
};

export function UpdateAccountForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(UpdateTokenSchema),
    defaultValues: {
      token: "",
    },
  });

  async function handleFormSubmit(values: FormValues) {
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
      <FieldGroup>
        <Field className="gap-0.5" data-invalid={!!errors.token}>
          <FieldLabel htmlFor="token">Canvas API Token</FieldLabel>
          <Input
            id="token"
            type="password"
            autoComplete="one-time-code"
            placeholder="e.g. abc123..."
            aria-invalid={!!errors.token}
            {...register("token")}
          />
          <FieldDescription>
            Your token is encrypted before it is stored.
          </FieldDescription>
          <FieldError>{errors.token?.message ?? ""}</FieldError>
        </Field>

        {errors.root && (
          <p
            className="bg-destructive/10 border-destructive text-destructive rounded-xl border px-3 py-2"
            aria-live="polite"
          >
            {errors.root.message}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Token"}
        </Button>
      </FieldGroup>
    </form>
  );
}
