"use client";

import React from "react";
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

interface ProgramPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  displayedCount: number;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  onPageChange: (page: number) => void;
}

export const ProgramPagination: React.FC<ProgramPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  displayedCount,
  rowsPerPage,
  onRowsPerPageChange,
  onPageChange,
}) => {
  const t = useT();
  const pageNumbers = Array.from(
    new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (page) => page >= 1 && page <= totalPages,
      ),
    ),
  ).sort((a, b) => a - b);
  const firstVisible =
    displayedCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const lastVisible = firstVisible + displayedCount - 1;

  return (
    <footer className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
        <label htmlFor="rows-per-page" className="font-medium text-foreground">
          {t("programs.pagination.rowsPerPage")}
        </label>
        <Select
          value={String(rowsPerPage)}
          onValueChange={(val) => onRowsPerPageChange(Number(val))}
        >
          <SelectTrigger
            id="rows-per-page"
            className="rounded-xl border-border bg-background text-foreground"
          >
            <SelectValue placeholder={String(rowsPerPage)} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[6, 12, 24, 48].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <span className="font-medium text-muted-foreground">
          {t("programs.pagination.showing")} {firstVisible}–{lastVisible}{" "}
          {t("programs.pagination.of")} {totalCount}
        </span>
      </div>

      <nav
        className="flex max-w-full items-center gap-1.5"
        aria-label={t("programs.pagination.region")}
      >
        <Button
          variant="outline"
          size="icon-sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          aria-label={t("programs.pagination.previous")}
          className="rounded-xl"
        >
          <ChevronLeft />
        </Button>

        {pageNumbers.map((pageNum, index) => {
          const previousPage = pageNumbers[index - 1];
          const hasGap = previousPage !== undefined && pageNum - previousPage > 1;

          return (
            <React.Fragment key={pageNum}>
              {hasGap ? (
                <span aria-hidden="true" className="px-1 text-muted-foreground">
                  …
                </span>
              ) : null}
              <Button
                type="button"
                variant={currentPage === pageNum ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(pageNum)}
                aria-label={`${t("programs.pagination.page")} ${pageNum}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
                className="rounded-xl"
              >
                {pageNum}
              </Button>
            </React.Fragment>
          );
        })}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          aria-label={t("programs.pagination.next")}
          className="rounded-xl"
        >
          <ChevronRight />
        </Button>
      </nav>
    </footer>
  );
};
