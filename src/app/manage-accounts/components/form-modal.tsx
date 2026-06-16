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
      <DialogContent className="glass-border dark:bg-glass/10 max-h-[calc(100dvh-2rem)] gap-3 overflow-y-auto rounded-2xl bg-white/45 p-4 shadow-[0_24px_80px_rgb(15_23_42_/_0.22),inset_0_1px_0_rgb(255_255_255_/_0.55)] backdrop-blur-2xl sm:max-w-lg sm:gap-4 sm:p-6 dark:shadow-[0_24px_80px_rgb(0_0_0_/_0.32),inset_0_1px_0_rgb(255_255_255_/_0.08)]">
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
