"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";

import { TagStatCards } from "@/components/admin/tags/TagStatCards";
import { TagTable } from "@/components/admin/tags/TagTable";
import { Button } from "@/components/ui/button";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
} from "@/components/ui/filter-bar";
import { useGetTagsQuery } from "@/lib/redux/services/tagsApi";
import { useLocalePath } from "@/lib/i18n/I18nProvider";

type UsageFilter = "ALL" | "IN_USE" | "UNUSED";

export default function AdminTagsPage() {
  const lp = useLocalePath();

  const [search, setSearch] = useState("");
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("ALL");

  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: tags = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetTagsQuery({
    q: debounced.trim() ? debounced.trim() : undefined,
  });

  const filteredTags = useMemo(() => {
    if (usageFilter === "IN_USE") {
      return tags.filter((tag) => (tag.usageCount ?? 0) > 0);
    }
    if (usageFilter === "UNUSED") {
      return tags.filter((tag) => (tag.usageCount ?? 0) === 0);
    }
    return tags;
  }, [tags, usageFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Link
              href={lp("/dashboard")}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Tags</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Tag Moderation
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and moderate user-created community tags across problems and showcases.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 rounded-xl border-border bg-card px-3 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <TagStatCards tags={tags} isLoading={isLoading} />

      {!isError && (
        <FilterBar>
          <FilterRow>
            <FilterSearch
              value={search}
              onChange={setSearch}
              label="Search tags"
              placeholder="Search by tag name or slug..."
            />

            <FilterControls>
              <div className="inline-flex h-11 items-center gap-1 rounded-xl bg-muted/50 p-1 text-xs font-semibold text-muted-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <button
                  type="button"
                  onClick={() => setUsageFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    usageFilter === "ALL"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "hover:text-foreground"
                  }`}
                >
                  All ({tags.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUsageFilter("IN_USE")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    usageFilter === "IN_USE"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "hover:text-foreground"
                  }`}
                >
                  In Use ({tags.filter((t) => (t.usageCount ?? 0) > 0).length})
                </button>
                <button
                  type="button"
                  onClick={() => setUsageFilter("UNUSED")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    usageFilter === "UNUSED"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "hover:text-foreground"
                  }`}
                >
                  Unused ({tags.filter((t) => (t.usageCount ?? 0) === 0).length})
                </button>
              </div>
            </FilterControls>
          </FilterRow>

          <ActiveFilters
            filters={[
              ...(usageFilter !== "ALL"
                ? [
                    {
                      key: "usage",
                      label: usageFilter === "IN_USE" ? "In Active Use" : "Unused Only",
                      clear: () => setUsageFilter("ALL"),
                    },
                  ]
                : []),
              ...(search.trim()
                ? [
                    {
                      key: "search",
                      label: `"${search.trim()}"`,
                      clear: () => setSearch(""),
                    },
                  ]
                : []),
            ]}
            onClearAll={() => {
              setUsageFilter("ALL");
              setSearch("");
            }}
          />
        </FilterBar>
      )}

      <main className="flex flex-col gap-3">
        {isError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <span>
              The tags could not be loaded. Please verify your connection and permissions,
              then try again.
            </span>
          </div>
        ) : isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-64 rounded-2xl border border-border bg-muted/60" />
          </div>
        ) : (
          <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
            <TagTable
              tags={filteredTags}
              totalCount={tags.length}
              onRefresh={refetch}
            />
          </div>
        )}
      </main>
    </motion.div>
  );
}
