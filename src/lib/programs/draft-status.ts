import type { ProgramSubmissionState } from "@/lib/types/admin/programAdminTypes";

export interface ProgramLike {
  state?: string | null;
  submissionState?: ProgramSubmissionState | null;
}

export function isPublished(program: ProgramLike | null | undefined): boolean {
  return Boolean(program) && program?.state !== "DRAFT";
}

export function isUnderReview(program: ProgramLike | null | undefined): boolean {
  return program?.submissionState === "PENDING_REVIEW";
}

export function isEditableDraft(
  program: ProgramLike | null | undefined,
): boolean {
  if (!program || program.state !== "DRAFT") return false;

  return (
    program.submissionState === "NOT_SUBMITTED" ||
    program.submissionState === "REJECTED" ||
    !program.submissionState
  );
}
