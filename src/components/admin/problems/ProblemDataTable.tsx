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
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProblemDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function ProblemDataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  currentPage = 0,
  onPageChange,
}: ProblemDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: currentPage,
    pageSize: 20,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-none"
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
                          header.getContext()
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
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center p-0"
                >
                  <Card className="border-none shadow-none p-8 bg-transparent space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No matching problems found
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Try adjusting your search query or filter criteria.
                    </p>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Rows per page
                </span>
                <Select
                  value={String(table.getState().pagination.pageSize)}
                  onValueChange={(val) => {
                    if (val) table.setPageSize(Number(val));
                  }}
                >
                  <SelectTrigger className="h-8 w-16 px-2.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs">
                    <SelectValue
                      placeholder={String(table.getState().pagination.pageSize)}
                    />
                  </SelectTrigger>
                  <SelectContent
                    align="start"
                    className="min-w-20 rounded-2xl shadow-lg"
                  >
                    {[10, 20, 50, 100].map((pageSize) => (
                      <SelectItem
                        key={pageSize}
                        value={String(pageSize)}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Page{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {pageCount || table.getPageCount() || 1}
                </span>{" "}
                ({data.length} total shown)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onPageChange && currentPage > 0) {
                    onPageChange(currentPage - 1);
                  } else {
                    table.previousPage();
                  }
                }}
                disabled={onPageChange ? currentPage === 0 : !table.getCanPreviousPage()}
                className="h-8 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onPageChange && pageCount && currentPage < pageCount - 1) {
                    onPageChange(currentPage + 1);
                  } else {
                    table.nextPage();
                  }
                }}
                disabled={
                  onPageChange
                    ? pageCount !== undefined && currentPage >= pageCount - 1
                    : !table.getCanNextPage()
                }
                className="h-8 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
