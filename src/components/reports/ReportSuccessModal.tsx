"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  Copy,
  Check,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format/datetime";

interface ReportSuccessModalProps {
  isOpen: boolean;
  reportId: string;
  programName: string;
  title: string;
  submittedAt?: string;
  onReset: () => void;
}

export const ReportSuccessModal: React.FC<ReportSuccessModalProps> = ({
  isOpen,
  reportId,
  programName,
  title,
  submittedAt,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReportId = () => {
    if (!reportId) return;
    navigator.clipboard.writeText(reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onReset()}>
      <DialogContent showCloseButton className="sm:max-w-md p-6 sm:p-7 rounded-2xl gap-6">
        {/* Success Checkmark Icon & Clean Header */}
        <DialogHeader className="text-center sm:text-center flex flex-col items-center gap-3">
          <div className="size-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
            <CheckCircle2 className="size-8 stroke-[2]" />
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Report Submitted Successfully
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
              Your vulnerability report has been logged and queued for triaging by the security team.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Clean Info Summary Card */}
        <div className="bg-muted/40 rounded-xl p-4 border border-border/80 text-left space-y-3">
          {/* Report ID */}
          <div className="grid grid-cols-3 gap-2 items-center">
            <span className="text-xs font-semibold text-muted-foreground">
              Report ID
            </span>
            <div className="col-span-2 flex items-center gap-1.5">
              <span className="font-mono text-sm font-semibold text-foreground tracking-tight">
                {reportId || "RPT-2026-88192"}
              </span>
              <button
                type="button"
                onClick={handleCopyReportId}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md cursor-pointer"
                title="Copy Report ID"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Program */}
          <div className="grid grid-cols-3 gap-2 items-center pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground">
              Program
            </span>
            <span className="col-span-2 text-sm font-semibold text-foreground truncate">
              {programName || "Security Program"}
            </span>
          </div>

          {/* Title */}
          <div className="grid grid-cols-3 gap-2 items-start pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground pt-0.5">
              Title
            </span>
            <span className="col-span-2 text-sm font-semibold text-foreground line-clamp-2 leading-snug">
              {title || "Vulnerability Report"}
            </span>
          </div>

          {/* Submitted At */}
          <div className="grid grid-cols-3 gap-2 items-center pt-2 border-t border-border/60">
            <span className="text-xs font-semibold text-muted-foreground">
              Submitted At
            </span>
            <span className="col-span-2 text-sm font-semibold text-foreground truncate">
              {formatDateTime(submittedAt || new Date().toISOString())}
            </span>
          </div>
        </div>

        {/* Dialog Actions */}
        <DialogFooter className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="w-full sm:w-1/2 border-border hover:bg-muted text-foreground font-semibold text-sm h-10 rounded-xl cursor-pointer"
          >
            <PlusCircle className="size-4 mr-1.5 text-muted-foreground" />
            <span>Submit Another</span>
          </Button>

          <Link href="/dashboard/my-reports" className="w-full sm:w-1/2">
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm h-10 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View My Reports</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
