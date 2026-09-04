"use client";

import Link from "next/link";
import { ArrowDownUp, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  FilterTabs,
} from "@/components/ui/filter-bar";
import type { DraftCategory } from "@/components/saved-draft/types";

export type DraftSort = "recent" | "oldest" | "title";

const DRAFT_SORT_LABELS: Record<string, string> = {
  recent: "Recently updated",
  oldest: "Oldest updated",
  title: "Title A-Z",
};

const CATEGORIES: Array<{
  key: DraftCategory;
  label: string;
}> = [
  { key: "all", label: "All" },
  { key: "problem", label: "Problems" },
  { key: "showcase", label: "Showcases" },
  { key: "solution", label: "Solutions" },
  { key: "report", label: "Reports" },
  { key: "program", label: "Programs" },
  { key: "response", label: "Responses" },
];

interface SavedDraftHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: DraftCategory;
  onTabChange: (category: DraftCategory) => void;
  sortBy: DraftSort;
  onSortByChange: (sort: DraftSort) => void;
  isFilterActive: boolean;
  onResetFilters: () => void;
  counts: Record<DraftCategory, number>;
  totalSavedCount: number;
  visibleCount: number;
  visibleTabs: DraftCategory[];
}

export function SavedDraftHeader({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  sortBy,
  onSortByChange,
  isFilterActive,
  onResetFilters,
  counts,
  totalSavedCount,
  visibleCount,
  visibleTabs,
}: SavedDraftHeaderProps) {
  const tabs = CATEGORIES.filter((t) => visibleTabs.includes(t.key));

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center dark:border-neutral-800">
        <div className="flex flex-col gap-1.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-neutral-400"
          >
            <Link
              href="/dashboard"
              className="transition-colors hover:text-slate-900 dark:hover:text-neutral-100"
            >
              Dashboard
            </Link>
            <ChevronRight aria-hidden="true" className="size-3.5" />
            <span className="text-slate-700 dark:text-neutral-200">
              Saved Drafts
            </span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-neutral-100">
            Saved Drafts
          </h1>
          <p className="text-sm text-slate-600 dark:text-neutral-400">
            Manage all your saved drafts across problems, showcases, solutions, programs, and reports.
          </p>
        </div>

        <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
          {visibleCount === totalSavedCount
            ? `${totalSavedCount} saved`
            : `${visibleCount} of ${totalSavedCount} shown`}
        </Badge>
      </header>

      <FilterBar>
        <FilterTabs
          label="Filter drafts by type"
          value={activeTab}
          onChange={onTabChange}
          tabs={tabs.map((tab) => ({
            value: tab.key,
            label: tab.label,
            count: counts[tab.key],
          }))}
        />

        <FilterRow>
          <FilterSearch
            value={searchTerm}
            onChange={onSearchChange}
            label="Search drafts"
            placeholder="Search all saved drafts..."
          />

          <FilterControls>
            <FilterSelect
              icon={ArrowDownUp}
              label="Sort by"
              items={DRAFT_SORT_LABELS}
              value={sortBy}
              onValueChange={(value) => onSortByChange(value as DraftSort)}
            />
          </FilterControls>
        </FilterRow>

        <ActiveFilters
          filters={
            searchTerm.trim()
              ? [
                  {
                    key: "search",
                    label: `"${searchTerm.trim()}"`,
                    clear: () => onSearchChange(""),
                  },
                ]
              : isFilterActive
                ? [
                    {
                      key: "category",
                      label: `Only ${activeTab}`,
                      clear: () => onTabChange("all"),
                    },
                  ]
                : []
          }
          onClearAll={onResetFilters}
        />
      </FilterBar>
    </div>
  );
}

