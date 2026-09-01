"use client";

import { motion } from "motion/react";
import { LoaderCircle, ShieldCheck } from "lucide-react";

interface ContentScanStatusProps {
  active?: boolean;
  fileCount?: number;
  includesLinks?: boolean;
  compact?: boolean;
}

export function ContentScanStatus({
  active = false,
  fileCount = 0,
  includesLinks = false,
  compact = false,
}: ContentScanStatusProps) {
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
      className={`flex items-start gap-3 rounded-xl border border-border bg-muted/40 ${
        compact ? "p-3" : "p-4"
      }`}
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
