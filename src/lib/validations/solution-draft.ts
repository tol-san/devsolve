import * as z from "zod";
import { APPROACH_TYPES, RESOURCE_TYPES } from "@/lib/validations/solution";

export const verificationStepDraftSchema = z.object({
  instruction: z.string().max(1000).optional(),
  expectedResult: z.string().max(1000).optional(),
});

export const testedWithDraftSchema = z.object({
  technology: z.string().max(100).optional(),
  version: z.string().max(50).optional(),
});

export const solutionResourceDraftSchema = z.object({
  type: z.enum(RESOURCE_TYPES).optional(),
  label: z.string().max(150).optional(),
  url: z.string().max(1000).optional(),
  displayOrder: z.number().int().optional(),
});

/**
 * Mirrors the backend `SaveSolutionDraftRequest`.
 *
 * Every field is optional so drafts can be saved mid-sentence during typing.
 */
export const saveSolutionDraftSchema = z.object({
  summary: z.string().max(250).optional(),
  bodyMarkdown: z.string().max(30_000).optional(),
  approachType: z.enum(APPROACH_TYPES).nullish(),
  verificationSteps: z.array(verificationStepDraftSchema).max(20).optional(),
  testedWith: z.array(testedWithDraftSchema).max(20).optional(),
  tradeoffs: z.string().max(5000).optional(),
  resources: z.array(solutionResourceDraftSchema).max(10).optional(),
});

export type SaveSolutionDraftValues = z.output<typeof saveSolutionDraftSchema>;

/** Mirrors `SolutionDraftResponse`. */
export interface SolutionDraftResponse extends SaveSolutionDraftValues {
  id: string;
  authorId?: string;
  problemId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageSolutionDraftResponse {
  content?: SolutionDraftResponse[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}
