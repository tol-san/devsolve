"use client";

import React from "react";
import { CheckCircle2, Clock3, MinusCircle, ShieldOff, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_BADGE_CLASS, STATUS_LABEL } from "@/lib/researchers/access";
import type { ResearcherAccessStatus } from "@/lib/validations/researcher-access";

const STATUS_ICON = {
  PENDING: Clock3,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  REVOKED: MinusCircle,
} as const;

export function ResearcherAccessBadge({
  status,
  className,
}: {
  status: ResearcherAccessStatus | null;
  className?: string;
}) {
  if (status === null) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "h-7 gap-1.5 rounded-full border-border bg-muted px-2.5 text-sm font-semibold text-muted-foreground",
          className,
        )}
      >
        <ShieldOff aria-hidden />
        Not requested
      </Badge>
    );
  }

  const Icon = STATUS_ICON[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-7 gap-1.5 rounded-full px-2.5 text-sm font-semibold",
        STATUS_BADGE_CLASS[status],
        className,
      )}
    >
      <Icon aria-hidden />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export default ResearcherAccessBadge;
