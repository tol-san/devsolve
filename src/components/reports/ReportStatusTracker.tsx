"use client";

import React from "react";
import { CheckCircle2, Circle, Clock, XCircle, ShieldCheck, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportStatusTrackerProps {
  status?: string;
  className?: string;
}

export function ReportStatusTracker({
  status = "SUBMITTED",
  className,
}: ReportStatusTrackerProps) {
  const normalized = status.toUpperCase();

  const isSubmitted = true;
  const isUnderReview =
    normalized === "SUBMITTED" ||
    normalized === "NEW" ||
    normalized === "TRIAGING";
  const isTriaged =
    normalized === "ACCEPTED" ||
    normalized === "VALID_CONFIRMED" ||
    normalized === "RETESTING" ||
    normalized === "RESOLVED" ||
    normalized === "REJECTED";
  const isAccepted =
    normalized === "ACCEPTED" ||
    normalized === "VALID_CONFIRMED" ||
    normalized === "RETESTING" ||
    normalized === "RESOLVED";
  const isRetesting = normalized === "RETESTING";
  const isResolved = normalized === "RESOLVED";
  const isRejected = normalized === "REJECTED";

  if (isRejected) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
        {/* Step 1: Submitted */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold shadow-2xs">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>1. Submitted</span>
        </div>
        <div className="hidden sm:block w-4 h-0.5 rounded-full bg-emerald-500/40" />

        {/* Step 2: Triaged */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold shadow-2xs">
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>2. Triaged</span>
        </div>
        <div className="hidden sm:block w-4 h-0.5 rounded-full bg-rose-500/40" />

        {/* Step 3: Rejected */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25 text-xs font-bold shadow-2xs">
          <XCircle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>3. Rejected & Closed</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      {/* Step 1: Submitted */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-xs font-bold shadow-2xs">
        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>1. Submitted</span>
      </div>
      <div
        className={cn(
          "hidden sm:block w-4 h-0.5 rounded-full transition-colors",
          isTriaged ? "bg-emerald-500/40" : "bg-primary/30",
        )}
      />

      {/* Step 2: Under Triage */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
          isTriaged
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 shadow-2xs"
            : isUnderReview
              ? "bg-primary/10 text-primary border-primary/30 ring-2 ring-primary/20 shadow-xs"
              : "bg-muted/40 text-muted-foreground border-border/80 font-medium",
        )}
      >
        {isTriaged ? (
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : isUnderReview ? (
          <Clock className="size-3.5 text-primary shrink-0 animate-spin-slow" />
        ) : (
          <Circle className="size-3 text-muted-foreground shrink-0" />
        )}
        <span>2. Under Triage</span>
      </div>
      <div
        className={cn(
          "hidden sm:block w-4 h-0.5 rounded-full transition-colors",
          isAccepted ? "bg-emerald-500/40" : "bg-border",
        )}
      />

      {/* Step 3: Accepted & Validated */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
          isAccepted
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 shadow-2xs"
            : "bg-muted/40 text-muted-foreground border-border/80 font-medium",
        )}
      >
        {isAccepted ? (
          <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <Circle className="size-3 text-muted-foreground/60 shrink-0" />
        )}
        <span>3. Accepted & Validated</span>
      </div>
      <div
        className={cn(
          "hidden sm:block w-4 h-0.5 rounded-full transition-colors",
          isResolved ? "bg-purple-500/40" : isRetesting ? "bg-cyan-500/40" : "bg-border",
        )}
      />

      {/* Step 4: Resolved / Retest */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
          isResolved
            ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25 shadow-2xs"
            : isRetesting
              ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 shadow-2xs"
              : "bg-muted/40 text-muted-foreground border-border/80 font-medium",
        )}
      >
        {isResolved ? (
          <Award className="size-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
        ) : isRetesting ? (
          <Clock className="size-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 animate-spin-slow" />
        ) : (
          <Circle className="size-3 text-muted-foreground/60 shrink-0" />
        )}
        <span>{isRetesting ? "4. In Retest" : "4. Resolved"}</span>
      </div>
    </div>
  );
}

export default ReportStatusTracker;
