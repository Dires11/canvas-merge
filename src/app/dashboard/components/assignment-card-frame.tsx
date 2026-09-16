import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { convertToDark } from "@/lib/utils/colors/colors";
import type { UserCourse } from "@/lib/types";

export function AssignmentCardFrame({
  color,
  icon: Icon,
  iconLabel,
  children,
}: {
  color: UserCourse["color"];
  icon: LucideIcon;
  iconLabel: string;
  children: ReactNode;
}) {
  const dark = convertToDark(color);
  return (
    <div
      data-glass-pointer=""
      className="glass-border glass-card-rim relative flex items-stretch gap-4 overflow-hidden rounded-2xl bg-[oklch(var(--c-light)/0.07)] shadow-sm backdrop-blur-lg dark:bg-[oklch(var(--c-dark)/0.06)] dark:backdrop-blur-sm"
      style={
        {
          "--c-light": `${color.l} ${color.c} ${color.h}`,
          "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
        } as CSSProperties
      }
    >
      <div className="liquid-glass-accent flex flex-none items-center justify-center px-2 md:px-5">
        <Icon
          className="relative z-10 size-9 opacity-80 lg:size-10"
          strokeWidth={1.5}
          aria-label={iconLabel}
        />
      </div>
      {children}
    </div>
  );
}
