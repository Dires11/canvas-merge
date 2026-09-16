"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink } from "lucide-react";
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
  baseUrl: string;
  onSubmit: (data: FormValues) => Promise<void>;
};

export function UpdateAccountForm({ baseUrl, onSubmit }: Props) {
  const settingsUrl = `${baseUrl.replace(/\/$/, "")}/profile/settings#:~:text=Approved%20Integrations`;
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
      className="text-card-foreground space-y-3 sm:space-y-4"
    >
      <FieldGroup className="gap-3 sm:gap-4">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Create a new token under Approved Integrations in Canvas, then paste it below.
          </p>
          <Button asChild variant="outline" size="sm">
            <a href={settingsUrl} target="_blank" rel="noopener noreferrer">
              Open Canvas Settings
              <ExternalLink className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
        </div>
        <Field className="gap-1" data-invalid={!!errors.token}>
          <FieldLabel htmlFor="token" className="text-sm font-medium">
            Canvas API Token
          </FieldLabel>
          <Input
            id="token"
            type="password"
            autoComplete="one-time-code"
            placeholder="e.g. abc123..."
            aria-invalid={!!errors.token}
            className="h-11 rounded-xl text-sm sm:text-base"
            {...register("token")}
          />
          <FieldDescription className="text-xs sm:text-sm">
            Your token is encrypted before it is stored.
          </FieldDescription>
          <FieldError>{errors.token?.message ?? ""}</FieldError>
        </Field>

        {errors.root && (
          <p
            className="bg-destructive/10 border-destructive text-destructive rounded-xl border px-3 py-2 text-sm"
            aria-live="polite"
          >
            {errors.root.message}
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          data-glass-pointer=""
          className="glass-primary relative h-11 w-full text-sm"
        >
          {isSubmitting ? "Updating..." : "Update Token"}
        </Button>
      </FieldGroup>
    </form>
  );
}
