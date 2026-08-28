"use client";

import React from "react";

import {
  ActiveFilters,
  FilterBar,
  FilterRow,
  FilterSearch,
  FilterTabs,
  type ActiveFilter,
} from "@/components/ui/filter-bar";

export type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "REMOVED";

interface StatusCounts {
  all: number;
  active: number;
  suspended: number;
  removed?: number;
}

interface UserFiltersBarProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  statusCounts: StatusCounts;
}

const STATUS_TABS: {
  key: StatusFilter;
  label: string;
  countKey: keyof StatusCounts;
}[] = [
  { key: "ALL", label: "All users", countKey: "all" },
  { key: "ACTIVE", label: "Active", countKey: "active" },
  { key: "SUSPENDED", label: "Suspended", countKey: "suspended" },
  { key: "REMOVED", label: "Removed", countKey: "removed" },
];

export function UserFiltersBar({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  statusCounts,
}: UserFiltersBarProps) {
  const activeFilters: ActiveFilter[] = searchQuery.trim()
    ? [
        {
          key: "search",
          label: `"${searchQuery.trim()}"`,
          clear: () => onSearchQueryChange(""),
        },
      ]
    : [];

  return (
    <FilterBar>
      <FilterTabs
        label="Account status"
        value={statusFilter}
        onChange={onStatusFilterChange}
        tabs={STATUS_TABS.map((tab) => ({
          value: tab.key,
          label: tab.label,
          count: statusCounts[tab.countKey] ?? 0,
        }))}
      />

      <FilterRow>
        <FilterSearch
          value={searchQuery}
          onChange={onSearchQueryChange}
          label="Search users"
          placeholder="Search by name, username or email..."
        />
      </FilterRow>

      <ActiveFilters
        filters={activeFilters}
        onClearAll={() => onSearchQueryChange("")}
      />
    </FilterBar>
  );
}
