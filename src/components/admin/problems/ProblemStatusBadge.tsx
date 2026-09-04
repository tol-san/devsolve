"use client";

import React from "react";
import {
  CheckCircle2,
  CircleDot,
  Clock,
  FilePen,
  Lock,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { ProblemStatus } from "@/lib/validations/problem";

const CHIP =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold";

const STATUS_LABEL: Record<ProblemStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending review",
  PUBLISHED: "Published",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

const STATUS_STYLE: Record<ProblemStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  PENDING_APPROVAL:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  PUBLISHED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  RESOLVED: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  CLOSED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  REJECTED: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

const STATUS_ICON: Record<ProblemStatus, LucideIcon> = {
  DRAFT: FilePen,
  PENDING_APPROVAL: Clock,
  PUBLISHED: CheckCircle2,
  RESOLVED: CircleDot,
  CLOSED: Lock,
  REJECTED: XCircle,
};

export function ProblemStatusBadge({ status }: { status?: ProblemStatus }) {
  if (!status) return null;

  const Icon = STATUS_ICON[status];

  return (
    <span className={`${CHIP} ${STATUS_STYLE[status]}`}>
      <Icon aria-hidden="true" className="size-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}
