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
import type {
  DiscussionCategory,
  DiscussionSort,
} from "@/lib/types/dicussion/types";
import { useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/* `value` is the API vocabulary the query is built from; `key` is the
   catalogue branch the visible label comes from. */
const CATEGORIES: { value: DiscussionCategory; key: string }[] = [
  { value: "All", key: "all" },
  { value: "Problems", key: "problems" },
  { value: "Showcase", key: "showcase" },
];

const SORT_OPTIONS: { value: DiscussionSort; key: string }[] = [
  { value: "newest", key: "newest" },
  { value: "oldest", key: "oldest" },
  { value: "top", key: "top" },
  { value: "discussed", key: "discussed" },
  { value: "viewed", key: "viewed" },
];

interface DiscussionCategoryTabsProps {
  selected: DiscussionCategory;
  onSelect: (category: DiscussionCategory) => void;
  sort: DiscussionSort;
  onSortChange: (sort: DiscussionSort) => void;
  totalCount: number;
}

export function DiscussionCategoryTabs({
  selected,
  onSelect,
  sort,
  onSortChange,
  totalCount,
}: DiscussionCategoryTabsProps) {
  const t = useT();

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-2 shadow-xs ring-1 ring-foreground/5 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label={t("community.tabs.label")}
        className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1"
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
              className="relative rounded-lg px-3 py-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5 sm:text-base"
            >
              {isActive && (
                <motion.span
                  layoutId="active-discussion-category"
                  className="absolute inset-0 rounded-lg bg-primary shadow-xs"
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
          <motion.p
            key={totalCount}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            aria-live="polite"
            className="text-sm font-medium text-muted-foreground"
          >
            <span className="font-bold tabular-nums text-foreground">
              {totalCount}
            </span>{" "}
            {totalCount === 1
              ? t("community.result")
              : t("community.results")}
          </motion.p>
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
            className="h-10 min-w-36 rounded-xl bg-muted/60 text-base font-semibold"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="end">
            <SelectGroup>
              {SORT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-base"
                >
                  {t(`community.sort.${option.key}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
