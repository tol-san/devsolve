import * as z from "zod";

import { ENVIRONMENT_VALUES } from "@/lib/validations/report";

export const saveReportDraftSchema = z.object({
  title: z.string().max(255).optional(),
  vulnerabilityInformation: z.string().optional(),
  impact: z.string().optional(),
  stepsToReproduce: z.string().max(20_000).optional(),
  proofOfConcept: z.string().max(20_000).optional(),
  remediationRecommendation: z.string().max(10_000).optional(),
  targetEndpoint: z.string().max(1_000).optional(),
  environment: z.enum(ENVIRONMENT_VALUES).optional(),
  discoveredAt: z.string().optional(),
  referenceLinks: z.array(z.string().max(500)).max(10).optional(),
  reportedSeverity: z
    .enum(["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .optional(),
  cvssVector: z.string().max(255).optional(),
  cvssScore: z.number().min(0).max(10).optional(),
  weaknessId: z.string().uuid().nullish(),
  suggestedWeakness: z.string().max(255).nullish(),
  assetId: z.string().uuid().nullish(),
});

export type SaveReportDraftValues = z.output<typeof saveReportDraftSchema>;

export interface ReportDraftResponse extends SaveReportDraftValues {
  id: string;
  programId?: string;
  createdAt?: string;
  updatedAt?: string;
}
