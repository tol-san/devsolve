"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Flag,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeft,
  History,
  LayoutTemplate,
  Lightbulb,
  MessageSquareWarning,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ActiveFilters,
  FilterBar,
  FilterControls,
  FilterRow,
  FilterSearch,
  FilterSelect,
  FilterTabs,
} from "@/components/ui/filter-bar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  useGetContentReportsQuery,
  useUpdateContentReportActionMutation,
  type ContentReportItem,
} from "@/lib/redux/services/admin/moderationApi";
import { useContentReportFilters } from "@/hooks/useContentReportFilters";
import { ContentReportCard } from "@/components/admin/ContentReportCard";
import { ReportReasonsBreakdown } from "@/components/admin/ReportReasonsBreakdown";
import { ModerationActionDialog } from "@/components/admin/ModerationActionDialog";
import { ModerationHistoryTable } from "@/components/admin/ModerationHistoryTable";
import { ShowcaseReviewQueue } from "@/components/admin/showcases/ShowcaseReviewQueue";
import { ProblemReviewQueue } from "@/components/admin/problems/ProblemReviewQueue";
import { SolutionReviewQueue } from "@/components/admin/solutions/SolutionReviewQueue";
import { AutoApprovalSettings } from "@/components/admin/auto-approval/AutoApprovalSettings";
import { useGetShowcaseReviewQueueQuery } from "@/lib/redux/services/admin/showcaseReviewApi";
import { useGetProblemReviewQueueQuery } from "@/lib/redux/services/admin/problemReviewApi";
import { useGetAdminSolutionsQuery } from "@/lib/redux/services/admin/solutionAdminApi";
import { useGetAdminSecurityIncidentsQuery } from "@/lib/redux/services/securityIncidentsApi";
import { FlagDetailSheet } from "@/components/admin/FlagDetailSheet";
import { SecurityIncidentsTable } from "@/components/security-incidents/SecurityIncidentsTable";
import type { ModerationActionType } from "@/lib/types/admin/types";
import { cn } from "@/lib/utils";

type TabId = "queue" | "showcases" | "problems" | "solutions" | "security" | "auto-approval" | "history";

const TABS: {
  value: TabId;
  label: string;
  icon: LucideIcon;
  blurb: string;
}[] = [
  {
    value: "queue",
    label: "Reports",
    icon: ShieldAlert,
    blurb:
      "Content the community flagged. It is already public, so acting here takes something down or warns its author.",
  },
  {
    value: "security",
    label: "Malware Incidents",
    icon: ShieldAlert,
    blurb:
      "Uploads refused and discarded by the VirusTotal security guard across all bounty programs and platform attachments.",
  },
  {
    value: "showcases",
    label: "Showcases",
    icon: LayoutTemplate,
    blurb:
      "Showcase submissions waiting on a decision. Nothing here is public until it is approved.",
  },
  {
    value: "problems",
    label: "Problems",
    icon: MessageSquareWarning,
    blurb:
      "Problems waiting on a decision. Approving one publishes it to the feed, open for solutions.",
  },
  {
    value: "solutions",
    label: "Solutions",
    icon: Lightbulb,
    blurb:
      "Answers waiting on a decision. Approving one publishes it on the problem it answers, where the asker can accept it.",
  },
  {
    value: "auto-approval",
    label: "AI Auto-Approval",
    icon: Sparkles,
    blurb:
      "Configure automated quality and safety checks to instantly publish verified community submissions.",
  },
  {
    value: "history",
    label: "History",
    icon: History,
    blurb: "Every moderation action taken, with who took it and when.",
  },
];

export default function ContentManagementPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContentManagement />
    </Suspense>
  );
}

function ContentManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<TabId>(() => {
    const param = searchParams.get("tab") as TabId | null;
    return param && TABS.some((tab) => tab.value === param) ? param : "queue";
  }, [searchParams]);

  const selectTab = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const { data, isLoading } = useGetContentReportsQuery();
  const [updateAction] = useUpdateContentReportActionMutation();

  const { data: showcaseQueue } = useGetShowcaseReviewQueueQuery({
    reviewStatus: "PENDING",
    pageSize: 1,
  });
  const { data: problemQueue } = useGetProblemReviewQueueQuery({
    status: "PENDING_APPROVAL",
    size: 1,
  });
  const { data: solutionQueue } = useGetAdminSolutionsQuery({
    reviewStatus: "PENDING",
    pageSize: 1,
  });
  const { data: securityQueue } = useGetAdminSecurityIncidentsQuery({
    size: 1,
  });

  const reportsList = useMemo(() => data?.items ?? [], [data]);
  const breakdown = data?.breakdown;

  const pendingReports = useMemo(
    () => reportsList.filter((report) => report.status === "PENDING").length,
    [reportsList],
  );

  const counts: Record<TabId, number | undefined> = {
    queue: data?.totalElements ?? pendingReports,
    showcases: showcaseQueue?.totalElements ?? 0,
    problems: problemQueue?.totalElements ?? 0,
    solutions: solutionQueue?.totalElements ?? 0,
    security: securityQueue?.totalElements ?? 0,
    "auto-approval": undefined,
    history: undefined,
  };

  const {
    typeFilter,
    reasonFilter,
    sortBy,
    searchQuery,
    currentPage,
    rowsPerPage,
    setTypeFilter,
    setReasonFilter,
    setSortBy,
    setSearchQuery,
    setCurrentPage,
    setRowsPerPage,
    resetFilters,
    filteredReports,
    paginatedReports,
    totalFiltered,
    totalPages,
  } = useContentReportFilters(reportsList);

  const [dialogReport, setDialogReport] = useState<ContentReportItem | null>(
    null,
  );
  const [dialogActionType, setDialogActionType] =
    useState<ModerationActionType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);

  const handleAction = async (
    id: string,
    action: "DISMISS" | "WARN" | "REMOVE",
  ) => {
    if (action === "DISMISS") {
      try {
        await updateAction({ id, action: "DISMISS" }).unwrap();
        toast.success("Content flag dismissed successfully.");
      } catch {
        toast.error("Failed to dismiss content flag.");
      }
    } else {
      const found = reportsList.find((r) => r.id === id);
      if (found) {
        setDialogReport(found);
        setDialogActionType(action);
        setIsDialogOpen(true);
      }
    }
  };

  const contentTypeOptions = [
    { label: "All Types", value: "ALL" },
    { label: "Solutions", value: "SOLUTION" },
    { label: "Problems", value: "PROBLEM" },
    { label: "Comments", value: "COMMENT" },
    { label: "Showcases", value: "SHOWCASE" },
    { label: "Programs", value: "PROGRAM" },
  ];

  const reasonOptions = [
    { label: "All Reasons", value: "ALL" },
    { label: "Spam", value: "Spam" },
    { label: "Harmful", value: "Harmful" },
    { label: "Offensive", value: "Offensive" },
    { label: "Off-topic", value: "Off-topic" },
  ];

  const sortOptions = [
    { label: "Most Reported", value: "MOST_REPORTED" },
    { label: "Newest First", value: "NEWEST" },
    { label: "Oldest First", value: "OLDEST" },
  ] as const;

  const activeBlurb =
    TABS.find((tab) => tab.value === activeTab)?.blurb ?? TABS[0].blurb;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-bold text-foreground">
            Content Management
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Content Management
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {activeBlurb}
        </p>
      </header>

      <nav
        aria-label="Moderation sections"
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-card p-1.5 sm:flex sm:items-stretch shadow-xs"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = counts[tab.value];
          const Icon = tab.icon;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => selectTab(tab.value)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4",
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground",
                )}
              />
              <span className="truncate">{tab.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "min-w-5 shrink-0 rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {activeTab === "queue" ? (
        <>
          <FilterBar>
            <FilterTabs
              label="Content type"
              value={typeFilter}
              onChange={setTypeFilter}
              tabs={contentTypeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />

            <FilterRow>
              <FilterSearch
                value={searchQuery}
                onChange={setSearchQuery}
                label="Search reports"
                placeholder="Search reports..."
              />

              <FilterControls>
                <FilterSelect
                  icon={SlidersHorizontal}
                  label="Reason"
                  items={Object.fromEntries(
                    reasonOptions.map((option) => [option.value, option.label]),
                  )}
                  value={reasonFilter}
                  onValueChange={setReasonFilter}
                />
                <FilterSelect
                  icon={ArrowUpDown}
                  label="Sort by"
                  items={Object.fromEntries(
                    sortOptions.map((option) => [option.value, option.label]),
                  )}
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as (typeof sortOptions)[number]["value"])
                  }
                />
              </FilterControls>
            </FilterRow>

            <ActiveFilters
              filters={[
                ...(typeFilter !== "ALL"
                  ? [
                      {
                        key: "type",
                        label:
                          contentTypeOptions.find(
                            (option) => option.value === typeFilter,
                          )?.label ?? typeFilter,
                        clear: () => setTypeFilter("ALL"),
                      },
                    ]
                  : []),
                ...(reasonFilter !== "ALL"
                  ? [
                      {
                        key: "reason",
                        label: reasonFilter,
                        clear: () => setReasonFilter("ALL"),
                      },
                    ]
                  : []),
                ...(searchQuery.trim()
                  ? [
                      {
                        key: "search",
                        label: `"${searchQuery.trim()}"`,
                        clear: () => setSearchQuery(""),
                      },
                    ]
                  : []),
              ]}
              onClearAll={resetFilters}
            />
          </FilterBar>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-44 rounded-2xl bg-muted/60"
                    />
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <Card className="space-y-4 rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Flag className="size-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {pendingReports === 0
                        ? "Nothing flagged right now"
                        : "No reports match your filters"}
                    </h3>
                    <p className="mx-auto max-w-md text-sm text-muted-foreground">
                      {pendingReports === 0
                        ? "Every flagged post and comment has been reviewed and resolved."
                        : "No pending reports matched the filters you applied."}
                    </p>
                  </div>
                  {pendingReports > 0 && (
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="h-9 cursor-pointer rounded-xl border-border bg-card text-foreground text-xs font-semibold hover:bg-muted"
                    >
                      <RotateCcw className="mr-1.5 size-3.5" /> Clear Filters
                    </Button>
                  )}
                </Card>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {paginatedReports.map((report) => (
                      <motion.div
                        key={report.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ContentReportCard
                          report={report}
                          onAction={handleAction}
                          onViewDetail={(id) => setSelectedFlagId(id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {totalFiltered > 0 && (
                    <div className="flex flex-col justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <span id="report-rows-per-page">Rows per page</span>
                        <div className="w-20">
                          <Select
                            value={String(rowsPerPage)}
                            onValueChange={(val: string | null) => {
                              if (val) setRowsPerPage(Number(val));
                            }}
                          >
                            <SelectTrigger
                              aria-labelledby="report-rows-per-page"
                              className="h-8 rounded-xl border-border bg-card text-xs font-semibold text-foreground"
                            >
                              <SelectValue placeholder={String(rowsPerPage)} />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-card text-card-foreground">
                              <SelectGroup>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <span className="ml-2 text-muted-foreground">
                          Showing {(currentPage - 1) * rowsPerPage + 1}–
                          {Math.min(currentPage * rowsPerPage, totalFiltered)}{" "}
                          of {totalFiltered} items
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-center sm:self-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(Math.max(currentPage - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="flex cursor-pointer items-center gap-1 font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft className="size-4" />
                          Previous
                        </button>

                        {pageWindow(currentPage, totalPages).map((item, i) =>
                          item === "gap" ? (
                            <span
                              key={`gap-${i}`}
                              aria-hidden="true"
                              className="px-1 text-muted-foreground"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setCurrentPage(item)}
                              aria-current={
                                currentPage === item ? "page" : undefined
                              }
                              className={cn(
                                "flex size-7 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition",
                                currentPage === item
                                  ? "bg-primary text-primary-foreground shadow-2xs"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              {item}
                            </button>
                          ),
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(Math.min(currentPage + 1, totalPages))
                          }
                          disabled={currentPage === totalPages}
                          className="flex cursor-pointer items-center gap-1 font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="lg:sticky lg:top-6 lg:col-span-4">
              {breakdown && (
                <ReportReasonsBreakdown
                  breakdown={breakdown}
                  activeReasonFilter={reasonFilter}
                  onSelectReason={setReasonFilter}
                />
              )}
            </div>
          </div>

          <ModerationActionDialog
            report={dialogReport}
            actionType={dialogActionType}
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setDialogReport(null);
              setDialogActionType(null);
            }}
          />

          <FlagDetailSheet
            flagId={selectedFlagId}
            isOpen={Boolean(selectedFlagId)}
            onClose={() => setSelectedFlagId(null)}
            onAction={handleAction}
          />
        </>
      ) : activeTab === "showcases" ? (
        <ShowcaseReviewQueue />
      ) : activeTab === "problems" ? (
        <ProblemReviewQueue />
      ) : activeTab === "solutions" ? (
        <SolutionReviewQueue />
      ) : activeTab === "security" ? (
        <SecurityIncidentsTable scope="admin" />
      ) : activeTab === "auto-approval" ? (
        <AutoApprovalSettings />
      ) : (
        <ModerationHistoryTable />
      )}
    </motion.div>
  );
}

function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2)
    [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) items.push("gap");
    items.push(page);
    previous = page;
  }
  return items;
}

function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading content management"
      className="w-full animate-pulse space-y-6 pb-12"
    >
      <span className="sr-only">Loading content management…</span>
      <div className="space-y-2">
        <div className="h-4 w-48 rounded-lg bg-muted/60" />
        <div className="h-8 w-72 rounded-lg bg-muted/60" />
        <div className="h-4 w-full max-w-2xl rounded-lg bg-muted/60" />
      </div>
      <div className="h-16 w-full rounded-2xl bg-muted/60" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-muted/60"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-muted/60 lg:col-span-4" />
      </div>
    </div>
  );
}
