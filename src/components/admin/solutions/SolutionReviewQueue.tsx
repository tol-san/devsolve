"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  ListChecks,
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
import {
  SolutionDecisionDialog,
  type SolutionDecision,
} from "@/components/admin/solutions/SolutionDecisionDialog";
import { useGetAdminSolutionsQuery } from "@/lib/redux/services/admin/solutionAdminApi";
import type {
  SolutionResponse,
  SolutionReviewStatus,
} from "@/lib/types/admin/solutionAdminTypes";
import { excerptOf } from "@/lib/markdown-excerpt";
import { APPROACH_LABELS } from "@/lib/validations/solution";
import { authorNameOf, messageOf } from "@/lib/discussions/format";

const STATUS_TABS: { value: SolutionReviewStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export const solutionReviewHref = (solutionId: string) =>
  `/dashboard/content-moderation/solutions/${solutionId}`;

export function SolutionReviewQueue() {
  const [status, setStatus] = useState<SolutionReviewStatus>("PENDING");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetAdminSolutionsQuery({
      reviewStatus: status,
      pageNumber: page,
      pageSize,
    });

  const [decisionFor, setDecisionFor] = useState<SolutionResponse | null>(null);
  const [decision, setDecision] = useState<SolutionDecision | null>(null);

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
              ? "solution waiting"
              : "solutions waiting"
            : "in this list"}
        </p>
      </div>

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
      ) : items.length === 0 ? (
        <PanelCard
          tone="empty"
          title={
            status === "PENDING"
              ? "Nothing waiting for review"
              : status === "APPROVED"
                ? "No approved solutions yet"
                : "Nothing rejected"
          }
          body={
            status === "PENDING"
              ? "Every posted answer has a decision. New ones land here the moment someone answers a problem."
              : status === "APPROVED"
                ? "Approved answers appear here, and on the problem each one answers."
                : "Answers you turn away stay here, with the reason you gave."
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

          <div className="flex flex-col justify-between gap-4 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span id="solution-queue-rows">Rows per page</span>
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

      <SolutionDecisionDialog
        solutionId={decisionFor?.id ?? ""}
        title={decisionFor?.summary ?? ""}
        decision={decision}
        isOpen={Boolean(decisionFor?.id && decision)}
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col gap-3 rounded-2xl border border-border bg-card text-card-foreground p-4 shadow-xs ${
        busy ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ReviewBadge status={review} />
        {item.approachType && (
          <span className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground bg-muted">
            {APPROACH_LABELS[item.approachType]}
          </span>
        )}
        {item.isAccepted && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Accepted by asker
          </span>
        )}
        {steps.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <ListChecks aria-hidden="true" className="size-3.5" />
            {steps.length} {steps.length === 1 ? "step" : "steps"}
          </span>
        )}
        {isPending && item.createdAt && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {waitingSince(item.createdAt)}
          </span>
        )}
      </div>

      {review === "REJECTED" && item.moderation?.rejectionReason && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300">
          <span className="font-bold">Rejected: </span>
          {item.moderation.rejectionReason}
        </p>
      )}

      <div className="min-w-0">
        <h3 className="truncate text-base font-bold text-foreground">
          {item.summary || "Untitled answer"}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {excerptOf(item.bodyMarkdown ?? "", 220)}
        </p>
      </div>

      {tested.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tested.map((entry, index) => (
            <span
              key={`${entry.technology}-${index}`}
              className="rounded-lg border border-border bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground"
            >
              {entry.technology}
              {entry.version ? ` ${entry.version}` : ""}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="truncate text-xs font-semibold text-muted-foreground">
            by {authorNameOf(item.author)}
          </span>
          {item.problemId && (
            <Link
              href={`/community/${item.problemId}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <ExternalLink aria-hidden="true" className="size-3" />
              The problem
            </Link>
          )}
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
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 px-3 text-xs font-bold text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
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
      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function waitingSince(iso: string) {
  const submitted = new Date(iso);
  if (Number.isNaN(submitted.getTime())) return "";

  const days = Math.floor((Date.now() - submitted.getTime()) / 86_400_000);
  if (days <= 0) return "Posted today";
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
      aria-label="Loading the solution queue"
      className="animate-pulse space-y-3"
    >
      <span className="sr-only">Loading the solution queue…</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex gap-2">
            <div className="h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-5 w-3/5 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="mt-1 flex justify-between">
            <div className="h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-56 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
