"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PublicProgramPaginationProps = {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onRowsPerPageChange: (value: number) => void;
  onPageChange: (page: number) => void;
};

export function PublicProgramPagination({
  currentPage,
  totalPages,
  rowsPerPage,
  onRowsPerPageChange,
  onPageChange,
}: PublicProgramPaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <footer className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 lg:flex-row">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Rows per page</span>
        <Select
          value={String(rowsPerPage)}
          onValueChange={(val) => onRowsPerPageChange(Number(val))}
        >
          <SelectTrigger className="h-9 w-[70px] rounded-xl border-border bg-card text-foreground">
            <SelectValue placeholder={String(rowsPerPage)} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="16">16</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <nav className="flex items-center gap-1.5" aria-label="Public programs pagination">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-9 px-3 rounded-xl border-border bg-background text-xs sm:text-sm font-semibold text-foreground shadow-2xs hover:bg-muted transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <ChevronLeft data-icon="inline-start" className="size-4 mr-0.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {pageNumbers.map((page) => (
          <Button
            key={page}
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page)}
            className={cn(
              "size-9 rounded-xl border border-border/80 bg-background/80 text-xs font-bold tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-all shadow-2xs cursor-pointer",
              currentPage === page && "border-primary bg-primary text-primary-foreground font-extrabold shadow-xs shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            {page}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-9 px-3 rounded-xl border-border bg-background text-xs sm:text-sm font-semibold text-foreground shadow-2xs hover:bg-muted transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight data-icon="inline-end" className="size-4 ml-0.5" />
        </Button>
      </nav>
    </footer>
  );
}
