"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { cn } from "@/lib/utils";

/**
 * Which organization the company screens are showing.
 *
 * Renders nothing for the great majority of accounts: one organization needs no
 * choosing, and none needs no control. It appears only once an account is
 * genuinely on several — owning one and invited into another, or invited into
 * two — which is the case the workspace used to handle by silently showing the
 * first and pretending the rest did not exist.
 *
 * The choice is remembered, so it survives navigation and reloads.
 */
export function OrganizationSwitcher({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { memberships, membership, hasMultiple, switchOrganization } =
    useCompanyAccess();

  if (!hasMultiple || !membership) return null;

  const name = membership.organizationName?.trim() || "Organization";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Workspace: ${name}. Switch organization`}
        title={collapsed ? name : undefined}
        className={cn(
          "mb-3 flex w-full cursor-pointer items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-left transition-colors hover:bg-muted",
          collapsed && "justify-center px-0",
        )}
      >
        <Building2 className="size-4 shrink-0 text-muted-foreground" />

        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Workspace
              </span>
              <span className="block truncate text-sm font-semibold text-foreground">
                {name}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-64 rounded-xl border-border bg-card p-1 text-card-foreground shadow-md"
      >
        <DropdownMenuLabel className="px-3 py-1.5 text-sm font-semibold text-muted-foreground">
          Your organizations
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-border" />

        {memberships.map((option) => {
          const isActive = option.organizationId === membership.organizationId;

          return (
            <DropdownMenuItem
              key={option.organizationId}
              onClick={() => switchOrganization(option.organizationId)}
              className="cursor-pointer rounded-[10px] px-3 py-2.5 text-foreground focus:bg-muted focus:text-foreground"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {option.organizationName?.trim() || "Organization"}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {option.owner ? "Owner" : (option.role ?? "Member")}
                  {option.organizationStatus !== "ACTIVE"
                    ? ` · ${String(option.organizationStatus).toLowerCase()}`
                    : ""}
                </span>
              </span>
              {isActive ? (
                <Check className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OrganizationSwitcher;
