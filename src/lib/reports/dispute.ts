
import type { DisputeDetail } from "@/lib/types/reports/types";

export function isDisputeBlocking(
  dispute: DisputeDetail | null | undefined,
): boolean {
  if (!dispute) return false;
  return (
    dispute.status === "AWAITING_REPORTER" ||
    dispute.status === "OPEN" ||
    dispute.status === "UNDER_REVIEW"
  );
}

export function isAwaitingReporter(
  dispute: DisputeDetail | null | undefined,
): boolean {
  return dispute?.status === "AWAITING_REPORTER";
}

export function isWithAdministrator(
  dispute: DisputeDetail | null | undefined,
): boolean {
  return dispute?.status === "OPEN" || dispute?.status === "UNDER_REVIEW";
}

export function isDisputeSettled(
  dispute: DisputeDetail | null | undefined,
): boolean {
  return dispute?.status === "RESOLVED" || dispute?.status === "DISMISSED";
}

export function disputeStatusLabel(dispute: DisputeDetail): string {
  switch (dispute.status) {
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
  }
}
