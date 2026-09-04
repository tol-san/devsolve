import React from "react";
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";

interface ReportStatusTrackerProps {
  status?: string;
}

export function ReportStatusTracker({ status = "SUBMITTED" }: ReportStatusTrackerProps) {
  const normalized = status.toUpperCase();

  const isSubmitted = true;
  const isTriaged =
    normalized === "TRIAGING" ||
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
      <div className="pt-3 flex flex-wrap items-center gap-2 sm:gap-3 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>1. Submitted</span>
        </div>
        <div className="hidden sm:block w-3 h-0.5 bg-border" />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>2. Triaged</span>
        </div>
        <div className="hidden sm:block w-3 h-0.5 bg-border" />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-xs font-bold">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>3. Rejected & Closed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-3 flex flex-wrap items-center gap-2 sm:gap-3 border-t border-border">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>1. Submitted</span>
      </div>
      <div className="hidden sm:block w-3 h-0.5 bg-border" />

      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
          isTriaged && normalized !== "TRIAGING"
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
            : normalized === "TRIAGING"
            ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
            : "bg-muted/60 text-muted-foreground border-border font-medium"
        }`}
      >
        {isTriaged && normalized !== "TRIAGING" ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : normalized === "TRIAGING" ? (
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 animate-spin" />
        ) : (
          <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
        )}
        <span>2. Under Triage</span>
      </div>
      <div className="hidden sm:block w-3 h-0.5 bg-border" />

      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
          isAccepted
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
            : "bg-muted/60 text-muted-foreground border-border font-medium"
        }`}
      >
        {isAccepted ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
        )}
        <span>3. Accepted & Validated</span>
      </div>
      <div className="hidden sm:block w-3 h-0.5 bg-border" />

      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
          isResolved
            ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
            : isRetesting
            ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
            : "bg-muted/60 text-muted-foreground border-border font-medium"
        }`}
      >
        {isResolved ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
        ) : isRetesting ? (
          <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 animate-spin" />
        ) : (
          <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
        )}
        <span>{isRetesting ? "4. In Retest Verification" : "4. Resolved"}</span>
      </div>
    </div>
  );
}
