"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ReportConfirmationItem } from "@/lib/types/admin/types";
import DisputedSeverityPair from "@/components/reports/DisputedSeverityPair";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldAlert,
  Building2,
  User,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  ChevronRight,
} from "lucide-react";

interface ReportConfirmationCardProps {
  report: ReportConfirmationItem;
  onSelect: (report: ReportConfirmationItem) => void;
  onQuickAction?: (report: ReportConfirmationItem, status: "CONFIRMED" | "REJECTED") => void;
}

export function ReportConfirmationCard({
  report,
  onSelect,
  onQuickAction,
}: ReportConfirmationCardProps) {
  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return "bg-rose-500 text-white shadow-2xs";
      case "high":
        return "bg-orange-500 text-white shadow-2xs";
      case "medium":
        return "bg-blue-600 text-white shadow-2xs";
      default:
        return "bg-slate-600 text-white shadow-2xs";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
      case "ESCALATED":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="rounded-2xl border border-border bg-card shadow-2xs hover:shadow-xs transition">
        <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                report.avatarColor ||
                (report.severity === "Critical"
                  ? "bg-rose-500 text-white"
                  : report.severity === "High"
                  ? "bg-orange-500 text-white"
                  : "bg-blue-600 text-white")
              }`}
            >
              {report.researcherName ? report.researcherName.replace("@", "").slice(0, 2).toUpperCase() : "DS"}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                {report.reportCode && (
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    {report.reportCode}
                  </span>
                )}
                <Link
                  href={`/dashboard/report-confirmation/${report.id}`}
                  className="text-base font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {report.title}
                </Link>
                {report.severity ? (
                  <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getSeverityBadge(report.severity)}`}>
                    {report.severity}
                  </Badge>
                ) : (
                  <DisputedSeverityPair
                    reportedSeverity={report.reportedSeverity || report.hackerClaimedSeverity?.tier}
                    triageSeverity={report.triageSeverity || report.companyConfirmedSeverity?.tier}
                    size="sm"
                  />
                )}
                <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(report.status)}`}>
                  {report.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Researcher: <strong className="text-foreground font-semibold">{report.researcherName}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Target: <strong className="text-foreground font-semibold">{report.companyName}</strong>
                </span>
                <span>•</span>
                <span>Category: {report.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  {report.rewardAmount ? `Reward: ${report.rewardAmount}` : `Est: ${report.rewardEstimate}`}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {report.submittedAt}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
            {report.status === "PENDING" && onQuickAction && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onQuickAction(report, "REJECTED")}
                  className="h-9 px-3 rounded-xl border-border text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onQuickAction(report, "CONFIRMED")}
                  className="h-9 px-3 rounded-xl border-border text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Confirm
                </Button>
              </>
            )}

            <Link href={`/dashboard/report-confirmation/${report.id}`}>
              <Button
                className="h-9 px-4 rounded-xl bg-foreground hover:bg-foreground/90 text-background text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Review & Triage
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
