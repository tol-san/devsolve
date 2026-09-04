"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  DiscussionCategory,
  TopicName,
} from "@/lib/types/dicussion/types";
import { useT } from "@/lib/i18n/I18nProvider";

const CATEGORY_KEYS: Record<string, string> = {
  All: "all",
  Problems: "problems",
  Showcase: "showcase",
};

interface DiscussionActiveFiltersProps {
  category: DiscussionCategory;
  defaultCategory: DiscussionCategory;
  topic: TopicName | null;
  tag: string | null;
  searchQuery: string;
  onClearCategory: () => void;
  onClearTopic: () => void;
  onClearTag: () => void;
  onClearSearch: () => void;
  onResetAll: () => void;
}

interface FilterChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export function DiscussionActiveFilters({
  category,
  defaultCategory,
  topic,
  tag,
  searchQuery,
  onClearCategory,
  onClearTopic,
  onClearTag,
  onClearSearch,
  onResetAll,
}: DiscussionActiveFiltersProps) {
  const t = useT();
  const chips: FilterChip[] = [];

  if (category !== defaultCategory) {
    chips.push({
      key: "category",
      label: t("community.activeFilters.category"),
      value: t(`community.tabs.${CATEGORY_KEYS[category] ?? "all"}`),
      onRemove: onClearCategory,
    });
  }
  if (topic) {
    chips.push({
      key: "topic",
      label: t("community.activeFilters.topic"),
      value: topic,
      onRemove: onClearTopic,
    });
  }
  if (tag) {
    chips.push({
      key: "tag",
      label: t("community.activeFilters.tag"),
      value: tag,
      onRemove: onClearTag,
    });
  }
  if (searchQuery) {
    chips.push({
      key: "search",
      label: t("community.activeFilters.search"),
      value: `“${searchQuery}”`,
      onRemove: onClearSearch,
    });
  }

  return (
    <AnimatePresence initial={false}>
      {chips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              {t("community.activeFilters.label")}
            </span>

            <AnimatePresence initial={false} mode="popLayout">
              {chips.map((chip) => (
                <motion.div
                  key={chip.key}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={chip.onRemove}
                    aria-label={`${t("community.activeFilters.remove")}: ${chip.label} ${chip.value}`}
                    className="max-w-64 rounded-lg"
                  >
                    <span className="truncate">
                      <span className="font-medium text-muted-foreground">
                        {chip.label}:
                      </span>{" "}
                      {chip.value}
                    </span>
                    <X data-icon="inline-end" aria-hidden="true" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onResetAll}
              className="ml-auto rounded-lg"
            >
              {t("community.activeFilters.clearAll")}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
