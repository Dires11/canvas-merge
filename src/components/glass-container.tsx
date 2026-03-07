import { cn } from "@/lib/utils";

export function GlassContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-border bg-glass/5 rounded-2xl p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
