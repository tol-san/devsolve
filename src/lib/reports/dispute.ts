
import type { DisputeDetail } from "@/lib/types/reports/types";

export function isDisputeBlocking(
  dispute: DisputeDetail | null | undefined,
): boolean {
  if (!dispute) return false;
  const s = dispute.status ? String(dispute.status).toUpperCase() : "";
  return (
    s === "AWAITING_REPORTER" ||
    s === "OPEN" ||
    s === "UNDER_REVIEW"
  );
}

export function isAwaitingReporter(
  dispute: DisputeDetail | null | undefined,
): boolean {
  const s = dispute?.status ? String(dispute.status).toUpperCase() : "";
  return s === "AWAITING_REPORTER";
}

export function isWithAdministrator(
  dispute: DisputeDetail | null | undefined,
): boolean {
  const s = dispute?.status ? String(dispute.status).toUpperCase() : "";
  return s === "OPEN" || s === "UNDER_REVIEW";
}

export function isDisputeSettled(
  dispute: DisputeDetail | null | undefined,
): boolean {
  const s = dispute?.status ? String(dispute.status).toUpperCase() : "";
  return s === "RESOLVED" || s === "DISMISSED";
}

export function disputeStatusLabel(dispute: DisputeDetail): string {
  const s = dispute.status ? String(dispute.status).toUpperCase() : "";
  switch (s) {
    case "AWAITING_REPORTER":
      return "Awaiting the researcher";
    case "OPEN":
      return "Awaiting an administrator";
    case "UNDER_REVIEW":
      return "Under administrator review";
    case "RESOLVED":
      return "Resolved";
    case "DISMISSED":
      return "Dismissed";
    default:
      return dispute.status;
  }
}
