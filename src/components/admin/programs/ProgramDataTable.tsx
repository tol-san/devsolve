"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
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

import { Badge } from "@/components/ui/badge";

interface ProgramDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function ProgramDataTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  totalElements,
  onPageChange,
  onPageSizeChange,
}: ProgramDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localPagination, setLocalPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const isServerPaged =
    typeof pageIndex === "number" && typeof pageCount === "number";

  const table = useReactTable({
    data,
    columns,
    pageCount: isServerPaged ? pageCount : undefined,
    manualPagination: isServerPaged,
    getCoreRowModel: getCoreRowModel(),
    ...(!isServerPaged && { getPaginationRowModel: getPaginationRowModel() }),
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      if (isServerPaged) {
        if (typeof updater === "function") {
          const nextState = updater({
            pageIndex: pageIndex ?? 0,
            pageSize: pageSize ?? 20,
          });
          if (nextState.pageIndex !== pageIndex && onPageChange) {
            onPageChange(nextState.pageIndex);
          }
          if (nextState.pageSize !== pageSize && onPageSizeChange) {
            onPageSizeChange(nextState.pageSize);
          }
        }
      } else {
        setLocalPagination(updater);
      }
    },
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination: isServerPaged
        ? { pageIndex: pageIndex ?? 0, pageSize: pageSize ?? 20 }
        : localPagination,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const cells = row.getVisibleCells();
            const nameCell = cells.find((c) => c.column.id === "name");
            const orgCell = cells.find((c) => c.column.id === "organizationName");
            const typeCell = cells.find((c) => c.column.id === "engagementType");
            const visCell = cells.find((c) => c.column.id === "visibility");
            const stateCell = cells.find((c) => c.column.id === "state");
            const reviewCell = cells.find((c) => c.column.id === "submissionState");
            const dateCell = cells.find((c) => c.column.id === "createdAt");
            const actionsCell = cells.find((c) => c.column.id === "actions");

            return (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-3">
                  {nameCell && flexRender(nameCell.column.columnDef.cell, nameCell.getContext())}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {typeCell && flexRender(typeCell.column.columnDef.cell, typeCell.getContext())}
                  {visCell && flexRender(visCell.column.columnDef.cell, visCell.getContext())}
                  {stateCell && flexRender(stateCell.column.columnDef.cell, stateCell.getContext())}
                  {reviewCell && flexRender(reviewCell.column.columnDef.cell, reviewCell.getContext())}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  {orgCell && flexRender(orgCell.column.columnDef.cell, orgCell.getContext())}
                  {dateCell && flexRender(dateCell.column.columnDef.cell, dateCell.getContext())}
                </div>

                {actionsCell && (
                  <div className="pt-2 border-t border-border/60 flex justify-end">
                    {flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <Card className="gap-3 bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 py-8 shadow-xs text-center rounded-2xl">
            <CardHeader className="grid justify-items-center gap-3 px-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Building2 className="size-6" />
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                No matching programs found
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Try another search or filter.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 shadow-xs">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-none hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-border/50 transition-colors hover:bg-muted/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 p-0 text-center"
                  >
                    <Card className="gap-3 border-none bg-transparent py-8 shadow-none">
                      <CardHeader className="grid justify-items-center gap-3 px-8 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <Building2 className="size-6" />
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          No matching programs found
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Try another search or filter.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {data.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Rows per page
              </span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(val) => {
                  if (val) table.setPageSize(Number(val));
                }}
              >
                <SelectTrigger className="h-8 w-16 cursor-pointer rounded-xl border-border bg-card px-2.5 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:border-blue-400">
                  <SelectValue
                    placeholder={String(table.getState().pagination.pageSize)}
                  />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  className="min-w-20 rounded-2xl border-border bg-card shadow-lg"
                >
                  <SelectGroup>
                    {[10, 20, 50, 100].map((size) => (
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
              Page{" "}
              <span className="font-bold text-foreground">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              of{" "}
              <span className="font-bold text-foreground">
                {table.getPageCount() || 1}
              </span>{" "}
              ({totalElements ?? data.length} total)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 cursor-pointer rounded-xl border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors disabled:opacity-40"
            >
              <ChevronLeft data-icon="inline-start" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 cursor-pointer rounded-xl border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors disabled:opacity-40"
            >
              Next
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
