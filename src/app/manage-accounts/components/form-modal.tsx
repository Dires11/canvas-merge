import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export function FormModal({
  trigger,
  title,
  description,
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: (controls: { close: () => void }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        data-glass-pointer=""
        overlayClassName="bg-slate-950/10 dark:bg-slate-950/20"
        className="settings-glass max-h-[calc(100dvh-2rem)] gap-3 overflow-y-auto rounded-2xl p-4 sm:max-w-lg sm:gap-4 sm:p-6"
      >
        <DialogHeader className="text-left">
          <DialogTitle className="pr-8 text-xl leading-tight sm:text-2xl">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children({
          close: () => setOpen(false),
        })}
      </DialogContent>
    </Dialog>
  );
}
