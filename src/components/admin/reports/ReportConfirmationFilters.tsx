"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

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

export type StatusFilterType =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "ESCALATED";
export type SeverityFilterType = "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface ReportConfirmationFiltersProps {
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
  severityFilter: SeverityFilterType;
  onSeverityFilterChange: (sev: SeverityFilterType) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  counts: {
    all: number;
    pending: number;
    confirmed: number;
    rejected: number;
    escalated: number;
  };
}

const SEVERITY_LABELS: Record<string, string> = {
  ALL: "Any severity",
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export function ReportConfirmationFilters({
  statusFilter,
  onStatusFilterChange,
  severityFilter,
  onSeverityFilterChange,
  searchQuery,
  onSearchQueryChange,
  counts,
}: ReportConfirmationFiltersProps) {
  const statusTabs: { value: StatusFilterType; label: string; count: number }[] =
    [
      { value: "ALL", label: "All queue", count: counts.all },
      { value: "PENDING", label: "Pending triage", count: counts.pending },
      { value: "CONFIRMED", label: "Confirmed", count: counts.confirmed },
      { value: "REJECTED", label: "Rejected", count: counts.rejected },
      { value: "ESCALATED", label: "Escalated", count: counts.escalated },
    ];

  const activeFilters: ActiveFilter[] = [
    ...(severityFilter !== "ALL"
      ? [
          {
            key: "severity",
            label: SEVERITY_LABELS[severityFilter],
            clear: () => onSeverityFilterChange("ALL"),
          },
        ]
      : []),
    ...(searchQuery.trim()
      ? [
          {
            key: "search",
            label: `"${searchQuery.trim()}"`,
            clear: () => onSearchQueryChange(""),
          },
        ]
      : []),
  ];

  return (
    <FilterBar>
      <FilterTabs
        label="Confirmation queue"
        value={statusFilter}
        onChange={onStatusFilterChange}
        tabs={statusTabs}
      />

      <FilterRow>
        <FilterSearch
          value={searchQuery}
          onChange={onSearchQueryChange}
          label="Search reports"
          placeholder="Search report, researcher or target..."
        />

        <FilterControls>
          <FilterSelect
            icon={AlertTriangle}
            label="Severity"
            items={SEVERITY_LABELS}
            value={severityFilter}
            onValueChange={(value) =>
              onSeverityFilterChange(value as SeverityFilterType)
            }
          />
        </FilterControls>
      </FilterRow>

      <ActiveFilters
        filters={activeFilters}
        onClearAll={() => {
          onSeverityFilterChange("ALL");
          onSearchQueryChange("");
        }}
      />
    </FilterBar>
  );
}
