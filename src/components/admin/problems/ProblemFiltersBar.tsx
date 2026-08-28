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
import { ProblemStatus } from "@/lib/types/admin/problemAdminTypes";

interface ProblemFiltersBarProps {
  statusFilter: ProblemStatus | "ALL";
  onStatusFilterChange: (status: ProblemStatus | "ALL") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  counts: {
    all: number;
    pendingApproval: number;
    published: number;
    rejected: number;
  };
}

const TABS: {
  key: ProblemStatus | "ALL";
  label: string;
  countKey: keyof ProblemFiltersBarProps["counts"];
}[] = [
  { key: "ALL", label: "All", countKey: "all" },
  {
    key: "PENDING_APPROVAL",
    label: "Pending approval",
    countKey: "pendingApproval",
  },
  { key: "PUBLISHED", label: "Published", countKey: "published" },
  { key: "REJECTED", label: "Rejected", countKey: "rejected" },
];

export const ProblemFiltersBar: React.FC<ProblemFiltersBarProps> = ({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  counts,
}) => {
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
        label="Problem status"
        value={statusFilter}
        onChange={onStatusFilterChange}
        tabs={TABS.map((tab) => ({
          value: tab.key,
          label: tab.label,
          count: counts[tab.countKey] ?? 0,
        }))}
      />

      <FilterRow>
        <FilterSearch
          value={searchQuery}
          onChange={onSearchQueryChange}
          label="Search problems"
          placeholder="Search problem title or author..."
        />
      </FilterRow>

      <ActiveFilters
        filters={activeFilters}
        onClearAll={() => onSearchQueryChange("")}
      />
    </FilterBar>
  );
};
