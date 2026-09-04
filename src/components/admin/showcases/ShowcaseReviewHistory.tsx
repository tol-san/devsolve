"use client";

import React from "react";
import { History } from "lucide-react";

import { ReviewStatusBadge } from "@/components/admin/showcases/ShowcaseSubmissionBadges";
import { useGetShowcaseReviewHistoryQuery } from "@/lib/redux/services/admin/showcaseReviewApi";

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ShowcaseReviewHistory({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const { data, isLoading, isError } = useGetShowcaseReviewHistoryQuery({
    id,
    pageSize: 20,
  });

  const entries = data?.content ?? [];

  if (isError || (!isLoading && entries.length === 0)) return null;

  return (
    <section className={`${className ?? ""} space-y-4 p-5`}>
      <div className="flex items-center gap-2">
        <History className="size-4 text-slate-400" aria-hidden="true" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Review history
        </h2>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[0, 1].map((index) => (
            <div
              key={index}
              className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <ol className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="space-y-1.5 rounded-xl border border-slate-200/80 p-3 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ReviewStatusBadge status={entry.reviewStatus} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {entry.submissionType === "REVISION"
                    ? "Revision"
                    : "First publish"}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Submitted {formatDateTime(entry.submittedAt)}
                {entry.reviewedAt
                  ? ` · decided ${formatDateTime(entry.reviewedAt)}`
                  : ""}
                {entry.reviewStatus === "APPROVED" &&
                  (entry.reviewedBy ? ` by ${entry.reviewedBy}` : " · Auto-approved")}
                {entry.reviewStatus === "REJECTED" &&
                  entry.reviewedBy &&
                  ` by ${entry.reviewedBy}`}
              </p>

              {entry.rejectionReason && (
                <p className="rounded-lg bg-slate-50 p-2 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  {entry.rejectionReason}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
