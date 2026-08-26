import * as z from "zod";

import { ENVIRONMENT_VALUES } from "@/lib/validations/report";

/**
 * Mirrors the backend `SaveReportDraftRequest`.
 *
 * Every field is optional — deliberately, and it is the whole point of a
 * draft. A report is refused without a title, a write-up and a severity; a
 * draft is saved mid-sentence, so nothing here may be required or autosave
 * would start rejecting the reporter's work while they are still doing it.
 *
 * What is enforced is the ceilings, because those are the failures worth
 * catching early: an over-long field is a problem the reporter can still fix
 * while it is on screen, rather than a 400 at submit.
 *
 * `reportedSeverity` accepts `NONE` here where the report schema does not —
 * a draft is allowed to be undecided.
 */
export const saveReportDraftSchema = z.object({
  title: z.string().max(255).optional(),
  vulnerabilityInformation: z.string().optional(),
  impact: z.string().optional(),
  stepsToReproduce: z.string().max(20_000).optional(),
  proofOfConcept: z.string().max(20_000).optional(),
  remediationRecommendation: z.string().max(10_000).optional(),
  targetEndpoint: z.string().max(1_000).optional(),
  environment: z.enum(ENVIRONMENT_VALUES).optional(),
  /** ISO-8601. The upstream rejects a future instant on submit, not on save. */
  discoveredAt: z.string().optional(),
  referenceLinks: z.array(z.string().max(500)).max(10).optional(),
  reportedSeverity: z
    .enum(["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .optional(),
  cvssVector: z.string().max(255).optional(),
  /** A number upstream, unlike the form's text input. */
  cvssScore: z.number().min(0).max(10).optional(),
  weaknessId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
});

export type SaveReportDraftValues = z.output<typeof saveReportDraftSchema>;

/** Mirrors `ReportDraftResponse`. */
export interface ReportDraftResponse extends SaveReportDraftValues {
  id: string;
  programId?: string;
  createdAt?: string;
  updatedAt?: string;
}
