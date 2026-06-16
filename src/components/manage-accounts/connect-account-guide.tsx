"use client";

import { useState } from "react";
import { AddSchema, BaseUrlSchema } from "@/lib/schemas/manage-accounts";
import { ExternalLink } from "lucide-react";
import { GlassContainer } from "../glass-container";
import Image from "next/image";
import { Step } from "./step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type AddValues = z.infer<typeof AddSchema>;

const guideInputClassName = "h-11 rounded-xl text-sm sm:text-base";
const guideLinkButtonClassName =
  "border-input bg-card-foreground/5 text-card-foreground hover:bg-card-foreground/10 rounded-xl shadow-xs dark:bg-input/30 dark:hover:bg-input/50";

export function ConnectAccountGuide({
  onSubmit: onSubmitProp,
}: {
  onSubmit: (data: AddValues) => Promise<void>;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [validatedBaseUrl, setValidatedBaseUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddValues>({
    resolver: zodResolver(AddSchema),
    mode: "onBlur",
    defaultValues: {
      domainName: "",
      baseUrl: "",
      token: "",
    },
  });

  async function onSubmit(data: AddValues) {
    try {
      await onSubmitProp(data);
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  async function handleNext() {
    if (isSubmitting) return;

    if (currentStep == 1) {
      const valid = await trigger(["domainName", "baseUrl"]);
      if (!valid) return;
      const parsed = BaseUrlSchema.safeParse(getValues("baseUrl"));
      if (parsed.success) {
        console.log("Derived base URL:", { baseUrl: parsed.data });
        setValidatedBaseUrl(parsed.data);
      }
    }
    if (currentStep == 4) {
      await handleSubmit(onSubmit)();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  }

  const settingsUrl = validatedBaseUrl
    ? `${validatedBaseUrl}/profile/settings#:~:text=Approved%20Integrations`
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <GlassContainer className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center gap-2 text-lg tracking-tight">
          Let&apos;s get started by connecting your Canvas account!
        </div>
        <div className="space-y-3">
          <Step
            currentStep={currentStep}
            step={1}
            title="College Information"
            onClick={setCurrentStep}
            onNext={handleNext}
          >
            <FieldGroup className="max-w-100 gap-2 p-2">
              <Field className="gap-1">
                <FieldLabel htmlFor="canvas-url">
                  Please enter your college Canvas URL:
                </FieldLabel>
                <Input
                  id="canvas-url"
                  placeholder="e.g. canvas.csun.edu"
                  className={guideInputClassName}
                  {...register("baseUrl")}
                />
                {errors?.baseUrl && (
                  <p className="text-sm text-red-600" aria-live="polite">
                    {errors.baseUrl.message}
                  </p>
                )}
                <FieldDescription className="text-sm">
                  This should be the URL you use to access Canvas.
                </FieldDescription>
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="college-name">
                  Please enter your college name:{" "}
                </FieldLabel>
                <Input
                  id="college-name"
                  placeholder="e.g. CSUN"
                  className={guideInputClassName}
                  {...register("domainName")}
                />
                {errors?.domainName && (
                  <p className="text-sm text-red-600" aria-live="polite">
                    {errors.domainName.message}
                  </p>
                )}
                <FieldDescription>
                  This is just for your reference. It can be anything you want.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </Step>

          <Step
            currentStep={currentStep}
            step={2}
            title="Open Canvas Settings"
            onClick={setCurrentStep}
            onNext={handleNext}
          >
            <div className="max-w-[80%]">
              <p className="text-sm">
                Now that we have your Canvas URL, the next step is to get your
                personal access token from Canvas. Click the button below to
                navigate to the Canvas settings page.
              </p>
              <Button
                asChild
                variant="outline"
                className={cn("mt-2", guideLinkButtonClassName)}
              >
                <a
                  href={settingsUrl ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  Navigate to Canvas Settings
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </Step>

          <Step
            currentStep={currentStep}
            step={3}
            title="Generate Access Token"
            onClick={setCurrentStep}
            onNext={handleNext}
          >
            <div className="space-y-4">
              <p className="text-sm">
                Now you should be on the &quot;Approved Integrations&quot;
                section of your Canvas settings. Click the &quot;+ New Access
                Token&quot; button to generate a new token. Make sure to copy
                the token after it&apos;s generated, as you won&apos;t be able
                to see it again!
              </p>
              <div className="grid gap-3">
                <figure className="glass-border bg-glass/5 overflow-hidden rounded-2xl p-2 shadow-sm">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 px-1 text-xs font-medium">
                    <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[11px]">
                      1
                    </span>
                    Find Approved Integrations
                  </div>
                  <Image
                    src="/canvas-guide/approved-integrations.png"
                    alt="Screenshot of the Canvas 'Approved Integrations' page with the '+ New Access Token' button highlighted."
                    width={1702}
                    height={340}
                    sizes="(min-width: 768px) 760px, 90vw"
                    className="rounded-xl border border-white/10 object-cover"
                  />
                </figure>

                <div className="grid gap-3 sm:grid-cols-2">
                  <figure className="glass-border bg-glass/5 overflow-hidden rounded-2xl p-2 shadow-sm">
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 px-1 text-xs font-medium">
                      <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[11px]">
                        2
                      </span>
                      Create the token
                    </div>
                    <Image
                      src="/canvas-guide/generate-token-modal.png"
                      alt="Screenshot of the modal for generating a new access token in Canvas."
                      width={1538}
                      height={954}
                      sizes="(min-width: 768px) 372px, 90vw"
                      className="aspect-[16/10] rounded-xl border border-white/10 object-cover object-top"
                    />
                  </figure>

                  <figure className="glass-border bg-glass/5 overflow-hidden rounded-2xl p-2 shadow-sm">
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 px-1 text-xs font-medium">
                      <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-[11px]">
                        3
                      </span>
                      Copy it once
                    </div>
                    <Image
                      src="/canvas-guide/generated-token.png"
                      alt="Screenshot of the generated access token in Canvas."
                      width={1526}
                      height={1224}
                      sizes="(min-width: 768px) 372px, 90vw"
                      className="aspect-[16/10] rounded-xl border border-white/10 object-cover object-top"
                    />
                  </figure>
                </div>
              </div>
            </div>
          </Step>

          <Step
            currentStep={currentStep}
            step={4}
            title="Access Token"
            onClick={setCurrentStep}
            onNext={handleNext}
            finalStep
            disableNext={isSubmitting}
          >
            <p>
              Copy the generated token and paste it into the token field below.
            </p>
            <Field className="max-w-100 gap-0 p-2">
              <FieldLabel
                htmlFor="canvas-token"
                className="tracking-tight: mb-1 shrink-0"
              >
                Please enter your Canvas Access Token:
              </FieldLabel>
              <Input
                id="canvas-token"
                placeholder="1860~X26VHn2..."
                className={guideInputClassName}
                {...register("token")}
              />
              {errors?.token && (
                <p className="text-sm text-red-600" aria-live="polite">
                  {errors.token.message}
                </p>
              )}
              {errors?.root && (
                <p className="text-sm text-red-600" aria-live="polite">
                  {errors.root.message}
                </p>
              )}
              <FieldDescription className="text-sm">
                This token is encrypted and securely stored on our servers.
              </FieldDescription>
            </Field>
          </Step>
        </div>
      </GlassContainer>
    </form>
  );
}
