"use client";

import { useMemo, useState } from "react";
import { AddSchema, BaseUrlSchema } from "@/lib/schemas/manage-accounts";
import { ExternalLink, School, KeyRound } from "lucide-react";
import { GlassContainer } from "../glass-container";
import Image from "next/image";
import Link from "next/link";
import { Step } from "./step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    watch,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddValues>({
    resolver: zodResolver(AddSchema),
    mode: "onChange",
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
      const parsed = BaseUrlSchema.safeParse(watch("baseUrl"));
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
          Let's get started by connecting your Canvas account!
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
              <Field className="gap-0">
                <FieldLabel
                  htmlFor="canvas-url"
                  className="tracking-tight: mb-1 shrink-0"
                >
                  Please enter your college Canvas URL:
                </FieldLabel>
                <Input
                  id="canvas-url"
                  placeholder="e.g. canvas.csun.edu"
                  className="dark:bg-background bg-background text-foreground placeholder:text-foreground/70"
                  {...register("baseUrl")}
                />
                {errors?.baseUrl && (
                  <p className="text-sm text-red-600" aria-live="polite">
                    {errors.baseUrl.message}
                  </p>
                )}
                <FieldDescription className="text-sm">
                  This should be the URL you use to access Canvas. Make sure
                  it's correct so we can guide you to the right settings page in
                  the next step!
                </FieldDescription>
              </Field>
              <Field className="gap-0">
                <FieldLabel htmlFor="college-name">
                  Please enter your college name:{" "}
                </FieldLabel>
                <Input
                  id="college-name"
                  placeholder="e.g. CSUN"
                  className="dark:bg-background bg-background text-foreground placeholder:text-foreground/70"
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
              <Button variant="outline" className="mt-2">
                <a
                  href={settingsUrl ?? "#"}
                  target="_blank"
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
            <div>
              <p className="text-sm">
                Now you should be on the "Approved Integrations" section of your
                Canvas settings. Click the "+ New Access Token" button to
                generate a new token. Make sure to copy the token after it's
                generated, as you won't be able to see it again!
              </p>
              <div className="flex flex-wrap items-center justify-center">
                <Image
                  src="/canvas-guide/approved-integrations.png"
                  alt="Screenshot of the Canvas 'Approved Integrations' page with the '+ New Access Token' button highlighted."
                  width={500}
                  height={50}
                  className="glass-border mt-2 rounded-2xl"
                />
                <Image
                  src="/canvas-guide/generate-token-modal.png"
                  alt="Screenshot of the modal for generating a new access token in Canvas."
                  width={500}
                  height={300}
                  className="glass-border mt-2 rounded-2xl"
                />
                <Image
                  src="/canvas-guide/generated-token.png"
                  alt="Screenshot of the modal for generating a new access token in Canvas."
                  width={500}
                  height={150}
                  className="glass-border mt-2 rounded-2xl"
                />
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
                className="dark:bg-background bg-background text-foreground placeholder:text-foreground/70"
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
