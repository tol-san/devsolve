"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { ScanResult, ScanState } from "@/hooks/useVirusTotalScan";
import { cn } from "@/lib/utils";

interface ContentScanStatusProps {
  result?: ScanResult | null;
  active?: boolean;
  fileCount?: number;
  includesLinks?: boolean;
  compact?: boolean;
  isConfigured?: boolean;
  className?: string;
}

export function ContentScanStatus({
  result,
  active = false,
  fileCount = 0,
  includesLinks = false,
  compact = false,
  isConfigured = true,
  className,
}: ContentScanStatusProps) {
  if (!isConfigured || result?.state === "unconfigured") {
    return null;
  }

  if (result) {
    return <ScanResultBadge result={result} compact={compact} className={className} />;
  }

  const subject = [
    fileCount ? `${fileCount} ${fileCount === 1 ? "file" : "files"}` : null,
    includesLinks ? "submitted links" : null,
  ]
    .filter(Boolean)
    .join(" and ");

  return (
    <motion.div
      role={active ? "status" : undefined}
      aria-live={active ? "polite" : undefined}
      initial={active ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border bg-muted/40",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      {active ? (
        <LoaderCircle
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 animate-spin text-primary motion-reduce:animate-none"
        />
      ) : (
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
        />
      )}
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">
          {active ? "Checking for threats…" : "VirusTotal protection enabled"}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {active
            ? `${subject || "Submitted content"} may take up to a minute to scan. Keep this page open.`
            : "Files are scanned before storage. Unsafe files are rejected and never attached."}
        </p>
      </div>
    </motion.div>
  );
}

function ScanResultBadge({
  result,
  compact,
  className,
}: {
  result: ScanResult;
  compact?: boolean;
  className?: string;
}) {
  const { state, target, verdict, stats, message, pollAttempts } = result;

  switch (state) {
    case "validating":
      return (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground",
            compact ? "p-2.5" : "p-3.5",
            className,
          )}
        >
          <LoaderCircle className="size-4 animate-spin text-primary shrink-0" />
          <span>Validating <strong>{target}</strong> format & signatures…</span>
        </div>
      );

    case "submitting":
    case "polling":
      return (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 text-sm text-foreground",
            compact ? "p-2.5" : "p-3.5",
            className,
          )}
        >
          <LoaderCircle className="mt-0.5 size-5 animate-spin text-primary shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">
              Scanning {target} with VirusTotal engines…
            </p>
            <p className="text-xs text-muted-foreground">
              Checking across 70+ security vendors (Attempt {pollAttempts}/3). This may take up to 35 seconds.
            </p>
          </div>
        </div>
      );

    case "clean":
      return (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-950 dark:text-emerald-200",
            compact ? "p-2.5" : "p-3.5",
            className,
          )}
        >
          <CheckCircle2 className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">Scan Clean: No Threats Detected</p>
            <p className="text-xs opacity-90">
              <strong>{target}</strong> passed security analysis ({stats?.harmless ?? stats?.undetected ?? 0} engines reported clean).
            </p>
          </div>
        </div>
      );

    case "suspicious":
      return (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-sm text-amber-950 dark:text-amber-200",
            compact ? "p-2.5" : "p-3.5",
            className,
          )}
        >
          <AlertTriangle className="mt-0.5 size-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">Security Warning: Suspicious Content</p>
            <p className="text-xs opacity-90">
              {message || `Flagged by security engines (${stats?.suspicious ?? 1} suspicious detections).`}
            </p>
          </div>
        </div>
      );

    case "malicious":
      return (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 text-sm text-destructive dark:text-destructive",
            compact ? "p-2.5" : "p-3.5",
            className,
          )}
        >
          <AlertOctagon className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="space-y-0.5">
            <p className="font-semibold">Threat Detected: Malicious Content Rejected</p>
            <p className="text-xs opacity-90">
              {message || `Blocked (${stats?.malicious ?? 0} malicious detections). This item will not be accepted.`}
            </p>
          </div>
        </div>
      );

    case "timed_out":
    case "unscanned":
      return (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border border-border bg-muted/50 text-sm text-muted-foreground",
            compact ? "p-2.5" : "p-3.5",
            className,
          )}
        >
          <Info className="mt-0.5 size-5 text-muted-foreground shrink-0" />
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">Scan Status Unavailable</p>
            <p className="text-xs text-muted-foreground">
              {message || "The security scan could not complete in time. You may still proceed with your submission."}
            </p>
          </div>
        </div>
      );

    case "error":
      return (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive",
            compact ? "p-2.5" : "p-3.5",
            className,
          )}
        >
          <ShieldAlert className="mt-0.5 size-5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">Validation / Scan Error</p>
            <p className="text-xs opacity-90">{message || "Failed to validate or scan content."}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
