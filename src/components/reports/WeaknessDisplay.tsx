"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WeaknessSummary } from "@/lib/types/reports/types";

interface WeaknessDisplayProps {
  weakness?: WeaknessSummary | string | null;
  suggestedWeakness?: string | null;
  className?: string;
  badgeClassName?: string;
}

export function WeaknessDisplay({
  weakness,
  suggestedWeakness,
  className,
  badgeClassName,
}: WeaknessDisplayProps) {
  if (suggestedWeakness && suggestedWeakness.trim().length > 0) {
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
        <span className="font-semibold text-foreground tracking-tight">
          {suggestedWeakness.trim()}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shadow-2xs",
            badgeClassName
          )}
        >
          suggested by reporter
        </Badge>
      </span>
    );
  }

  if (weakness) {
    let displayText = "";
    if (typeof weakness === "string") {
      displayText = weakness;
    } else {
      displayText = [weakness.cweId, weakness.name].filter(Boolean).join(" · ");
      if (!displayText) {
        displayText = weakness.name || weakness.cweId || "";
      }
    }

    if (
      displayText.trim().length > 0 &&
      displayText !== "Vulnerability Finding" &&
      displayText !== "CWE-Unclassified"
    ) {
      return (
        <span className={cn("font-semibold text-foreground tracking-tight", className)}>
          {displayText}
        </span>
      );
    }
  }

  return (
    <span className={cn("text-muted-foreground italic font-normal text-sm", className)}>
      Not classified yet
    </span>
  );
}
