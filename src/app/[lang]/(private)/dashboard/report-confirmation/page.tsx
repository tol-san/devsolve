"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FileCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useGetReportConfirmationsQuery,
  useUpdateConfirmReportMutation,
  ReportConfirmationItem,
} from "@/lib/redux/services/adminApi";
import { ReportConfirmationStatCards } from "@/components/admin/reports/ReportConfirmationStatCards";
import {
  ReportConfirmationFilters,
  StatusFilterType,
  SeverityFilterType,
} from "@/components/admin/reports/ReportConfirmationFilters";
import { ReportConfirmationCard } from "@/components/admin/reports/ReportConfirmationCard";
import { ReportConfirmationDetailDrawer } from "@/components/admin/reports/ReportConfirmationDetailDrawer";

export default function ReportConfirmationPage() {
  const { data: reports = [], isLoading, isFetching, refetch } = useGetReportConfirmationsQuery();
  const [updateConfirm] = useUpdateConfirmReportMutation();

  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReportConfirmationItem | null>(null);

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "PENDING").length,
    confirmed: reports.filter((r) => r.status === "CONFIRMED").length,
    rejected: reports.filter((r) => r.status === "REJECTED").length,
    escalated: reports.filter((r) => r.status === "ESCALATED").length,
  };

  const filteredReports = reports.filter((rep) => {
    const matchesStatus = statusFilter === "ALL" || rep.status === statusFilter;
    const matchesSeverity =
      severityFilter === "ALL" ||
      (rep.severity ? rep.severity.toUpperCase() === severityFilter : false);

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      rep.title.toLowerCase().includes(q) ||
      rep.companyName.toLowerCase().includes(q) ||
      rep.researcherName.toLowerCase().includes(q) ||
      (rep.reportCode && rep.reportCode.toLowerCase().includes(q)) ||
      rep.category.toLowerCase().includes(q);

    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const handleQuickAction = async (
    report: ReportConfirmationItem,
    status: "CONFIRMED" | "REJECTED",
  ) => {
    await updateConfirm({ id: report.id, status });
  };

  const handleDrawerConfirm = async (
    id: string,
    status: "CONFIRMED" | "REJECTED" | "ESCALATED",
    severity: "Critical" | "High" | "Medium" | "Low",
    rewardEstimate: string,
    triageNotes: string,
  ) => {
    await updateConfirm({
      id,
      status,
      severity,
      rewardEstimate,
      triageNotes,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div className="space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground"
          >
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <span className="text-border/70">/</span>
            <span className="text-foreground font-semibold">
              Report Confirmation
            </span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Platform Report Triage &amp; Confirmation
          </h1>
          <p className="text-sm text-muted-foreground">
            Audit submitted vulnerability reports, confirm CVSS severity, verify PoC payloads, and approve escalation to program owners.
          </p>
        </div>

        {counts.pending > 0 && (
          <div className="shrink-0 flex items-center gap-2.5 bg-card border border-amber-500/30 rounded-2xl px-4 py-2.5 shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
              {counts.pending} {counts.pending === 1 ? "report requires triage" : "reports require triage"}
            </span>
          </div>
        )}
      </header>

      <ReportConfirmationStatCards reports={reports} />

      <ReportConfirmationFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        counts={counts}
      />

      <main className="space-y-4">
        {isLoading || isFetching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 space-y-3.5 shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10 animate-pulse"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-24 rounded-lg bg-muted" />
                    <div className="h-6 w-28 rounded-lg bg-muted" />
                    <div className="h-6 w-32 rounded-lg bg-muted" />
                  </div>
                  <div className="h-6 w-24 rounded-xl bg-muted" />
                </div>
                <div className="flex items-start gap-4">
                  <div className="size-11 rounded-2xl bg-muted shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-3/4 rounded-md bg-muted" />
                    <div className="h-4 w-1/2 rounded-md bg-muted" />
                  </div>
                </div>
                <div className="pt-2.5 border-t border-border/50 flex items-center justify-between">
                  <div className="h-4 w-36 rounded-md bg-muted" />
                  <div className="h-9 w-32 rounded-xl bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="rounded-2xl border border-border/80 bg-card p-12 text-center space-y-3.5 shadow-2xs ring-1 ring-foreground/5 dark:ring-foreground/10">
            <div className="size-14 rounded-2xl border border-primary/20 bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-2xs">
              <FileCheck className="size-7" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-foreground">
                No Reports Pending Triage
              </CardTitle>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                There are no vulnerability reports matching your current search or filter criteria. All submitted findings have been processed.
              </p>
            </div>
            {(statusFilter !== "ALL" || severityFilter !== "ALL" || searchQuery.trim()) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSeverityFilter("ALL");
                  setSearchQuery("");
                }}
                className="rounded-xl border-border bg-card hover:bg-muted text-xs font-semibold cursor-pointer shadow-2xs mt-2"
              >
                Reset all filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <ReportConfirmationCard
                  key={report.id}
                  report={report}
                  onSelect={(rep) => setSelectedReport(rep)}
                  onQuickAction={handleQuickAction}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <ReportConfirmationDetailDrawer
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onConfirm={handleDrawerConfirm}
      />
    </motion.div>
  );
}
