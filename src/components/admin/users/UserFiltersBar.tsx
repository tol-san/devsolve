"use client";

import React from "react";
import { Shield, ArrowUpDown } from "lucide-react";
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

export type StatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "PENDING" | "REMOVED";
export type RoleFilter = "ALL" | "USER" | "COMPANY" | "ADMIN";
export type UserSortOption =
  | "NEWEST"
  | "OLDEST"
  | "REPUTATION_DESC"
  | "REPORTS_DESC"
  | "NAME_ASC"
  | "NAME_DESC";

export interface StatusCounts {
  all: number;
  active: number;
  suspended: number;
  pending?: number;
  removed?: number;
}

interface UserFiltersBarProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  roleFilter?: RoleFilter;
  onRoleFilterChange?: (role: RoleFilter) => void;
  sortOption?: UserSortOption;
  onSortOptionChange?: (sort: UserSortOption) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  statusCounts: StatusCounts;
  onResetAll?: () => void;
}

const STATUS_TABS: {
  key: StatusFilter;
  label: string;
  countKey: keyof StatusCounts;
}[] = [
  { key: "ALL", label: "All users", countKey: "all" },
  { key: "ACTIVE", label: "Active", countKey: "active" },
  { key: "SUSPENDED", label: "Suspended", countKey: "suspended" },
  { key: "PENDING", label: "Pending", countKey: "pending" },
  { key: "REMOVED", label: "Removed", countKey: "removed" },
];

const ROLE_ITEMS: Record<RoleFilter, string> = {
  ALL: "All Roles",
  USER: "Researchers (USER)",
  COMPANY: "Company Reps (COMPANY)",
  ADMIN: "Administrators (ADMIN)",
};

const SORT_ITEMS: Record<UserSortOption, string> = {
  NEWEST: "Newest Joined",
  OLDEST: "Oldest Joined",
  REPUTATION_DESC: "Highest Reputation",
  REPORTS_DESC: "Most Reports",
  NAME_ASC: "Name (A to Z)",
  NAME_DESC: "Name (Z to A)",
};

export function UserFiltersBar({
  statusFilter,
  onStatusFilterChange,
  roleFilter = "ALL",
  onRoleFilterChange,
  sortOption = "NEWEST",
  onSortOptionChange,
  searchQuery,
  onSearchQueryChange,
  statusCounts,
  onResetAll,
}: UserFiltersBarProps) {
  const activeFilters: ActiveFilter[] = [];

  if (searchQuery.trim()) {
    activeFilters.push({
      key: "search",
      label: `"${searchQuery.trim()}"`,
      clear: () => onSearchQueryChange(""),
    });
  }

  if (roleFilter && roleFilter !== "ALL") {
    activeFilters.push({
      key: "role",
      label: `Role: ${ROLE_ITEMS[roleFilter] ?? roleFilter}`,
      clear: () => onRoleFilterChange?.("ALL"),
    });
  }

  if (sortOption && sortOption !== "NEWEST") {
    activeFilters.push({
      key: "sort",
      label: `Sort: ${SORT_ITEMS[sortOption] ?? sortOption}`,
      clear: () => onSortOptionChange?.("NEWEST"),
    });
  }

  const handleClearAll = () => {
    onSearchQueryChange("");
    onRoleFilterChange?.("ALL");
    onSortOptionChange?.("NEWEST");
    if (onResetAll) {
      onResetAll();
    }
  };

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
          placeholder="Search by name, handle, email, country, or ID..."
        />

        <FilterControls>
          {onRoleFilterChange && (
            <FilterSelect
              icon={Shield}
              label="Role"
              items={ROLE_ITEMS}
              value={roleFilter}
              onValueChange={(val) => onRoleFilterChange(val as RoleFilter)}
            />
          )}

          {onSortOptionChange && (
            <FilterSelect
              icon={ArrowUpDown}
              label="Sort by"
              items={SORT_ITEMS}
              value={sortOption}
              onValueChange={(val) => onSortOptionChange(val as UserSortOption)}
            />
          )}
        </FilterControls>
      </FilterRow>

      <ActiveFilters
        filters={activeFilters}
        onClearAll={handleClearAll}
      />
    </FilterBar>
  );
}
