"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { MyAccessList } from "@/components/researchers/MyAccessList";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { STATUS_LABEL } from "@/lib/researchers/access";
import { useGetMyResearcherAccessQuery } from "@/lib/redux/services/researcherAccessApi";
import {
  RESEARCHER_ACCESS_STATUSES,
  type ResearcherAccessStatus,
} from "@/lib/validations/researcher-access";

type Filter = ResearcherAccessStatus | "ALL";

/**
 * Where a researcher stands with every company they have approached.
 *
 * Reporting is gated on the company, once, for all of its programs — so this
 * is the list that answers "can I file this?" before the report form does, and
 * the only place a rejection or a revocation is ever explained.
 */
export default function MyAccessPage() {
  const lp = useLocalePath();

  const [status, setStatus] = useState<Filter>("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching, isError } = useGetMyResearcherAccessQuery({
    status,
    page,
  });

  const rows = data?.rows ?? [];
  const totalPages = data?.totalPages ?? 1;
  const approved = rows.filter((row) => row.canSubmitReports).length;

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
            <span className="font-semibold text-foreground">My access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My access
          </h1>
          <p className="text-sm text-muted-foreground">
            Companies approve researchers before accepting reports. One approval
            covers every program that company runs.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="inline-flex h-11 items-center gap-2 rounded-xl bg-muted/50 px-3 text-sm text-muted-foreground">
            <span className="shrink-0 font-medium">Status</span>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as Filter);
                /* A narrowed list is shorter than the one being paged
                   through, so page 3 of the old one would land on nothing. */
                setPage(0);
              }}
            >
              <SelectTrigger
                aria-label="Filter by access status"
                className="h-8 border-none bg-transparent font-medium text-foreground shadow-none focus:ring-0"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                {RESEARCHER_ACCESS_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-3">
        {isError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <span>
              Your access could not be loaded. Check that you are signed in,
              then try again.
            </span>
          </div>
        ) : isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-28 rounded-2xl border border-border bg-muted/60" />
            <div className="h-28 rounded-2xl border border-border bg-muted/60" />
            <div className="h-28 rounded-2xl border border-border bg-muted/60" />
          </div>
        ) : (
          <>
            {approved > 0 && (
              <p className="text-sm font-medium text-muted-foreground">
                {approved} of {rows.length} on this page can take your reports.
              </p>
            )}
            <div
              className={isFetching ? "opacity-70 transition-opacity" : undefined}
            >
              <MyAccessList records={rows} hasFilter={status !== "ALL"} />
            </div>
          </>
        )}

        {!isError && !isLoading && totalPages > 1 && (
          <nav
            aria-label="Access pages"
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
    </motion.div>
  );
}
