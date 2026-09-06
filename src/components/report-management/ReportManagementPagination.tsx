import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function buildVisiblePages(
  pageNumbers: number[],
  currentPage: number,
  totalPages: number
) {
  if (totalPages <= 5) return pageNumbers;

  const visiblePages = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  return pageNumbers.filter((pageNumber) => visiblePages.has(pageNumber));
}

type ReportManagementPaginationProps = {
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (value: number) => void;
  filteredCount: number;
};

export function ReportManagementPagination({
  rowsPerPage,
  currentPage,
  totalPages,
  pageNumbers,
  onPageChange,
  filteredCount,
}: ReportManagementPaginationProps) {
  const visiblePages = buildVisiblePages(pageNumbers, currentPage, totalPages);
  const start = filteredCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, filteredCount);

  return (
    <footer className="flex flex-col gap-3 px-4 sm:px-6 py-3.5 sm:py-4 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
      <p className="text-xs sm:text-sm text-muted-foreground">
        {start}-{end} of {filteredCount} reports
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-end">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="rounded-xl border-border bg-card text-foreground hover:bg-muted cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>

        {visiblePages.map((pageNumber, index) => {
          const previousPage = visiblePages[index - 1];
          const shouldRenderEllipsis =
            previousPage !== undefined && pageNumber - previousPage > 1;

          return (
            <div key={pageNumber} className="flex items-center gap-2">
              {shouldRenderEllipsis ? (
                <span className="px-1 text-sm font-medium text-muted-foreground">...</span>
              ) : null}
              <Button
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  "rounded-xl text-sm font-semibold cursor-pointer",
                  currentPage === pageNumber
                    ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white"
                    : "border-border bg-card text-foreground hover:bg-muted"
                )}
                aria-current={currentPage === pageNumber ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            </div>
          );
        })}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="rounded-xl border-border bg-card text-foreground hover:bg-muted cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </nav>
    </footer>
  );
}
