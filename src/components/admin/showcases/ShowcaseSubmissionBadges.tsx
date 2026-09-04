"use client";

import React from "react";
import { CheckCircle2, Clock, FilePen, Sparkles, XCircle } from "lucide-react";

import type { ShowcaseReviewStatus } from "@/lib/validations/showcase";

const CHIP =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold";

export function SubmissionTypeBadge({
  type,
}: {
  type: "INITIAL" | "REVISION";
}) {
  const isRevision = type === "REVISION";

  return (
    <span
      title={
        isRevision
          ? "An edit to an approved showcase. The live version stays as it is until this is approved."
          : "A first publish. Nothing of this showcase is public yet."
      }
      className={`${CHIP} ${
        isRevision
          ? "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {isRevision ? (
        <FilePen className="size-3.5" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      {isRevision ? "Revision" : "First publish"}
    </span>
  );
}

const STATUS_LABEL: Record<ShowcaseReviewStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Changes requested",
};

const STATUS_STYLE: Record<ShowcaseReviewStatus, string> = {
  PENDING:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  APPROVED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  REJECTED: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

export function ReviewStatusBadge({
  status,
}: {
  status: ShowcaseReviewStatus;
}) {
  return (
    <span className={`${CHIP} ${STATUS_STYLE[status]}`}>
      {status === "APPROVED" ? (
        <CheckCircle2 className="size-3.5" />
      ) : status === "REJECTED" ? (
        <XCircle className="size-3.5" />
      ) : (
        <Clock className="size-3.5" />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}
