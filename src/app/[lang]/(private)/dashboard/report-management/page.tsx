"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";

import { RequireOrgPermission } from "@/components/auth/RequireOrgPermission";
import { ManagedReportCard } from "@/components/report-management/ManagedReportCard";
import { ReportFiltersBar } from "@/components/report-management/ReportFiltersBar";
import { ReportManagementHeader } from "@/components/report-management/ReportManagementHeader";
import { ReportManagementPagination } from "@/components/report-management/ReportManagementPagination";
import { ReportMetricsGrid } from "@/components/report-management/ReportMetricsGrid";
import { reportListGridClass } from "@/components/report-management/report-list-layout";
import { Button } from "@/components/ui/button";
import {
  pageEnterContainer,
  pageEnterItem,
} from "@/components/ui/page-enter-motion";
import { useReportManagement } from "@/hooks/useReportManagement";

function ReportManagementContent() {
  const {
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    rowsPerPage,
    currentPage,
    setCurrentPage,
    filteredCount,
    paginatedReports,
    totalPages,
    pageNumbers,
    typeCounts,
    severityCounts,
    statusCounts,
    metrics,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useReportManagement();
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    typeFilter !== "All Types" ||
    severityFilter !== "All" ||
    statusFilter !== "All Statuses";

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("All Types");
    setSeverityFilter("All");
    setStatusFilter("All Statuses");
    setCurrentPage(1);
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={pageEnterContainer}
      className="space-y-6 w-full pb-12"
    >
      <motion.div variants={pageEnterItem}>
        <ReportManagementHeader />
      </motion.div>

      <motion.div variants={pageEnterItem}>
        <ReportMetricsGrid metrics={metrics} isLoading={isLoading} />
      </motion.div>

      <motion.div variants={pageEnterItem} id="report-filters">
        <ReportFiltersBar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          severityFilter={severityFilter}
          onSeverityFilterChange={setSeverityFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeCounts={typeCounts}
          severityCounts={severityCounts}
          statusCounts={statusCounts}
          showMoreFilters={showMoreFilters}
          onToggleMoreFilters={() => setShowMoreFilters((current) => !current)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      </motion.div>

      <motion.section variants={pageEnterItem} className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-4 sm:px-6 py-3.5 shadow-xs">
          <p className="text-sm font-medium text-foreground">
            Showing {filteredCount} reports
          </p>

          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            onClick={() => {
              setCurrentPage(1);
              void refetch();
            }}
            className="rounded-xl border-border bg-card text-muted-foreground shadow-none hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Refresh report list"
          >
            <RefreshCw className={isFetching ? "animate-spin" : undefined} />
          </Button>
        </div>

        {isLoading ? (
          <div className="overflow-hidden rounded-[14px] bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs">
            <div className="hidden border-b border-border px-6 py-4 lg:block">
              <div className={reportListGridClass}>
                {[
                  { label: "Report", align: "text-left" },
                  { label: "Assets", align: "text-left" },
                  { label: "Type", align: "text-center" },
                  { label: "Status", align: "text-center" },
                  { label: "Severity", align: "text-center" },
                ].map(({ label, align }) => (
                  <span
                    key={label}
                    className={`text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground ${align}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="divide-y divide-border bg-card">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`report-skeleton-${index}`}
                  className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_0.8fr_0.8fr_0.8fr]"
                >
                  <div className="space-y-3">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
                    <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-xs">
            <h3 className="text-xl font-semibold text-foreground">
              We couldn&apos;t load organization reports
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Check your organization access and try fetching the report queue again.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : paginatedReports.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-xs">
            <h3 className="text-xl font-semibold text-foreground">
              No reports match the current filters
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Try changing the search query or clear the selected filters to see more reports.
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[14px] bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs">
            <div className="hidden border-b border-border px-6 py-4 lg:block">
              <div className={reportListGridClass}>
                {[
                  { label: "Report", align: "text-left" },
                  { label: "Assets", align: "text-left" },
                  { label: "Type", align: "text-center" },
                  { label: "Status", align: "text-center" },
                  { label: "Severity", align: "text-center" },
                ].map(({ label, align }) => (
                  <span
                    key={label}
                    className={`text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground ${align}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-card">
              {paginatedReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                >
                  <ManagedReportCard
                    report={report}
                    isLast={index === paginatedReports.length - 1}
                  />
                </motion.div>
              ))}
            </div>

            <div className="border-t border-border">
              <ReportManagementPagination
                rowsPerPage={rowsPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                onPageChange={setCurrentPage}
                filteredCount={filteredCount}
              />
            </div>
          </div>
        )}
      </motion.section>
    </motion.section>
  );
}

/**
 * The company's report queue.
 *
 * Guarded on `VIEW_REPORTS` rather than on being a company account: an invited
 * member with that permission does this work, and the guard wraps the content
 * so its queries do not fire before the answer is in.
 */
export default function ReportManagementPage() {
  return (
    <RequireOrgPermission
      permission="VIEW_REPORTS"
      title="You cannot see this organization's reports"
      description="Reading the report queue needs the “View reports” permission in this organization. If you are a researcher, your own submissions are on your reports screen."
      action={{ href: "/dashboard/my-reports", label: "My reports" }}
    >
      <ReportManagementContent />
    </RequireOrgPermission>
  );
}
