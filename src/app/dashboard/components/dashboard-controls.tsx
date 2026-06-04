import type {
  CanvasDomainInfo,
  AccountSafeInfo,
  UserCourse,
  Filters,
} from "@/lib/types";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { BookMarked, BrushCleaning, CircleUser, School } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { convertToDark } from "@/lib/utils/colors/colors";
import { cn } from "@/lib/utils";

type Props = {
  accounts: AccountSafeInfo[];
  domains: Record<string, CanvasDomainInfo>;
  courses: UserCourse[];
  filters: Filters;
  onFilterChange: (
    type: keyof Filters,
    value: string,
    pressed: boolean,
  ) => void;
  clearAll: (type?: keyof Filters) => void;
  embedded?: boolean;
};

export function AssignmentDashboardControls({
  accounts,
  domains,
  courses,
  filters,
  onFilterChange,
  clearAll,
  embedded = false,
}: Props) {
  return (
    <div>
      <Menubar
        className={cn(
          "rounded-lg",
          embedded
            ? "h-auto w-auto shrink-0 flex-nowrap gap-1 border-transparent bg-transparent p-0 shadow-none"
            : "bg-glass/10 glass-border px-2 py-5 backdrop-blur-lg",
        )}
      >
        <MenubarMenu>
          <MenubarTrigger
            className={cn(
              embedded &&
                "size-8 justify-center rounded-md border border-slate-300/40 bg-white/40 p-0 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] hover:bg-white/60 sm:size-auto sm:h-8 sm:px-2 sm:py-0 dark:border-white/10 dark:bg-glass/5 dark:shadow-none dark:hover:bg-glass/15",
            )}
          >
            <School className="size-4 sm:mr-2" strokeWidth={1.8} />
            <span className="hidden sm:inline">Domains</span>
          </MenubarTrigger>
          <MenubarContent className="bg-glass/10 glass-border w-64 backdrop-blur-lg">
            <MenubarItem onClick={() => clearAll("domain")}>
              <BrushCleaning strokeWidth={1.5} className="text-foreground" />
              Clear All
            </MenubarItem>

            <MenubarSeparator />

            <MenubarLabel className="text-muted-foreground text-sm">
              <p>Select domains to filter by.</p>
            </MenubarLabel>

            {Object.entries(domains).map(([domainSlug, domain]) => (
              <MenubarCheckboxItem
                key={domainSlug}
                checked={filters.domain.includes(domainSlug)}
                onCheckedChange={(pressed) =>
                  onFilterChange("domain", domainSlug, pressed)
                }
                onSelect={(e) => e.preventDefault()}
              >
                <School className="text-foreground" strokeWidth={1.5} />
                {domain.name}
              </MenubarCheckboxItem>
            ))}
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger
            className={cn(
              embedded &&
                "size-8 justify-center rounded-md border border-slate-300/40 bg-white/40 p-0 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] hover:bg-white/60 sm:size-auto sm:h-8 sm:px-2 sm:py-0 dark:border-white/10 dark:bg-glass/5 dark:shadow-none dark:hover:bg-glass/15",
            )}
          >
            <CircleUser className="size-4 sm:mr-2" strokeWidth={1.8} />
            <span className="hidden sm:inline">Accounts</span>
          </MenubarTrigger>
          <MenubarContent className="bg-glass/10 glass-border max-h-137 w-64 overflow-y-auto backdrop-blur-lg">
            <MenubarItem onClick={() => clearAll("account")}>
              <BrushCleaning strokeWidth={1.5} className="text-foreground" />
              Clear All
            </MenubarItem>

            <MenubarSeparator />

            <MenubarLabel className="text-muted-foreground text-sm">
              <p>Select accounts to filter by.</p>

              {filters.domain.length > 0 && (
                <p className="mt-1 text-xs">
                  Note: Accounts that do not belong to the selected domains are
                  disabled.
                </p>
              )}
            </MenubarLabel>

            {accounts.map((account) => (
              <MenubarCheckboxItem
                key={account.id}
                disabled={
                  filters.domain.length > 0 &&
                  !filters.domain.includes(account.canvasDomain.slug)
                }
                checked={filters.account.includes(account.id)}
                onCheckedChange={(pressed) =>
                  onFilterChange("account", account.id, pressed)
                }
                onSelect={(e) => e.preventDefault()}
              >
                <Avatar className="size-4">
                  <AvatarImage src={account.avatarUrl} alt={account.name} />
                  <AvatarFallback>
                    <CircleUser className="text-foreground" strokeWidth={1.5} />
                  </AvatarFallback>
                </Avatar>
                {account.name}
              </MenubarCheckboxItem>
            ))}
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger
            className={cn(
              embedded &&
                "size-8 justify-center rounded-md border border-slate-300/40 bg-white/40 p-0 text-sm shadow-[0_1px_3px_rgb(15_23_42_/_0.08)] hover:bg-white/60 sm:size-auto sm:h-8 sm:px-2 sm:py-0 dark:border-white/10 dark:bg-glass/5 dark:shadow-none dark:hover:bg-glass/15",
            )}
          >
            <BookMarked className="size-4 sm:mr-2" strokeWidth={1.8} />
            <span className="hidden sm:inline">Courses</span>
          </MenubarTrigger>
          <MenubarContent className="glass-border bg-glass/10 max-h-137 w-70 overflow-y-auto backdrop-blur-lg">
            <MenubarItem onClick={() => clearAll("course")}>
              <BrushCleaning strokeWidth={1.5} className="text-foreground" />
              Clear All
            </MenubarItem>

            <MenubarSeparator />

            <MenubarLabel className="text-muted-foreground text-sm">
              <p>Select courses to filter by.</p>
            </MenubarLabel>

            {courses.map((course) => {
              const dark = convertToDark(course.color);
              const courseValue = `${course.domainSlug}-${course.id}`;

              return (
                <MenubarCheckboxItem
                  key={courseValue}
                  checked={filters.course.includes(courseValue)}
                  onCheckedChange={(pressed) =>
                    onFilterChange("course", courseValue, pressed)
                  }
                  onSelect={(e) => e.preventDefault()}
                  style={
                    {
                      "--c-light": `${course.color.l} ${course.color.c} ${course.color.h}`,
                      "--c-dark": `${dark.l} ${dark.c} ${dark.h}`,
                    } as React.CSSProperties
                  }
                >
                  <BookMarked
                    className="text-[oklch(var(--c-light))] dark:text-[oklch(var(--c-dark))]"
                    strokeWidth={1.5}
                  />
                  {course.course_code}
                </MenubarCheckboxItem>
              );
            })}
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
