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
import type { OrganizationVerificationFilter } from "@/lib/types/admin/types";

interface OrganizationFiltersBarProps {
  statusFilter: OrganizationVerificationFilter;
  onStatusFilterChange: (status: OrganizationVerificationFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

const TABS: {
  key: OrganizationVerificationFilter;
  label: string;
  countKey: keyof OrganizationFiltersBarProps["counts"];
}[] = [
  { key: "ALL", label: "All", countKey: "all" },
  { key: "PENDING", label: "Pending KYC", countKey: "pending" },
  { key: "APPROVED", label: "Approved", countKey: "approved" },
  { key: "REJECTED", label: "Rejected", countKey: "rejected" },
];

export const OrganizationFiltersBar: React.FC<OrganizationFiltersBarProps> = ({
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
        label="Verification status"
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
          label="Search organizations"
          placeholder="Search name, owner or website..."
        />
      </FilterRow>

      <ActiveFilters
        filters={activeFilters}
        onClearAll={() => onSearchQueryChange("")}
      />
    </FilterBar>
  );
};
