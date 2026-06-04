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
import { useEffect, useMemo } from "react";

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

  const matchedDomainName = useMemo(() => {
    const parsed = BaseUrlSchema.safeParse(baseUrl);
    if (!parsed.success) return null;
    return domainMap.get(parsed.data) ?? null;
  }, [baseUrl, domainMap]);

  useEffect(() => {
    if (!matchedDomainName) return;
    setValue("domainName", matchedDomainName, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [matchedDomainName, setValue]);

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
      className="text-card-foreground space-y-3 sm:space-y-4"
    >
      <FieldGroup className="gap-3 sm:gap-4">
        <Field className="gap-1" data-invalid={!!errors.baseUrl}>
          <FieldLabel htmlFor="baseUrl" className="text-sm font-medium">
            College Canvas URL
          </FieldLabel>
          <Input
            id="baseUrl"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="e.g. https://canvas.instructure.edu"
            aria-invalid={!!errors.baseUrl}
            className="h-11 rounded-xl text-sm sm:text-base"
            {...register("baseUrl")}
          />
          <FieldDescription className="text-xs sm:text-sm">
            The base URL of your institution&apos;s Canvas instance.
          </FieldDescription>
          <FieldError>{errors.baseUrl?.message ?? ""}</FieldError>
        </Field>

        <Field className="gap-1" data-invalid={!!errors.domainName}>
          <FieldLabel htmlFor="domainName" className="text-sm font-medium">
            College Name
          </FieldLabel>
          {matchedDomainName && (
            <FieldDescription className="text-xs text-green-600 sm:text-sm">
              A matching domain was found and the name was auto-filled!
            </FieldDescription>
          )}
          <Input
            id="domainName"
            readOnly={!!matchedDomainName}
            autoComplete="off"
            placeholder="e.g. CSUN"
            aria-invalid={!!errors.domainName}
            className="h-11 rounded-xl text-sm sm:text-base"
            {...register("domainName")}
          />

          <FieldDescription className="text-xs sm:text-sm">
            This is used as the display name for this Canvas domain.
          </FieldDescription>
          <FieldError>{errors.domainName?.message ?? ""}</FieldError>
        </Field>

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
          className="mt-2 h-11 w-full text-sm sm:mt-3"
        >
          {isSubmitting ? "Connecting..." : "Connect Account"}
        </Button>
      </FieldGroup>
    </form>
  );
}
