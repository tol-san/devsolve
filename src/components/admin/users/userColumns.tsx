"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AdminUserItem } from "@/lib/redux/services/adminApi";
import type { ModerationActionType } from "@/lib/types/admin/types";
import { UserStatusBadge } from "./UserStatusBadge";
import { CountryDisplay } from "@/components/shared/CountryDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  UserX,
  ArrowUpDown,
  MoreHorizontal,
  AlertTriangle,
  Trash2,
  Ban,
  RotateCcw,
} from "lucide-react";

const ROLE_OPTIONS: {
  value: "USER" | "COMPANY" | "ADMIN";
  label: string;
}[] = [
  { value: "USER", label: "USER" },
  { value: "COMPANY", label: "COMPANY" },
  { value: "ADMIN", label: "ADMIN" },
];

interface ColumnCallbacks {
  onUpdateStatus?: (id: string, status: "ACTIVE" | "SUSPENDED") => void;
  onModerateUser?: (user: AdminUserItem, actionType?: ModerationActionType) => void;
  /** The signed-in admin, so their own row cannot offer self-moderation. */
  currentUserId?: string;
  onUpdateRole?: (
    id: string,
    role: "USER" | "COMPANY" | "ADMIN" | "MODERATOR"
  ) => void;
}

function UserActionsCell({
  user,
  onModerateUser,
  currentUserId,
}: {
  user: AdminUserItem;
  onModerateUser?: (user: AdminUserItem, actionType?: ModerationActionType) => void;
  currentUserId?: string;
}) {
  const isRemoved = user.status === "REMOVED";
  const isSuspended = user.status === "SUSPENDED";

  // The API rejects moderating yourself (400) or another admin (403). Say so
  // on the row rather than letting an admin click into an error.
  const isSelf = Boolean(currentUserId && user.id === currentUserId);
  const isAdmin = user.role === "ADMIN";

  if (isSelf || isAdmin) {
    return (
      <div className="flex items-center justify-end">
        <span
          title={
            isSelf
              ? "You cannot moderate your own account"
              : "Administrators cannot be moderated from here"
          }
          className="text-xs font-medium text-muted-foreground"
        >
          {isSelf ? "You" : "Admin"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer shadow-2xs">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-56 rounded-2xl border border-border bg-popover text-popover-foreground p-1.5 shadow-lg"
        >
          {onModerateUser && (
            <DropdownMenuGroup className="flex flex-col gap-0.5">
              <DropdownMenuItem
                onClick={() => onModerateUser(user, "WARN")}
                disabled={isRemoved}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400"
              >
                <AlertTriangle className="size-3.5" />
                <span>{isRemoved ? "Warn (user removed)" : "Warn user"}</span>
              </DropdownMenuItem>

              {isSuspended ? (
                <DropdownMenuItem
                  onClick={() => onModerateUser(user, "REINSTATE")}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reinstate account</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => onModerateUser(user, "SUSPEND")}
                  disabled={isRemoved}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-orange-600 dark:text-orange-400"
                >
                  <UserX className="size-3.5" />
                  <span>{isRemoved ? "Suspend (user removed)" : "Suspend account"}</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => onModerateUser(user, "BAN")}
                disabled={isRemoved}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-purple-600 dark:text-purple-400"
              >
                <Ban className="size-3.5" />
                <span>{isRemoved ? "Ban (user removed)" : "Ban user"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onModerateUser(user, "REMOVE")}
                disabled={isRemoved}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span>{isRemoved ? "Remove (already removed)" : "Remove account"}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function getUserColumns({
  onModerateUser,
  currentUserId,
}: ColumnCallbacks): ColumnDef<AdminUserItem>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-bold text-foreground cursor-pointer text-xs uppercase tracking-wider"
        >
          User
          <ArrowUpDown data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original;
        const displayName = user.name || (user as { fullName?: string }).fullName || user.email || "User";
        const initials = displayName
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
          .toUpperCase() || "U";
        return (
          <div className="flex items-center gap-3 py-0.5">
            <Avatar className="size-9 shrink-0 border border-border">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={displayName} />
              )}
              <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </div>
              <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">{user.email}</span>
                {user.country && (
                  <>
                    <span aria-hidden="true">·</span>
                    <CountryDisplay
                      value={user.country}
                      size={12}
                      className="shrink-0"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-bold text-foreground cursor-pointer text-xs uppercase tracking-wider"
        >
          Role
          <ArrowUpDown data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => {
        const role = row.original.role;
        const opt = ROLE_OPTIONS.find((r) => r.value === role) ?? ROLE_OPTIONS[0];
        return (
          <Badge variant="secondary" className="rounded-lg font-semibold text-xs">
            {opt.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-bold text-foreground cursor-pointer text-xs uppercase tracking-wider"
        >
          Status
          <ArrowUpDown data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "reportsSubmitted",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-bold text-foreground cursor-pointer text-xs uppercase tracking-wider"
        >
          Activity
          <ArrowUpDown data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => {
        const u = row.original;
        const reports = u.reportsSubmitted ?? 0;
        const rep = u.reputation ?? 0;
        return (
          <div className="flex flex-col gap-0.5 text-sm">
            <div className="font-semibold text-foreground">
              {reports} report{reports === 1 ? "" : "s"}
            </div>
            <div className="text-muted-foreground text-xs">
              {rep} rep points
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "joinedDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent font-bold text-foreground cursor-pointer text-xs uppercase tracking-wider"
        >
          Joined Date
          <ArrowUpDown data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => {
        const rawDate = row.original.joinedDate;
        let formatted = rawDate;
        if (rawDate && !isNaN(Date.parse(rawDate))) {
          formatted = new Date(rawDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
        }
        return (
          <span className="text-sm font-medium text-muted-foreground">
            {formatted}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right text-xs font-bold text-foreground uppercase tracking-wider">
          Actions
        </div>
      ),
      cell: ({ row }) => (
        <UserActionsCell
          user={row.original}
          onModerateUser={onModerateUser}
          currentUserId={currentUserId}
        />
      ),
    },
  ];
}
