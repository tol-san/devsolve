"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Scale } from "lucide-react";

interface DisputedSeverityPairProps {
  reportedSeverity?: string | null;
  triageSeverity?: string | null;
  cvssScore?: string | number | null;
  cvssVector?: string | null;
  className?: string;
  size?: "sm" | "md";
}

function getTierStyle(tier?: string | null) {
  const norm = tier ? tier.toUpperCase() : "";
  switch (norm) {
    case "CRITICAL":
      return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "HIGH":
      return "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case "MEDIUM":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "LOW":
      return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function getDotStyle(tier?: string | null) {
  const norm = tier ? tier.toUpperCase() : "";
  switch (norm) {
    case "CRITICAL":
      return "bg-rose-500 animate-pulse";
    case "HIGH":
      return "bg-orange-500";
    case "MEDIUM":
      return "bg-amber-500";
    case "LOW":
      return "bg-blue-500";
    default:
      return "bg-muted-foreground";
  }
}

export function DisputedSeverityPair({
  reportedSeverity,
  triageSeverity,
  cvssScore,
  className,
  size = "md",
}: DisputedSeverityPairProps) {
  const isSm = size === "sm";
  const reportedLabel = reportedSeverity ? reportedSeverity.toUpperCase() : "UNSET";
  const triageLabel = triageSeverity ? triageSeverity.toUpperCase() : "PENDING";

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 shadow-2xs text-center min-w-[150px] sm:min-w-[160px]",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        <Scale className="size-3 text-amber-500 shrink-0" />
        <span>Disputed</span>
      </div>

      <Badge
        variant="outline"
        className={cn(
          "w-full justify-center font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap",
          isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
          getTierStyle(reportedSeverity),
        )}
      >
        <span className={cn("size-1.5 rounded-full shrink-0", getDotStyle(reportedSeverity))} />
        <span className="font-normal opacity-90">Researcher:</span>
        <strong className="font-extrabold tracking-wide">{reportedLabel}</strong>
        {cvssScore && <span className="font-mono text-[9px] opacity-80">({cvssScore})</span>}
      </Badge>

      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 text-center select-none leading-none">
        vs
      </span>

      <Badge
        variant="outline"
        className={cn(
          "w-full justify-center font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap",
          isSm ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
          getTierStyle(triageSeverity),
        )}
      >
        <span className={cn("size-1.5 rounded-full shrink-0", getDotStyle(triageSeverity))} />
        <span className="font-normal opacity-90">Organization:</span>
        <strong className="font-extrabold tracking-wide">{triageLabel}</strong>
      </Badge>
    </div>
  );
}

export default DisputedSeverityPair;

