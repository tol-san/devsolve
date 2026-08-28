"use client";

import { AlertTriangle, ShieldCheck, Tag } from "lucide-react";

import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  type ActiveFilter,
} from "@/components/ui/filter-bar";

type TypeFilter = "All Types" | "Bounty" | "Response";
type SeverityFilter = "All" | "Critical" | "High" | "Medium" | "Low";
type StatusFilter = "All Statuses" | "Open" | "Closed";

type ReportFiltersBarProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
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

/**
 * The counts ride in the labels rather than in a badge beside them: a select
 * shows one option at a time, so "Bounty (12)" is the only place the number
 * can be read without opening the menu.
 */
function withCount(label: string, count: number | undefined) {
  return typeof count === "number" ? `${label} (${count})` : label;
}

export function ReportFiltersBar({
  searchTerm,
  onSearchTermChange,
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

  const activeFilters: ActiveFilter[] = [
    ...(typeFilter !== "All Types"
      ? [
          {
            key: "type",
            label: typeFilter,
            clear: () => onTypeFilterChange("All Types"),
          },
        ]
      : []),
    ...(severityFilter !== "All"
      ? [
          {
            key: "severity",
            label: severityFilter,
            clear: () => onSeverityFilterChange("All"),
          },
        ]
      : []),
    ...(statusFilter !== "All Statuses"
      ? [
          {
            key: "status",
            label: statusFilter,
            clear: () => onStatusFilterChange("All Statuses"),
          },
        ]
      : []),
    ...(searchTerm.trim()
      ? [
          {
            key: "search",
            label: `"${searchTerm.trim()}"`,
            clear: () => onSearchTermChange(""),
          },
        ]
      : []),
  ];

  return (
    <FilterBar>
      <FilterRow>
        <FilterSearch
          value={searchTerm}
          onChange={onSearchTermChange}
          label="Search reports"
          placeholder="Search reports..."
        />

        {/* All three are shown rather than folded behind a "more filters"
            toggle: on a triage queue they are the job, not an advanced case. */}
        <FilterControls>
          <FilterSelect
            icon={Tag}
            label="Type"
            items={typeItems}
            value={typeFilter}
            onValueChange={(value) => onTypeFilterChange(value as TypeFilter)}
          />
          <FilterSelect
            icon={AlertTriangle}
            label="Severity"
            items={severityItems}
            value={severityFilter}
            onValueChange={(value) =>
              onSeverityFilterChange(value as SeverityFilter)
            }
          />
          <FilterSelect
            icon={ShieldCheck}
            label="Status"
            items={statusItems}
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange(value as StatusFilter)
            }
          />
        </FilterControls>
      </FilterRow>

      <ActiveFilters filters={activeFilters} onClearAll={onClearFilters} />
    </FilterBar>
  );
}
