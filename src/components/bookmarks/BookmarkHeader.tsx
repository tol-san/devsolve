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

export type BookmarkSort = "newest" | "oldest" | "title";

const BOOKMARK_SORT_LABELS: Record<string, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  title: "Title A-Z",
};
import type {
  BookmarkCategory,
  BookmarksResponse,
} from "@/lib/types/bookmarks/types";

interface BookmarkHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: BookmarkCategory;
  onCategoryChange: (category: BookmarkCategory) => void;
  sortBy: BookmarkSort;
  onSortByChange: (sort: BookmarkSort) => void;
  isFilterActive: boolean;
  onResetFilters: () => void;
  counts: BookmarksResponse["counts"];
  totalSavedCount: number;
  visibleCount: number;
}

const CATEGORIES: Array<{
  value: BookmarkCategory;
  label: string;
  countKey: keyof BookmarksResponse["counts"];
}> = [
  { value: "all", label: "All", countKey: "all" },
  { value: "Program", label: "Programs", countKey: "Program" },
  { value: "Problems", label: "Problems", countKey: "Problems" },
  { value: "Solutions", label: "Solutions", countKey: "Solutions" },
  { value: "Showcases", label: "Showcases", countKey: "Showcases" },
];

export function BookmarkHeader({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortByChange,
  isFilterActive,
  onResetFilters,
  counts,
  totalSavedCount,
  visibleCount,
}: BookmarkHeaderProps) {
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
              Bookmarks
            </span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-neutral-100">
            Bookmarks
          </h1>
          <p className="text-sm text-slate-600 dark:text-neutral-400">
            Search and filter your saved programs and community posts.
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
          label="Filter bookmarks by type"
          value={selectedCategory}
          onChange={onCategoryChange}
          tabs={CATEGORIES.map((category) => ({
            value: category.value,
            label: category.label,
            count: counts[category.countKey],
          }))}
        />

        <FilterRow>
          <FilterSearch
            value={searchTerm}
            onChange={onSearchChange}
            label="Search bookmarks"
            placeholder="Search titles and descriptions..."
          />

          <FilterControls>
            <FilterSelect
              icon={ArrowDownUp}
              label="Sort by"
              items={BOOKMARK_SORT_LABELS}
              value={sortBy}
              onValueChange={(value) => onSortByChange(value as BookmarkSort)}
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
                      label: `Only ${selectedCategory}`,
                      clear: () => onCategoryChange("all"),
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
