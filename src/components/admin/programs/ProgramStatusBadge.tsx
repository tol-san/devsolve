"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusConfig {
  label: string;
  dotColor: string;
  badgeClass?: string;
}

const SUBMISSION_CONFIG: Record<string, StatusConfig> = {
  NOT_SUBMITTED: {
    label: "Not Submitted",
    dotColor: "bg-muted-foreground",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    dotColor: "bg-amber-500",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
  },
  APPROVED: {
    label: "Approved",
    dotColor: "bg-emerald-500",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
  },
  REJECTED: {
    label: "Rejected",
    dotColor: "bg-rose-500",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold",
  },
};

const STATE_CONFIG: Record<string, StatusConfig> = {
  ACTIVE: {
    label: "Active",
    dotColor: "bg-emerald-500",
    badgeClass: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  PAUSED: {
    label: "Paused",
    dotColor: "bg-amber-500",
    badgeClass: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  CLOSED: {
    label: "Closed",
    dotColor: "bg-rose-500",
    badgeClass: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  DRAFT: {
    label: "Draft",
    dotColor: "bg-muted-foreground",
    badgeClass: "border-border bg-muted/40 text-muted-foreground",
  },
};

function StatusChip({ config }: { config: StatusConfig }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold shadow-2xs transition-colors",
        config.badgeClass ?? "border-border bg-card text-foreground",
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-full", config.dotColor)} />
      <span>{config.label}</span>
    </Badge>
  );
}

export function ProgramReviewBadge({ status }: { status: string }) {
  const config = SUBMISSION_CONFIG[status] ?? {
    label: status,
    dotColor: "bg-muted-foreground",
  };
  return <StatusChip config={config} />;
}

export function ProgramStateBadge({ state }: { state: string }) {
  const config = STATE_CONFIG[state] ?? STATE_CONFIG.DRAFT;
  return <StatusChip config={config} />;
}
