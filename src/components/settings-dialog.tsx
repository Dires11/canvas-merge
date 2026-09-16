"use client";

import { GradesSettings } from "@/components/grades-settings";
import { AssignmentWindowSettings } from "@/components/assignment-window-settings";
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
          data-glass-pointer=""
          className="glass-control group relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ease-out hover:bg-background/30 dark:hover:bg-glass/15 focus-visible:ring-ring focus-visible:ring-2"
        >
          <Settings className="text-foreground/70 size-4 -rotate-6 stroke-[2] transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-foreground" />
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
        <AssignmentWindowSettings />
        <GradesSettings />
      </DialogContent>
    </Dialog>
  );
}
