"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type UserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "BANNED"
  | "BAN"
  | "PENDING"
  | "REMOVED"
  | "WARNED";

interface StatusConfig {
  label: string;
  dotColor: string;
  badgeClass: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  ACTIVE: {
    label: "Active",
    dotColor: "bg-emerald-500",
    badgeClass:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  SUSPENDED: {
    label: "Suspended",
    dotColor: "bg-orange-500",
    badgeClass:
      "border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-400",
  },
  BANNED: {
    label: "Banned",
    dotColor: "bg-purple-500",
    badgeClass:
      "border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-400",
  },
  BAN: {
    label: "Banned",
    dotColor: "bg-purple-500",
    badgeClass:
      "border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-400",
  },
  WARNED: {
    label: "Warned",
    dotColor: "bg-amber-500",
    badgeClass:
      "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  PENDING: {
    label: "Pending",
    dotColor: "bg-amber-500",
    badgeClass:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  REMOVED: {
    label: "Removed",
    dotColor: "bg-muted-foreground",
    badgeClass: "border-border bg-muted/60 text-muted-foreground",
  },
};

export function getUserStatusConfig(status?: string | null): StatusConfig {
  const normalized = (status || "").toUpperCase();
  return (
    STATUS_CONFIG[normalized] ?? {
      label: status || "Active",
      dotColor: "bg-emerald-500",
      badgeClass:
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    }
  );
}

interface UserStatusBadgeProps {
  status?: string | null;
  className?: string;
  size?: "xs" | "sm" | "default";
}

export function UserStatusBadge({
  status,
  className,
  size = "default",
}: UserStatusBadgeProps) {
  const config = getUserStatusConfig(status);
  const sizeClasses =
    size === "xs"
      ? "text-[10px] px-1.5 py-0.5 gap-1 rounded-md"
      : size === "sm"
      ? "text-xs px-2 py-0.5 gap-1.5 rounded-lg"
      : "text-xs px-2.5 py-1 gap-2 rounded-xl";

  const dotSize = size === "xs" ? "size-1.5" : "size-2";

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center font-bold tracking-wide select-none transition-colors",
        config.badgeClass,
        sizeClasses,
        className
      )}
    >
      <span className={cn("rounded-full shrink-0", dotSize, config.dotColor)} />
      <span>{config.label}</span>
    </Badge>
  );
}

