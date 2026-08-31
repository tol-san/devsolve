"use client";

import React, { useState } from "react";
import { Trash2, Tag as TagIcon, Hash, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TagDeleteDialog } from "./TagDeleteDialog";
import type { TagResponse } from "@/lib/redux/services/tagsApi";
import { cn } from "@/lib/utils";

interface TagTableProps {
  tags: TagResponse[];
  totalCount: number;
  onRefresh?: () => void;
}

export function TagTable({ tags, totalCount, onRefresh }: TagTableProps) {
  const [selectedTag, setSelectedTag] = useState<TagResponse | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sortField, setSortField] = useState<"name" | "usageCount">("usageCount");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: "name" | "usageCount") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "usageCount" ? "desc" : "asc");
    }
  };

  const sortedTags = [...tags].sort((a, b) => {
    if (sortField === "name") {
      const cmp = a.name.localeCompare(b.name);
      return sortDirection === "asc" ? cmp : -cmp;
    }
    const countA = a.usageCount ?? 0;
    const countB = b.usageCount ?? 0;
    return sortDirection === "asc" ? countA - countB : countB - countA;
  });

  const handleDeleteClick = (tag: TagResponse) => {
    setSelectedTag(tag);
    setDeleteOpen(true);
  };

  if (!tags.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <TagIcon className="size-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No tags found</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          No tags match your search criteria. Community tags will appear here as users
          tag problems and showcases.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tag Name</span>
                    <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Slug
                </th>
                <th
                  scope="col"
                  className="px-6 py-3.5 cursor-pointer select-none hover:text-foreground transition-colors text-right"
                  onClick={() => handleSort("usageCount")}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Usage Count</span>
                    <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedTags.map((tag) => {
                const count = tag.usageCount ?? 0;
                return (
                  <tr
                    key={tag.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                          <Hash className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground text-sm">
                            {tag.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-md">
                        {tag.slug || tag.name.toLowerCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Badge
                        variant={count > 0 ? "secondary" : "outline"}
                        className={cn(
                          "font-mono text-xs font-semibold tabular-nums",
                          count > 10
                            ? "bg-primary/10 text-primary border-primary/20"
                            : count > 0
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground border-dashed",
                        )}
                      >
                        {count} {count === 1 ? "use" : "uses"}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(tag)}
                        className="size-8 rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                        title={`Delete tag #${tag.name}`}
                        aria-label={`Delete tag #${tag.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-3 text-xs text-muted-foreground font-medium">
          <span>
            Showing <strong className="text-foreground">{sortedTags.length}</strong> of{" "}
            <strong className="text-foreground">{totalCount}</strong> tag
            {totalCount === 1 ? "" : "s"}
          </span>
          <span className="text-[11px]">
            Sorted by {sortField === "name" ? "alphabetical name" : "usage count"} (
            {sortDirection === "asc" ? "ascending" : "descending"})
          </span>
        </div>
      </div>

      <TagDeleteDialog
        tag={selectedTag}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={onRefresh}
      />
    </>
  );
}
