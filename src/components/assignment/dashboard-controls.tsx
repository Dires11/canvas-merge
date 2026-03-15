import type { AccountSafeInfo, UserCourse } from "@/lib/types";
import { GlassContainer } from "../glass-container";
import { Filters } from "./dashboard-client";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  BookMarked,
  BrushCleaning,
  CircleUser,
  School,
  SlidersHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { convertToDark } from "@/lib/colors/colors";

export function AssignmentDashboardControls({
  accounts,
  domains,
  courses,
  filters,
  onFilterChange,
  clearAll,
}: {
  accounts: AccountSafeInfo[];
  domains: string[];
  courses: UserCourse[];
  filters: Filters;
  onFilterChange: (
    type: keyof Filters,
    value: string,
    pressed: boolean,
  ) => void;
  clearAll: (type?: keyof Filters) => void;
}) {
  return (
    <div className="">
      <Menubar className="bg-glass/5 rounded-lg border px-2 py-5">
        <MenubarMenu>
          <MenubarTrigger>
            <School className="mr-2 size-4" strokeWidth={1.8} /> Domains
          </MenubarTrigger>
          <MenubarContent className="w-64 backdrop-blur-lg">
            <MenubarItem onClick={() => clearAll("domain")}>
              <BrushCleaning strokeWidth={1.5} className="text-foreground" />
              Clear All
            </MenubarItem>
            <MenubarSeparator />
            <MenubarLabel className="text-muted-foreground text-sm">
              <p>Select domains to filter by.</p>
            </MenubarLabel>

            {domains.map((domain) => (
              <MenubarCheckboxItem
                key={domain}
                checked={filters.domain.includes(domain)}
                onCheckedChange={(pressed) =>
                  onFilterChange("domain", domain, pressed)
                }
                onSelect={(e) => e.preventDefault()}
              >
                <School className="text-foreground" strokeWidth={1.5} />
                {domain}
              </MenubarCheckboxItem>
            ))}
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            {" "}
            <CircleUser className="mr-2 size-4" strokeWidth={1.8} />
            Accounts
          </MenubarTrigger>
          <MenubarContent className="max-h-137 w-64 overflow-y-auto">
            <MenubarItem onClick={() => clearAll("account")}>
              <BrushCleaning strokeWidth={1.5} className="text-foreground" />
              Clear All
            </MenubarItem>
            <MenubarSeparator />
            <MenubarLabel className="text-muted-foreground text-sm">
              <p>Select accounts to filter by.</p>

              {filters.domain.length > 0 && (
                <>
                  <p className="mt-1 text-xs">
                    Note: Accounts that do not belong to the selected domains
                    are disabled.
                  </p>
                </>
              )}
            </MenubarLabel>
            {accounts.map((account) => (
              <MenubarCheckboxItem
                key={account.id}
                disabled={
                  filters.domain.length > 0 &&
                  !filters.domain.includes(account.domain)
                }
                checked={filters.account.includes(account.id)}
                onCheckedChange={(pressed) =>
                  onFilterChange("account", account.id, pressed)
                }
                onSelect={(e) => e.preventDefault()}
              >
                <Avatar className="size-4">
                  <AvatarImage
                    src={account.avatarUrl}
                    alt={`${account.name}`}
                  />
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
          <MenubarTrigger>
            <BookMarked className="mr-2 size-4" strokeWidth={1.8} /> Courses
          </MenubarTrigger>
          <MenubarContent className="max-h-137 w-70 overflow-y-auto backdrop-blur-lg">
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
              return (
                <MenubarCheckboxItem
                  key={course.id}
                  checked={filters.course.includes(
                    `${course.domain}-${course.id}`,
                  )}
                  onCheckedChange={(pressed) =>
                    onFilterChange(
                      "course",
                      `${course.domain}-${course.id}`,
                      pressed,
                    )
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
