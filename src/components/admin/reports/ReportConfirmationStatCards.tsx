"use client";

import React from "react";
import { ReportConfirmationItem } from "@/lib/types/admin/types";
import { ShieldAlert, FileCheck, XCircle, Clock } from "lucide-react";

interface ReportConfirmationStatCardsProps {
  reports: ReportConfirmationItem[];
}

export function ReportConfirmationStatCards({ reports }: ReportConfirmationStatCardsProps) {
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;
  const criticalCount = reports.filter(
    (r) => r.severity === "Critical" && r.status === "PENDING"
  ).length;
  const confirmedCount = reports.filter((r) => r.status === "CONFIRMED").length;
  const rejectedCount = reports.filter((r) => r.status === "REJECTED").length;

  const stats = [
    {
      label: "Pending Triage",
      value: pendingCount,
      subtext: "Awaiting security review",
      icon: Clock,
      bgColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200/60 dark:border-amber-900/40",
    },
    {
      label: "Critical Queue",
      value: criticalCount,
      subtext: "High-urgency vulnerabilities",
      icon: ShieldAlert,
      bgColor: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
      borderColor: "border-rose-200/60 dark:border-rose-900/40",
    },
    {
      label: "Confirmed & Forwarded",
      value: confirmedCount,
      subtext: "Approved to program owners",
      icon: FileCheck,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200/60 dark:border-emerald-900/40",
    },
    {
      label: "Rejected / Spam",
      value: rejectedCount,
      subtext: "Invalid submissions",
      icon: XCircle,
      bgColor: "bg-muted text-muted-foreground",
      borderColor: "border-border",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-card border ${item.borderColor} shadow-2xs flex items-center justify-between transition hover:shadow-xs`}
          >
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                {item.label}
              </span>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {item.value}
              </div>
              <p className="text-xs text-muted-foreground">{item.subtext}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
