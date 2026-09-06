"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Folder,
  ImageOff,
  Layers,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { ShowcaseDecisionDialog } from "@/components/admin/showcases/ShowcaseDecisionDialog";
import {
  ReviewStatusBadge,
  SubmissionTypeBadge,
} from "@/components/admin/showcases/ShowcaseSubmissionBadges";
import { AdminAuthNotice, isAuthError } from "@/components/admin/AdminAuthGate";
import {
  useGetShowcaseReviewQueueQuery,
  type ShowcaseReviewQueueItem,
} from "@/lib/redux/services/admin/showcaseReviewApi";
import { useGetActiveCategoriesQuery } from "@/lib/redux/services/categoriesApi";
import { excerptOf } from "@/lib/markdown-excerpt";
import type { ShowcaseReviewStatus } from "@/lib/validations/showcase";
import { cn } from "@/lib/utils";

type StatusTab = ShowcaseReviewStatus | "ALL";
type SubmissionFilter = "ALL" | "INITIAL" | "REVISION";
type SortOption = "NEWEST" | "OLDEST";

export const reviewDetailHref = (showcaseId: string) =>
  `/dashboard/content-moderation/showcases/${showcaseId}`;

export function ShowcaseReviewQueue() {
  const [status, setStatus] = useState<StatusTab>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [submissionTypeFilter, setSubmissionTypeFilter] =
    useState<SubmissionFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOption>("NEWEST");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch queue from backend
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetShowcaseReviewQueueQuery({
      reviewStatus: status === "ALL" ? undefined : status,
      pageNumber: page,
      pageSize,
    });

  // Dedicated background count queries so all 4 KPI ribbon cards display counts simultaneously
  const { data: pendingData } = useGetShowcaseReviewQueueQuery({
    reviewStatus: "PENDING",
    pageSize: 1,
  });
  const { data: approvedData } = useGetShowcaseReviewQueueQuery({
    reviewStatus: "APPROVED",
    pageSize: 1,
  });
  const { data: rejectedData } = useGetShowcaseReviewQueueQuery({
    reviewStatus: "REJECTED",
    pageSize: 1,
  });
  const { data: allData } = useGetShowcaseReviewQueueQuery({
    pageSize: 1,
  });

  const pendingCount =
    status === "PENDING" && data?.totalElements !== undefined
      ? data.totalElements
      : pendingData?.totalElements ?? 0;

  const approvedCount =
    status === "APPROVED" && data?.totalElements !== undefined
      ? data.totalElements
      : approvedData?.totalElements ?? 0;

  const rejectedCount =
    status === "REJECTED" && data?.totalElements !== undefined
      ? data.totalElements
      : rejectedData?.totalElements ?? 0;

  const allCount =
    status === "ALL" && data?.totalElements !== undefined
      ? data.totalElements
      : allData?.totalElements ?? (pendingCount + approvedCount + rejectedCount);

  // Fetch categories for filter dropdown
  const { data: categories = [] } = useGetActiveCategoriesQuery("SHOWCASE");

  const [decisionFor, setDecisionFor] =
    useState<ShowcaseReviewQueueItem | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(
    null,
  );

  const rawItems = useMemo(() => data?.content ?? [], [data?.content]);
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Client-side filtering & sorting across the loaded page
  const filteredItems = useMemo(() => {
    let result = [...rawItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.overview?.toLowerCase().includes(q) ||
          item.authorName?.toLowerCase().includes(q) ||
          item.categoryName?.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.name.toLowerCase().includes(q))),
      );
    }

    if (categoryFilter !== "ALL") {
      result = result.filter(
        (item) => item.categoryId === categoryFilter || item.categoryName === categoryFilter,
      );
    }

    if (submissionTypeFilter !== "ALL") {
      result = result.filter(
        (item) => item.submissionType === submissionTypeFilter,
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime() || 0;
      const timeB = new Date(b.submittedAt).getTime() || 0;
      return sortOrder === "NEWEST" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [rawItems, searchQuery, categoryFilter, submissionTypeFilter, sortOrder]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    categoryFilter !== "ALL" ||
    submissionTypeFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setSubmissionTypeFilter("ALL");
    setSortOrder("NEWEST");
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
            setStatus("PENDING");
            setPage(0);
          }}
          className={cn(
            "flex w-full flex-col gap-1 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
            status === "PENDING"
              ? "border-amber-500/50 bg-amber-500/10 shadow-xs ring-1 ring-amber-500/20"
              : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
          )}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Pending Review
            </span>
            <Clock className="size-4 shrink-0 text-amber-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {pendingCount}
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            Awaiting decision
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatus("APPROVED");
            setPage(0);
          }}
          className={cn(
            "flex w-full flex-col gap-1 rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
            status === "APPROVED"
              ? "border-emerald-500/50 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/20"
              : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
          )}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Approved
            </span>
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {approvedCount}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Live on index
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
              Changes Requested
            </span>
            <XCircle className="size-4 shrink-0 text-rose-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {rejectedCount}
          </span>
          <span className="text-[11px] text-rose-600 dark:text-rose-400">
            Returned to author
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
              All Submissions
            </span>
            <Sparkles className="size-4 shrink-0 text-primary" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {allCount}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Full queue archive
          </span>
        </button>
      </div>

      {/* ── Multi-Dimensional Filter Bar ────────────────────────────── */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
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
              placeholder="Search by title, overview, author, or #tags..."
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

            {/* Submission Type Filter */}
            <div className="w-36 sm:w-44">
              <Select
                value={submissionTypeFilter}
                onValueChange={(val) => {
                  setSubmissionTypeFilter((val as SubmissionFilter) || "ALL");
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <Layers className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Submission">
                    {(val: string) => {
                      if (val === "ALL" || !val) return "Type: All";
                      if (val === "INITIAL") return "Initial";
                      if (val === "REVISION") return "Revision";
                      return val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INITIAL">Initial Submission</SelectItem>
                  <SelectItem value="REVISION">Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="w-36 sm:w-44">
              <Select
                value={sortOrder}
                onValueChange={(val) => setSortOrder((val as SortOption) || "NEWEST")}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <ArrowUpDown className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Sort">
                    {(val: string) =>
                      val === "NEWEST"
                        ? "Newest first"
                        : val === "OLDEST"
                          ? "Longest waiting"
                          : "Sort"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="NEWEST">Newest first</SelectItem>
                  <SelectItem value="OLDEST">Longest waiting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                title="List view"
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                title="Grid view"
                className={cn(
                  "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
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
            {submissionTypeFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 rounded-lg px-2 py-0.5 font-normal">
                Type: {submissionTypeFilter === "INITIAL" ? "Initial" : "Revision"}
                <button
                  type="button"
                  onClick={() => setSubmissionTypeFilter("ALL")}
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

      {/* ── Content Rows or Grid ────────────────────────────────────── */}
      {isError ? (
        <PanelCard
          tone="error"
          title="Something went wrong"
          body={messageOf(error, "The review queue could not be loaded.")}
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
        <QueueSkeleton viewMode={viewMode} />
      ) : filteredItems.length === 0 ? (
        <PanelCard
          tone="empty"
          title={
            hasActiveFilters
              ? "No showcases match your filters"
              : status === "PENDING"
                ? "Nothing waiting for review"
                : status === "APPROVED"
                  ? "No approved submissions yet"
                  : "Nothing sent back"
          }
          body={
            hasActiveFilters
              ? "Try broadening your search term or clearing active category and submission type filters."
              : status === "PENDING"
                ? "Every submitted showcase has a decision. New submissions land here the moment an author submits."
                : status === "APPROVED"
                  ? "Approved showcases appear here and are live on the community showcase showcase directory."
                  : "Submissions you request changes on remain here until the author resubmits."
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
          className={`space-y-4 transition-opacity duration-150 ${
            isFetching ? "opacity-70" : ""
          }`}
        >
          {viewMode === "list" ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <ShowcaseListRow
                    key={item.revisionId ?? item.showcaseId}
                    item={item}
                    busy={decisionFor?.showcaseId === item.showcaseId}
                    onDecide={(next) => {
                      setDecisionFor(item);
                      setDecision(next);
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <ShowcaseGridCard
                    key={item.revisionId ?? item.showcaseId}
                    item={item}
                    busy={decisionFor?.showcaseId === item.showcaseId}
                    onDecide={(next) => {
                      setDecisionFor(item);
                      setDecision(next);
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* ── Pagination Bar ─────────────────────────────────────────── */}
          <div className="flex flex-col justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span id="showcase-queue-rows">Rows per page:</span>
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
                    aria-labelledby="showcase-queue-rows"
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
      <ShowcaseDecisionDialog
        showcaseId={decisionFor?.showcaseId ?? ""}
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

// ── List View Row ────────────────────────────────────────────────────────
function ShowcaseListRow({
  item,
  busy,
  onDecide,
}: {
  item: ShowcaseReviewQueueItem;
  busy: boolean;
  onDecide: (decision: "APPROVED" | "REJECTED") => void;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const isPending = item.reviewStatus === "PENDING";
  const cover =
    coverFailed || !item.coverImageUrl?.startsWith("https://")
      ? null
      : item.coverImageUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col gap-4 rounded-2xl border border-border bg-card text-card-foreground p-4 shadow-xs transition-all hover:border-border/80 sm:flex-row ${
        busy ? "opacity-60" : ""
      }`}
    >
      {/* Cover image preview */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-44">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            quality={90}
            sizes="176px"
            onError={() => setCoverFailed(true)}
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff aria-hidden="true" className="size-6" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            <SubmissionTypeBadge type={item.submissionType} />
            {item.categoryName && (
              <span className="rounded-lg border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground bg-muted/60">
                {item.categoryName}
              </span>
            )}
            {isPending ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="size-3" />
                {waitingSince(item.submittedAt)}
              </span>
            ) : (
              <ReviewStatusBadge status={item.reviewStatus} />
            )}
          </div>

          {/* Title & Overview */}
          <h3 className="text-base font-bold text-foreground line-clamp-1">
            {item.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {excerptOf(item.overview ?? "", 190)}
          </p>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {item.tags.slice(0, 5).map((t, idx) => (
              <span
                key={t.id ?? idx}
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5"
              >
                #{t.name}
              </span>
            ))}
            {item.tags.length > 5 && (
              <span className="text-[11px] text-muted-foreground">
                +{item.tags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Bottom bar: Author & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <User className="size-3.5 text-muted-foreground/80" />
            <span>by {item.authorName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={reviewDetailHref(item.showcaseId)}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:bg-muted"
            >
              <Eye className="size-3.5" />
              Review in full
            </Link>

            {isPending && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDecide("REJECTED")}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/5 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/15 disabled:opacity-50"
                >
                  <XCircle className="size-3.5" />
                  Request changes
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDecide("APPROVED")}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="size-3.5" />
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Grid View Card ───────────────────────────────────────────────────────
function ShowcaseGridCard({
  item,
  busy,
  onDecide,
}: {
  item: ShowcaseReviewQueueItem;
  busy: boolean;
  onDecide: (decision: "APPROVED" | "REJECTED") => void;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const isPending = item.reviewStatus === "PENDING";
  const cover =
    coverFailed || !item.coverImageUrl?.startsWith("https://")
      ? null
      : item.coverImageUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col rounded-2xl border border-border bg-card text-card-foreground overflow-hidden shadow-xs transition-all hover:border-border/80 ${
        busy ? "opacity-60" : ""
      }`}
    >
      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            quality={90}
            sizes="(max-width: 768px) 100vw, 380px"
            onError={() => setCoverFailed(true)}
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff aria-hidden="true" className="size-8" />
          </span>
        )}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <SubmissionTypeBadge type={item.submissionType} />
        </div>
        <div className="absolute top-2.5 right-2.5">
          {isPending ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 text-white px-2 py-0.5 text-[11px] font-bold backdrop-blur-xs">
              <Clock className="size-3" />
              Pending
            </span>
          ) : (
            <ReviewStatusBadge status={item.reviewStatus} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-2">
          {item.categoryName && (
            <span className="inline-block rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {item.categoryName}
            </span>
          )}
          <h3 className="text-base font-bold text-foreground line-clamp-1">
            {item.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {excerptOf(item.overview ?? "", 140)}
          </p>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {item.tags.slice(0, 3).map((t, idx) => (
                <span
                  key={t.id ?? idx}
                  className="text-[10px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate font-semibold">by {item.authorName}</span>
            <span className="text-[11px] shrink-0">{waitingSince(item.submittedAt)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={reviewDetailHref(item.showcaseId)}
              className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-border bg-card text-xs font-bold text-foreground transition hover:bg-muted"
            >
              <Eye className="size-3.5" />
              Review
            </Link>

            {isPending ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onDecide("APPROVED")}
                className="inline-flex h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-emerald-600 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="size-3.5" />
                Approve
              </button>
            ) : (
              <span className="inline-flex h-8 items-center justify-center text-xs font-semibold text-muted-foreground">
                Done
              </span>
            )}
          </div>
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

function QueueSkeleton({ viewMode }: { viewMode: "list" | "grid" }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden h-72">
            <div className="aspect-video w-full bg-muted/60" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-24 rounded bg-muted/60" />
              <div className="h-5 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-full rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading the review queue"
      className="animate-pulse space-y-3"
    >
      <span className="sr-only">Loading the review queue…</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row"
        >
          <div className="aspect-video w-full shrink-0 rounded-xl bg-muted/60 sm:w-44" />
          <div className="flex flex-1 flex-col gap-2.5">
            <div className="flex gap-2">
              <div className="h-6 w-28 rounded-lg bg-muted/60" />
              <div className="h-6 w-20 rounded-lg bg-muted/60" />
            </div>
            <div className="h-5 w-3/5 rounded-lg bg-muted/60" />
            <div className="h-4 w-full rounded-lg bg-muted/60" />
            <div className="mt-2 flex justify-between">
              <div className="h-6 w-28 rounded-lg bg-muted/60" />
              <div className="h-8 w-56 rounded-xl bg-muted/60" />
            </div>
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
