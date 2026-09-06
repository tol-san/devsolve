"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutGrid, LayoutList } from "lucide-react";
import type {
  DiscussionCategory,
  DiscussionSort,
} from "@/lib/types/dicussion/types";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: DiscussionCategory; key: string }[] = [
  { value: "All", key: "all" },
  { value: "Problems", key: "problems" },
  { value: "Showcase", key: "showcase" },
];

const SORT_OPTIONS: { value: DiscussionSort; key: string }[] = [
  { value: "newest", key: "newest" },
  { value: "trending", key: "trending" },
  { value: "top", key: "top" },
  { value: "discussed", key: "discussed" },
  { value: "viewed", key: "viewed" },
  { value: "oldest", key: "oldest" },
];

interface DiscussionCategoryTabsProps {
  selected: DiscussionCategory;
  onSelect: (category: DiscussionCategory) => void;
  sort: DiscussionSort;
  onSortChange: (sort: DiscussionSort) => void;
  totalCount: number;
  isLoading?: boolean;
  viewMode?: "list" | "card";
  onViewModeChange?: (mode: "list" | "card") => void;
}

export function DiscussionCategoryTabs({
  selected,
  onSelect,
  sort,
  onSortChange,
  totalCount,
  isLoading = false,
  viewMode = "list",
  onViewModeChange,
}: DiscussionCategoryTabsProps) {
  const t = useT();

  return (
    <div className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl bg-card p-2 sm:p-2.5 shadow-xs ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label={t("community.tabs.label")}
        className="grid grid-cols-3 gap-1 rounded-xl sm:rounded-2xl bg-muted/60 p-1"
      >
        {CATEGORIES.map(({ value, key }) => {
          const isActive = selected === value;

          return (
            <button
              key={value}
              id={`discussion-tab-${value.toLowerCase()}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onSelect(value)}
              className="relative rounded-lg sm:rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 cursor-pointer"
            >
              {isActive && (
                <motion.span
                  layoutId="active-discussion-category"
                  className="absolute inset-0 rounded-lg sm:rounded-xl bg-primary shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span
                className={cn(
                  "relative transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`community.tabs.${key}`)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 px-1 sm:justify-end">
        <AnimatePresence mode="wait">
          {isLoading && totalCount === 0 ? (
            <motion.div
              key="loading-count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-5 w-18 animate-pulse rounded-md bg-muted"
            />
          ) : (
            <motion.p
              key={totalCount}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              aria-live="polite"
              className="text-xs sm:text-sm font-medium text-muted-foreground"
            >
              <span className="font-bold tabular-nums text-foreground">
                {totalCount}
              </span>{" "}
              {totalCount === 1
                ? t("community.result")
                : t("community.results")}
            </motion.p>
          )}
        </AnimatePresence>

        <Select
          value={sort}
          onValueChange={(value) =>
            value && onSortChange(value as DiscussionSort)
          }
        >
          <SelectTrigger
            id="discussions-sort"
            aria-label={t("community.sort.label")}
            className="h-9 min-w-36 rounded-xl border border-border/80 bg-card text-xs sm:text-sm font-semibold shadow-2xs hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectGroup>
              {SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs sm:text-sm font-medium"
                >
                  {t(`community.sort.${option.key}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {onViewModeChange && (
          <div
            role="group"
            aria-label="View mode"
            className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5 shadow-2xs"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onViewModeChange("list")}
              aria-pressed={viewMode === "list"}
              aria-label="List view"
              title="List view"
              className={cn(
                "h-8 w-8 rounded-lg transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-card text-foreground shadow-xs font-semibold ring-1 ring-foreground/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <LayoutList className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onViewModeChange("card")}
              aria-pressed={viewMode === "card"}
              aria-label="Card view"
              title="Card view"
              className={cn(
                "h-8 w-8 rounded-lg transition-all cursor-pointer",
                viewMode === "card"
                  ? "bg-card text-foreground shadow-xs font-semibold ring-1 ring-foreground/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <LayoutGrid className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
