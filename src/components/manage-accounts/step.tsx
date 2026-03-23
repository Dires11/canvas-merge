"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

export function Step({
  currentStep,
  step,
  title,
  children,
  disableNext = false,
  onClick,
}: {
  currentStep: number;
  step: number;
  title: string;
  children: React.ReactNode;
  disableNext?: boolean;
  onClick: (number: number) => void;
}) {
  const completed = currentStep > step;
  const active = currentStep === step;

  return (
    <div
      className={cn(
        completed
          ? "border-green-500/80"
          : active
            ? "border-primary/80"
            : "border-glass",
        "bg-glass/5 relative flex items-center gap-5 overflow-hidden rounded-2xl border px-2 py-2",
      )}
      onClick={() => {
        if (completed) {
          onClick(step);
        }
      }}
      onFocus={() => {
        if (completed) {
          onClick(step);
        }
      }}
      tabIndex={step <= currentStep ? 0 : -1}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full p-2 text-xl font-semibold",
          completed
            ? "bg-green-500 text-white"
            : active
              ? "bg-primary text-primary-foreground"
              : "dark:bg-glass/5 bg-glass/40",
        )}
      >
        {completed ? <Check className="size-5" /> : step}
      </span>
      <div
        className={cn(
          "flex flex-1 gap-2 overflow-hidden transition-all duration-150 ease-in-out",
          active ? "flex-col gap-5 opacity-100" : "opacity-70",
        )}
      >
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {active && children}
        {active && (
          <div className="flex justify-end">
            <Button
              disabled={disableNext}
              className="bg-primary text-primary-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onClick(step + 1);
              }}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
