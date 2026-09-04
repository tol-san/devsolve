"use client";

import { useMemo, useState, useEffect, useCallback } from "react";

import type {
  ManagedReport,
  ReportStatus,
  ReportSeverity,
  ReportType,
  ReportWorkflowState,
} from "@/components/report-management/types";
import { useGetManagedReportsQuery } from "@/lib/redux/services/reportsApi";

export type TypeFilter = "All Types" | ReportType;
export type SeverityFilter = "All" | ReportSeverity;
export type StatusFilter = "All Statuses" | ReportStatus;
export type QueueTabFilter = "ALL" | "PENDING" | "UNDER_REVIEW" | "RETESTING" | "APPROVED" | "CLOSED";
export type ReportSortOption =
  | "NEWEST"
  | "OLDEST"
  | "SEVERITY_DESC"
  | "SEVERITY_ASC"
  | "TITLE_ASC";

const SEVERITY_WEIGHTS: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function paginateReports(
  reports: ManagedReport[],
  currentPage: number,
  rowsPerPage: number
) {
  const totalPages = Math.max(1, Math.ceil(reports.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;

  return {
    currentPage: safePage,
    totalPages,
    paginatedReports: reports.slice(startIndex, startIndex + rowsPerPage),
  };
}

export function useReportManagement() {
  const {
    data: reports = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetManagedReportsQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All Types");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Statuses");
  const [queueTab, setQueueTab] = useState<QueueTabFilter>("ALL");
  const [sortOption, setSortOption] = useState<ReportSortOption>("NEWEST");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input to avoid recalculating on each keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredReports = useMemo(() => {
    const query = debouncedSearch.toLowerCase();

    let list = reports.filter((report) => {
      const matchesSearch =
        query.length === 0 ||
        report.title.toLowerCase().includes(query) ||
        (report.reportId?.toLowerCase().includes(query) ?? false) ||
        report.author.toLowerCase().includes(query) ||
        report.authorEmail.toLowerCase().includes(query) ||
        report.assets.some((asset) => asset.toLowerCase().includes(query)) ||
        report.summary.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All Types" || report.type === typeFilter;

      const matchesSeverity =
        severityFilter === "All" || report.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All Statuses" || report.status === statusFilter;

      const matchesQueue =
        queueTab === "ALL" ||
        report.queueState === queueTab ||
        (queueTab === "RETESTING" && ((report as any).state === "RETESTING" || report.queueState === "RETESTING")) ||
        (queueTab === "PENDING" && !report.queueState);

      return matchesSearch && matchesType && matchesSeverity && matchesStatus && matchesQueue;
    });

    // Apply sorting
    list.sort((a, b) => {
      switch (sortOption) {
        case "OLDEST": {
          const dateA = a.submittedAtIso ? new Date(a.submittedAtIso).getTime() : 0;
          const dateB = b.submittedAtIso ? new Date(b.submittedAtIso).getTime() : 0;
          return dateA - dateB;
        }
        case "SEVERITY_DESC": {
          const weightA = a.severity ? SEVERITY_WEIGHTS[a.severity] ?? 0 : 0;
          const weightB = b.severity ? SEVERITY_WEIGHTS[b.severity] ?? 0 : 0;
          return weightB - weightA;
        }
        case "SEVERITY_ASC": {
          const weightA = a.severity ? SEVERITY_WEIGHTS[a.severity] ?? 0 : 0;
          const weightB = b.severity ? SEVERITY_WEIGHTS[b.severity] ?? 0 : 0;
          return weightA - weightB;
        }
        case "TITLE_ASC":
          return a.title.localeCompare(b.title);
        case "NEWEST":
        default: {
          const dateA = a.submittedAtIso ? new Date(a.submittedAtIso).getTime() : 0;
          const dateB = b.submittedAtIso ? new Date(b.submittedAtIso).getTime() : 0;
          return dateB - dateA;
        }
      }
    });

    return list;
  }, [reports, debouncedSearch, severityFilter, statusFilter, typeFilter, queueTab, sortOption]);

  const typeCounts = useMemo(() => {
    return {
      all: reports.length,
      bounty: reports.filter((report) => report.type === "Bounty").length,
      response: reports.filter((report) => report.type === "Response").length,
    };
  }, [reports]);

  const severityCounts = useMemo(() => {
    return {
      critical: reports.filter((report) => report.severity === "Critical").length,
      high: reports.filter((report) => report.severity === "High").length,
      medium: reports.filter((report) => report.severity === "Medium").length,
      low: reports.filter((report) => report.severity === "Low").length,
    };
  }, [reports]);

  const statusCounts = useMemo(() => {
    return {
      open: reports.filter((report) => report.status === "Open").length,
      closed: reports.filter((report) => report.status === "Closed").length,
    };
  }, [reports]);

  const queueCounts = useMemo(() => {
    return {
      all: reports.length,
      pending: reports.filter((r) => r.queueState === "PENDING" || !r.queueState).length,
      underReview: reports.filter((r) => r.queueState === "UNDER_REVIEW").length,
      retesting: reports.filter((r) => r.queueState === "RETESTING" || (r as any).state === "RETESTING").length,
      approved: reports.filter((r) => r.queueState === "APPROVED").length,
      closed: reports.filter((r) => r.queueState === "CLOSED" || r.status === "Closed").length,
    };
  }, [reports]);

  const metrics = useMemo(() => {
    return {
      total: reports.length,
      pending: queueCounts.pending,
      underReview: queueCounts.underReview,
      approved: queueCounts.approved,
    };
  }, [reports, queueCounts]);

  const handleMetricClick = useCallback((metricType: "total" | "pending" | "underReview" | "approved") => {
    switch (metricType) {
      case "pending":
        setQueueTab("PENDING");
        break;
      case "underReview":
        setQueueTab("UNDER_REVIEW");
        break;
      case "approved":
        setQueueTab("APPROVED");
        break;
      case "total":
      default:
        setQueueTab("ALL");
        break;
    }
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setTypeFilter("All Types");
    setSeverityFilter("All");
    setStatusFilter("All Statuses");
    setQueueTab("ALL");
    setSortOption("NEWEST");
    setCurrentPage(1);
  }, []);

  const pagination = useMemo(() => {
    return paginateReports(filteredReports, currentPage, rowsPerPage);
  }, [filteredReports, currentPage, rowsPerPage]);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: pagination.totalPages }, (_, index) => index + 1);
  }, [pagination.totalPages]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
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
    setRowsPerPage,
    currentPage: pagination.currentPage,
    setCurrentPage,
    totalCount: reports.length,
    filteredCount: filteredReports.length,
    paginatedReports: pagination.paginatedReports,
    totalPages: pagination.totalPages,
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
  };
}
