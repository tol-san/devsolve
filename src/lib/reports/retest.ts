
import type { RetestSummary } from "@/lib/redux/services/reportsApi";
import { toDate } from "@/lib/format/datetime";

export type RetestAttemptStatus =
  | "AWAITING_VERDICT"
  | "ANSWERED"
  | "CLOSED_WITHOUT_VERDICT";

export function retestAttemptStatus(attempt: RetestSummary): RetestAttemptStatus {
  if (!attempt.completedAt) return "AWAITING_VERDICT";
  return attempt.verdict ? "ANSWERED" : "CLOSED_WITHOUT_VERDICT";
}

export function openRetestAttempt(
  history: RetestSummary[] | undefined | null,
): RetestSummary | null {
  return history?.find((attempt) => !attempt.completedAt) ?? null;
}

export function latestRetestAttempt(
  history: RetestSummary[] | undefined | null,
): RetestSummary | null {
  if (!history || history.length === 0) return null;
  return history[history.length - 1];
}

function bountyDigits(value: BountyAmount): string | null {
  if (value === null || value === undefined) return null;

  const text = typeof value === "string" ? value.trim() : String(value);
  return text ? text : null;
}

export type BountyAmount = string | number | null | undefined;

export function formatBountyAmount(value: BountyAmount): string | null {
  const digits = bountyDigits(value);
  if (!digits) return null;

  const match = /^(\d+)(?:\.(\d*))?$/.exec(digits);
  if (!match) return digits;

  const [, whole, fraction = ""] = match;
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `$${grouped}.${`${fraction}00`.slice(0, 2)}`;
}

export function hasBountyReward(value: BountyAmount): boolean {
  const digits = bountyDigits(value);
  if (!digits) return false;

  return /^\d+(\.\d+)?$/.test(digits) && /[1-9]/.test(digits);
}

export function formatDueDate(dueAt: string | null | undefined): string | null {
  const date = toDate(dueAt);
  if (!date) return null;

  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export type RetestDeadline = {
  relative: string;
  absolute: string;
  daysRemaining: number;
  isOverdue: boolean;
  isUrgent: boolean;
};

export function retestDeadline(
  dueAt: string | null | undefined,
  now: Date = new Date(),
): RetestDeadline | null {
  const due = toDate(dueAt);
  if (!due) return null;

  const startOfDay = (date: Date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const daysRemaining = Math.round(
    (startOfDay(due) - startOfDay(now)) / 86_400_000,
  );

  const relative =
    daysRemaining === 0
      ? "today"
      : daysRemaining === 1
        ? "tomorrow"
        : daysRemaining > 1
          ? `in ${daysRemaining} days`
          : daysRemaining === -1
            ? "yesterday"
            : `${Math.abs(daysRemaining)} days ago`;

  return {
    relative,
    absolute: due.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    daysRemaining,
    isOverdue: due.getTime() < now.getTime(),
    isUrgent: daysRemaining >= 0 && daysRemaining <= 2,
  };
}

export function verdictDueLabel(dueAt: string | null | undefined): string | null {
  const deadline = retestDeadline(dueAt);
  if (!deadline) return null;

  return deadline.isOverdue
    ? "Verdict window has closed"
    : `Verdict due ${deadline.relative}`;
}

export function awaitingVerdictLabel(dueAt: string | null | undefined): string {
  const deadline = retestDeadline(dueAt);
  if (!deadline) return "Awaiting verdict";

  return deadline.isOverdue
    ? `Awaiting verdict, due ${deadline.absolute} — overdue`
    : `Awaiting verdict, due ${deadline.absolute}`;
}

export const RETEST_VERDICT_LABEL: Record<
  NonNullable<RetestSummary["verdict"]>,
  string
> = {
  VERIFIED_FIXED: "Verified fixed",
  STILL_VULNERABLE: "Still vulnerable",
};
