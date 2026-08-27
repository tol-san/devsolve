import type {
  ResearcherAccessStatus,
  ReviewDecision,
} from "@/lib/validations/researcher-access";

/**
 * The one place the access state machine is written down.
 *
 * The upstream answers 409 for any transition it does not allow, and a button
 * that produces a 409 is a button that should not have been offered. Both
 * sides of the screen — what the researcher may ask for, what the company may
 * decide — are derived here so the two cannot drift apart.
 */

/** `null` means no record: this account has never approached the company. */
export type AccessState = ResearcherAccessStatus | null;

/** Whether a report may be filed against any of the company's programs. */
export function canSubmitWith(status: AccessState): boolean {
  return status === "APPROVED";
}

/**
 * Whether asking (or asking again) is a legal move.
 *
 * Refused while PENDING — the request is already in the queue and a second one
 * is a 409, not a nudge — and while APPROVED, where there is nothing to ask
 * for. From REJECTED or REVOKED it is allowed: the company may also approve
 * straight from either without a new request, so this is an offer, not a
 * requirement.
 */
export function canRequestAccess(status: AccessState): boolean {
  return status === null || status === "REJECTED" || status === "REVOKED";
}

/**
 * The label on the researcher's action, or null when there is no action to
 * offer. PENDING deliberately has none: re-sending is the one thing that
 * cannot help, and offering it invites the 409.
 */
export function requestActionLabel(status: AccessState): string | null {
  if (status === null) return "Request access";
  if (status === "REJECTED" || status === "REVOKED") return "Request again";
  return null;
}

/**
 * The decisions a company may take on a researcher in this state.
 *
 * REVOKE exists only from APPROVED, and REJECT does not — withdrawing an
 * approval is a revocation, so the two never appear together on one row.
 * APPROVE is legal from every non-approved state, including REJECTED and
 * REVOKED, which is what lets a company change its mind without asking the
 * researcher to re-apply.
 */
export function allowedDecisions(status: AccessState): ReviewDecision[] {
  switch (status) {
    case "PENDING":
      return ["APPROVE", "REJECT"];
    case "APPROVED":
      return ["REVOKE"];
    case "REJECTED":
    case "REVOKED":
      return ["APPROVE"];
    default:
      return [];
  }
}

/** What the button says, and what the confirmation is about. */
export const DECISION_LABEL: Record<ReviewDecision, string> = {
  APPROVE: "Approve",
  REJECT: "Reject",
  REVOKE: "Revoke",
};

/** Past tense, for the toast after the upstream agrees. */
export const DECISION_DONE: Record<ReviewDecision, string> = {
  APPROVE: "approved",
  REJECT: "rejected",
  REVOKE: "revoked",
};

/**
 * Whether the company reached out rather than the researcher asking.
 *
 * A request carries a motivation of at least twenty characters — the endpoint
 * refuses anything shorter — so a record without one was never a request. It
 * came from `POST /organizations/{id}/researchers/invite`, which is a company
 * clearing someone who never applied.
 *
 * Worth telling apart on the researcher side: being approved for something you
 * asked for and being approached by a company you have never contacted are
 * different pieces of news.
 */
export function wasInvited(record: {
  motivation?: string | null;
  status?: ResearcherAccessStatus;
}): boolean {
  return !record.motivation?.trim();
}

/** Human wording for a state, used on badges and empty states. */
export const STATUS_LABEL: Record<ResearcherAccessStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVOKED: "Revoked",
};

/**
 * Badge colours. Kept as token pairs rather than a `variant` because the four
 * states need four distinct readings and the badge variants only offer two.
 */
export const STATUS_BADGE_CLASS: Record<ResearcherAccessStatus, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  APPROVED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  REJECTED:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  REVOKED: "border-border bg-muted text-muted-foreground",
};
