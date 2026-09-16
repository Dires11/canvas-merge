import { cn } from "@/lib/utils/cn";
export function GlassContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-glass-pointer=""
      className={cn(
        "glass-border bg-glass/5 relative rounded-2xl p-4 shadow-sm backdrop-blur-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
