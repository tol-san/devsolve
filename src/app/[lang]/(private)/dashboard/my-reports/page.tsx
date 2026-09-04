"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Eye,
  Plus,
  RotateCcw,
  DollarSign,
  FileSearch,
  Building2,
  ShieldAlert,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Award,
} from "lucide-react";

import { useGetReportsQuery, ReportItem } from "@/lib/redux/services/reportsApi";
import { Button } from "@/components/ui/button";
import {
  MotionTableRow,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  FilterTabs,
} from "@/components/ui/filter-bar";
import StatusBadge from "@/components/reports/StatusBadge";
import SeverityBadge from "@/components/reports/SeverityBadge";
import { ResearcherReportMetrics } from "@/components/reports/ResearcherReportMetrics";
import { ResearcherReportCard } from "@/components/reports/ResearcherReportCard";
import { ReportQuickViewModal } from "@/components/reports/ReportQuickViewModal";
import { ResearcherReportPagination } from "@/components/reports/ResearcherReportPagination";
import { cn } from "@/lib/utils";

const SEVERITY_LABELS: Record<string, string> = {
  All: "Any severity",
  CRITICAL: "Critical (P1)",
  HIGH: "High (P2)",
  MEDIUM: "Medium (P3)",
  LOW: "Low (P4)",
};

const SORT_LABELS: Record<string, string> = {
  latest: "Latest Activity",
  newest: "Newest Submitted",
  oldest: "Oldest Submitted",
  severity: "Severity (Highest)",
  bounty: "Bounty (Highest)",
};

const parseBounty = (val?: string): number => {
  if (!val) return 0;
  const clean = val.replace(/,/g, "");
  const match = clean.match(/\$?(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

function MyReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentTopRef = useRef<HTMLDivElement>(null);

  const initialProgram =
    searchParams.get("program") || searchParams.get("programId") || "All";
  const initialSeverity = searchParams.get("severity") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const initialPageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10);
  const initialStatusParam = searchParams.get("status");
  const initialStatus: "All" | "Retesting" | "Open" | "Resolved" =
    initialStatusParam === "RETESTING" || initialStatusParam === "Retesting"
      ? "Retesting"
      : initialStatusParam === "SUBMITTED" ||
        initialStatusParam === "TRIAGING" ||
        initialStatusParam === "Open"
      ? "Open"
      : initialStatusParam === "RESOLVED" ||
        initialStatusParam === "ACCEPTED" ||
        initialStatusParam === "Resolved"
      ? "Resolved"
      : "All";

  // Filter & Layout state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTab, setActiveTab] =
    useState<"All" | "Retesting" | "Open" | "Resolved">(initialStatus);
  const [severityFilter, setSeverityFilter] = useState(initialSeverity);
  const [programFilter, setProgramFilter] = useState(initialProgram);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selected report for modal detail preview
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Unfiltered fetch just to drive the header/footer totals and metric cards
  const { data: allReports = [], isLoading: isAllLoading } = useGetReportsQuery();

  // Metric counts
  const pendingRetests = useMemo(
    () =>
      allReports.filter(
        (r) => r.status === "RETESTING" || (r as any).rawStatus === "RETESTING"
      ),
    [allReports]
  );
  const retestCount = pendingRetests.length;

  const underTriageReports = useMemo(
    () =>
      allReports.filter(
        (r) =>
          r.status === "TRIAGING" ||
          r.status === "SUBMITTED" ||
          (r as any).rawStatus === "TRIAGING"
      ),
    [allReports]
  );
  const underTriageCount = underTriageReports.length;

  const resolvedReports = useMemo(
    () =>
      allReports.filter(
        (r) =>
          r.status === "RESOLVED" ||
          r.status === "ACCEPTED" ||
          r.status === "REJECTED"
      ),
    [allReports]
  );
  const resolvedCount = resolvedReports.length;

  const statusTabs = useMemo(
    () => [
      { value: "All" as const, label: `All (${allReports.length})` },
      {
        value: "Retesting" as const,
        label: `Retest Requests${retestCount > 0 ? ` (${retestCount})` : ""}`,
      },
      { value: "Open" as const, label: `Open (${underTriageCount})` },
      { value: "Resolved" as const, label: `Resolved (${resolvedCount})` },
    ],
    [allReports.length, retestCount, underTriageCount, resolvedCount]
  );

  // Dynamic program options derived from the user's filed reports
  const programOptions: Record<string, string> = useMemo(() => {
    const options: Record<string, string> = {
      All: "All programs",
    };
    allReports.forEach((r) => {
      if (r.program && !options[r.program]) {
        options[r.program] = r.program;
      }
    });
    if (programFilter !== "All" && !options[programFilter]) {
      options[programFilter] = programFilter;
    }
    return options;
  }, [allReports, programFilter]);

  // RTK Query data fetching with filters
  const { data: reports = [], isLoading } = useGetReportsQuery({
    search: searchTerm,
    status: activeTab,
    severity: severityFilter,
    program: programFilter,
  });

  const totalSubmissions = allReports.length;
  const totalPrograms = new Set(allReports.map((r) => r.program)).size;

  // Client-side sorting on top of query results
  const sortedReports = useMemo(() => {
    const list = [...reports];
    if (sortBy === "latest") {
      return list;
    }
    if (sortBy === "newest") {
      return list.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    if (sortBy === "oldest") {
      return list.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateA - dateB;
      });
    }
    if (sortBy === "severity") {
      const rank: Record<string, number> = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };
      return list.sort(
        (a, b) =>
          ((b.severity ? rank[b.severity] : 0) || 0) -
          ((a.severity ? rank[a.severity] : 0) || 0)
      );
    }
    if (sortBy === "bounty") {
      return list.sort((a, b) => parseBounty(b.bountyOrRep) - parseBounty(a.bountyOrRep));
    }
    return list;
  }, [reports, sortBy]);

  // Pagination calculation
  const totalItems = sortedReports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedReports = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedReports.slice(start, start + pageSize);
  }, [sortedReports, safeCurrentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    contentTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleBack = () => {
    router.back();
  };

  const handleTabChange = (tab: "All" | "Retesting" | "Open" | "Resolved") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setActiveTab("All");
    setProgramFilter("All");
    setSeverityFilter("All");
    setSearchTerm("");
    setSortBy("latest");
    setCurrentPage(1);
  };

  return (
    <motion.section
      ref={contentTopRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">My Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <span>My Vulnerability Reports</span>
            <Badge
              variant="secondary"
              className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              {totalSubmissions} Total
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            Track, manage, and verify all your submitted security findings and bounty payouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <Link href="/dashboard/submit-report">
            <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm h-9.5 px-4 gap-2 shadow-xs cursor-pointer">
              <Plus className="size-4" />
              <span>Submit Vulnerability</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleBack}
            className="rounded-xl bg-card text-foreground hover:bg-muted text-xs sm:text-sm h-9.5 px-3.5 gap-1.5 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </Button>
        </div>
      </header>

      {/* KPI Metrics Strip */}
      <ResearcherReportMetrics
        total={totalSubmissions}
        retestCount={retestCount}
        underTriageCount={underTriageCount}
        resolvedCount={resolvedCount}
        programsCount={totalPrograms}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isLoading={isAllLoading}
      />

      {/* Retest Requests Action Banner for Researcher */}
      {retestCount > 0 && activeTab !== "Retesting" && (
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent p-5 sm:p-6 shadow-xs">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shrink-0 shadow-xs">
                <RotateCcw className="size-6 animate-spin-slow" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground">
                    Retest Verification Requested
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 gap-1"
                  >
                    <Sparkles className="size-2.5" />
                    <span>{retestCount} Pending Verification</span>
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Organizations have deployed remediation fixes for {retestCount === 1 ? "1 of your reports" : `${retestCount} of your reports`} and requested your re-testing validation.
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleTabChange("Retesting")}
              className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs sm:text-sm h-10 px-5 gap-2 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <RotateCcw className="size-4" />
              <span>Review Retest Requests ({retestCount})</span>
            </Button>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <FilterBar>
        <FilterTabs
          label="Report status"
          value={activeTab}
          onChange={handleTabChange}
          tabs={statusTabs}
        />

        <FilterRow>
          <FilterSearch
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            label="Search reports"
            placeholder="Search by ID, program or title..."
          />

          <FilterControls>
            <FilterSelect
              icon={Building2}
              label="Program"
              items={programOptions}
              value={programFilter}
              onValueChange={(val) => {
                setProgramFilter(val);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              icon={ShieldAlert}
              label="Severity"
              items={SEVERITY_LABELS}
              value={severityFilter}
              onValueChange={(val) => {
                setSeverityFilter(val);
                setCurrentPage(1);
              }}
            />

            <FilterSelect
              icon={ArrowUpDown}
              label="Sort by"
              items={SORT_LABELS}
              value={sortBy}
              onValueChange={setSortBy}
            />

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table view"
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-xs ring-1 ring-foreground/5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="size-4" />
                <span className="hidden md:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid cards view"
                className={cn(
                  "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-xs ring-1 ring-foreground/5"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="size-4" />
                <span className="hidden md:inline">Grid</span>
              </button>
            </div>
          </FilterControls>
        </FilterRow>

        <ActiveFilters
          filters={[
            ...(programFilter !== "All"
              ? [
                  {
                    key: "program",
                    label: programOptions[programFilter] ?? programFilter,
                    clear: () => setProgramFilter("All"),
                  },
                ]
              : []),
            ...(severityFilter !== "All"
              ? [
                  {
                    key: "severity",
                    label: SEVERITY_LABELS[severityFilter] ?? severityFilter,
                    clear: () => setSeverityFilter("All"),
                  },
                ]
              : []),
            ...(sortBy !== "latest"
              ? [
                  {
                    key: "sort",
                    label: `Sorted by ${SORT_LABELS[sortBy] || sortBy}`,
                    clear: () => setSortBy("latest"),
                  },
                ]
              : []),
            ...(searchTerm.trim()
              ? [
                  {
                    key: "search",
                    label: `"${searchTerm.trim()}"`,
                    clear: () => setSearchTerm(""),
                  },
                ]
              : []),
          ]}
          onClearAll={handleResetFilters}
        />
      </FilterBar>

      {/* Reports Presentation: Table View or Grid Cards View */}
      {viewMode === "table" ? (
        <div className="bg-card rounded-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-3.5 px-4 sm:px-6">Report ID</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">
                  Vulnerability &amp; Program
                </TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Type</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Severity</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Status</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Bounty / Reward</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6">Last Activity</TableHead>
                <TableHead className="py-3.5 px-4 sm:px-6 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={6} columns={8} />
              ) : paginatedReports.length === 0 ? (
                <TableEmpty
                  colSpan={8}
                  icon={FileSearch}
                  title="No reports match your filters"
                  description="Nothing here fits the search, severity, program, or status you picked. Adjust or clear filters to see more."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFilters}
                      className="rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Reset All Filters
                    </Button>
                  }
                />
              ) : (
                paginatedReports.map((report, idx) => {
                  const isRetesting =
                    report.status === "RETESTING" ||
                    (report as any).rawStatus === "RETESTING";

                  return (
                    <MotionTableRow
                      key={report.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className={cn(
                        "group transition-colors",
                        isRetesting
                          ? "bg-cyan-500/[0.04] hover:bg-cyan-500/[0.08] dark:bg-cyan-500/[0.06] dark:hover:bg-cyan-500/[0.10]"
                          : ""
                      )}
                    >
                      {/* Report ID */}
                      <TableCell className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          {isRetesting && (
                            <span
                              className="size-2 rounded-full bg-cyan-500 animate-ping shrink-0"
                              title="Action Required: Retest Verification"
                            />
                          )}
                          <Link
                            href={`/dashboard/my-reports/${report.id}`}
                            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline decoration-2 underline-offset-2"
                          >
                            {report.reportId}
                          </Link>
                        </div>
                      </TableCell>

                      {/* Vulnerability & Program */}
                      <TableCell className="py-4 px-4 whitespace-normal sm:px-6 max-w-xs">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs shrink-0 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
                            <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 rounded-lg">
                              {report.avatarLetter}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <Link href={`/dashboard/my-reports/${report.id}`}>
                              <strong className="text-sm sm:text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors block">
                                {report.title}
                              </strong>
                            </Link>
                            <span className="text-xs text-muted-foreground truncate">
                              {report.program}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-4 px-4 sm:px-6">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {report.type}
                        </span>
                      </TableCell>

                      {/* Severity */}
                      <TableCell className="py-4 px-4 sm:px-6">
                        <SeverityBadge severity={report.severity} />
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4 px-4 sm:px-6">
                        <StatusBadge status={report.status} />
                      </TableCell>

                      {/* Bounty / Reward */}
                      <TableCell className="py-4 px-4 sm:px-6">
                        {report.isBountyHighlight ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shadow-xs">
                            <DollarSign className="size-3.5" />
                            <span>{report.bountyOrRep}</span>
                          </span>
                        ) : report.bountyOrRep === "Reputation" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold text-indigo-600 bg-indigo-500/10 dark:text-indigo-300 border border-indigo-500/20">
                            <Award className="size-3.5" />
                            <span>Reputation</span>
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-foreground">
                            {report.bountyOrRep}
                          </span>
                        )}
                      </TableCell>

                      {/* Last Activity */}
                      <TableCell className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-muted-foreground font-medium">
                            {report.lastActivityDate}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-bold tracking-wide uppercase",
                              isRetesting
                                ? "text-cyan-600 dark:text-cyan-400 font-extrabold"
                                : "text-blue-600 dark:text-blue-400"
                            )}
                          >
                            {report.lastActivityBadge}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isRetesting && (
                            <Link href={`/dashboard/my-reports/${report.id}`}>
                              <Button
                                size="sm"
                                className="h-8 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs px-2.5 gap-1.5 cursor-pointer shadow-xs"
                              >
                                <RotateCcw className="size-3 animate-spin-slow" />
                                <span>Verify Fix</span>
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelectedReport(report)}
                            aria-label="Quick preview report"
                            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </MotionTableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Reusable, Premium Table Pagination */}
          <ResearcherReportPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      ) : (
        /* Grid Cards View */
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-card ring-1 ring-foreground/5 animate-pulse p-5 space-y-4"
                />
              ))}
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="rounded-2xl bg-card ring-1 ring-foreground/5 p-12 text-center space-y-3">
              <FileSearch className="size-10 mx-auto text-muted-foreground opacity-40" />
              <h3 className="text-base font-bold text-foreground">
                No reports match your filters
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Nothing matches your selected search or filter criteria.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="rounded-xl text-xs font-semibold mt-2 cursor-pointer"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
              {paginatedReports.map((report, idx) => (
                <ResearcherReportCard
                  key={report.id}
                  report={report}
                  index={idx}
                  onQuickView={setSelectedReport}
                />
              ))}
            </div>
          )}

          {/* Grid View Pagination */}
          <ResearcherReportPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            className="rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10"
          />
        </div>
      )}

      {/* Report Quick View Modal */}
      <ReportQuickViewModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </motion.section>
  );
}

export default function MyReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">
          Loading reports...
        </div>
      }
    >
      <MyReportsContent />
    </Suspense>
  );
}
