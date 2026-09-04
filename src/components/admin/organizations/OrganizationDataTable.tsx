"use client";

import React, { useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
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
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
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

interface OrganizationDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
  isFetching?: boolean;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function OrganizationDataTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  totalRows,
  isFetching = false,
  onPageChange,
  onPageSizeChange,
}: OrganizationDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      pagination: { pageIndex, pageSize },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                  className="border-b border-border hover:bg-muted/60 transition-colors"
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
                  <Card className="gap-3 border-none bg-transparent py-8 shadow-none">
                    <CardHeader className="grid justify-items-center gap-3 px-8 text-center">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <Building2 className="size-6" />
                      </div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        No matching organizations found
                      </CardTitle>
                      <CardDescription className="max-w-sm text-sm text-muted-foreground">
                        Try another search or status filter.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-muted/40 border-t border-border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    if (val) onPageSizeChange(Number(val));
                  }}
                >
                  <SelectTrigger className="h-8 w-16 cursor-pointer rounded-xl border-border bg-card px-2.5 text-sm font-semibold text-foreground shadow-2xs">
                    <SelectValue placeholder={String(pageSize)} />
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-20 rounded-2xl border-border bg-card text-card-foreground shadow-lg">
                    <SelectGroup>
                      {[10, 20, 50, 100].map((pageSize) => (
                        <SelectItem
                          key={pageSize}
                          value={String(pageSize)}
                          className="cursor-pointer text-sm font-semibold"
                        >
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm font-medium text-muted-foreground">
                Page{" "}
                <span className="font-bold text-foreground">
                  {pageIndex + 1}
                </span>{" "}
                of{" "}
                <span className="font-bold text-foreground">
                  {pageCount || 1}
                </span>{" "}
                ({totalRows} total)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pageIndex - 1)}
                disabled={pageIndex <= 0 || isFetching}
                className="h-8 cursor-pointer rounded-xl border-border bg-card text-foreground px-3 text-sm font-semibold disabled:opacity-40 hover:bg-muted"
              >
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pageIndex + 1)}
                disabled={pageIndex + 1 >= pageCount || isFetching}
                className="h-8 cursor-pointer rounded-xl border-border bg-card text-foreground px-3 text-sm font-semibold disabled:opacity-40 hover:bg-muted"
              >
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
