"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flag,
  Loader2,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminAuthNotice, isAuthError } from "@/components/admin/AdminAuthGate";
import { ResolveFlagDialog } from "@/components/admin/ResolveFlagDialog";
import {
  useDismissFlagMutation,
  useGetAdminFlagsQuery,
  type FlagResponse,
} from "@/lib/redux/services/admin/adminFlagsApi";
import {
  previewKey,
  useGetFlaggedContentPreviewsQuery,
  type ContentPreview,
} from "@/lib/redux/services/admin/flaggedContentApi";
import {
  ADMIN_FLAGGABLE_TYPES,
  FLAGGABLE_TYPE_LABELS,
  FLAG_REASON_LABELS,
  isTakedownTarget,
  type AdminFlaggableType,
  type FlagStatus,
} from "@/lib/validations/moderation";
import { FLAG_REASONS, type FlagReason } from "@/lib/validations/engagement";
import { messageOf } from "@/lib/discussions/format";

const PAGE_SIZE = 20;

const STATUS_TABS: { value: FlagStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

export function ReportQueue() {
  const [status, setStatus] = useState<FlagStatus>("PENDING");
  const [flaggableType, setFlaggableType] = useState<AdminFlaggableType | "ALL">("ALL");
  const [reason, setReason] = useState<FlagReason | "ALL">("ALL");
  const [pageNumber, setPageNumber] = useState(0);
  const [resolving, setResolving] = useState<FlagResponse | null>(null);

  const query = useGetAdminFlagsQuery({
    status,
    flaggableType: flaggableType === "ALL" ? undefined : flaggableType,
    reason: reason === "ALL" ? undefined : reason,
    pageNumber,
    pageSize: PAGE_SIZE,
  });

  const flags = useMemo(() => query.data?.items ?? [], [query.data]);

  // Flags carry no preview, so each reported item is fetched alongside them.
  const targets = useMemo(
    () => flags.map((flag) => ({ type: flag.flaggableType, id: flag.flaggableId })),
    [flags],
  );
  const { data: previews, isFetching: isLoadingPreviews } =
    useGetFlaggedContentPreviewsQuery(targets, { skip: targets.length === 0 });

  const [dismissFlag, { isLoading: isDismissing }] = useDismissFlagMutation();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (query.isError && isAuthError(query.error)) {
    return <AdminAuthNotice error={query.error} />;
  }

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPageNumber(0);
  };

  const onDismiss = async (flag: FlagResponse) => {
    setBusyId(flag.id);
    try {
      await dismissFlag(flag.id).unwrap();
      toast.success("Report dismissed", {
        description: "The content stays up and the report is closed.",
      });
    } catch (caught) {
      toast.error(messageOf(caught, "That report could not be dismissed."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center rounded-xl border border-border bg-muted/60 p-1 text-sm font-semibold">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => resetPage(setStatus)(tab.value)}
                aria-pressed={status === tab.value}
                className={`relative cursor-pointer rounded-lg px-3.5 py-1.5 transition-colors ${
                  status === tab.value
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Select
            value={flaggableType}
            onValueChange={(value) =>
              resetPage(setFlaggableType)(value as AdminFlaggableType | "ALL")
            }
          >
            <SelectTrigger className="h-9 w-44 rounded-xl border-border bg-background text-sm">
              <SelectValue placeholder="All content" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="ALL">All content</SelectItem>
              {ADMIN_FLAGGABLE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {FLAGGABLE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={reason}
            onValueChange={(value) => resetPage(setReason)(value as FlagReason | "ALL")}
          >
            <SelectTrigger className="h-9 w-40 rounded-xl border-border bg-background text-sm">
              <SelectValue placeholder="Any reason" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="ALL">Any reason</SelectItem>
              {FLAG_REASONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {FLAG_REASON_LABELS[value] ?? value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm font-medium text-muted-foreground tabular-nums">
          {query.isFetching ? "Loading…" : `${total.toLocaleString()} report${total === 1 ? "" : "s"}`}
        </span>
      </div>

      {query.isLoading ? (
        <QueueSkeleton />
      ) : query.isError ? (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-sm text-rose-700 dark:text-rose-300">
          {messageOf(query.error, "The report queue could not be loaded.")}
        </p>
      ) : flags.length === 0 ? (
        <EmptyQueue status={status} />
      ) : (
        <div className="space-y-3">
          {flags.map((flag, index) => (
            <FlagRow
              key={flag.id}
              flag={flag}
              index={index}
              preview={previews?.[previewKey(flag.flaggableType, flag.flaggableId)]}
              isLoadingPreview={isLoadingPreviews}
              isBusy={busyId === flag.id && isDismissing}
              onDismiss={() => void onDismiss(flag)}
              onResolve={() => setResolving(flag)}
            />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-sm text-muted-foreground">
            Page {pageNumber + 1} of {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageNumber === 0 || query.isFetching}
              onClick={() => setPageNumber((page) => Math.max(0, page - 1))}
              className="cursor-pointer rounded-xl"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pageNumber + 1 >= pageCount || query.isFetching}
              onClick={() => setPageNumber((page) => page + 1)}
              className="cursor-pointer rounded-xl"
            >
              Next
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {resolving && (
        <ResolveFlagDialog
          open
          onOpenChange={(next) => !next && setResolving(null)}
          flag={resolving}
          preview={
            previews?.[previewKey(resolving.flaggableType, resolving.flaggableId)]
          }
          onDone={() => setResolving(null)}
        />
      )}
    </div>
  );
}

function FlagRow({
  flag,
  index,
  preview,
  isLoadingPreview,
  isBusy,
  onDismiss,
  onResolve,
}: {
  flag: FlagResponse;
  index: number;
  preview?: ContentPreview;
  isLoadingPreview: boolean;
  isBusy: boolean;
  onDismiss: () => void;
  onResolve: () => void;
}) {
  const isPending = flag.status === "PENDING";
  const isSystem = flag.source === "SYSTEM";
  const label = FLAGGABLE_TYPE_LABELS[flag.flaggableType] ?? flag.flaggableType;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.24) }}
      className="rounded-2xl border border-border bg-card p-4 shadow-2xs sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
          {label}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
          <Flag aria-hidden="true" className="size-3" />
          {FLAG_REASON_LABELS[flag.reason] ?? flag.reason}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
            isSystem
              ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isSystem ? (
            <>
              <Bot aria-hidden="true" className="size-3" />
              Profanity filter
            </>
          ) : (
            <>
              <User aria-hidden="true" className="size-3" />
              {flag.reporterName ?? "Community member"}
            </>
          )}
        </span>
        {!isPending && <StatusChip status={flag.status} />}
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(flag.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>

      <ContentPreviewBlock
        preview={preview}
        isLoading={isLoadingPreview}
        label={label}
        flaggableId={flag.flaggableId}
      />

      {flag.description && (
        <p className="mt-3 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-foreground/90">
          <span className="font-semibold">Reporter said: </span>
          {flag.description}
        </p>
      )}

      {flag.resolutionNote && (
        <p className="mt-3 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Resolution: </span>
          {flag.resolutionNote}
        </p>
      )}

      {isPending ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDismiss}
            disabled={isBusy}
            className="cursor-pointer rounded-xl"
          >
            {isBusy ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <XCircle aria-hidden="true" className="size-4" />
            )}
            Dismiss
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onResolve}
            className="cursor-pointer rounded-xl"
          >
            <Check aria-hidden="true" className="size-4" />
            Resolve…
          </Button>
          {!isTakedownTarget(flag.flaggableType) && (
            <span className="text-xs text-muted-foreground">
              This type cannot be taken down.
            </span>
          )}
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-2 border-t border-border pt-3.5 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          Closed{flag.reviewedAt ? ` on ${new Date(flag.reviewedAt).toLocaleDateString()}` : ""}
          {" — no further action available."}
        </p>
      )}
    </motion.article>
  );
}

function ContentPreviewBlock({
  preview,
  isLoading,
  label,
  flaggableId,
}: {
  preview?: ContentPreview;
  isLoading: boolean;
  label: string;
  flaggableId: string;
}) {
  if (!preview && isLoading) {
    return (
      <div className="mt-3 h-20 animate-pulse rounded-xl border border-border bg-muted/40" />
    );
  }

  if (!preview || preview.unavailable) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/20 px-3.5 py-3">
        <p className="text-sm text-muted-foreground">
          The reported {label.toLowerCase()} could not be loaded.
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          {flaggableId}
        </p>
      </div>
    );
  }

  if (preview.missing) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/20 px-3.5 py-3">
        <p className="text-sm font-semibold text-foreground">
          Already removed or deleted
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Nothing left to take down — dismissing closes the report.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/25 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-base font-bold text-foreground">
            {preview.title ?? `Untitled ${label.toLowerCase()}`}
          </p>
          {preview.authorName && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              by {preview.authorName}
              {preview.status ? ` · ${preview.status}` : ""}
            </p>
          )}
        </div>
        {preview.href && (
          <Link
            href={preview.href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Open
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </Link>
        )}
      </div>
      {preview.excerpt && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/80">
          {preview.excerpt}
        </p>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: FlagStatus }) {
  const styles =
    status === "REVIEWED"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${styles}`}>
      {status === "REVIEWED" ? "Resolved" : "Dismissed"}
    </span>
  );
}

function EmptyQueue({ status }: { status: FlagStatus }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-2xs">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <ShieldCheck aria-hidden="true" className="size-5" />
      </div>
      <p className="text-base font-semibold text-foreground">
        {status === "PENDING" ? "Nothing waiting for review" : "No reports here"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {status === "PENDING"
          ? "Every reported post has been dealt with."
          : "Try another status or filter."}
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
