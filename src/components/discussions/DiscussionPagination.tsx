"use client";

import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n/I18nProvider";

interface DiscussionPaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DiscussionPagination({
  page,
  totalPages,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
}: DiscussionPaginationProps) {
  const t = useT();

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
    if (page >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  if (totalCount === 0) return null;

  const firstItem = (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, totalCount);

  return (
    <nav
      aria-label={t("community.pagination.region")}
      className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-card p-3 shadow-xs ring-1 ring-foreground/5 sm:flex-row"
    >
      <div className="flex flex-wrap items-center gap-3 px-1 text-sm font-medium text-muted-foreground">
        <p aria-live="polite">
          <span className="font-semibold tabular-nums text-foreground">
            {firstItem}–{lastItem}
          </span>{" "}
          {t("community.pagination.of")}{" "}
          <span className="tabular-nums">{totalCount}</span>
        </p>

        <div className="flex items-center gap-2">
          <span id="discussions-rows-label">
            {t("community.pagination.show")}
          </span>
          <Select
            value={String(limit)}
            onValueChange={(value) => value && onLimitChange(Number(value))}
          >
            <SelectTrigger
              aria-labelledby="discussions-rows-label"
              className="h-9 min-w-18 rounded-xl bg-muted/60 text-base font-semibold"
            >
              <SelectValue placeholder={String(limit)} />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {[10, 20, 50, 100].map((option) => (
                  <SelectItem
                    key={option}
                    value={String(option)}
                    className="text-base"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <motion.div whileTap={{ scale: 0.94 }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={t("community.pagination.gotoPrevious")}
            className="rounded-xl"
          >
            <ChevronLeft data-icon="inline-start" aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("community.pagination.previous")}
            </span>
          </Button>
        </motion.div>

        <div className="hidden items-center gap-1 sm:flex">
          {getPages().map((pageItem, index) =>
            pageItem === "..." ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="flex size-8 items-center justify-center text-sm font-semibold text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={pageItem}
                type="button"
                size="icon-sm"
                variant={page === pageItem ? "default" : "ghost"}
                onClick={() => onPageChange(pageItem)}
                aria-label={`${t("community.pagination.gotoPage")} ${pageItem}`}
                aria-current={page === pageItem ? "page" : undefined}
                className="rounded-xl tabular-nums"
              >
                {pageItem}
              </Button>
            ),
          )}
        </div>

        <span className="px-2 text-sm font-semibold tabular-nums text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </span>

        <motion.div whileTap={{ scale: 0.94 }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={t("community.pagination.gotoNext")}
            className="rounded-xl"
          >
            <span className="hidden sm:inline">
              {t("community.pagination.next")}
            </span>
            <ChevronRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </motion.div>
      </div>
    </nav>
  );
}
