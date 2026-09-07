import * as z from "zod";

import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

export const RESEARCHER_ACCESS_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVOKED",
] as const;

export type ResearcherAccessStatus = (typeof RESEARCHER_ACCESS_STATUSES)[number];

export interface ResearcherAccessRecord {
  id: string;
  organizationId: string;
  organizationName?: string | null;
  researcherId: string;
  researcherName?: string | null;
  researcherEmail?: string | null;
  researcherUsername?: string | null;
  username?: string | null;
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

export interface ProgramReportingAccess {
  programId: string;
  organizationId: string;
  organizationName?: string | null;
  status: ResearcherAccessStatus | null;
  canSubmitReports: boolean;
  reason?: string | null;
}

export const MOTIVATION_MIN_LENGTH = 20;
export const MOTIVATION_MAX_LENGTH = 2000;

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

export const reviewResearcherAccessSchema = z.object({
  decision: z.enum(REVIEW_DECISIONS),
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
