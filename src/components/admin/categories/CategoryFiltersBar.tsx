"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
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
import { CATEGORY_SCOPES } from "@/lib/validations/category";

export type CategoryScopeFilter = "ALL" | (typeof CATEGORY_SCOPES)[number];
export type CategoryStateFilter = "ALL" | "ACTIVE" | "INACTIVE";

interface CategoryCounts {
  all: number;
  active: number;
  inactive: number;
}

interface CategoryFiltersBarProps {
  stateFilter: CategoryStateFilter;
  onStateFilterChange: (state: CategoryStateFilter) => void;
  scopeFilter: CategoryScopeFilter;
  onScopeFilterChange: (scope: CategoryScopeFilter) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  counts: CategoryCounts;
}

const STATE_TABS: {
  key: CategoryStateFilter;
  label: string;
  countKey: keyof CategoryCounts;
}[] = [
  { key: "ALL", label: "All", countKey: "all" },
  { key: "ACTIVE", label: "Active", countKey: "active" },
  { key: "INACTIVE", label: "Inactive", countKey: "inactive" },
];

export function CategoryFiltersBar({
  stateFilter,
  onStateFilterChange,
  scopeFilter,
  onScopeFilterChange,
  searchQuery,
  onSearchQueryChange,
  counts,
}: CategoryFiltersBarProps) {
  const scopeItems: Record<string, string> = {
    ALL: "All scopes",
    ...Object.fromEntries(
      CATEGORY_SCOPES.map((scope) => [
        scope,
        scope.charAt(0) + scope.slice(1).toLowerCase(),
      ]),
    ),
  };

  const activeFilters: ActiveFilter[] = [
    ...(scopeFilter !== "ALL"
      ? [
          {
            key: "scope",
            label: scopeItems[scopeFilter] ?? scopeFilter,
            clear: () => onScopeFilterChange("ALL" as CategoryScopeFilter),
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
        label="Category state"
        value={stateFilter}
        onChange={onStateFilterChange}
        tabs={STATE_TABS.map((tab) => ({
          value: tab.key,
          label: tab.label,
          count: counts[tab.countKey] ?? 0,
        }))}
      />

      <FilterRow>
        <FilterSearch
          value={searchQuery}
          onChange={onSearchQueryChange}
          label="Search categories"
          placeholder="Search name or slug..."
        />

        <FilterControls>
          <FilterSelect
            icon={SlidersHorizontal}
            label="Scope"
            items={scopeItems}
            value={scopeFilter}
            onValueChange={(value) =>
              onScopeFilterChange(value as CategoryScopeFilter)
            }
          />
        </FilterControls>
      </FilterRow>

      <ActiveFilters
        filters={activeFilters}
        onClearAll={() => {
          onScopeFilterChange("ALL" as CategoryScopeFilter);
          onSearchQueryChange("");
        }}
      />
    </FilterBar>
  );
}
