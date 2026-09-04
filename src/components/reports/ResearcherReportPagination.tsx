"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ResearcherReportPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

function getPaginationRange(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [];

  pages.push(1);

  if (currentPage > 3) {
    pages.push("ellipsis-left");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis-right");
  }

  pages.push(totalPages);

  return pages;
}

export function ResearcherReportPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = "reports",
  className,
}: ResearcherReportPaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-muted/30 select-none",
        className
      )}
    >
      <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-muted-foreground w-full sm:w-auto justify-between sm:justify-start">
        <span>
          Showing{" "}
          <strong className="text-foreground font-semibold">
            {startItem}–{endItem}
          </strong>{" "}
          of{" "}
          <strong className="text-foreground font-semibold">
            {totalItems}
          </strong>{" "}
          {itemLabel}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground hidden md:inline">
            Per page:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              onPageSizeChange(Number(val));
              onPageChange(1);
            }}
          >
            <SelectTrigger className="h-8 w-18 text-xs rounded-xl bg-card border-border shadow-2xs font-medium cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)} className="text-xs">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
        <Button
          size="icon"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
          title="First page"
          className="size-8 rounded-xl bg-card border-border hover:bg-muted text-foreground disabled:opacity-40 cursor-pointer hidden sm:inline-flex"
        >
          <ChevronsLeft className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          aria-label="Previous page"
          title="Previous page"
          className="size-8 rounded-xl bg-card border-border hover:bg-muted text-foreground disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {paginationRange.map((item, idx) => {
          if (typeof item === "string") {
            return (
              <span
                key={`${item}-${idx}`}
                className="px-1.5 text-xs text-muted-foreground font-medium select-none"
              >
                &hellip;
              </span>
            );
          }

          const isCurrent = item === currentPage;

          return (
            <Button
              key={item}
              size="sm"
              variant={isCurrent ? "default" : "outline"}
              onClick={() => onPageChange(item)}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`Page ${item}`}
              className={cn(
                "size-8 p-0 rounded-xl text-xs font-semibold cursor-pointer transition-all",
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                  : "bg-card border-border text-foreground hover:bg-muted"
              )}
            >
              {item}
            </Button>
          );
        })}

        <Button
          size="icon"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          aria-label="Next page"
          title="Next page"
          className="size-8 rounded-xl bg-card border-border hover:bg-muted text-foreground disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
          title="Last page"
          className="size-8 rounded-xl bg-card border-border hover:bg-muted text-foreground disabled:opacity-40 cursor-pointer hidden sm:inline-flex"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
