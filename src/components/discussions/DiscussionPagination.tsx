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
import { cn } from "@/lib/utils";

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
      className="flex flex-col sm:flex-row items-center justify-between gap-3.5 rounded-2xl border border-border/80 bg-card/85 backdrop-blur-md p-3 sm:p-3.5 shadow-xs ring-1 ring-foreground/5 dark:ring-foreground/10"
    >
      {/* Left side: Showing count & Rows-per-page dropdown */}
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
        <p aria-live="polite" className="flex items-center gap-1.5 font-medium">
          <span>{t("community.pagination.showing")}</span>
          <span className="font-bold tabular-nums text-foreground">
            {firstItem}–{lastItem}
          </span>
          <span>{t("community.pagination.of")}</span>
          <span className="font-bold tabular-nums text-foreground">{totalCount}</span>
        </p>

        <span
          className="hidden sm:inline text-border font-bold select-none"
          aria-hidden="true"
        >
          |
        </span>

        <div className="flex items-center gap-2">
          <span id="discussions-rows-label" className="font-medium">
            {t("community.pagination.show")}
          </span>
          <Select
            value={String(limit)}
            onValueChange={(value) => value && onLimitChange(Number(value))}
          >
            <SelectTrigger
              aria-labelledby="discussions-rows-label"
              className="h-8.5 min-w-18 rounded-xl border border-border/80 bg-background/80 text-xs sm:text-sm font-bold text-foreground shadow-2xs hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <SelectValue placeholder={String(limit)} />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} className="rounded-xl border-border bg-card shadow-md">
              <SelectGroup>
                {[10, 20, 50, 100].map((option) => (
                  <SelectItem
                    key={option}
                    value={String(option)}
                    className="text-xs sm:text-sm font-semibold rounded-lg cursor-pointer"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right side: Previous button, Page numbers with smooth spring indicator, Next button */}
      <div className="flex items-center gap-1.5">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={t("community.pagination.gotoPrevious")}
            className="h-9 px-3 rounded-xl border border-border/80 bg-background/80 text-xs sm:text-sm font-semibold text-foreground shadow-2xs hover:bg-muted hover:border-border transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft className="size-4 mr-0.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {t("community.pagination.previous")}
            </span>
          </Button>
        </motion.div>

        {/* Page buttons */}
        <div className="hidden items-center gap-1.5 sm:flex">
          {getPages().map((pageItem, index) =>
            pageItem === "..." ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className="flex size-9 items-center justify-center text-xs font-bold tracking-widest text-muted-foreground/50 select-none"
              >
                •••
              </span>
            ) : (
              <button
                key={pageItem}
                type="button"
                onClick={() => onPageChange(pageItem)}
                aria-label={`${t("community.pagination.gotoPage")} ${pageItem}`}
                aria-current={page === pageItem ? "page" : undefined}
                className={cn(
                  "relative flex size-9 items-center justify-center rounded-xl text-xs font-bold tabular-nums transition-all cursor-pointer select-none active:scale-95",
                  page === pageItem
                    ? "text-primary-foreground font-extrabold shadow-xs shadow-primary/25"
                    : "border border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border shadow-2xs",
                )}
              >
                {page === pageItem && (
                  <motion.span
                    layoutId="active-discussion-page"
                    className="absolute inset-0 rounded-xl bg-primary border border-primary -z-1"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{pageItem}</span>
              </button>
            ),
          )}
        </div>

        {/* Mobile compact indicator */}
        <span className="px-2.5 py-1 rounded-xl bg-muted/60 text-xs font-bold tabular-nums text-foreground border border-border/70 sm:hidden">
          {page} / {totalPages}
        </span>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={t("community.pagination.gotoNext")}
            className="h-9 px-3 rounded-xl border border-border/80 bg-background/80 text-xs sm:text-sm font-semibold text-foreground shadow-2xs hover:bg-muted hover:border-border transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <span className="hidden sm:inline">
              {t("community.pagination.next")}
            </span>
            <ChevronRight className="size-4 ml-0.5" aria-hidden="true" />
          </Button>
        </motion.div>
      </div>
    </nav>
  );
}
