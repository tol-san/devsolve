"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageOff,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  useGetShowcaseReviewQueueQuery,
  type ShowcaseReviewQueueItem,
} from "@/lib/redux/services/admin/showcaseReviewApi";
import { excerptOf } from "@/lib/markdown-excerpt";
import type { ShowcaseReviewStatus } from "@/lib/validations/showcase";

const STATUS_TABS: { value: ShowcaseReviewStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Changes requested" },
];

export const reviewDetailHref = (showcaseId: string) =>
  `/dashboard/content-moderation/showcases/${showcaseId}`;

export function ShowcaseReviewQueue() {
  const [status, setStatus] = useState<ShowcaseReviewStatus>("PENDING");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetShowcaseReviewQueueQuery({
      reviewStatus: status,
      pageNumber: page,
      pageSize,
    });

  const [decisionFor, setDecisionFor] =
    useState<ShowcaseReviewQueueItem | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(
    null,
  );

  const items = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatus(tab.value);
                setPage(0);
              }}
              aria-pressed={status === tab.value}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                status === tab.value
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="px-1 text-xs font-medium text-muted-foreground">
          <span className="font-bold tabular-nums text-foreground">
            {totalElements}
          </span>{" "}
          {status === "PENDING"
            ? totalElements === 1
              ? "submission waiting"
              : "submissions waiting"
            : "in this list"}
        </p>
      </div>

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
        <QueueSkeleton />
      ) : items.length === 0 ? (
        <PanelCard
          tone="empty"
          title={
            status === "PENDING"
              ? "Nothing waiting for review"
              : status === "APPROVED"
                ? "No approved submissions yet"
                : "Nothing sent back"
          }
          body={
            status === "PENDING"
              ? "Every submitted showcase has a decision. New ones land here the moment an author publishes."
              : status === "APPROVED"
                ? "Approved showcases appear here, and on the public index."
                : "Submissions you ask changes on stay here until the author resubmits."
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
            {items.map((item) => (
              <QueueRow
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

          <div className="flex flex-col justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span id="showcase-queue-rows">Rows per page</span>
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
                {Math.min((page + 1) * pageSize, totalElements)} of{" "}
                {totalElements}
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
                <ChevronLeft data-icon="inline-start" aria-hidden="true" />
                Previous
              </Button>
              <span className="text-xs font-bold tabular-nums text-foreground">
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
                <ChevronRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}

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

function QueueRow({
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
      className={`flex flex-col gap-4 rounded-2xl border border-border bg-card text-card-foreground p-4 shadow-xs sm:flex-row ${
        busy ? "opacity-60" : ""
      }`}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-40">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            quality={90}
            sizes="160px"
            onError={() => setCoverFailed(true)}
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff aria-hidden="true" className="size-5" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <SubmissionTypeBadge type={item.submissionType} />
          {item.categoryName && (
            <span className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground bg-muted">
              {item.categoryName}
            </span>
          )}
          {isPending ? (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {waitingSince(item.submittedAt)}
            </span>
          ) : (
            <ReviewStatusBadge status={item.reviewStatus} />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-foreground">
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {excerptOf(item.overview ?? "", 180)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-muted-foreground">
            by {item.authorName}
          </span>

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
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
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
        <h3 className="text-lg font-bold text-foreground">
          {title}
        </h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {body}
        </p>
      </div>
      {action && <div className="flex justify-center">{action}</div>}
    </Card>
  );
}

function QueueSkeleton() {
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
          className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-video w-full shrink-0 rounded-xl bg-slate-200 sm:w-40 dark:bg-slate-800" />
          <div className="flex flex-1 flex-col gap-2.5">
            <div className="flex gap-2">
              <div className="h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-5 w-3/5 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="mt-1 flex justify-between">
              <div className="h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-56 rounded-xl bg-slate-200 dark:bg-slate-800" />
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
