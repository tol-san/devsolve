"use client";

import { AlertTriangle, ArrowUpDown, ShieldCheck, Tag } from "lucide-react";

import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  FilterTabs,
  type ActiveFilter,
} from "@/components/ui/filter-bar";
import type {
  TypeFilter,
  SeverityFilter,
  StatusFilter,
  QueueTabFilter,
  ReportSortOption,
} from "@/hooks/useReportManagement";

type ReportFiltersBarProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  queueTab?: QueueTabFilter;
  onQueueTabChange?: (value: QueueTabFilter) => void;
  queueCounts?: {
    all: number;
    pending: number;
    underReview: number;
    retesting?: number;
    approved: number;
    closed: number;
  };
  sortOption?: ReportSortOption;
  onSortOptionChange?: (value: ReportSortOption) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  severityFilter: SeverityFilter;
  onSeverityFilterChange: (value: SeverityFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  typeCounts: {
    bounty: number;
    response: number;
  };
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  statusCounts: {
    open: number;
    closed: number;
  };
  onClearFilters: () => void;
};

const QUEUE_TABS: {
  key: QueueTabFilter;
  label: string;
  countKey: "all" | "pending" | "underReview" | "retesting" | "approved" | "closed";
}[] = [
  { key: "ALL", label: "All reports", countKey: "all" },
  { key: "PENDING", label: "Pending", countKey: "pending" },
  { key: "UNDER_REVIEW", label: "Under Review", countKey: "underReview" },
  { key: "RETESTING", label: "Retesting", countKey: "retesting" },
  { key: "APPROVED", label: "Approved & Triaged", countKey: "approved" },
  { key: "CLOSED", label: "Closed / Resolved", countKey: "closed" },
];

const SORT_ITEMS: Record<ReportSortOption, string> = {
  NEWEST: "Newest Submitted",
  OLDEST: "Oldest Submitted",
  SEVERITY_DESC: "Highest Severity",
  SEVERITY_ASC: "Lowest Severity",
  TITLE_ASC: "Title (A to Z)",
};

function withCount(label: string, count: number | undefined) {
  return typeof count === "number" ? `${label} (${count})` : label;
}

export function ReportFiltersBar({
  searchTerm,
  onSearchTermChange,
  queueTab = "ALL",
  onQueueTabChange,
  queueCounts,
  sortOption = "NEWEST",
  onSortOptionChange,
  typeFilter,
  onTypeFilterChange,
  severityFilter,
  onSeverityFilterChange,
  statusFilter,
  onStatusFilterChange,
  typeCounts,
  severityCounts,
  statusCounts,
  onClearFilters,
}: ReportFiltersBarProps) {
  const typeItems: Record<string, string> = {
    "All Types": "Any type",
    Bounty: withCount("Bounty", typeCounts.bounty),
    Response: withCount("Response", typeCounts.response),
  };

  const severityItems: Record<string, string> = {
    All: "Any severity",
    Critical: withCount("Critical", severityCounts.critical),
    High: withCount("High", severityCounts.high),
    Medium: withCount("Medium", severityCounts.medium),
    Low: withCount("Low", severityCounts.low),
  };

  const statusItems: Record<string, string> = {
    "All Statuses": "Any status",
    Open: withCount("Open", statusCounts.open),
    Closed: withCount("Closed", statusCounts.closed),
  };

  const activeFilters: ActiveFilter[] = [];

  if (searchTerm.trim()) {
    activeFilters.push({
      key: "search",
      label: `"${searchTerm.trim()}"`,
      clear: () => onSearchTermChange(""),
    });
  }

  if (typeFilter !== "All Types") {
    activeFilters.push({
      key: "type",
      label: `Type: ${typeFilter}`,
      clear: () => onTypeFilterChange("All Types"),
    });
  }

  if (severityFilter !== "All") {
    activeFilters.push({
      key: "severity",
      label: `Severity: ${severityFilter}`,
      clear: () => onSeverityFilterChange("All"),
    });
  }

  if (statusFilter !== "All Statuses") {
    activeFilters.push({
      key: "status",
      label: `Status: ${statusFilter}`,
      clear: () => onStatusFilterChange("All Statuses"),
    });
  }

  if (sortOption !== "NEWEST") {
    activeFilters.push({
      key: "sort",
      label: `Sort: ${SORT_ITEMS[sortOption] ?? sortOption}`,
      clear: () => onSortOptionChange?.("NEWEST"),
    });
  }

  return (
    <FilterBar>
      {onQueueTabChange && queueCounts && (
        <FilterTabs
          label="Report Queue State"
          value={queueTab}
          onChange={onQueueTabChange}
          tabs={QUEUE_TABS.map((tab) => ({
            value: tab.key,
            label: tab.label,
            count: queueCounts[tab.countKey] ?? 0,
          }))}
        />
      )}

      <FilterRow>
        <FilterSearch
          value={searchTerm}
          onChange={onSearchTermChange}
          label="Search reports"
          placeholder="Search by title, report ID (#RPT), researcher, or asset..."
        />

        <FilterControls className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap items-center gap-2 w-full lg:w-auto min-w-0">
          <FilterSelect
            icon={Tag}
            label="Type"
            items={typeItems}
            value={typeFilter}
            onValueChange={(value) => onTypeFilterChange(value as TypeFilter)}
            className="w-full lg:w-auto justify-between lg:justify-start min-w-0"
          />
          <FilterSelect
            icon={AlertTriangle}
            label="Severity"
            items={severityItems}
            value={severityFilter}
            onValueChange={(value) =>
              onSeverityFilterChange(value as SeverityFilter)
            }
            className="w-full lg:w-auto justify-between lg:justify-start min-w-0"
          />
          <FilterSelect
            icon={ShieldCheck}
            label="Status"
            items={statusItems}
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange(value as StatusFilter)
            }
            className="w-full lg:w-auto justify-between lg:justify-start min-w-0"
          />
          {onSortOptionChange && (
            <FilterSelect
              icon={ArrowUpDown}
              label="Sort by"
              items={SORT_ITEMS}
              value={sortOption}
              onValueChange={(value) =>
                onSortOptionChange(value as ReportSortOption)
              }
              className="w-full lg:w-auto justify-between lg:justify-start min-w-0"
            />
          )}
        </FilterControls>
      </FilterRow>

      <ActiveFilters filters={activeFilters} onClearAll={onClearFilters} />
    </FilterBar>
  );
}
