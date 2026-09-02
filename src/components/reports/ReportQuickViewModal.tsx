"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Shield,
  Coins,
  Globe,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ReportItem } from "@/lib/redux/services/reportsApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StatusBadge from "@/components/reports/StatusBadge";
import SeverityBadge from "@/components/reports/SeverityBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportQuickViewModalProps {
  report: ReportItem | null;
  onClose: () => void;
}

export function ReportQuickViewModal({
  report,
  onClose,
}: ReportQuickViewModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const isRetesting =
    report.status === "RETESTING" || (report as any).rawStatus === "RETESTING";
  const retests = report.retestHistory || [];
  const latestRetest = retests.length > 0 ? retests[retests.length - 1] : null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(report.reportId);
    setCopied(true);
    toast.success(`Copied ${report.reportId} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigateDetail = () => {
    onClose();
    router.push(`/dashboard/my-reports/${report.id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-card text-card-foreground rounded-2xl max-w-xl w-full shadow-2xl ring-1 ring-foreground/10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-border bg-muted/20">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Click to copy Report ID"
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold hover:bg-blue-500/20 transition-colors cursor-pointer"
                >
                  <span>{report.reportId}</span>
                  {copied ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3 opacity-60" />
                  )}
                </button>

                {isRetesting && (
                  <Badge
                    variant="outline"
                    className="border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] uppercase gap-1"
                  >
                    <RotateCcw className="size-2.5 animate-spin-slow" />
                    <span>Retest Action Required</span>
                  </Badge>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight line-clamp-2">
                {report.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="size-5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold">
                  <AvatarFallback className="rounded-md">
                    {report.avatarLetter}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground truncate">
                  {report.program}
                </span>
                {report.submittedAt && (
                  <>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl size-8 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            {/* Retest Action Callout Banner */}
            {isRetesting && (
              <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                      <RotateCcw className="size-4 animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Remediation Fix Verification Requested
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Attempt #{latestRetest?.attemptNumber || 1} &bull; Fix deployed by organization
                      </p>
                    </div>
                  </div>

                  {latestRetest?.environment && (
                    <Badge
                      variant="outline"
                      className="border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] uppercase"
                    >
                      {latestRetest.environment}
                    </Badge>
                  )}
                </div>

                {/* Retest Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Number(latestRetest?.bountyReward) > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-semibold text-[11px]">
                      <Coins className="size-3.5 text-emerald-500 shrink-0" />
                      <span>+${Number(latestRetest?.bountyReward).toLocaleString()} Bounty Bonus on verified fix</span>
                    </div>
                  )}
                  {latestRetest?.targetEndpoint && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/80 border border-border text-muted-foreground font-mono text-[11px] truncate">
                      <Globe className="size-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{latestRetest.targetEndpoint}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Severity
                </span>
                <SeverityBadge severity={report.severity} />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Status
                </span>
                <StatusBadge status={report.status} />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Reward
                </span>
                <span className="text-xs font-bold text-foreground block">
                  {report.bountyOrRep}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Type
                </span>
                <span className="text-xs font-semibold text-foreground block">
                  {report.type}
                </span>
              </div>
            </div>

            {/* Activity Metadata */}
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 text-blue-500 shrink-0" />
                <span>Last Activity:</span>
                <strong className="text-foreground">{report.lastActivityDate}</strong>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase tracking-wider border-border bg-background"
              >
                {report.lastActivityBadge}
              </Badge>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-border bg-muted/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs h-9 px-4 cursor-pointer"
            >
              Close
            </Button>
            <Button
              onClick={handleNavigateDetail}
              className={cn(
                "rounded-xl text-xs h-9 px-4 font-semibold gap-1.5 shadow-xs cursor-pointer text-white",
                isRetesting
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isRetesting ? (
                <>
                  <RotateCcw className="size-3.5" />
                  <span>Start Retest Verification</span>
                </>
              ) : (
                <>
                  <span>Full Report &amp; PoC</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
