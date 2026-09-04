"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileCheck, ShieldAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
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
  const { data: reports = [], isLoading, isFetching } = useGetReportConfirmationsQuery();
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
    status: "CONFIRMED" | "REJECTED"
  ) => {
    await updateConfirm({ id: report.id, status });
  };

  const handleDrawerConfirm = async (
    id: string,
    status: "CONFIRMED" | "REJECTED" | "ESCALATED",
    severity: "Critical" | "High" | "Medium" | "Low",
    rewardEstimate: string,
    triageNotes: string
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
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Platform Report Triage & Confirmation
          </h1>
          <p className="text-sm text-muted-foreground">
            Audit submitted vulnerability reports, confirm CVSS severity, verify PoC payloads, and approve escalation to program owners.
          </p>
        </div>

        {counts.pending > 0 && (
          <div className="shrink-0 flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {counts.pending} report{counts.pending > 1 ? "s" : ""} pending triage
            </span>
          </div>
        )}
      </header>

      {/* Metrics Summary Cards */}
      <ReportConfirmationStatCards reports={reports} />

      {/* Filters & Search */}
      <ReportConfirmationFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        counts={counts}
      />

      {/* Reports List Queue */}
      <main className="space-y-3">
        {isLoading || isFetching ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-muted rounded-2xl border border-border"
              />
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="rounded-2xl border border-border bg-card p-12 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground mx-auto flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              No Reports Pending Triage
            </CardTitle>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              There are no vulnerability reports matching your current search or filter criteria.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
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

      {/* Detail Drawer Modal */}
      <ReportConfirmationDetailDrawer
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onConfirm={handleDrawerConfirm}
      />
    </motion.div>
  );
}
