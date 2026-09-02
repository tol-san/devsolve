/**
 * Reading a retest attempt.
 *
 * `RetestSummary` carries no status enum — the backend states the facts
 * (`completedAt`, `verdict`) and the reader derives what they mean. Every
 * screen has to derive the same three, so the derivation lives here once
 * rather than being re-guessed per component:
 *
 * | Fields                             | Meaning                     |
 * |------------------------------------|-----------------------------|
 * | `completedAt === null`             | awaiting the researcher     |
 * | `completedAt` and `verdict` set    | answered, verdict stands    |
 * | `completedAt` set, `verdict` null  | closed without a verdict    |
 *
 * The third is not a researcher decision: `resultNotes` says whether triage
 * moved the report on or the window simply lapsed, so it is the report
 * speaking, not the reporter, and is labelled that way.
 */

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

/**
 * The attempt still waiting on the researcher, of which there is at most one.
 *
 * Found by `completedAt`, not by taking the last element: the newest attempt
 * is only the open one while it is unanswered, and after a verdict the report
 * still shows the history with nothing outstanding.
 */
export function openRetestAttempt(
  history: RetestSummary[] | undefined | null,
): RetestSummary | null {
  return history?.find((attempt) => !attempt.completedAt) ?? null;
}

/** The most recent attempt, open or not. History arrives oldest first. */
export function latestRetestAttempt(
  history: RetestSummary[] | undefined | null,
): RetestSummary | null {
  if (!history || history.length === 0) return null;
  return history[history.length - 1];
}

/**
 * The amount as text, whatever the backend sent it as.
 *
 * `RetestSummary.bountyReward` is documented as a decimal string, and the live
 * API serialises it as a JSON number — so both arrive and both are handled
 * here rather than at every call site. A number is stringified, never
 * formatted through `toFixed` or `toLocaleString`: those re-enter floating
 * point, and this value is `NUMERIC(10,2)` upstream.
 */
function bountyDigits(value: BountyAmount): string | null {
  if (value === null || value === undefined) return null;

  const text = typeof value === "string" ? value.trim() : String(value);
  return text ? text : null;
}

/** What the API can put in `bountyReward`, as opposed to what it promises. */
export type BountyAmount = string | number | null | undefined;

/**
 * `bountyReward` rendered without going through a float.
 *
 * Parsing a decimal string to display it is how `10.10` becomes `10.1` and how
 * a stored `NUMERIC(10,2)` loses its last cent to binary rounding. The integer
 * part is grouped by string surgery and the fraction padded to two places;
 * anything not shaped like a decimal is shown verbatim rather than silently
 * turned into `$NaN`.
 */
export function formatBountyAmount(value: BountyAmount): string | null {
  const digits = bountyDigits(value);
  if (!digits) return null;

  const match = /^(\d+)(?:\.(\d*))?$/.exec(digits);
  if (!match) return digits;

  const [, whole, fraction = ""] = match;
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `$${grouped}.${`${fraction}00`.slice(0, 2)}`;
}

/** Whether an attempt carries a bonus at all — again without parsing it. */
export function hasBountyReward(value: BountyAmount): boolean {
  const digits = bountyDigits(value);
  if (!digits) return false;

  return /^\d+(\.\d+)?$/.test(digits) && /[1-9]/.test(digits);
}

/** `15 Sep` — the deadline as a date, for the organization's side. */
export function formatDueDate(dueAt: string | null | undefined): string | null {
  const date = toDate(dueAt);
  if (!date) return null;

  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export type RetestDeadline = {
  /** `in 6 days`, `today`, `tomorrow`, or `2 days ago` once it has passed. */
  relative: string;
  /** `15 Sep`. */
  absolute: string;
  /** Whole days remaining; negative once the window has closed. */
  daysRemaining: number;
  /** Past the deadline — the attempt lapses and the report returns to resolved. */
  isOverdue: boolean;
  /** Inside 48 hours, where the researcher should be told loudly. */
  isUrgent: boolean;
};

/**
 * How long the researcher has left.
 *
 * Null when `dueAt` is null — legacy attempts predate the deadline and the
 * rule for those is to omit it, not to invent one. Days are counted between
 * calendar days rather than by dividing the millisecond gap, so an attempt
 * due tomorrow morning reads "tomorrow" and not "in 0 days".
 */
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

/** The reporter-facing line: `Verdict due in 6 days`. */
export function verdictDueLabel(dueAt: string | null | undefined): string | null {
  const deadline = retestDeadline(dueAt);
  if (!deadline) return null;

  return deadline.isOverdue
    ? "Verdict window has closed"
    : `Verdict due ${deadline.relative}`;
}

/** The organization-facing line: `Awaiting verdict, due 15 Sep`. */
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
