"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  GitBranch,
  Lightbulb,
  ListChecks,
  MessageSquare,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  User,
  Wrench,
  X,
  XCircle,
  type LucideIcon,
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
import {
  SolutionDecisionDialog,
  type SolutionDecision,
} from "@/components/admin/solutions/SolutionDecisionDialog";
import { AdminAuthNotice, isAuthError } from "@/components/admin/AdminAuthGate";
import { useGetAdminSolutionsQuery } from "@/lib/redux/services/admin/solutionAdminApi";
import type {
  SolutionResponse,
  SolutionReviewStatus,
} from "@/lib/types/admin/solutionAdminTypes";
import { excerptOf } from "@/lib/markdown-excerpt";
import { APPROACH_LABELS, type ApproachType } from "@/lib/validations/solution";
import { authorNameOf, messageOf } from "@/lib/discussions/format";
import { cn } from "@/lib/utils";

type StatusTab = SolutionReviewStatus | "ALL";
type AcceptedFilter = "ALL" | "ACCEPTED" | "UNACCEPTED";

export const solutionReviewHref = (solutionId: string) =>
  `/dashboard/content-moderation/solutions/${solutionId}`;

const APPROACH_CONFIG: Record<
  ApproachType,
  { label: string; chipClass: string; icon: LucideIcon }
> = {
  FIX: {
    label: "Direct Fix",
    chipClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
    icon: Wrench,
  },
  WORKAROUND: {
    label: "Workaround",
    chipClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
    icon: Sparkles,
  },
  EXPLANATION: {
    label: "Explanation",
    chipClass: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold",
    icon: BookOpen,
  },
  ALTERNATIVE: {
    label: "Alternative",
    chipClass: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold",
    icon: GitBranch,
  },
};

export function SolutionReviewQueue() {
  const [status, setStatus] = useState<StatusTab>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [approachFilter, setApproachFilter] = useState<ApproachType | "ALL">("ALL");
  const [acceptedFilter, setAcceptedFilter] = useState<AcceptedFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetAdminSolutionsQuery({
      reviewStatus: status === "ALL" ? undefined : status,
      pageNumber: page,
      pageSize,
    });

  // Dedicated background count queries so all 4 KPI ribbon cards display counts simultaneously
  const { data: pendingData } = useGetAdminSolutionsQuery({
    reviewStatus: "PENDING",
    pageSize: 1,
  });
  const { data: approvedData } = useGetAdminSolutionsQuery({
    reviewStatus: "APPROVED",
    pageSize: 1,
  });
  const { data: rejectedData } = useGetAdminSolutionsQuery({
    reviewStatus: "REJECTED",
    pageSize: 1,
  });
  const { data: allData } = useGetAdminSolutionsQuery({
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

  const [decisionFor, setDecisionFor] = useState<SolutionResponse | null>(null);
  const [decision, setDecision] = useState<SolutionDecision | null>(null);

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
          item.summary?.toLowerCase().includes(q) ||
          item.bodyMarkdown?.toLowerCase().includes(q) ||
          authorNameOf(item.author, "").toLowerCase().includes(q) ||
          item.problemId?.toLowerCase().includes(q) ||
          (item.testedWith &&
            item.testedWith.some((t) => t.technology?.toLowerCase().includes(q))),
      );
    }

    if (approachFilter !== "ALL") {
      result = result.filter((item) => item.approachType === approachFilter);
    }

    if (acceptedFilter === "ACCEPTED") {
      result = result.filter((item) => item.isAccepted);
    } else if (acceptedFilter === "UNACCEPTED") {
      result = result.filter((item) => !item.isAccepted);
    }

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return sortOrder === "NEWEST" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [rawItems, searchQuery, approachFilter, acceptedFilter, sortOrder]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    approachFilter !== "ALL" ||
    acceptedFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchQuery("");
    setApproachFilter("ALL");
    setAcceptedFilter("ALL");
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
              Pending Solutions
            </span>
            <Clock className="size-4 shrink-0 text-amber-500" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {pendingCount}
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            Awaiting verification
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
            Visible to community
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
            Turned down answers
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
              All Solutions
            </span>
            <Lightbulb className="size-4 shrink-0 text-primary" />
          </div>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {allCount}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Full solution archive
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
              placeholder="Search by summary, body, author, or problem ID..."
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
            {/* Approach Type Filter */}
            <div className="w-36 sm:w-44">
              <Select
                value={approachFilter}
                onValueChange={(val) => {
                  setApproachFilter((val as ApproachType | "ALL") || "ALL");
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <Wrench className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Approach Type">
                    {(val: string) =>
                      val === "ALL" || !val
                        ? "Approach: All"
                        : (APPROACH_CONFIG[val as ApproachType]?.label ?? val)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="ALL">All Approaches</SelectItem>
                  {(Object.keys(APPROACH_CONFIG) as ApproachType[]).map((app) => {
                    const Icon = APPROACH_CONFIG[app].icon;
                    return (
                      <SelectItem key={app} value={app}>
                        <span className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          {APPROACH_CONFIG[app].label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Accepted Status Filter */}
            <div className="w-36 sm:w-44">
              <Select
                value={acceptedFilter}
                onValueChange={(val) => {
                  setAcceptedFilter((val as AcceptedFilter) || "ALL");
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <CheckCircle2 className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Accepted status">
                    {(val: string) => {
                      if (val === "ALL" || !val) return "Status: All";
                      if (val === "ACCEPTED") return "Accepted";
                      if (val === "UNACCEPTED") return "Unaccepted";
                      return val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="ALL">All Solutions</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted by asker</SelectItem>
                  <SelectItem value="UNACCEPTED">Not accepted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="w-36 sm:w-44">
              <Select
                value={sortOrder}
                onValueChange={(val) =>
                  setSortOrder(val as "NEWEST" | "OLDEST")
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-muted/40 text-xs font-semibold">
                  <ArrowUpDown className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Sort order">
                    {(val: string) =>
                      val === "NEWEST"
                        ? "Newest first"
                        : val === "OLDEST"
                          ? "Longest waiting"
                          : "Sort order"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  <SelectItem value="NEWEST">Newest first</SelectItem>
                  <SelectItem value="OLDEST">Longest waiting</SelectItem>
                </SelectContent>
              </Select>
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
            {approachFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 rounded-lg px-2 py-0.5 font-normal">
                Approach: {APPROACH_CONFIG[approachFilter].label}
                <button
                  type="button"
                  onClick={() => setApproachFilter("ALL")}
                  className="hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {acceptedFilter !== "ALL" && (
              <Badge variant="secondary" className="gap-1 rounded-lg px-2 py-0.5 font-normal">
                Status: {acceptedFilter === "ACCEPTED" ? "Accepted only" : "Not accepted"}
                <button
                  type="button"
                  onClick={() => setAcceptedFilter("ALL")}
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
          body={messageOf(error, "The solution queue could not be loaded.")}
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
              ? "No solutions match your filters"
              : status === "PENDING"
                ? "Nothing waiting for review"
                : status === "APPROVED"
                  ? "No approved solutions yet"
                  : "Nothing rejected"
          }
          body={
            hasActiveFilters
              ? "Try adjusting your search criteria or resetting the approach type and accepted status filters."
              : status === "PENDING"
                ? "Every posted answer has a decision. New ones land here the moment a member submits an answer."
                : status === "APPROVED"
                  ? "Approved answers appear here, and on the problem each one answers."
                  : "Answers you turn away stay here, along with the feedback reason you gave."
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
                busy={decisionFor?.id === item.id}
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
              <span id="solution-queue-rows">Rows per page:</span>
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
                    aria-labelledby="solution-queue-rows"
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
      <SolutionDecisionDialog
        solutionId={decisionFor?.id ?? ""}
        title={decisionFor?.summary ?? ""}
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
  item: SolutionResponse;
  busy: boolean;
  onDecide: (decision: SolutionDecision) => void;
}) {
  const review = item.moderation?.status ?? "PENDING";
  const isPending = review === "PENDING";
  const steps = (item.verificationSteps ?? []).filter(
    (step) => step.instruction || step.expectedResult,
  );
  const tested = (item.testedWith ?? []).filter((entry) => entry.technology);

  const approachCfg = item.approachType ? APPROACH_CONFIG[item.approachType] : null;
  const ApproachIcon = approachCfg ? approachCfg.icon : Wrench;

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
      {/* Top Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <ReviewBadge status={review} />

        {/* Approach Type */}
        {approachCfg && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-xs",
              approachCfg.chipClass,
            )}
          >
            <ApproachIcon className="size-3.5 shrink-0" />
            {approachCfg.label}
          </span>
        )}

        {/* Accepted Badge */}
        {item.isAccepted && (
          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Accepted by asker
          </span>
        )}

        {/* Steps count */}
        {steps.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            <ListChecks aria-hidden="true" className="size-3.5 text-primary" />
            {steps.length} {steps.length === 1 ? "verification step" : "verification steps"}
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

      {/* Rejection Note */}
      {review === "REJECTED" && item.moderation?.rejectionReason && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300">
          <span className="font-bold">Rejection reason: </span>
          {item.moderation.rejectionReason}
        </p>
      )}

      {/* Summary & Body */}
      <div className="min-w-0 space-y-1">
        <h3 className="text-base font-bold text-foreground line-clamp-1">
          {item.summary || "Untitled answer"}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {excerptOf(item.bodyMarkdown ?? "", 220)}
        </p>
      </div>

      {/* Tested-With Environment Chips */}
      {tested.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tested.map((entry, index) => (
            <span
              key={`${entry.technology}-${index}`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground"
            >
              <Code2 className="size-3 text-muted-foreground/70" />
              {entry.technology}
              {entry.version ? ` ${entry.version}` : ""}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Bar: Problem link, author & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-semibold flex items-center gap-1.5">
            <User className="size-3.5 text-muted-foreground/80" />
            by {authorNameOf(item.author)}
          </span>

          {item.problemId && (
            <Link
              href={`/community/${item.problemId}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              <ExternalLink aria-hidden="true" className="size-3.5" />
              Target Problem
            </Link>
          )}

          <div className="flex items-center gap-3 tabular-nums">
            <span
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title="Vote score"
            >
              <ThumbsUp className="size-3.5 text-muted-foreground" />
              {item.voteScore ?? 0}
            </span>
            <span
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              title="Comments count"
            >
              <MessageSquare className="size-3.5 text-muted-foreground" />
              {item.commentCount ?? 0}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={solutionReviewHref(item.id)}
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
                Reject
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
    </motion.div>
  );
}

export function ReviewBadge({ status }: { status: SolutionReviewStatus }) {
  const styles: Record<SolutionReviewStatus, string> = {
    PENDING:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    APPROVED:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    REJECTED:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    ACCEPTED:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  };
  const labels: Record<SolutionReviewStatus, string> = {
    PENDING: "Pending review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    ACCEPTED: "Accepted",
  };

  return (
    <span
      className={cn("rounded-lg px-2.5 py-0.5 text-xs font-bold border", styles[status])}
    >
      {labels[status]}
    </span>
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
      aria-label="Loading the solution queue"
      className="animate-pulse space-y-3"
    >
      <span className="sr-only">Loading the solution queue…</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex gap-2">
            <div className="h-6 w-28 rounded-lg bg-muted/60" />
            <div className="h-6 w-24 rounded-lg bg-muted/60" />
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
