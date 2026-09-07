import * as z from "zod";
import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

export const APPROACH_TYPES = [
  "FIX",
  "WORKAROUND",
  "EXPLANATION",
  "ALTERNATIVE",
] as const;

export type ApproachType = (typeof APPROACH_TYPES)[number];

export const APPROACH_LABELS: Record<ApproachType, string> = {
  FIX: "Fix",
  WORKAROUND: "Workaround",
  EXPLANATION: "Explanation",
  ALTERNATIVE: "Alternative",
};

export const APPROACH_DESCRIPTIONS: Record<ApproachType, string> = {
  FIX: "Removes the cause. The problem stops happening.",
  WORKAROUND: "Gets past it without curing it.",
  EXPLANATION: "Says why it happens, without changing code.",
  ALTERNATIVE: "A different route that avoids the problem.",
};

export const RESOURCE_TYPES = [
  "DOCUMENTATION",
  "REPOSITORY",
  "VIDEO",
  "DIAGRAM",
  "DEMO",
  "ARTICLE",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  DOCUMENTATION: "Documentation",
  REPOSITORY: "Repository",
  VIDEO: "Video",
  DIAGRAM: "Diagram",
  DEMO: "Demo",
  ARTICLE: "Article",
};

const httpsUrl = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label} must not exceed ${max} characters`)
    .regex(/^https:\/\/\S+$/i, `${label} must start with https://`);

export const verificationStepSchema = z.object({
  instruction: z
    .string()
    .max(1000, "An instruction must not exceed 1000 characters"),
  expectedResult: z
    .string()
    .max(1000, "An expected result must not exceed 1000 characters"),
});

export type VerificationStepRequest = z.output<typeof verificationStepSchema>;

export const testedWithSchema = z.object({
  technology: z
    .string()
    .max(100, "A technology name must not exceed 100 characters"),
  version: z
    .string()
    .max(50, "A version must not exceed 50 characters")
    .optional(),
});

export type TestedWithRequest = z.output<typeof testedWithSchema>;

export const solutionResourceSchema = z.object({
  type: z.enum(RESOURCE_TYPES, {
    message: `type must be one of ${RESOURCE_TYPES.join(", ")}`,
  }),
  label: z.string().max(150, "A label must not exceed 150 characters"),
  url: httpsUrl(1000, "A resource URL"),
});

export type SolutionResourceRequest = z.output<typeof solutionResourceSchema>;

export const solutionCreateSchema = z.object({
  summary: z
    .string()
    .min(10, "The summary must be at least 10 characters")
    .max(250, "The summary must not exceed 250 characters")
    .refine(isCleanText, profanityMessage("The summary"))
    .refine(isReadableText, readabilityMessage("The summary")),
  bodyMarkdown: z
    .string()
    .min(30, "Explain the answer in at least 30 characters")
    .max(30_000, "The answer must not exceed 30000 characters")
    .refine(isCleanText, profanityMessage("The answer")),
  approachType: z.enum(APPROACH_TYPES, {
    message: `approachType must be one of ${APPROACH_TYPES.join(", ")}`,
  }),
  verificationSteps: z
    .array(verificationStepSchema)
    .max(20, "Up to 20 verification steps are allowed")
    .optional(),
  testedWith: z
    .array(testedWithSchema)
    .max(20, "Up to 20 tested-with entries are allowed")
    .optional(),
  tradeoffs: z
    .string()
    .max(5000, "Trade-offs must not exceed 5000 characters")
    .optional(),
  resources: z
    .array(solutionResourceSchema)
    .max(10, "Up to 10 resources are allowed")
    .optional(),
});

export type CreateSolutionRequest = z.output<typeof solutionCreateSchema>;

export const solutionUpdateSchema = solutionCreateSchema.partial();

export type UpdateSolutionRequest = z.output<typeof solutionUpdateSchema>;

export const solutionFormSchema = solutionCreateSchema.extend({
  summary: z
    .string()
    .trim()
    .min(10, "The summary must be at least 10 characters")
    .max(250, "The summary must not exceed 250 characters"),
  verificationSteps: z
    .array(
      z.object({
        instruction: z
          .string()
          .max(1000, "An instruction must not exceed 1000 characters"),
        expectedResult: z
          .string()
          .max(1000, "An expected result must not exceed 1000 characters"),
      }),
    )
    .max(20, "Up to 20 verification steps are allowed")
    .optional(),
  testedWith: z
    .array(
      z.object({
        technology: z
          .string()
          .max(100, "A technology name must not exceed 100 characters"),
        version: z
          .string()
          .max(50, "A version must not exceed 50 characters")
          .optional(),
      }),
    )
    .max(20, "Up to 20 tested-with entries are allowed")
    .optional(),
  resources: z
    .array(
      z.object({
        type: z.enum(RESOURCE_TYPES),
        label: z.string().max(150, "A label must not exceed 150 characters"),
        url: z
          .union([z.literal(""), httpsUrl(1000, "A resource URL")])
          .optional(),
      }),
    )
    .max(10, "Up to 10 resources are allowed")
    .optional()
    .superRefine((rows, ctx) => {
      rows?.forEach((row, index) => {
        const hasLabel = row.label.trim().length > 0;
        const hasUrl = (row.url ?? "").trim().length > 0;
        if (hasLabel && !hasUrl) {
          ctx.addIssue({
            code: "custom",
            path: [index, "url"],
            message: "Add the link, or clear the label",
          });
        }
        if (hasUrl && !hasLabel) {
          ctx.addIssue({
            code: "custom",
            path: [index, "label"],
            message: "Name what this link is",
          });
        }
      });
    }),
});

export type SolutionFormValues = z.output<typeof solutionFormSchema>;
export type SolutionFormInput = z.input<typeof solutionFormSchema>;
