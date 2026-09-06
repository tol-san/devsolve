"use client";

export const dynamic = "force-dynamic";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

import { WeaknessFormDialog } from "@/components/admin/weaknesses/WeaknessFormDialog";
import { WeaknessTable } from "@/components/admin/weaknesses/WeaknessTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
} from "@/components/ui/filter-bar";
import { Switch } from "@/components/ui/switch";
import { useGetAdminWeaknessesQuery } from "@/lib/redux/services/adminWeaknessesApi";
import type { Weakness } from "@/lib/redux/services/weaknessesApi";
import { useLocalePath } from "@/lib/i18n/I18nProvider";

export default function AdminWeaknessesPage() {
  const lp = useLocalePath();

  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Weakness | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [session, setSession] = useState(0);

  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isError } = useGetAdminWeaknessesQuery({
    search: debounced,
    activeOnly,
    page,
  });

  useEffect(() => {
    setPage(0);
  }, [debounced, activeOnly]);

  const totalPages = data?.totalPages ?? 1;

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const retired = useMemo(
    () => rows.filter((row) => row.isActive === false).length,
    [rows],
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setSession((n) => n + 1);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((weakness: Weakness) => {
    setEditing(weakness);
    setSession((n) => n + 1);
    setDialogOpen(true);
  }, []);

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
            <span className="font-semibold text-foreground">Weaknesses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Weaknesses
          </h1>
          <p className="text-sm text-muted-foreground">
            The CWE catalogue researchers classify their reports against.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={lp("/dashboard/weaknesses/insights")}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted"
          >
            <BarChart3 className="size-4 text-muted-foreground" />
            <span>Insights</span>
          </Link>

          {retired > 0 && (
            <Badge
              variant="outline"
              className="h-9 gap-2 rounded-xl border-border bg-card px-3 text-sm font-semibold text-foreground"
            >
              <span className="size-2 rounded-full bg-muted-foreground" />
              <span>{retired} retired</span>
            </Badge>
          )}
          <Button
            onClick={openCreate}
            className="h-9 cursor-pointer rounded-xl px-4 text-sm font-semibold shadow-2xs"
          >
            <Plus data-icon="inline-start" />
            New weakness
          </Button>
        </div>
      </header>

      {!isError && (
        <FilterBar>
          <FilterRow>
            <FilterSearch
              value={search}
              onChange={setSearch}
              label="Search weaknesses"
              placeholder="Search by name or CWE id..."
            />

            <FilterControls>
              <label className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl bg-muted/50 px-3 text-sm font-medium text-foreground shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <Switch
                  checked={activeOnly}
                  onCheckedChange={setActiveOnly}
                  aria-label="Hide retired weaknesses"
                />
                Hide retired
              </label>
            </FilterControls>
          </FilterRow>

          <ActiveFilters
            filters={[
              ...(activeOnly
                ? [
                    {
                      key: "retired",
                      label: "Retired hidden",
                      clear: () => setActiveOnly(false),
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
              setActiveOnly(false);
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
              The weakness catalogue could not be loaded. Check that you are
              signed in as an admin, then try again.
            </span>
          </div>
        ) : isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-64 rounded-2xl border border-border bg-muted/60" />
          </div>
        ) : (
          <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
            <WeaknessTable
              weaknesses={rows}
              totalCount={data?.total ?? rows.length}
              onEdit={openEdit}
            />
          </div>
        )}

        {!isError && !isLoading && totalPages > 1 && (
          <nav
            aria-label="Weakness pages"
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <span className="text-sm font-medium text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0 || isFetching}
                onClick={() => setPage((n) => Math.max(0, n - 1))}
                className="cursor-pointer rounded-xl"
              >
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1 || isFetching}
                onClick={() => setPage((n) => Math.min(totalPages - 1, n + 1))}
                className="cursor-pointer rounded-xl"
              >
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          </nav>
        )}
      </main>

      <WeaknessFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        weakness={editing}
        session={session}
      />
    </motion.div>
  );
}
