"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { AddSchema, BaseUrlSchema } from "@/lib/schemas/manage-accounts";
import type { AddAccountInput } from "@/lib/types/account";
import { CanvasDomainInfo } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

type Props = {
  onSubmit: (data: AddAccountInput) => Promise<void>;
  domains: CanvasDomainInfo[];
};

export function AddAccountForm({ onSubmit, domains }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddAccountInput>({
    resolver: zodResolver(AddSchema),
    defaultValues: {
      baseUrl: "",
      domainName: "",
      token: "",
    },
  });

  const domainMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const domain of domains) {
      map.set(domain.baseUrl, domain.name);
    }
    return map;
  }, [domains]);

  const baseUrl = useWatch({ control, name: "baseUrl" });

  useEffect(() => {
    setMatch(false);
    const parsed = BaseUrlSchema.safeParse(baseUrl);
    if (!parsed.success) return;
    const domainName = domainMap.get(parsed.data);
    console.log("Derived domainName:", { domainName });
    if (domainName) {
      setMatch(true);
      setValue("domainName", domainName, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [baseUrl]);

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
  const [match, setMatch] = useState<boolean>(false);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      className="text-card-foreground space-y-4"
    >
      <FieldGroup className="gap-1">
        <Field className="gap-0.5" data-invalid={!!errors.baseUrl}>
          <FieldLabel htmlFor="baseUrl">College Canvas URL</FieldLabel>
          <Input
            id="baseUrl"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. https://canvas.instructure.edu"
            aria-invalid={!!errors.baseUrl}
            {...register("baseUrl")}
          />
          <FieldDescription>
            The base URL of your institution&apos;s Canvas instance.
          </FieldDescription>
          <FieldError>{errors.baseUrl?.message ?? ""}</FieldError>
        </Field>

        <Field className="gap-0.5" data-invalid={!!errors.domainName}>
          <FieldLabel htmlFor="domainName">College Name</FieldLabel>
          {match && (
            <FieldDescription className="text-green-600">
              A matching domain was found and the name was auto-filled!
            </FieldDescription>
          )}
          <Input
            id="domainName"
            readOnly={match}
            autoComplete="off"
            placeholder="e.g. CSUN"
            aria-invalid={!!errors.domainName}
            {...register("domainName")}
          />

          <FieldDescription>
            This is used as the display name for this Canvas domain.
          </FieldDescription>
          <FieldError>{errors.domainName?.message ?? ""}</FieldError>
        </Field>

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
        <Button type="submit" disabled={isSubmitting} className="mt-3">
          {isSubmitting ? "Connecting..." : "Connect Account"}
        </Button>
      </FieldGroup>
    </form>
  );
}
