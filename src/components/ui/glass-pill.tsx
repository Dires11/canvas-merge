import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shared glass surface for filter pills and popover triggers. */
export function GlassPill({
  active = false,
  className,
  size = "xs",
  ...props
}: Omit<ComponentProps<typeof Button>, "variant"> & { active?: boolean }) {
  return (
    <Button
      {...props}
      size={size}
      variant={active ? "default" : "outline"}
      className={cn(
        "glass-control relative h-7 rounded-full px-2.5 text-xs",
        active
          ? "text-white"
          : "data-[state=open]:bg-glass/20 data-[state=open]:text-accent-foreground dark:bg-glass/5 dark:hover:bg-glass/15 dark:data-[state=open]:bg-glass/20 border-slate-300/35 bg-white/35 shadow-[0_1px_2px_rgb(15_23_42_/_0.06)] hover:bg-white/55 dark:border-white/10 dark:shadow-none",
        className,
      )}
    />
  );
}
