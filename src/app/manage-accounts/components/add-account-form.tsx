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
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  onSubmit: (data: AddAccountInput) => Promise<void>;
  domains: CanvasDomainInfo[];
};

export function AddAccountForm({ onSubmit, domains }: Props) {
  const [selectedDomainBaseUrl, setSelectedDomainBaseUrl] = useState(
    domains[0]?.baseUrl ?? "new",
  );
  const isAddingNewDomain = selectedDomainBaseUrl === "new";

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
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
    if (!isAddingNewDomain) return null;
    const parsed = BaseUrlSchema.safeParse(baseUrl);
    if (!parsed.success) return null;
    return domainMap.get(parsed.data) ?? null;
  }, [baseUrl, domainMap, isAddingNewDomain]);

  useEffect(() => {
    if (isAddingNewDomain) return;

    const selectedDomain = domains.find(
      (domain) => domain.baseUrl === selectedDomainBaseUrl,
    );
    if (!selectedDomain) return;

    setValue("baseUrl", selectedDomain.baseUrl, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("domainName", selectedDomain.name, {
      shouldValidate: true,
      shouldDirty: true,
    });
    clearErrors(["baseUrl", "domainName"]);
  }, [
    clearErrors,
    domains,
    isAddingNewDomain,
    selectedDomainBaseUrl,
    setValue,
  ]);

  useEffect(() => {
    if (!matchedDomainName) return;
    setValue("domainName", matchedDomainName, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [matchedDomainName, setValue]);

  function selectSavedDomain(baseUrl: string) {
    setSelectedDomainBaseUrl(baseUrl);
  }

  function selectNewDomain() {
    setSelectedDomainBaseUrl("new");
    setValue("baseUrl", "", {
      shouldValidate: false,
      shouldDirty: true,
    });
    setValue("domainName", "", {
      shouldValidate: false,
      shouldDirty: true,
    });
    clearErrors(["baseUrl", "domainName"]);
  }

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
        {domains.length > 0 && (
          <Field className="gap-2">
            <FieldLabel className="text-sm font-medium">
              Canvas Domain
            </FieldLabel>
            <div className="grid gap-2">
              {domains.map((domain) => {
                const isSelected = selectedDomainBaseUrl === domain.baseUrl;

                return (
                  <button
                    key={domain.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectSavedDomain(domain.baseUrl)}
                    className={cn(
                      "border-input bg-card-foreground/5 text-card-foreground hover:bg-card-foreground/10 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm shadow-xs transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                      isSelected &&
                        "border-primary bg-primary/15 text-foreground shadow-sm",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {domain.name}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {domain.baseUrl}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "border-muted-foreground/40 size-3.5 shrink-0 rounded-full border",
                        isSelected && "border-primary bg-primary",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}

              <button
                type="button"
                aria-pressed={isAddingNewDomain}
                onClick={selectNewDomain}
                className={cn(
                  "border-input bg-card-foreground/5 text-card-foreground hover:bg-card-foreground/10 flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium shadow-xs transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  isAddingNewDomain &&
                    "border-primary bg-primary/15 text-foreground shadow-sm",
                )}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add a new Canvas domain
              </button>
            </div>
          </Field>
        )}

        {!isAddingNewDomain && (
          <>
            <input type="hidden" {...register("baseUrl")} />
            <input type="hidden" {...register("domainName")} />
          </>
        )}

        {isAddingNewDomain && (
          <>
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
          </>
        )}

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
