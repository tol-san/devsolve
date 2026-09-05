"use client";

export const dynamic = "force-dynamic";

import React, { useCallback, useId, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Lightbulb,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { WeaknessFormDialog } from "@/components/admin/weaknesses/WeaknessFormDialog";
import {
  useGetWeaknessStatsQuery,
  useGetSuggestedWeaknessesQuery,
  type SuggestedWeakness,
} from "@/lib/redux/services/adminWeaknessesApi";
import type { PopularWeakness } from "@/lib/redux/services/weaknessesApi";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type ActiveTab = "stats" | "suggested";

function formatNaiveDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function WeaknessInsightsPage() {
  const lp = useLocalePath();
  const [activeTab, setActiveTab] = useState<ActiveTab>("stats");

  // Stats tab state
  const [includeUnused, setIncludeUnused] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [statsPage, setStatsPage] = useState(0);

  // Suggested tab state
  const [suggestedPage, setSuggestedPage] = useState(0);

  // Add to catalog dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prefilledName, setPrefilledName] = useState<string>("");
  const [dialogSession, setDialogSession] = useState(0);

  const unusedSwitchId = useId();
  const activeSwitchId = useId();

  // Queries — Note: strictly omitting sort parameter as backend returns 400
  const {
    data: statsData,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    isError: isStatsError,
    refetch: refetchStats,
  } = useGetWeaknessStatsQuery({
    includeUnused,
    activeOnly,
    page: statsPage,
    size: 20,
  });

  const {
    data: suggestedData,
    isLoading: isSuggestedLoading,
    isFetching: isSuggestedFetching,
    isError: isSuggestedError,
    refetch: refetchSuggested,
  } = useGetSuggestedWeaknessesQuery({
    page: suggestedPage,
    size: 20,
  });

  const openAddFromSuggestion = useCallback((item: SuggestedWeakness) => {
    setPrefilledName(item.name);
    setDialogSession((n) => n + 1);
    setDialogOpen(true);
  }, []);

  const statsRows = statsData?.content ?? [];
  const statsTotalPages = Math.max(1, statsData?.totalPages ?? 1);

  const suggestedRows = suggestedData?.content ?? [];
  const suggestedTotalPages = Math.max(1, suggestedData?.totalPages ?? 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      {/* Header */}
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
            <Link
              href={lp("/dashboard/weaknesses")}
              className="transition-colors hover:text-foreground"
            >
              Weaknesses
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Insights</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Weakness Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Reporting frequency, catalog coverage, and uncategorized submissions
            from researchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={lp("/dashboard/weaknesses")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:bg-muted"
          >
            <BookOpen className="size-3.5 text-muted-foreground" />
            <span>Manage Catalog</span>
          </Link>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "stats"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <BarChart3 className="size-4" />
          <span>Most reported</span>
          {statsData?.totalElements !== undefined && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {statsData.totalElements}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("suggested")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
            activeTab === "suggested"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Lightbulb className="size-4" />
          <span>Suggested by reporters</span>
          {suggestedData?.totalElements !== undefined && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {suggestedData.totalElements}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Most Reported */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-6">
              <label
                htmlFor={unusedSwitchId}
                className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-foreground select-none"
              >
                <Switch
                  id={unusedSwitchId}
                  checked={includeUnused}
                  onCheckedChange={(checked) => {
                    setIncludeUnused(checked);
                    setStatsPage(0);
                  }}
                />
                <span>Include unused entries (retirement review)</span>
              </label>

              <label
                htmlFor={activeSwitchId}
                className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-foreground select-none"
              >
                <Switch
                  id={activeSwitchId}
                  checked={activeOnly}
                  onCheckedChange={(checked) => {
                    setActiveOnly(checked);
                    setStatsPage(0);
                  }}
                />
                <span>Active entries only</span>
              </label>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetchStats()}
              disabled={isStatsFetching}
              className="rounded-xl text-xs cursor-pointer"
            >
              <RefreshCw
                className={cn("size-3.5 mr-1.5", isStatsFetching && "animate-spin")}
              />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Stats Table */}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            {isStatsLoading ? (
              <div className="space-y-3 p-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-full animate-pulse rounded-xl bg-muted/60"
                  />
                ))}
              </div>
            ) : isStatsError ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="size-8 text-rose-500 mb-2" />
                <h3 className="text-base font-semibold text-foreground">
                  Unable to load weakness statistics
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  The server could not return weakness popularity data right now.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchStats()}
                >
                  Try again
                </Button>
              </div>
            ) : statsRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <BarChart3 className="size-8 text-muted-foreground mb-2" />
                <h3 className="text-base font-semibold text-foreground">
                  No weakness statistics found
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {includeUnused
                    ? "No weakness catalog items match the selected criteria."
                    : "No reports have been filed under the weakness catalog yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-3 sm:px-6">CWE ID</th>
                      <th className="px-4 py-3 sm:px-6">Weakness Name</th>
                      <th className="px-4 py-3 sm:px-6">Status</th>
                      <th className="px-4 py-3 sm:px-6 text-right">Reports</th>
                      <th className="px-4 py-3 sm:px-6 text-right">Valid</th>
                      <th className="px-4 py-3 sm:px-6 text-right">Share</th>
                      <th className="px-4 py-3 sm:px-6">Last Reported</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {statsRows.map((row: PopularWeakness) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 sm:px-6 font-mono text-xs font-semibold text-primary">
                          {row.cweId || "—"}
                        </td>
                        <td className="px-4 py-3 sm:px-6 font-semibold text-foreground">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          {row.isActive ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-border bg-muted text-muted-foreground font-medium text-[11px]"
                            >
                              Retired
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-right font-mono font-semibold text-foreground tabular-nums">
                          {row.reportCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {row.validCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-right font-mono text-foreground tabular-nums">
                          {typeof row.share === "number"
                            ? `${row.share.toFixed(1)}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-xs text-muted-foreground">
                          {formatNaiveDateTime(row.lastReportedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {statsTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/80 px-4 py-3 sm:px-6">
                <p className="text-xs text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{statsPage + 1}</span> of{" "}
                  <span className="font-semibold text-foreground">{statsTotalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatsPage((p) => Math.max(0, p - 1))}
                    disabled={statsPage <= 0 || isStatsFetching}
                    className="rounded-xl text-xs cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setStatsPage((p) => Math.min(statsTotalPages - 1, p + 1))
                    }
                    disabled={statsPage >= statsTotalPages - 1 || isStatsFetching}
                    className="rounded-xl text-xs cursor-pointer"
                  >
                    Next
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Suggested by Reporters */}
      {activeTab === "suggested" && (
        <div className="space-y-4">
          {/* Explanatory Info Card */}
          <div className="flex items-start gap-3 rounded-2xl border border-blue-500/25 bg-blue-500/5 p-4 sm:p-5 text-sm text-foreground shadow-xs">
            <Info className="size-5 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                What reporters typed themselves when nothing in the catalog fit.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Note: adding a suggestion to the catalog does <strong>not</strong> retroactively
                reclassify the reports that suggested it — triage performs reclassification per report.
              </p>
            </div>
          </div>

          {/* Suggested Table */}
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
            {isSuggestedLoading ? (
              <div className="space-y-3 p-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-full animate-pulse rounded-xl bg-muted/60"
                  />
                ))}
              </div>
            ) : isSuggestedError ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="size-8 text-rose-500 mb-2" />
                <h3 className="text-base font-semibold text-foreground">
                  Unable to load suggestions
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Could not retrieve reporter suggested weaknesses.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchSuggested()}
                >
                  Try again
                </Button>
              </div>
            ) : suggestedRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
                <h3 className="text-base font-semibold text-foreground">
                  No suggested weaknesses
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Reporters have found all required vulnerability types in the standard catalog.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-3 sm:px-6">Suggested Classification</th>
                      <th className="px-4 py-3 sm:px-6 text-right">Reports</th>
                      <th className="px-4 py-3 sm:px-6">Catalog Match</th>
                      <th className="px-4 py-3 sm:px-6">First Suggested</th>
                      <th className="px-4 py-3 sm:px-6">Last Suggested</th>
                      <th className="px-4 py-3 sm:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {suggestedRows.map((row: SuggestedWeakness) => (
                      <tr
                        key={row.name}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 sm:px-6 font-semibold text-foreground">
                          {row.name}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-right font-mono font-semibold text-foreground tabular-nums">
                          {row.reportCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 sm:px-6">
                          {row.inCatalog ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-[11px] gap-1"
                            >
                              <Search className="size-3" />
                              <span>In Catalog (Search Gap)</span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]"
                            >
                              Not in Catalog
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-xs text-muted-foreground">
                          {formatNaiveDateTime(row.firstSuggestedAt)}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-xs text-muted-foreground">
                          {formatNaiveDateTime(row.lastSuggestedAt)}
                        </td>
                        <td className="px-4 py-3 sm:px-6 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openAddFromSuggestion(row)}
                            className="rounded-xl text-xs font-semibold cursor-pointer shadow-2xs hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                          >
                            <Plus className="size-3.5 mr-1" />
                            <span>Add to catalog</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {suggestedTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/80 px-4 py-3 sm:px-6">
                <p className="text-xs text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{suggestedPage + 1}</span> of{" "}
                  <span className="font-semibold text-foreground">{suggestedTotalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSuggestedPage((p) => Math.max(0, p - 1))}
                    disabled={suggestedPage <= 0 || isSuggestedFetching}
                    className="rounded-xl text-xs cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSuggestedPage((p) => Math.min(suggestedTotalPages - 1, p + 1))
                    }
                    disabled={suggestedPage >= suggestedTotalPages - 1 || isSuggestedFetching}
                    className="rounded-xl text-xs cursor-pointer"
                  >
                    Next
                    <ChevronRight className="size-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prefilled Add to Catalog Dialog */}
      <WeaknessFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        weakness={null}
        initialName={prefilledName}
        session={dialogSession}
      />
    </motion.div>
  );
}
