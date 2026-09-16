"use client";

import { Settings } from "lucide-react";
import { AppearanceSettings } from "@/components/appearance-settings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className="glass-control hover:bg-glass/20 focus-visible:ring-ring flex size-8 cursor-pointer items-center justify-center rounded-full focus-visible:ring-2"
        >
          <Settings className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent
        data-glass-pointer=""
        overlayClassName="bg-slate-950/10 dark:bg-slate-950/20"
        className="settings-glass max-h-[85dvh] overflow-y-auto rounded-3xl p-6 sm:max-w-xl sm:p-8"
      >
        <DialogHeader className="mb-3 text-left">
          <DialogTitle className="text-2xl">Settings</DialogTitle>
          <DialogDescription className="sr-only">
            Customize the appearance of CanvasMerge.
          </DialogDescription>
        </DialogHeader>
        <AppearanceSettings />
      </DialogContent>
    </Dialog>
  );
}
