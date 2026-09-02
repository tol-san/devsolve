import * as z from "zod";
import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

/** Values accepted by `CreateProblemRequest.sdlcPhase`. */
export const SDLC_PHASES = [
  "PLANNING",
  "REQUIREMENTS_ANALYSIS",
  "DESIGN",
  "DEVELOPMENT",
  "TESTING",
  "DEPLOYMENT",
  "MAINTENANCE",
] as const;

export type SdlcPhase = (typeof SDLC_PHASES)[number];

/** How each phase is written for a reader, wherever one is shown. */
export const SDLC_LABELS: Record<SdlcPhase, string> = {
  PLANNING: "Planning",
  REQUIREMENTS_ANALYSIS: "Requirements analysis",
  DESIGN: "Design",
  DEVELOPMENT: "Development",
  TESTING: "Testing",
  DEPLOYMENT: "Deployment",
  MAINTENANCE: "Maintenance",
};

/** Values accepted by `CreateProblemRequest.problemType`. */
export const PROBLEM_TYPES = [
  "BUG",
  "HOW_TO",
  "ARCHITECTURE",
  "PERFORMANCE",
  "SECURITY",
  "DEPLOYMENT",
  "GENERAL",
] as const;

export type ProblemType = (typeof PROBLEM_TYPES)[number];

export const PROBLEM_TYPE_LABELS: Record<ProblemType, string> = {
  BUG: "Bug",
  HOW_TO: "How-to",
  ARCHITECTURE: "Architecture",
  PERFORMANCE: "Performance",
  SECURITY: "Security",
  DEPLOYMENT: "Deployment",
  GENERAL: "General",
};

/** What each type is for, so the picker does not need a guess. */
export const PROBLEM_TYPE_DESCRIPTIONS: Record<ProblemType, string> = {
  BUG: "Something behaves wrongly and you can show it.",
  HOW_TO: "You know the goal, not the route to it.",
  ARCHITECTURE: "How to structure or split the thing.",
  PERFORMANCE: "It works, but too slowly or too expensively.",
  SECURITY: "A weakness, hardening question, or auth problem.",
  DEPLOYMENT: "Builds, pipelines, environments, releases.",
  GENERAL: "Anything the other six do not cover.",
};

/** Values accepted by `CreateProblemRequest.severity`. */
export const PROBLEM_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type ProblemSeverity = (typeof PROBLEM_SEVERITIES)[number];

export const SEVERITY_LABELS: Record<ProblemSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

/** Values of the backend `ProblemStatus` enum. */
export const PROBLEM_STATUSES = [
  "DRAFT",
  "PENDING_APPROVAL",
  "PUBLISHED",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
] as const;

export type ProblemStatus = (typeof PROBLEM_STATUSES)[number];

/**
 * Mirrors `ProblemModerationRequest`. The whole body is the status a moderator
 * moves the problem to — `PUBLISHED` to approve, `REJECTED` to turn away.
 *
 * Unlike a showcase decision there is no reason field upstream, so nothing a
 * reviewer types here could reach the author.
 */
export const problemModerationSchema = z.object({
  status: z.enum(PROBLEM_STATUSES, {
    message: `status must be one of ${PROBLEM_STATUSES.join(", ")}`,
  }),
});

/** Validated body sent to `PATCH /api/v1/admin/problems/{id}/moderation`. */
export type ProblemModerationRequest = z.output<
  typeof problemModerationSchema
>;

/** Mirrors `ProblemTechnologyRequest`. Only `name` is required upstream. */
export const problemTechnologySchema = z.object({
  name: z
    .string()
    .max(100, "Technology name must not exceed 100 characters"),
  version: z
    .string()
    .max(50, "Technology version must not exceed 50 characters")
    .optional(),
});

export type ProblemTechnologyRequest = z.output<
  typeof problemTechnologySchema
>;

/** Mirrors `ProblemEnvironmentRequest`. Only `technology` is required upstream. */
export const problemEnvironmentSchema = z.object({
  technology: z
    .string()
    .max(100, "An environment name must not exceed 100 characters"),
  version: z
    .string()
    .max(50, "An environment version must not exceed 50 characters")
    .optional(),
});

export type ProblemEnvironmentRequest = z.output<
  typeof problemEnvironmentSchema
>;

const uniqueStrings = (values: string[]) =>
  new Set(values).size === values.length;

/**
 * Mirrors the backend `CreateProblemRequest` wire contract. `categoryId`,
 * `description`, `problemType` and `title` are the four the backend requires;
 * the rest of the detail fields are optional and left to the writer.
 */
export const problemCreateSchema = z.object({
  categoryId: z.uuid("Category id must be a UUID"),
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(180, "Title must not exceed 180 characters")
    .refine(isCleanText, profanityMessage("Title"))
    .refine(isReadableText, readabilityMessage("Title")),
  problemType: z.enum(PROBLEM_TYPES, {
    message: "Please select a problem type",
  }),
  sdlcPhase: z
    .enum(SDLC_PHASES, {
      message: "Please select a valid SDLC phase",
    })
    .optional(),
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(20_000, "Description must not exceed 20,000 characters")
    .refine(isCleanText, profanityMessage("Description"))
    .refine(isReadableText, readabilityMessage("Description")),
  severity: z
    .enum(PROBLEM_SEVERITIES, {
      message: "Please select a valid severity",
    })
    .optional(),
  expectedBehavior: z
    .string()
    .max(5000, "Expected behaviour must not exceed 5000 characters")
    .optional(),
  actualBehavior: z
    .string()
    .max(5000, "Actual behaviour must not exceed 5000 characters")
    .optional(),
  reproductionSteps: z
    .array(z.string().max(1000, "A step must not exceed 1000 characters"))
    .max(20, "Up to 20 reproduction steps are allowed")
    .optional(),
  environment: z
    .array(problemEnvironmentSchema)
    .max(20, "Up to 20 environment entries are allowed")
    .optional(),
  attemptsTried: z
    .string()
    .max(5000, "What you tried must not exceed 5000 characters")
    .optional(),
  errorMessage: z
    .string()
    .max(10_000, "The error output must not exceed 10000 characters")
    .optional(),
  repositoryUrl: z
    .string()
    .max(1000, "Repository URL must not exceed 1000 characters")
    .regex(/^https:\/\/\S+$/i, "Repository URL must start with https://")
    .optional(),
  technologies: z
    .array(problemTechnologySchema)
    .max(20, "Up to 20 technologies are allowed")
    .optional(),
  tagIds: z
    .array(z.uuid("Each tag id must be a UUID"))
    .max(10, "Up to 10 tag ids are allowed")
    .refine(uniqueStrings, { message: "Tag ids must be unique" })
    .optional(),
  /* Upstream calls these `newTagNames` — free-text tags that do not exist yet.
     The old `tags` name was silently dropped by the backend. */
  newTagNames: z
    .array(z.string().max(50, "Each tag must not exceed 50 characters"))
    .max(10, "Up to 10 tags are allowed")
    .refine(uniqueStrings, { message: "Tags must be unique" })
    .optional(),
});

/** Raw values accepted by the wire schema. */
export type CreateProblemInput = z.input<typeof problemCreateSchema>;

/**
 * `ProblemUpdateRequest` — every field optional, matching the PATCH contract.
 *
 * The field rules are the create rules, so a title still cannot be shortened
 * below ten characters; what changes is that omitting a field is allowed and
 * means "leave it alone".
 */
export const problemUpdateSchema = problemCreateSchema.partial();

/** Validated body sent to `PATCH /api/v1/problems/{id}`. */
export type ProblemUpdateRequest = z.output<typeof problemUpdateSchema>;

/** Validated request body sent to `POST /api/v1/problems`. */
export type CreateProblemRequest = z.output<typeof problemCreateSchema>;

const problemTechnologyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Technology name is required")
    .max(100, "Technology name must not exceed 100 characters"),
  version: z
    .string()
    .trim()
    .max(50, "Technology version must not exceed 50 characters")
    .optional(),
});

/**
 * Form-level rules can be stricter than the wire contract, except where the
 * form has to be looser: a repeatable field is empty for as long as it takes
 * to fill in, so blank rows pass here and the submit handler drops them.
 */
export const createProblemFormSchema = problemCreateSchema.extend({
  title: z
    .string()
    .trim()
    .min(10, "Title must be at least 10 characters")
    .max(180, "Title must not exceed 180 characters")
    .refine(isCleanText, profanityMessage("Title"))
    .refine(isReadableText, readabilityMessage("Title")),
  categoryId: z.uuid("Choose a category"),
  description: z
    .string()
    .trim()
    .min(30, "Description must be at least 30 characters")
    .max(20_000, "Description must not exceed 20000 characters")
    .refine(isCleanText, profanityMessage("Description"))
    .refine(isReadableText, readabilityMessage("Description")),
  technologies: z
    .array(problemTechnologyFormSchema)
    .max(20, "Up to 20 technologies are allowed")
    .optional(),
  reproductionSteps: z
    .array(z.string().max(1000, "A step must not exceed 1000 characters"))
    .max(20, "Up to 20 reproduction steps are allowed")
    .optional(),
  environment: z
    .array(
      z.object({
        technology: z
          .string()
          .max(100, "An environment name must not exceed 100 characters"),
        version: z
          .string()
          .max(50, "An environment version must not exceed 50 characters")
          .optional(),
      }),
    )
    .max(20, "Up to 20 environment entries are allowed")
    .optional(),
  repositoryUrl: z
    .union([
      z.literal(""),
      z
        .string()
        .max(1000, "Repository URL must not exceed 1000 characters")
        .regex(/^https:\/\/\S+$/i, "Repository URL must start with https://"),
    ])
    .optional(),
});

export type CreateProblemFormInput = z.input<
  typeof createProblemFormSchema
>;
export type CreateProblemFormValues = z.output<
  typeof createProblemFormSchema
>;
