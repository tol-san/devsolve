"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Eye,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  FileSearch,
  Building2,
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

const SEVERITY_LABELS: Record<string, string> = {
  All: "Any severity",
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const STATUS_TABS: { value: "All" | "Open" | "Resolved"; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Open", label: "Open" },
  { value: "Resolved", label: "Resolved" },
];

function MyReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialProgram = searchParams.get("program") || searchParams.get("programId") || "All";
  const initialSeverity = searchParams.get("severity") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialStatusParam = searchParams.get("status");
  const initialStatus: "All" | "Open" | "Resolved" =
    initialStatusParam === "SUBMITTED" || initialStatusParam === "TRIAGING" || initialStatusParam === "Open"
      ? "Open"
      : initialStatusParam === "RESOLVED" || initialStatusParam === "ACCEPTED" || initialStatusParam === "Resolved"
      ? "Resolved"
      : "All";

  // Filter state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<"All" | "Open" | "Resolved">(initialStatus);
  const [severityFilter, setSeverityFilter] = useState(initialSeverity);
  const [programFilter, setProgramFilter] = useState(initialProgram);

  // Selected report for modal detail preview
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Unfiltered fetch (separate cache entry) just to drive the header/footer
  // totals, so "Showing X of Y" stays accurate against filters/search.
  const { data: allReports = [] } = useGetReportsQuery();

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

  // RTK Query data fetching with program filter
  const { data: reports = [], isLoading } = useGetReportsQuery({
    search: searchTerm,
    status: activeTab,
    severity: severityFilter,
    program: programFilter,
  });

  const totalSubmissions = allReports.length;
  const totalPrograms = new Set(allReports.map((r) => r.program)).size;
  const displayedCount = reports.length;

  const handleBack = () => {
    router.back();
  };

  const getSeverityBadge = (severity: ReportItem["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            CRITICAL
          </Badge>
        );
      case "HIGH":
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            HIGH
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            MEDIUM
          </Badge>
        );
      case "LOW":
        return (
          <Badge className="bg-slate-500 hover:bg-slate-600 text-white font-semibold text-sm px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-fit shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LOW
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: ReportItem["status"]) => {
    switch (status) {
      case "TRIAGING":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-300 dark:border-amber-500/20 font-semibold text-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            TRIAGING
          </Badge>
        );
      case "RESOLVED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-500/20 font-semibold text-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            RESOLVED
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-500/20 font-semibold text-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            ACCEPTED
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:text-indigo-300 dark:border-indigo-500/20 font-semibold text-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            SUBMITTED
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-200 dark:text-rose-300 dark:border-rose-500/20 font-semibold text-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            REJECTED
          </Badge>
        );
    }
  };

  const getBountyDisplay = (item: ReportItem) => {
    if (item.isBountyHighlight) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 shadow-xs">
          <DollarSign className="w-3.5 h-3.5" />
          {item.bountyOrRep}
        </span>
      );
    }
    if (item.isBountyDim) {
      return <span className="text-sm font-medium text-muted-foreground line-through">{item.bountyOrRep}</span>;
    }
    if (item.bountyOrRep === "Reputation") {
      return (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 dark:text-indigo-300 dark:bg-indigo-500/10 dark:border-indigo-500/20">
          <Award className="w-3.5 h-3.5" />
          Reputation
        </span>
      );
    }
    return <span className="text-sm font-semibold text-foreground">{item.bountyOrRep}</span>;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">My Reports</h1>
          <p className="text-base text-muted-foreground font-medium">
            {totalSubmissions} submission{totalSubmissions === 1 ? "" : "s"} across {totalPrograms} program{totalPrograms === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleBack}
          className="self-start sm:self-auto cursor-pointer rounded-xl bg-card text-foreground hover:bg-muted transition-all gap-2 px-4 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      </header>

      <FilterBar>
        <FilterTabs
          label="Report status"
          value={activeTab}
          onChange={setActiveTab}
          tabs={STATUS_TABS}
        />

        <FilterRow>
          <FilterSearch
            value={searchTerm}
            onChange={setSearchTerm}
            label="Search reports"
            placeholder="Search by ID, program or title..."
          />

          <FilterControls>
            <FilterSelect
              icon={Building2}
              label="Program"
              items={programOptions}
              value={programFilter}
              onValueChange={setProgramFilter}
            />

            <FilterSelect
              icon={Filter}
              label="Severity"
              items={SEVERITY_LABELS}
              value={severityFilter}
              onValueChange={setSeverityFilter}
            />
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
          onClearAll={() => {
            setProgramFilter("All");
            setSeverityFilter("All");
            setSearchTerm("");
          }}
        />
      </FilterBar>

      {/* Data Table Container */}
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
              <TableHead className="py-3.5 px-4 sm:px-6">Bounty/Rep</TableHead>
              <TableHead className="py-3.5 px-4 sm:px-6">
                Last Activity
              </TableHead>
              <TableHead className="py-3.5 px-4 sm:px-6 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={6} columns={8} />
            ) : reports.length === 0 ? (
              <TableEmpty
                colSpan={8}
                icon={FileSearch}
                title="No reports match your filters"
                description="Nothing here fits the search, type, severity or status you picked. Widen one of them to see more."
              />
            ) : (
              reports.map((report, idx) => (
                <MotionTableRow
                  key={report.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="group"
                >
                  {/* Report ID */}
                  <TableCell className="py-4 px-4 sm:px-6">
                    <Link
                      href={`/dashboard/my-reports/${report.id}`}
                      className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline decoration-2 underline-offset-2"
                    >
                      {report.reportId}
                    </Link>
                  </TableCell>

                  {/* Vulnerability & Program */}
                  <TableCell className="py-4 px-4 whitespace-normal sm:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs shrink-0 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
                        <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 rounded-lg">
                          {report.avatarLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <Link href={`/dashboard/my-reports/${report.id}`}>
                          <strong className="text-sm sm:text-base font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                            {report.title}
                          </strong>
                        </Link>
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">
                          {report.program}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="py-4 px-4 sm:px-6">
                    <span className="text-sm font-medium text-muted-foreground">
                      {report.type}
                    </span>
                  </TableCell>

                  {/* Severity */}
                  <TableCell className="py-4 px-4 sm:px-6">
                    {getSeverityBadge(report.severity)}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4 px-4 sm:px-6">
                    {getStatusBadge(report.status)}
                  </TableCell>

                  {/* Bounty/Rep */}
                  <TableCell className="py-4 px-4 sm:px-6">
                    {getBountyDisplay(report)}
                  </TableCell>

                  {/* Last Activity */}
                  <TableCell className="py-4 px-4 sm:px-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-muted-foreground font-medium">
                        {report.lastActivityDate}
                      </span>
                      <span className="text-xs font-bold tracking-wide text-blue-600 dark:text-blue-400 uppercase">
                        {report.lastActivityBadge}
                      </span>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-4 px-4 sm:px-6 text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedReport(report)}
                      aria-label="View Report"
                      className="w-8 h-8 rounded-lg text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </MotionTableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-muted/30">
          <span className="text-sm font-medium text-muted-foreground">
            Showing {displayedCount} of {totalSubmissions} submissions
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 p-0 rounded-lg text-xs font-semibold cursor-pointer ${
                currentPage === 1
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 text-foreground hover:bg-muted"
              }`}
            >
              1
            </Button>
            <Button
              size="sm"
              onClick={() => setCurrentPage(2)}
              className={`w-8 h-8 p-0 rounded-lg text-xs font-semibold cursor-pointer ${
                currentPage === 2
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 text-foreground hover:bg-muted"
              }`}
            >
              2
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-8 h-8 rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </footer>
      </div>

      {/* Report Quick View Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-2xl p-6 max-w-lg w-full shadow-2xl ring-1 ring-foreground/5 dark:ring-foreground/10 space-y-4"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{selectedReport.reportId}</span>
                  <h3 className="text-lg font-bold text-foreground">{selectedReport.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedReport.program}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-full w-8 h-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Severity</span>
                  <div>{getSeverityBadge(selectedReport.severity)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Status</span>
                  <div>{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Type</span>
                  <p className="font-semibold text-foreground">{selectedReport.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Bounty / Rep</span>
                  <div>{getBountyDisplay(selectedReport)}</div>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-muted-foreground">Last Activity</span>
                  <p className="font-semibold text-foreground">
                    {selectedReport.lastActivityDate} — <span className="text-blue-600 dark:text-blue-400">{selectedReport.lastActivityBadge}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={() => router.push(`/dashboard/my-reports/${selectedReport.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs cursor-pointer font-semibold"
                >
                    Full Details
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
