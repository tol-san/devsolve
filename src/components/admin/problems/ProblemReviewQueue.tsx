"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Bug,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  Eye,
  FileQuestion,
  Filter,
  Folder,
  Gauge,
  HelpCircle,
  Layers,
  MessageSquare,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Trash2,
  User,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TakedownDialog } from "@/components/admin/TakedownDialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProblemDecisionDialog,
  type ProblemDecision,
} from "@/components/admin/problems/ProblemDecisionDialog";
import { ProblemStatusBadge } from "@/components/admin/problems/ProblemStatusBadge";
import { AdminAuthNotice, isAuthError } from "@/components/admin/AdminAuthGate";
import { useGetProblemReviewQueueQuery } from "@/lib/redux/services/admin/problemReviewApi";
import { useGetActiveCategoriesQuery } from "@/lib/redux/services/categoriesApi";
import type { ProblemResponse } from "@/lib/redux/services/problemsApi";
import { excerptOf } from "@/lib/markdown-excerpt";
import {
  PROBLEM_TYPE_LABELS,
  SDLC_LABELS,
  SEVERITY_LABELS,
  type ProblemSeverity,
  type ProblemStatus,
  type ProblemType,
  type SdlcPhase,
} from "@/lib/validations/problem";
import { authorNameOf } from "@/lib/discussions/format";
import { cn } from "@/lib/utils";

type StatusTab = ProblemStatus | "ALL";

export const problemReviewHref = (problemId: string) =>
  `/dashboard/content-moderation/problems/${problemId}`;

const SEVERITY_CONFIG: Record<
  ProblemSeverity,
  { label: string; chipClass: string; dotClass: string }
> = {
  CRITICAL: {
    label: "Critical",
    chipClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold",
    dotClass: "bg-rose-500",
  },
  HIGH: {
    label: "High",
    chipClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold",
    dotClass: "bg-amber-500",
  },
  MEDIUM: {
    label: "Medium",
    chipClass: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold",
    dotClass: "bg-blue-500",
  },
  LOW: {
    label: "Low",
    chipClass: "border-border bg-muted/60 text-muted-foreground font-medium",
    dotClass: "bg-muted-foreground",
  },
};

const PROBLEM_TYPE_ICONS: Record<ProblemType, LucideIcon> = {
  BUG: Bug,
  SECURITY: Shield,
  PERFORMANCE: Gauge,
  ARCHITECTURE: Layers,
  HOW_TO: HelpCircle,
  DEPLOYMENT: Cpu,
  GENERAL: FileQuestion,
};

export function ProblemReviewQueue() {
  const [status, setStatus] = useState<StatusTab>("PENDING_APPROVAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState<ProblemSeverity | "ALL">("ALL");
  const [problemTypeFilter, setProblemTypeFilter] = useState<ProblemType | "ALL">("ALL");
  const [sdlcPhaseFilter, setSdlcPhaseFilter] = useState<SdlcPhase | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"createdAt,ASC" | "createdAt,DESC">("createdAt,ASC");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetProblemReviewQueueQuery({
      status: status === "ALL" ? undefined : status,
      page,
      size: pageSize,
      sort: sortOrder,
    });

  // Dedicated background count queries so all 4 KPI ribbon cards display counts simultaneously
  const { data: pendingData } = useGetProblemReviewQueueQuery({
    status: "PENDING_APPROVAL",
    size: 1,
  });
  const { data: publishedData } = useGetProblemReviewQueueQuery({
    status: "PUBLISHED",
    size: 1,
  });
  const { data: rejectedData } = useGetProblemReviewQueueQuery({
    status: "REJECTED",
    size: 1,
  });
  const { data: allData } = useGetProblemReviewQueueQuery({
    size: 1,
  });

  const pendingCount =
    status === "PENDING_APPROVAL" && data?.totalElements !== undefined
      ? data.totalElements
      : pendingData?.totalElements ?? 0;

  const publishedCount =
    status === "PUBLISHED" && data?.totalElements !== undefined
      ? data.totalElements
      : publishedData?.totalElements ?? 0;

  const rejectedCount =
    status === "REJECTED" && data?.totalElements !== undefined
      ? data.totalElements
      : rejectedData?.totalElements ?? 0;

  const allCount =
    status === "ALL" && data?.totalElements !== undefined
      ? data.totalElements
      : allData?.totalElements ?? (pendingCount + publishedCount + rejectedCount);

  const { data: categories = [] } = useGetActiveCategoriesQuery("PROBLEM");

  const [decisionFor, setDecisionFor] = useState<ProblemResponse | null>(null);
  const [decision, setDecision] = useState<ProblemDecision | null>(null);

  const rawItems = useMemo(() => data?.content ?? [], [data?.content]);
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Client-side filtering across the loaded page
  const filteredItems = useMemo(() => {
    let result = [...rawItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          authorNameOf(item.author, "").toLowerCase().includes(q) ||
          item.category?.name?.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.name?.toLowerCase().includes(q))) ||
          (item.technologies && item.technologies.some((t) => t.name?.toLowerCase().includes(q))),
      );
    }

    if (categoryFilter !== "ALL") {
      result = result.filter(
        (item) => item.category?.id === categoryFilter || item.category?.name === categoryFilter,
      );
    }

    if (severityFilter !== "ALL") {
      result = result.filter((item) => item.severity === severityFilter);
    }

    if (problemTypeFilter !== "ALL") {
      result = result.filter((item) => item.problemType === problemTypeFilter);
    }

    if (sdlcPhaseFilter !== "ALL") {
      result = result.filter((item) => item.sdlcPhase === sdlcPhaseFilter);
    }

    return result;
  }, [rawItems, searchQuery, categoryFilter, severityFilter, problemTypeFilter, sdlcPhaseFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "ALL" ||
    severityFilter !== "ALL" ||
    problemTypeFilter !== "ALL" ||
    sdlcPhaseFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setSeverityFilter("ALL");
    setProblemTypeFilter("ALL");
    setSdlcPhaseFilter("ALL");
    setSortOrder("createdAt,ASC");
    setPage(0);
  };

  if (isError && isAuthError(error)) {
    return <AdminAuthNotice error={error} />;
  }

  return (
    <div className="space-y-5">
      {/* ── KPI Summary Ribbon ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setStatus("PENDING_APPROVAL");
            setPage(0);
          }}
          className={cn(
            "flex w-full flex-col gap-1 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
            status === "PENDING_APPROVAL"
              ? "border-amber-500/50 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/20"
              : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
          )}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Pending Approval
            </span>
            <Clock className="size-4 shrink-0 text-amber-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {pendingCount}
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            Awaiting moderator review
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("PUBLISHED");
            setPage(0);
          }}
          className={cn(
            "flex w-full flex-col gap-1 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
            status === "PUBLISHED"
              ? "border-emerald-500/50 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/20"
              : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
          )}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Published
            </span>
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {publishedCount}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Live on community feed
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("REJECTED");
            setPage(0);
          }}
          className={cn(
            "flex w-full flex-col gap-1 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
            status === "REJECTED"
              ? "border-rose-500/50 bg-rose-500/10 shadow-xs ring-1 ring-rose-500/20"
              : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
          )}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Rejected
            </span>
            <XCircle className="size-4 shrink-0 text-rose-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {rejectedCount}
          </span>
          <span className="text-[11px] text-rose-600 dark:text-rose-400">
            Turned away / invalid
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("ALL");
            setPage(0);
          }}
          className={cn(
            "flex w-full flex-col gap-1 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
            status === "ALL"
              ? "border-primary/50 bg-primary/10 shadow-xs ring-1 ring-primary/20"
              : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
          )}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              All Problems
            </span>
            <Sparkles className="size-4 shrink-0 text-primary" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {allCount}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Full problem inventory
          </span>
        </button>
      </div>

      {/* ── Multi-Dimensional Filter Bar ────────────────────────────── */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        {/* Row 1: Search & Primary Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search by problem title, description, author, or tech..."
              className="h-10 pl-9 pr-9 rounded-xl border-border bg-muted/40 text-sm placeholder:text-muted-foreground focus-visible:ring-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter */}
            <div className="w-36 sm:w-44">
              <Select
                value={severityFilter}
                onValueChange={(val) => {
                  setSeverityFilter((val as ProblemSeverity | "ALL") || "ALL");
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <Shield className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Severity">
                    {(val: string) =>
                      val === "ALL" || !val
                        ? "Severity: All"
                        : (SEVERITY_LABELS[val as ProblemSeverity] ?? val)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="ALL">All Severities</SelectItem>
                  {(Object.keys(SEVERITY_CONFIG) as ProblemSeverity[]).map((sev) => (
                    <SelectItem key={sev} value={sev}>
                      <span className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", SEVERITY_CONFIG[sev].dotClass)} />
                        {SEVERITY_LABELS[sev]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Problem Type Filter */}
            <div className="w-36 sm:w-44">
              <Select
                value={problemTypeFilter}
                onValueChange={(val) => {
                  setProblemTypeFilter((val as ProblemType | "ALL") || "ALL");
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <Filter className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Problem Type">
                    {(val: string) =>
                      val === "ALL" || !val
                        ? "Type: All"
                        : (PROBLEM_TYPE_LABELS[val as ProblemType] ?? val)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="ALL">All Types</SelectItem>
                  {(Object.keys(PROBLEM_TYPE_LABELS) as ProblemType[]).map((pt) => {
                    const Icon = PROBLEM_TYPE_ICONS[pt];
                    return (
                      <SelectItem key={pt} value={pt}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          {PROBLEM_TYPE_LABELS[pt]}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="w-36 sm:w-44">
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val || "ALL");
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <Folder className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Category">
                    {(val: string) => {
                      if (val === "ALL" || !val) return "Category: All";
                      return categories.find((c) => c.id === val || c.name === val)?.name ?? val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="w-36 sm:w-44">
              <Select
                value={sortOrder}
                onValueChange={(val) =>
                  setSortOrder(val as "createdAt,ASC" | "createdAt,DESC")
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <ArrowUpDown className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Sort order">
                    {(val: string) =>
                      val === "createdAt,ASC"
                        ? "Longest waiting"
                        : val === "createdAt,DESC"
                          ? "Newest first"
                          : "Sort order"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="createdAt,ASC">Longest waiting</SelectItem>
                  <SelectItem value="createdAt,DESC">Newest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Row 2: Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60 text-xs">
            <span className="font-semibold text-muted-foreground mr-1">Active filters:</span>
            {searchQuery.trim() && (
              <Badge variant="secondary" className="gap-1 rounded-lg px-2 py-0.5 font-normal">
                Search: &ldquo;{searchQuery.trim()}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {severityFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 rounded-lg px-2 py-0.5 font-normal">
                Severity: {SEVERITY_LABELS[severityFilter]}
                <button
                  type="button"
                  onClick={() => setSeverityFilter("ALL")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {problemTypeFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 rounded-lg px-2 py-0.5 font-normal">
                Type: {PROBLEM_TYPE_LABELS[problemTypeFilter]}
                <button
                  type="button"
                  onClick={() => setProblemTypeFilter("ALL")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {categoryFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 rounded-lg px-2 py-0.5 font-normal">
                Category: {categories.find((c) => c.id === categoryFilter)?.name ?? categoryFilter}
                <button
                  type="button"
                  onClick={() => setCategoryFilter("ALL")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-primary hover:underline ml-2 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* ── Content Rows ────────────────────────────────────────────── */}
      {isError ? (
        <PanelCard
          tone="error"
          title="Something went wrong"
          body={messageOf(error, "The problem queue could not be loaded.")}
          action={
            <Button
              type="button"
              onClick={() => void refetch()}
              className="rounded-xl"
            >
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : isLoading ? (
        <QueueSkeleton />
      ) : filteredItems.length === 0 ? (
        <PanelCard
          tone="empty"
          title={
            hasActiveFilters
              ? "No problems match your filters"
              : status === "PENDING_APPROVAL"
                ? "Nothing waiting for review"
                : status === "PUBLISHED"
                  ? "No published problems yet"
                  : "Nothing rejected"
          }
          body={
            hasActiveFilters
              ? "Try adjusting your search criteria or resetting the severity, type, and category filters."
              : status === "PENDING_APPROVAL"
                ? "Every submitted problem has a decision. New ones land here the moment an author submits."
                : status === "PUBLISHED"
                  ? "Approved problems appear here, and are visible on the public problem feed."
                  : "Problems you turn away remain recorded here."
          }
          action={
            hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="rounded-xl"
              >
                Reset filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          aria-busy={isFetching}
          className={`space-y-3 transition-opacity duration-150 ${
            isFetching ? "opacity-70" : ""
          }`}
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <QueueRow
                key={item.id}
                item={item}
                busy={Boolean(item.id) && decisionFor?.id === item.id}
                onDecide={(next) => {
                  setDecisionFor(item);
                  setDecision(next);
                }}
              />
            ))}
          </AnimatePresence>

          {/* ── Pagination Bar ─────────────────────────────────────────── */}
          <div className="flex flex-col justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span id="problem-queue-rows">Rows per page:</span>
              <div className="w-20">
                <Select
                  value={String(pageSize)}
                  onValueChange={(value: string | null) => {
                    if (!value) return;
                    setPageSize(Number(value));
                    setPage(0);
                  }}
                >
                  <SelectTrigger
                    aria-labelledby="problem-queue-rows"
                    className="h-8 rounded-xl border-border bg-card text-xs font-semibold text-foreground"
                  >
                    <SelectValue placeholder={String(pageSize)} />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-card-foreground">
                    {[10, 25, 50].map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="ml-2">
                Showing {page * pageSize + 1}–
                {Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
              </span>
            </div>

            <div className="flex items-center gap-2 self-center sm:self-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                className="rounded-xl"
              >
                <ChevronLeft className="size-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-bold tabular-nums text-foreground px-2">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl"
              >
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Dialog */}
      <ProblemDecisionDialog
        problemId={decisionFor?.id ?? ""}
        title={decisionFor?.title ?? ""}
        decision={decision}
        isOpen={Boolean(decisionFor && decision)}
        onClose={() => {
          setDecisionFor(null);
          setDecision(null);
        }}
      />
    </div>
  );
}

function QueueRow({
  item,
  busy,
  onDecide,
}: {
  item: ProblemResponse;
  busy: boolean;
  onDecide: (decision: ProblemDecision) => void;
}) {
  const [takingDown, setTakingDown] = useState(false);
  const isPending = item.status === "PENDING_APPROVAL";
  const isLive = item.status === "PUBLISHED" || item.status === "RESOLVED";
  const description = item.description ?? "";
  const warnings = item.contentWarnings ?? [];
  const technologies = item.technologies ?? [];
  const tags = item.tags ?? [];

  const TypeIcon = item.problemType ? PROBLEM_TYPE_ICONS[item.problemType] : FileQuestion;
  const severityCfg = item.severity ? SEVERITY_CONFIG[item.severity] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col gap-3 rounded-2xl border border-border bg-card text-card-foreground p-4 shadow-xs transition-all hover:border-border/80 ${
        busy ? "opacity-60" : ""
      }`}
    >
      {/* Top Metadata Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <ProblemStatusBadge status={item.status} />

        {/* Severity Badge */}
        {severityCfg && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs",
              severityCfg.chipClass,
            )}
          >
            <span className={cn("size-2 rounded-full", severityCfg.dotClass)} />
            {severityCfg.label}
          </span>
        )}

        {/* Problem Type */}
        {item.problemType && (
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            <TypeIcon className="size-3.5 text-primary shrink-0" />
            {PROBLEM_TYPE_LABELS[item.problemType]}
          </span>
        )}

        {/* Category */}
        {item.category?.name && (
          <span className="rounded-lg border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted/60">
            {item.category.name}
          </span>
        )}

        {/* SDLC Phase */}
        {item.sdlcPhase && (
          <span className="rounded-lg bg-muted/50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border">
            {SDLC_LABELS[item.sdlcPhase]}
          </span>
        )}

        {/* Waiting duration */}
        {isPending && item.createdAt && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 ml-auto">
            <Clock className="size-3" />
            {waitingSince(item.createdAt)}
          </span>
        )}
      </div>

      {/* Auto Flag Warnings */}
      {warnings.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <AlertTriangle
            aria-hidden="true"
            className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
            Flagged automatically:
          </span>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            {warnings.join(", ")}
          </span>
        </div>
      )}

      {/* Title & Description */}
      <div className="min-w-0 space-y-1">
        <h3 className="text-base font-bold text-foreground line-clamp-1">
          {item.title ?? "Untitled problem"}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {excerptOf(description, 220)}
        </p>
      </div>

      {/* Technologies & Tags */}
      {(technologies.length > 0 || tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {technologies.map((tech, index) => (
            <span
              key={tech.id ?? `${tech.name}-${index}`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground font-mono"
            >
              <Code2 className="size-3 text-muted-foreground/70" />
              {tech.name}
              {tech.version ? ` ${tech.version}` : ""}
            </span>
          ))}
          {tags.map((tag, index) => (
            <span
              key={tag.id ?? `${tag.name}-${index}`}
              className="rounded-md bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border/80"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Bar: Engagement Stats, Author, & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-semibold flex items-center gap-1.5">
            <User className="size-3.5 text-muted-foreground/80" />
            by {authorNameOf(item.author)}
          </span>

          <div className="flex items-center gap-3 tabular-nums">
            <span
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title="Solutions submitted"
            >
              <CheckCircle2 className="size-3.5 text-muted-foreground" />
              {item.solutionCount ?? 0}
            </span>
            <span
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title="Community comments"
            >
              <MessageSquare className="size-3.5 text-muted-foreground" />
              {item.commentCount ?? 0}
            </span>
            <span
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title="Vote score"
            >
              <ThumbsUp className="size-3.5 text-muted-foreground" />
              {item.voteScore ?? 0}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {item.id && (
            <Link
              href={problemReviewHref(item.id)}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:bg-muted"
            >
              <Eye className="size-3.5" />
              Review in full
            </Link>
          )}

          {isPending && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDecide("REJECTED")}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/5 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/15 disabled:opacity-50"
              >
                <XCircle className="size-3.5" />
                Reject
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDecide("PUBLISHED")}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="size-3.5" />
                Approve
              </button>
            </>
          )}

          {isLive && item.id && (
            <>
              <button
                type="button"
                onClick={() => setTakingDown(true)}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/5 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/15"
              >
                <Trash2 className="size-3.5" />
                Take down
              </button>
              <TakedownDialog
                open={takingDown}
                onOpenChange={setTakingDown}
                targetType="PROBLEM"
                targetId={item.id}
                targetTitle={item.title}
                targetAuthor={authorNameOf(item.author)}
              />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function waitingSince(iso: string) {
  const submitted = new Date(iso);
  if (Number.isNaN(submitted.getTime())) return "";

  const days = Math.floor((Date.now() - submitted.getTime()) / 86_400_000);
  if (days <= 0) return "Submitted today";
  if (days === 1) return "Waiting 1 day";
  return `Waiting ${days} days`;
}

function PanelCard({
  tone,
  title,
  body,
  action,
}: {
  tone: "empty" | "error";
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="space-y-4 rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
      <div
        className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${
          tone === "error"
            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {tone === "error" ? (
          <AlertCircle className="size-7" />
        ) : (
          <ShieldCheck className="size-7" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{body}</p>
      </div>
      {action && <div className="flex justify-center">{action}</div>}
    </Card>
  );
}

function QueueSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading the problem queue"
      className="animate-pulse space-y-3"
    >
      <span className="sr-only">Loading the problem queue…</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-lg bg-muted/60" />
            <div className="h-6 w-20 rounded-lg bg-muted/60" />
            <div className="h-6 w-28 rounded-lg bg-muted/60" />
          </div>
          <div className="h-5 w-2/3 rounded-lg bg-muted/60" />
          <div className="h-4 w-full rounded-lg bg-muted/60" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-36 rounded-lg bg-muted/60" />
            <div className="h-8 w-48 rounded-xl bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function messageOf(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data) return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  return fallback;
}
