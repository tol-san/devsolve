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
import type { ShowcaseReviewStatus } from "@/lib/validations/showcase";

interface ShowcaseFiltersBarProps {
  statusFilter: ShowcaseReviewStatus | "ALL";
  onStatusChange: (status: ShowcaseReviewStatus | "ALL") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
}

const STATUS_TABS: { value: ShowcaseReviewStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "Pending review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All submissions" },
];

export function ShowcaseFiltersBar({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onReset,
}: ShowcaseFiltersBarProps) {
  /* The queue is where this screen starts, so only the search counts as a
     filter laid over it. */
  const activeFilters: ActiveFilter[] = searchQuery.trim()
    ? [
        {
          key: "search",
          label: `"${searchQuery.trim()}"`,
          clear: () => onSearchChange(""),
        },
      ]
    : [];

  return (
    <FilterBar>
      <FilterTabs
        label="Review status"
        value={statusFilter}
        onChange={onStatusChange}
        tabs={STATUS_TABS}
      />

      <FilterRow>
        <FilterSearch
          value={searchQuery}
          onChange={onSearchChange}
          label="Search showcases"
          placeholder="Search by title, author or category..."
        />
      </FilterRow>

      <ActiveFilters filters={activeFilters} onClearAll={onReset} />
    </FilterBar>
  );
}
