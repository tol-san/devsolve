import type {
  ResearcherAccessStatus,
  ReviewDecision,
} from "@/lib/validations/researcher-access";

export type AccessState = ResearcherAccessStatus | null;

export function canSubmitWith(status: AccessState): boolean {
  return status === "APPROVED";
}

export function canRequestAccess(status: AccessState): boolean {
  return status === null || status === "REJECTED" || status === "REVOKED";
}

export function requestActionLabel(status: AccessState): string | null {
  if (status === null) return "Request access";
  if (status === "REJECTED" || status === "REVOKED") return "Request again";
  return null;
}

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

export const DECISION_LABEL: Record<ReviewDecision, string> = {
  APPROVE: "Approve",
  REJECT: "Reject",
  REVOKE: "Revoke",
};

export const DECISION_DONE: Record<ReviewDecision, string> = {
  APPROVE: "approved",
  REJECT: "rejected",
  REVOKE: "revoked",
};

export function wasInvited(record: {
  motivation?: string | null;
  status?: ResearcherAccessStatus;
}): boolean {
  return !record.motivation?.trim();
}

export const STATUS_LABEL: Record<ResearcherAccessStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVOKED: "Revoked",
};

export const STATUS_BADGE_CLASS: Record<ResearcherAccessStatus, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  APPROVED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  REJECTED:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  REVOKED: "border-border bg-muted text-muted-foreground",
};
