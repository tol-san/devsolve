import * as z from "zod";

import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

/**
 * Researcher access to a company.
 *
 * A program no longer decides who may report against it — the organization
 * behind it does, once, for all of its programs. Everything here mirrors the
 * backend's researcher-access resource; the frontend adds no rules of its own
 * beyond the lengths the upstream already enforces.
 */

export const RESEARCHER_ACCESS_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVOKED",
] as const;

/**
 * `null` is a state too, and the most common one: a researcher who has never
 * approached this company has no record at all, so there is nothing to read a
 * status off. It is spelled out rather than folded into "REJECTED" because the
 * two lead to different offers — one asks, the other asks *again*.
 */
export type ResearcherAccessStatus = (typeof RESEARCHER_ACCESS_STATUSES)[number];

/** Mirrors the backend's access record, as returned by every endpoint below. */
export interface ResearcherAccessRecord {
  id: string;
  organizationId: string;
  organizationName?: string | null;
  researcherId: string;
  researcherName?: string | null;
  researcherEmail?: string | null;
  status: ResearcherAccessStatus;
  canSubmitReports: boolean;
  motivation?: string | null;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  requestedAt?: string | null;
  reviewedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/**
 * `GET /programs/{programId}/reporting-access` — may this account file here?
 *
 * The whole point of asking before submitting: the researcher learns they are
 * blocked while the form is still empty, rather than after writing a report.
 * `status` is null when no record exists, and `canSubmitReports` is the
 * upstream's own verdict — trusted over any status reading done here.
 */
export interface ProgramReportingAccess {
  programId: string;
  organizationId: string;
  organizationName?: string | null;
  status: ResearcherAccessStatus | null;
  canSubmitReports: boolean;
  /**
   * The upstream's own wording, rendered verbatim. Named `reason` because
   * that is what `ReportingEligibilityResponse` calls it.
   *
   * This response carries no review note — it is the eligibility answer, not
   * the access record. A rejection note has to be read from the record
   * itself, via `GET /organizations/{id}/researchers/me`.
   */
  reason?: string | null;
}

export const MOTIVATION_MIN_LENGTH = 20;
export const MOTIVATION_MAX_LENGTH = 2000;

/** `POST /organizations/{orgId}/researchers` — the researcher asks. */
export const requestResearcherAccessSchema = z.object({
  motivation: z
    .string()
    .trim()
    .min(
      MOTIVATION_MIN_LENGTH,
      `Tell them at least ${MOTIVATION_MIN_LENGTH} characters about why you want in`,
    )
    .max(
      MOTIVATION_MAX_LENGTH,
      `Keep this under ${MOTIVATION_MAX_LENGTH} characters`,
    )
    .refine(isCleanText, profanityMessage("Motivation"))
    .refine(isReadableText, readabilityMessage("Motivation")),
});

export type RequestResearcherAccessValues = z.output<
  typeof requestResearcherAccessSchema
>;

export const REVIEW_DECISIONS = ["APPROVE", "REJECT", "REVOKE"] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

/** `PATCH /organizations/{orgId}/researchers/{userId}` — the company rules. */
export const reviewResearcherAccessSchema = z.object({
  decision: z.enum(REVIEW_DECISIONS),
  /* The researcher reads this on their own access list, which is the only
     place a rejection or a revocation is ever explained. */
  note: z
    .string()
    .trim()
    .max(MOTIVATION_MAX_LENGTH, `Keep this under ${MOTIVATION_MAX_LENGTH} characters`)
    .refine(isCleanText, profanityMessage("Note"))
    .optional()
    .or(z.literal("")),
});

export type ReviewResearcherAccessValues = z.output<
  typeof reviewResearcherAccessSchema
>;

/**
 * `POST /organizations/{orgId}/researchers/invite` — approval without a
 * request.
 *
 * The field is `userId`, not an email: the upstream links an existing account
 * and has nothing to send an invitation to, so someone who has never signed up
 * cannot be pre-approved here.
 */
export const inviteResearcherSchema = z.object({
  userId: z.uuid("Paste the researcher's user id"),
  note: z
    .string()
    .trim()
    .max(MOTIVATION_MAX_LENGTH, `Keep this under ${MOTIVATION_MAX_LENGTH} characters`)
    .refine(isCleanText, profanityMessage("Note"))
    .optional()
    .or(z.literal("")),
});

export type InviteResearcherInput = z.input<typeof inviteResearcherSchema>;
export type InviteResearcherValues = z.output<typeof inviteResearcherSchema>;
