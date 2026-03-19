"use client";

import { useMemo, useState } from "react";
import { BaseUrlSchema } from "@/lib/schemas/manage-accounts";
import { ExternalLink, School, KeyRound } from "lucide-react";
import { GlassContainer } from "../glass-container";
import Image from "next/image";
import Link from "next/link";
import { Step } from "./step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
export function ConnectAccountGuide({
  onDomainValidated,
}: {
  onDomainValidated?: (domain: string) => void;
}) {
  const [domainInput, setDomainInput] = useState("");
  const [domainName, setDomainName] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const parsed = useMemo(() => {
    return BaseUrlSchema.safeParse(domainInput);
  }, [domainInput]);

  const baseUrl = parsed.success ? parsed.data : null;

  const settingsUrl = baseUrl
    ? `${baseUrl}/profile/settings#:~:text=Approved%20Integrations`
    : null;

  const error = parsed.success ? null : parsed.error?.issues?.[0]?.message;

  return (
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
          disableNext={!baseUrl}
        >
          <FieldGroup className="max-w-100 gap-2 p-2">
            <Field className="gap-0">
              <FieldLabel htmlFor="college-name">
                Please enter your college name:{" "}
              </FieldLabel>
              <Input
                id="college-name"
                placeholder="e.g. CSUN"
                className="dark:bg-background bg-background text-foreground placeholder:text-foreground/70"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
              />
              <FieldDescription>
                This is just for your reference. It can be anything you want.
              </FieldDescription>
            </Field>
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
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
              />
              {domainInput && error && (
                <p className="text-sm text-red-600" aria-live="polite">
                  {error}
                </p>
              )}
              <FieldDescription className="text-sm">
                This should be the URL you use to access Canvas. Make sure it's
                correct so we can guide you to the right settings page in the
                next step!
              </FieldDescription>
            </Field>
          </FieldGroup>
        </Step>

        <Step
          currentStep={currentStep}
          step={2}
          title="Open Canvas Settings"
          onClick={setCurrentStep}
        >
          <div className="max-w-[80%]">
            <p className="text-sm">
              Now that we have your Canvas URL, the next step is to get your
              personal access token from Canvas. Click the button below to
              navigate to the Canvas settings page.
            </p>
            <Button variant="outline" className="mt-2">
              <Link
                href={settingsUrl ?? "#"}
                target="_blank"
                className="inline-flex items-center gap-1"
              >
                Navigate to Canvas Settings
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Step>

        <Step
          currentStep={currentStep}
          step={3}
          title="Generate Access Token"
          onClick={setCurrentStep}
        >
          <div>
            <p className="text-sm">
              Now you should be on the "Approved Integrations" section of your
              Canvas settings. Click the "+ New Access Token" button to generate
              a new token. Make sure to copy the token after it's generated, as
              you won't be able to see it again!
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
          title="Copy Access Token"
          onClick={setCurrentStep}
        >
          <p>
            Copy the generated token and paste it into the token field in the
            next step.
          </p>
        </Step>
      </div>
    </GlassContainer>
  );
}
