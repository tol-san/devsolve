"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertCircle,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Flag,
  Layers,
  List,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminAuthNotice, isAuthError } from "@/components/admin/AdminAuthGate";
import {
  ResolveFlagDialog,
  type BulkTargetDescriptor,
} from "@/components/admin/ResolveFlagDialog";
import {
  useDismissFlagMutation,
  useDismissFlagTargetMutation,
  useGetAdminFlagsQuery,
  useGetAdminFlagsSummaryQuery,
  useGetGroupedAdminFlagsQuery,
  type FlagResponse,
  type GroupedFlagItem,
} from "@/lib/redux/services/admin/adminFlagsApi";
import {
  ADMIN_FLAGGABLE_TYPES,
  FLAGGABLE_TYPE_LABELS,
  FLAG_REASON_LABELS,
  FLAG_SORTS,
  type AdminFlaggableType,
  type FlagSort,
  type FlagStatus,
  type FlagTarget,
} from "@/lib/validations/moderation";
import { FLAG_REASONS, type FlagReason } from "@/lib/validations/engagement";
import { messageOf } from "@/lib/discussions/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_TABS: { value: FlagStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

const SORT_LABELS: Record<FlagSort, string> = {
  NEWEST: "Newest",
  OLDEST: "Longest waiting",
  MOST_REPORTED: "Most reported",
};

function formatWaitTime(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    if (diffMs <= 0) return "Just now";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return "< 1 hr waiting";
    if (hours < 24) return `${hours}h waiting`;
    const days = Math.floor(hours / 24);
    return `${days}d waiting`;
  } catch {
    return "Recent";
  }
}

function formatReportDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ReportQueue() {
  const [status, setStatus] = useState<FlagStatus>("PENDING");
  const [isGrouped, setIsGrouped] = useState(false);
  const [flaggableType, setFlaggableType] = useState<AdminFlaggableType | "ALL">("ALL");
  const [reason, setReason] = useState<FlagReason | "ALL">("ALL");
  const [sort, setSort] = useState<FlagSort>("NEWEST");
  const [pageNumber, setPageNumber] = useState(0);

  // Search with 300ms debounce
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim().slice(0, 200));
      setPageNumber(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // When switching views, set natural default sort
  const handleToggleGrouped = () => {
    setIsGrouped((prev) => {
      const next = !prev;
      setSort(next ? "MOST_REPORTED" : "NEWEST");
      setPageNumber(0);
      return next;
    });
  };

  // Summary badge counters
  const { data: summary, refetch: refetchSummary } = useGetAdminFlagsSummaryQuery();

  // Flat query
  const flatQuery = useGetAdminFlagsQuery(
    {
      status,
      flaggableType: flaggableType === "ALL" ? undefined : flaggableType,
      reason: reason === "ALL" ? undefined : reason,
      search: debouncedSearch || undefined,
      sort,
      pageNumber,
      pageSize: PAGE_SIZE,
    },
    { skip: isGrouped }
  );

  // Grouped query
  const groupedQuery = useGetGroupedAdminFlagsQuery(
    {
      status,
      flaggableType: flaggableType === "ALL" ? undefined : flaggableType,
      reason: reason === "ALL" ? undefined : reason,
      search: debouncedSearch || undefined,
      sort,
      pageNumber,
      pageSize: PAGE_SIZE,
    },
    { skip: !isGrouped }
  );

  const activeQuery = isGrouped ? groupedQuery : flatQuery;
  const flatItems = useMemo(() => flatQuery.data?.items ?? [], [flatQuery.data]);
  const groupedItems = useMemo(
    () => groupedQuery.data?.items ?? [],
    [groupedQuery.data]
  );

  // Mutation hooks
  const [dismissSingleFlag, { isLoading: isDismissingSingle }] =
    useDismissFlagMutation();
  const [dismissTargetFlags, { isLoading: isDismissingTarget }] =
    useDismissFlagTargetMutation();

  const [busyId, setBusyId] = useState<string | null>(null);

  // Modal resolution state
  const [resolvingFlag, setResolvingFlag] = useState<FlagResponse | null>(null);
  const [resolvingBulkTarget, setResolvingBulkTarget] =
    useState<BulkTargetDescriptor | null>(null);

  if (activeQuery.isError && isAuthError(activeQuery.error)) {
    return <AdminAuthNotice error={activeQuery.error} />;
  }

  const total = activeQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPageNumber(0);
  };

  const onDismissSingle = async (flag: FlagResponse) => {
    setBusyId(flag.id);
    try {
      await dismissSingleFlag(flag.id).unwrap();
      toast.success("Report dismissed", {
        description: "The content stays up and the report is closed.",
      });
      void refetchSummary();
    } catch (caught: unknown) {
      const err = caught as { status?: number };
      if (err?.status === 409) {
        toast.info("Already reviewed", {
          description: "This report has already been reviewed by another moderator.",
        });
        void refetchSummary();
      } else {
        toast.error(messageOf(caught, "That report could not be dismissed."));
      }
    } finally {
      setBusyId(null);
    }
  };

  const onDismissGrouped = async (item: GroupedFlagItem) => {
    const key = `${item.flaggableType}:${item.flaggableId}`;
    setBusyId(key);
    try {
      const result = await dismissTargetFlags({
        flaggableType: item.flaggableType,
        flaggableId: item.flaggableId,
      }).unwrap();

      if (result.affected === 0) {
        toast.info("Already handled", {
          description: "Another moderator already handled these reports.",
        });
      } else {
        toast.success(
          `${result.affected} report${result.affected === 1 ? "" : "s"} dismissed`,
          {
            description: "The content stays up and all open reports were closed.",
          }
        );
      }
      void refetchSummary();
    } catch (caught) {
      toast.error(messageOf(caught, "Could not dismiss reports on this item."));
    } finally {
      setBusyId(null);
    }
  };

  const getTabCount = (tabStatus: FlagStatus): number => {
    if (!summary) return 0;
    if (tabStatus === "PENDING") return summary.totalPending;
    if (tabStatus === "REVIEWED") return summary.totalResolved;
    if (tabStatus === "DISMISSED") return summary.totalDismissed;
    return 0;
  };

  return (
    <div className="space-y-4">
      {/* Primary Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs with Summary Counters */}
          <div className="inline-flex items-center rounded-xl border border-border bg-muted/60 p-1 text-sm font-semibold">
            {STATUS_TABS.map((tab) => {
              const count = getTabCount(tab.value);
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => resetPage(setStatus)(tab.value)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex items-center gap-1.5 cursor-pointer rounded-lg px-3.5 py-1.5 transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-xs font-bold tabular-nums",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grouping Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isGrouped ? "default" : "outline"}
              size="sm"
              onClick={handleToggleGrouped}
              className="h-9 gap-1.5 rounded-xl cursor-pointer text-xs font-semibold"
            >
              {isGrouped ? (
                <>
                  <Layers className="size-4" />
                  <span>Grouped by Content</span>
                </>
              ) : (
                <>
                  <List className="size-4" />
                  <span>Flat Reports List</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Debounced Search */}
          <div className="relative min-w-48 flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search content, author, reporter..."
              maxLength={200}
              className="h-9 pl-9 pr-3 rounded-xl border-border bg-background text-sm"
            />
          </div>

          {/* Content Type Filter */}
          <Select
            value={flaggableType}
            onValueChange={(val) =>
              resetPage(setFlaggableType)(val as AdminFlaggableType | "ALL")
            }
          >
            <SelectTrigger className="h-9 w-44 rounded-xl border-border bg-background text-sm">
              <SelectValue placeholder="All content" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="ALL">All content types</SelectItem>
              {ADMIN_FLAGGABLE_TYPES.map((type) => {
                const typeCount =
                  status === "PENDING" && summary?.byType
                    ? summary.byType[type]
                    : undefined;
                return (
                  <SelectItem key={type} value={type}>
                    {FLAGGABLE_TYPE_LABELS[type]}
                    {typeCount !== undefined ? ` (${typeCount})` : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Reason Filter */}
          <Select
            value={reason}
            onValueChange={(val) =>
              resetPage(setReason)(val as FlagReason | "ALL")
            }
          >
            <SelectTrigger className="h-9 w-40 rounded-xl border-border bg-background text-sm">
              <SelectValue placeholder="Any reason" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="ALL">Any reason</SelectItem>
              {FLAG_REASONS.map((r) => {
                const reasonCount =
                  status === "PENDING" && summary?.byReason
                    ? summary.byReason[r]
                    : undefined;
                return (
                  <SelectItem key={r} value={r}>
                    {FLAG_REASON_LABELS[r] ?? r}
                    {reasonCount !== undefined ? ` (${reasonCount})` : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select
            value={sort}
            onValueChange={(val) => resetPage(setSort)(val as FlagSort)}
          >
            <SelectTrigger className="h-9 w-44 rounded-xl border-border bg-background text-sm">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              {FLAG_SORTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="ml-auto text-xs font-medium text-muted-foreground tabular-nums">
            {activeQuery.isFetching
              ? "Updating…"
              : `${total.toLocaleString()} ${isGrouped ? "target" : "report"}${total === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeQuery.isLoading ? (
        <QueueSkeleton />
      ) : activeQuery.isError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-sm text-rose-700 dark:text-rose-300">
          <p className="font-semibold">Unable to load reports</p>
          <p className="mt-1 text-xs opacity-90">
            {messageOf(activeQuery.error, "The report queue could not be loaded.")}
          </p>
        </div>
      ) : (isGrouped ? groupedItems.length === 0 : flatItems.length === 0) ? (
        <EmptyQueue status={status} isGrouped={isGrouped} />
      ) : isGrouped ? (
        /* Grouped View */
        <div className="space-y-3.5">
          {groupedItems.map((item, index) => {
            const itemKey = `${item.flaggableType}:${item.flaggableId}`;
            return (
              <GroupedFlagCard
                key={itemKey}
                item={item}
                index={index}
                status={status}
                isBusy={busyId === itemKey && isDismissingTarget}
                onDismiss={() => void onDismissGrouped(item)}
                onResolve={() =>
                  setResolvingBulkTarget({
                    flaggableType: item.flaggableType,
                    flaggableId: item.flaggableId,
                    target: item.target,
                    reportCount: item.reportCount,
                  })
                }
              />
            );
          })}
        </div>
      ) : (
        /* Flat Reports List */
        <div className="space-y-3">
          {flatItems.map((flag, index) => (
            <FlatFlagRow
              key={flag.id}
              flag={flag}
              index={index}
              isBusy={busyId === flag.id && isDismissingSingle}
              onDismiss={() => void onDismissSingle(flag)}
              onResolve={() => setResolvingFlag(flag)}
              onBulkResolve={() =>
                setResolvingBulkTarget({
                  flaggableType: flag.flaggableType,
                  flaggableId: flag.flaggableId,
                  target: flag.target,
                  reportCount: flag.reportCountOnTarget ?? undefined,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xs text-muted-foreground">
            Page {pageNumber + 1} of {pageCount} ({total.toLocaleString()} items)
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageNumber === 0 || activeQuery.isFetching}
              onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
              className="h-8 cursor-pointer rounded-xl text-xs"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageNumber + 1 >= pageCount || activeQuery.isFetching}
              onClick={() => setPageNumber((p) => p + 1)}
              className="h-8 cursor-pointer rounded-xl text-xs"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Resolve Dialog for Single Flag */}
      {resolvingFlag && (
        <ResolveFlagDialog
          open
          onOpenChange={(next) => !next && setResolvingFlag(null)}
          flag={resolvingFlag}
          onDone={() => {
            setResolvingFlag(null);
            void refetchSummary();
          }}
        />
      )}

      {/* Resolve Dialog for Bulk Target */}
      {resolvingBulkTarget && (
        <ResolveFlagDialog
          open
          onOpenChange={(next) => !next && setResolvingBulkTarget(null)}
          bulkTarget={resolvingBulkTarget}
          onDone={() => {
            setResolvingBulkTarget(null);
            void refetchSummary();
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flat View Row Component
// ---------------------------------------------------------------------------
function FlatFlagRow({
  flag,
  index,
  isBusy,
  onDismiss,
  onResolve,
  onBulkResolve,
}: {
  flag: FlagResponse;
  index: number;
  isBusy: boolean;
  onDismiss: () => void;
  onResolve: () => void;
  onBulkResolve: () => void;
}) {
  const isPending = flag.status === "PENDING";
  const isAutomated = flag.source === "AUTOMATED" || !flag.reporter;
  const label = FLAGGABLE_TYPE_LABELS[flag.flaggableType] ?? flag.flaggableType;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.24) }}
      className="rounded-2xl border border-border bg-card p-4 shadow-2xs sm:p-5"
    >
      {/* Top Header / Meta Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
          {label}
        </span>

        {/* Primary Flag Reason */}
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
          <Flag className="size-3" />
          {FLAG_REASON_LABELS[flag.reason] ?? flag.reason}
        </span>

        {/* Reporter Badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
            isAutomated
              ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
              : "bg-muted text-foreground"
          )}
        >
          {isAutomated ? (
            <>
              <Bot className="size-3.5" />
              <span>Automated Filter</span>
            </>
          ) : (
            <>
              {flag.reporter?.avatarUrl ? (
                <Avatar className="size-4">
                  <AvatarImage src={flag.reporter.avatarUrl} alt={flag.reporter.name} />
                  <AvatarFallback className="text-[9px]">
                    {flag.reporter.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="size-3" />
              )}
              <span>{flag.reporter?.name ?? "Community member"}</span>
              {typeof flag.reporter?.reputation === "number" && (
                <span className="ml-1 text-[11px] text-muted-foreground">
                  ({flag.reporter.reputation} rep)
                </span>
              )}
            </>
          )}
        </span>

        {/* Aggregate report count on target if multiple */}
        {flag.reportCountOnTarget !== null && flag.reportCountOnTarget > 1 && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            <AlertCircle className="size-3" />
            Reported by {flag.reportCountOnTarget} people
          </span>
        )}

        {!isPending && <StatusChip status={flag.status} />}

        <span className="ml-auto text-xs text-muted-foreground">
          {formatReportDate(flag.createdAt)}
        </span>
      </div>

      {/* Target Preview */}
      <TargetContentBlock
        target={flag.target}
        label={label}
        flaggableId={flag.flaggableId}
      />

      {/* All Reasons on this Target Chips */}
      {flag.allReasons && flag.allReasons.length > 1 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            All tagged reasons:
          </span>
          {flag.allReasons.map((r) => (
            <span
              key={r}
              className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
            >
              {FLAG_REASON_LABELS[r] ?? r}
            </span>
          ))}
        </div>
      )}

      {/* Reporter Note */}
      {flag.description && (
        <p className="mt-3 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground/90">
          <span className="font-semibold text-foreground">Reporter said: </span>
          {flag.description}
        </p>
      )}

      {/* Resolution Note if resolved */}
      {flag.resolutionNote && (
        <p className="mt-3 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Resolution note: </span>
          {flag.resolutionNote}
        </p>
      )}

      {/* Actions */}
      {isPending ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3.5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDismiss}
              disabled={isBusy}
              className="cursor-pointer rounded-xl text-xs font-semibold"
            >
              {isBusy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <XCircle className="size-3.5" />
              )}
              Dismiss report
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onResolve}
              className="cursor-pointer rounded-xl text-xs font-semibold"
            >
              <Check className="size-3.5" />
              Resolve report…
            </Button>
          </div>

          {/* If there are multiple reports on this same content, offer bulk action */}
          {flag.reportCountOnTarget !== null && flag.reportCountOnTarget > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBulkResolve}
              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
            >
              Resolve all {flag.reportCountOnTarget} reports on this {label.toLowerCase()}…
            </Button>
          )}
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-2 border-t border-border pt-3.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Closed{flag.reviewedAt ? ` on ${formatReportDate(flag.reviewedAt)}` : ""}
          {flag.reviewedBy ? ` by ${flag.reviewedBy}` : ""}
          {" — no further action required."}
        </p>
      )}
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Grouped View Card Component
// ---------------------------------------------------------------------------
function GroupedFlagCard({
  item,
  index,
  status,
  isBusy,
  onDismiss,
  onResolve,
}: {
  item: GroupedFlagItem;
  index: number;
  status: FlagStatus;
  isBusy: boolean;
  onDismiss: () => void;
  onResolve: () => void;
}) {
  const isPending = status === "PENDING";
  const label = FLAGGABLE_TYPE_LABELS[item.flaggableType] ?? item.flaggableType;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.24) }}
      className="rounded-2xl border border-border bg-card p-4 shadow-2xs sm:p-5"
    >
      {/* Top Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
          {label}
        </span>

        {/* Total & Pending Report Count */}
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
          <ShieldAlert className="size-3.5" />
          {item.reportCount} total report{item.reportCount === 1 ? "" : "s"}
          {item.pendingCount > 0 && ` (${item.pendingCount} open)`}
        </span>

        {/* Auto-flagged indicator */}
        {item.automated && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Bot className="size-3.5" />
            Auto-flagged
          </span>
        )}

        {/* Waiting duration */}
        {item.firstReportedAt && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Clock className="size-3.5" />
            {formatWaitTime(item.firstReportedAt)}
          </span>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          Last reported: {formatReportDate(item.lastReportedAt)}
        </span>
      </div>

      {/* Target Content Display */}
      <TargetContentBlock
        target={item.target}
        label={label}
        flaggableId={item.flaggableId}
      />

      {/* Aggregated Reasons */}
      {item.reasons && item.reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Reported for:
          </span>
          {item.reasons.map((r) => (
            <span
              key={r}
              className="rounded-md border border-rose-500/20 bg-rose-500/5 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300"
            >
              {FLAG_REASON_LABELS[r] ?? r}
            </span>
          ))}
        </div>
      )}

      {/* Bulk Action Controls */}
      {isPending ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3.5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDismiss}
              disabled={isBusy}
              className="cursor-pointer rounded-xl text-xs font-semibold"
            >
              {isBusy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <XCircle className="size-3.5" />
              )}
              Dismiss all ({item.pendingCount})
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onResolve}
              className="cursor-pointer rounded-xl text-xs font-semibold"
            >
              <Check className="size-3.5" />
              Resolve all ({item.pendingCount})…
            </Button>
          </div>

          <span className="text-xs text-muted-foreground">
            Resolving or dismissing actions all open reports on this item at once.
          </span>
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-2 border-t border-border pt-3.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          All reports on this content have been reviewed.
        </p>
      )}
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Inline Target Content Renderer
// ---------------------------------------------------------------------------
function TargetContentBlock({
  target,
  label,
  flaggableId,
}: {
  target: FlagTarget;
  label: string;
  flaggableId: string;
}) {
  const isDeleted = target.contentStatus === "DELETED";

  if (isDeleted) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/20 px-3.5 py-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="size-4 text-rose-500" />
          <p className="text-sm font-semibold text-foreground">
            This content no longer exists
          </p>
          <ContentStatusBadge status="DELETED" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          The reported {label.toLowerCase()} was already deleted or taken down.
          Dismissing will close the report.
        </p>
      </div>
    );
  }

  // Fall back to snippet for comments or items without title
  const displayTitle =
    target.title || target.snippet || `Untitled ${label.toLowerCase()}`;

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/25 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {target.thumbnailUrl && (
            <img
              src={target.thumbnailUrl}
              alt=""
              className="size-12 rounded-lg object-cover border border-border shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="line-clamp-1 text-base font-bold text-foreground">
                {displayTitle}
              </p>
              <ContentStatusBadge status={target.contentStatus} />
            </div>

            {/* Author details */}
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {target.authorAvatarUrl ? (
                <Avatar className="size-4">
                  <AvatarImage src={target.authorAvatarUrl} alt={target.authorName ?? ""} />
                  <AvatarFallback className="text-[9px]">
                    {target.authorName ? target.authorName.slice(0, 1) : "A"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="size-3" />
              )}
              <span>by {target.authorName ?? "Unknown author"}</span>
              {target.createdAt && (
                <>
                  <span>·</span>
                  <span>written {formatReportDate(target.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Safe Direct URL link */}
        {target.directUrl ? (
          <Link
            href={target.directUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span>Open</span>
            <ExternalLink className="size-3.5" />
          </Link>
        ) : (
          <span className="shrink-0 text-xs text-muted-foreground/60">
            No link available
          </span>
        )}
      </div>

      {/* Snippet display if title was distinct from snippet */}
      {target.title && target.snippet && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/80">
          {target.snippet}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers & Subcomponents
// ---------------------------------------------------------------------------
function ContentStatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const s = status.toUpperCase();
  const styles: Record<string, string> = {
    PUBLISHED:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    PENDING:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    DRAFT: "bg-muted text-muted-foreground border-border",
    REJECTED:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    REMOVED:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    DELETED:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        styles[s] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {s === "PUBLISHED" && (
        <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {s}
    </span>
  );
}

function StatusChip({ status }: { status: FlagStatus }) {
  const isResolved = status === "REVIEWED";
  return (
    <span
      className={cn(
        "rounded-lg px-2.5 py-1 text-xs font-bold",
        isResolved
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      )}
    >
      {isResolved ? "Resolved" : "Dismissed"}
    </span>
  );
}

function EmptyQueue({
  status,
  isGrouped,
}: {
  status: FlagStatus;
  isGrouped: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-2xs">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-6" />
      </div>
      <p className="text-base font-semibold text-foreground">
        {status === "PENDING"
          ? isGrouped
            ? "No reported content waiting for review"
            : "No pending reports"
          : "No reports found"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {status === "PENDING"
          ? "The community content queue is clean and up to date."
          : "Try switching filters or search terms."}
      </p>
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div className="animate-pulse space-y-3" role="status" aria-label="Loading reports">
      <span className="sr-only">Loading reports…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-lg bg-muted" />
            <div className="h-6 w-28 rounded-lg bg-muted" />
            <div className="h-6 w-24 rounded-lg bg-muted" />
          </div>
          <div className="mt-3 h-20 rounded-xl bg-muted" />
          <div className="mt-4 h-9 w-56 rounded-xl bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default ReportQueue;
