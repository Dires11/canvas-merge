import { cn } from "@/lib/utils/cn";
export function GlassContainer({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
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
