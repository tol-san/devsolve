/**
 * What an open severity dispute stops you doing.
 *
 * A report whose severity is disputed cannot be triaged at all: the backend
 * answers `PATCH /reports/{id}/triage` with
 * *"An administrator must resolve the open severity dispute"* and a 409. That
 * is not a failure to report after the fact — it is a state the screen can see
 * before it offers the action, and the reason the actions are disabled rather
 * than merely apologetic.
 *
 * Only an administrator can clear it, through the dispute admin endpoints.
 * Nothing an organization triager does on the report will lift the block, so
 * the copy points them at the right person instead of at a retry.
 */

import type { DisputeDetail } from "@/lib/types/reports/types";

/**
 * Whether this dispute still stands.
 *
 * `UNDER_REVIEW` counts as unresolved: an administrator holding a dispute open
 * has not decided it, and the backend refuses triage exactly as it does for
 * `OPEN`. Only `RESOLVED` and `DISMISSED` release the report.
 */
export function isDisputeBlocking(
  dispute: DisputeDetail | null | undefined,
): boolean {
  if (!dispute) return false;
  return dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW";
}

/** How the dispute's state reads on screen. */
export function disputeStatusLabel(dispute: DisputeDetail): string {
  switch (dispute.status) {
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
