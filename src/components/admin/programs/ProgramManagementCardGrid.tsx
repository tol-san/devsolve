"use client";

import React from "react";
import { ChevronLeft, ChevronRight, FolderX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgramManagementSummaryItem } from "@/lib/types/admin/programAdminTypes";
import { ProgramManagementCard } from "./ProgramManagementCard";

interface ProgramManagementCardGridProps {
  programs: ProgramManagementSummaryItem[];
  scope?: "owner" | "admin";
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onResetFilters?: () => void;
}

export function ProgramManagementCardGrid({
  programs,
  scope = "owner",
  pageIndex,
  pageSize,
  pageCount,
  totalElements,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}: ProgramManagementCardGridProps) {
  if (programs.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-border bg-card/60 p-12 text-center shadow-xs">
        <CardHeader className="items-center space-y-3 p-0">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FolderX className="size-6" />
          </div>
          <CardTitle className="text-lg font-bold text-foreground">
            No programs found
          </CardTitle>
          <CardDescription className="max-w-sm text-sm text-muted-foreground">
            No security programs match your current filter and search criteria.
            Try picking another state, review tab, or clear the search.
          </CardDescription>
          {onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="mt-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </CardHeader>
      </Card>
    );
  }

  const canPrevious = pageIndex > 0;
  const canNext = pageIndex + 1 < pageCount;

  return (
    <div className="space-y-6">
      {/* Grid of Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
        {programs.map((program, idx) => (
          <ProgramManagementCard
            key={program.id}
            program={program}
            scope={scope}
            index={idx}
          />
        ))}
      </div>

      {/* Standardized Pagination Bar */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 sm:flex-row shadow-2xs">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Programs per page
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                if (val) onPageSizeChange(Number(val));
              }}
            >
              <SelectTrigger className="h-8 w-16 cursor-pointer rounded-xl border-border bg-card px-2.5 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:border-primary">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent
                align="start"
                className="min-w-20 rounded-2xl border-border bg-card shadow-lg"
              >
                <SelectGroup>
                  {[12, 24, 48, 96].map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="cursor-pointer text-sm font-semibold"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            Page <span className="font-bold text-foreground">{pageIndex + 1}</span>{" "}
            of <span className="font-bold text-foreground">{pageCount || 1}</span>{" "}
            ({totalElements} total)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={!canPrevious}
            className="h-8 cursor-pointer rounded-xl border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!canNext}
            className="h-8 cursor-pointer rounded-xl border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors disabled:opacity-40"
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
