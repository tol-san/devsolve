"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { LayoutGrid, List, MoveHorizontal, RefreshCw } from "lucide-react";

import { motion } from "motion/react";

import { RequireOrgPermission } from "@/components/auth/RequireOrgPermission";
import { ManagedReportCard } from "@/components/report-management/ManagedReportCard";
import { ManagedReportGridCard } from "@/components/report-management/ManagedReportGridCard";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
    queueTab,
    setQueueTab,
    sortOption,
    setSortOption,
    rowsPerPage,
    currentPage,
    setCurrentPage,
    filteredCount,
    totalCount,
    paginatedReports,
    totalPages,
    pageNumbers,
    typeCounts,
    severityCounts,
    statusCounts,
    queueCounts,
    metrics,
    handleMetricClick,
    handleClearAllFilters,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useReportManagement();

  const [userViewMode, setUserViewMode] = useState<"table" | "grid" | null>(null);
  const isMobile = useIsMobile();
  const viewMode = userViewMode ?? (isMobile ? "grid" : "table");

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    typeFilter !== "All Types" ||
    severityFilter !== "All" ||
    statusFilter !== "All Statuses" ||
    queueTab !== "ALL" ||
    sortOption !== "NEWEST";

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={pageEnterContainer}
      className="space-y-6 w-full pb-12 min-w-0 max-w-full overflow-hidden"
    >
      <motion.div variants={pageEnterItem}>
        <ReportManagementHeader />
      </motion.div>

      <motion.div variants={pageEnterItem}>
        <ReportMetricsGrid
          metrics={metrics}
          activeQueue={queueTab}
          onMetricClick={handleMetricClick}
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={pageEnterItem} id="report-filters">
        <ReportFiltersBar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          queueTab={queueTab}
          onQueueTabChange={setQueueTab}
          queueCounts={queueCounts}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          severityFilter={severityFilter}
          onSeverityFilterChange={setSeverityFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeCounts={typeCounts}
          severityCounts={severityCounts}
          statusCounts={statusCounts}
          onClearFilters={handleClearAllFilters}
        />
      </motion.div>

      <motion.section variants={pageEnterItem} className="space-y-3 min-w-0 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 p-3 sm:px-5 py-2.5 shadow-xs">
          <p className="text-sm font-medium text-foreground">
            Showing <strong className="font-semibold text-foreground">{filteredCount}</strong> of {totalCount} reports
          </p>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center p-1 bg-muted rounded-xl border border-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUserViewMode("table")}
                title="Table view"
                className={cn(
                  "p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-xs ring-1 ring-foreground/5"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="size-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setUserViewMode("grid")}
                title="Cards view"
                className={cn(
                  "p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-xs ring-1 ring-foreground/5"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="size-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setCurrentPage(1);
                void refetch();
              }}
              className="size-9 rounded-xl border-border bg-card text-muted-foreground shadow-none hover:bg-muted hover:text-foreground cursor-pointer"
              aria-label="Refresh report list"
            >
              <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          viewMode === "table" ? (
            <div className="w-full min-w-0 max-w-full overflow-hidden rounded-[14px] bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs">
              <div className="w-full overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
                <div className="min-w-[860px]">
                  <div className="border-b border-border px-6 py-4">
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
                        className={`px-6 py-5 ${reportListGridClass}`}
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
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5 sm:gap-4.5 min-w-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 animate-pulse p-5 space-y-4"
                />
              ))}
            </div>
          )
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
                onClick={handleClearAllFilters}
                className="mt-5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : viewMode === "table" ? (
          <div className="w-full min-w-0 max-w-full overflow-hidden rounded-[14px] bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-4 py-2 border-b border-border/60 bg-muted/30 lg:hidden">
              <MoveHorizontal className="size-3.5 shrink-0 text-muted-foreground" />
              <span>Scroll horizontally to view all columns</span>
            </div>
            <div className="w-full overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
              <div className="min-w-[860px]">
                <div className="border-b border-border px-6 py-4">
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
              </div>
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
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5 sm:gap-4.5 min-w-0">
              {paginatedReports.map((report, index) => (
                <ManagedReportGridCard
                  key={report.id}
                  report={report}
                  index={index}
                />
              ))}
            </div>

            <div className="rounded-[14px] bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs overflow-hidden">
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
