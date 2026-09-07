import * as z from "zod";
import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function hostOf(raw: string): string | null {
  const normalized = normalizeUrl(raw);
  if (!normalized) return null;
  try {
    return new URL(normalized).host || null;
  } catch {
    return null;
  }
}

const optionalUrl = (max = 500) =>
  z
    .string()
    .trim()
    .transform(normalizeUrl)
    .refine((value) => value === "" || URL.canParse(value), {
      message: "Enter a valid URL",
    })
    .refine((value) => value.length <= max, {
      message: `URL must not exceed ${max} characters`,
    })
    .optional();

export const TECH_SUGGESTIONS = [
  "React",
  "Next.js",
  "Vue.js",
  "Svelte",
  "Angular",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Node.js",
  "Express.js",
  "NestJS",
  "Java",
  "Spring Boot",
  "Kotlin",
  "Python",
  "FastAPI",
  "Django",
  "Go",
  "Rust",
  "PHP",
  "Laravel",
  "Ruby on Rails",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Prisma",
  "GraphQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "Google Cloud",
  "Azure",
  "Vercel",
  "Firebase",
  "Supabase",
  "Flutter",
  "React Native",
  "Swift",
  "Terraform",
] as const;

export function canonicalizeTech(raw: string): string {
  const cleaned = raw.trim().replace(/^#/, "").replace(/\s+/g, " ");
  if (!cleaned) return "";

  const key = cleaned.toLowerCase().replace(/[.\s-]/g, "");
  const known = TECH_SUGGESTIONS.find(
    (tech) => tech.toLowerCase().replace(/[.\s-]/g, "") === key,
  );
  if (known) return known;

  const withoutJs = key.replace(/js$/, "");
  const nearby = TECH_SUGGESTIONS.find(
    (tech) => tech.toLowerCase().replace(/[.\s-]/g, "") === withoutJs,
  );

  return nearby ?? cleaned;
}

export const MAX_TECH = 15;

const pendingImage = z
  .custom<File>((value) => value instanceof File, {
    message: "Choose a PNG, JPG, or WebP image",
  })
  .optional();

export const buildStepSchema = z.object({
  key: z.string(),
  serverId: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(1, "Step title is required")
    .max(255, "Step title must not exceed 255 characters")
    .refine(isCleanText, profanityMessage("Step title"))
    .refine(isReadableText, readabilityMessage("Step title")),
  description: z
    .string()
    .trim()
    .min(1, "Step description is required")
    .refine(isCleanText, profanityMessage("Step description")),
  codeSnippet: z.string().optional(),
  codeLanguage: z.string().optional(),
  imageUrl: z
    .string()
    .trim()
    .max(500, "Image URL must not exceed 500 characters")
    .optional(),
  diagramUrl: z
    .string()
    .trim()
    .max(500, "Diagram URL must not exceed 500 characters")
    .optional(),
  imageFile: pendingImage,
  diagramFile: pendingImage,
});

export type BuildStepValues = z.infer<typeof buildStepSchema>;

export const resourceLinkSchema = z.object({
  key: z.string(),
  label: z
    .string()
    .trim()
    .min(1, "Label is required")
    .max(80, "Label must not exceed 80 characters"),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .transform(normalizeUrl)
    .refine((value) => URL.canParse(value), { message: "Enter a valid URL" })
    .refine((value) => value.length <= 500, {
      message: "URL must not exceed 500 characters",
    }),
});

export type ResourceLinkValues = z.infer<typeof resourceLinkSchema>;

export const createShowcaseSchema = z
  .object({
    coverImageUrl: z
      .string()
      .trim()
      .max(500, "Cover image URL must not exceed 500 characters")
      .optional(),
    coverImageFile: pendingImage,
    title: z
      .string()
      .trim()
      .min(1, "Project title is required")
      .max(255, "Title must not exceed 255 characters")
      .refine(isCleanText, profanityMessage("Title"))
      .refine(isReadableText, readabilityMessage("Title")),
    categoryId: z.string().min(1, "Pick a category"),
    overview: z
      .string()
      .trim()
      .min(1, "An overview is required")
      .refine(isCleanText, profanityMessage("The overview")),
    techStack: z
      .array(z.string())
      .max(MAX_TECH, `Up to ${MAX_TECH} technologies`),
    steps: z.array(buildStepSchema).min(1, "Add at least one build step"),
    repoUrl: optionalUrl(),
    liveUrl: optionalUrl(),
    videoUrl: optionalUrl(),
    resourceLinks: z.array(resourceLinkSchema),
  })
  /* A cover can arrive either way, so the requirement is on the pair rather
     than on one field. The message is reported against `coverImageUrl`, which
     is where the field renders its error. */
  .refine(
    (values) => Boolean(values.coverImageUrl?.trim() || values.coverImageFile),
    { message: "A cover image is required", path: ["coverImageUrl"] },
  );

export type CreateShowcaseFormValues = z.input<typeof createShowcaseSchema>;

export type CreateShowcaseSubmitValues = z.output<typeof createShowcaseSchema>;

export const SHOWCASE_REVIEW_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type ShowcaseReviewStatus = (typeof SHOWCASE_REVIEW_STATUSES)[number];

const wireText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must not exceed ${max} characters`)
    .optional();

export const showcaseCreateSchema = z.object({
  categoryId: z.uuid("Category id must be a UUID").optional(),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must not exceed 255 characters")
    .refine(isCleanText, profanityMessage("Title"))
    .refine(isReadableText, readabilityMessage("Title")),
  overview: z
    .string()
    .trim()
    .min(1, "An overview is required")
    .refine(isCleanText, profanityMessage("The overview")),
  coverImageUrl: wireText(500, "Cover image URL"),
  liveUrl: wireText(500, "Live URL"),
  repoUrl: wireText(500, "Repository URL"),
  videoUrl: wireText(500, "Video URL"),
});

export const showcaseUpdateSchema = showcaseCreateSchema.partial();

export const showcaseStepCreateSchema = z.object({
  stepNumber: z.coerce
    .number()
    .int("Step number must be a whole number")
    .min(1, "Step numbers start at 1"),
  title: z
    .string()
    .trim()
    .min(1, "Step title is required")
    .max(255, "Step title must not exceed 255 characters")
    .refine(isCleanText, profanityMessage("Step title"))
    .refine(isReadableText, readabilityMessage("Step title")),
  description: z
    .string()
    .trim()
    .min(1, "Step description is required")
    .refine(isCleanText, profanityMessage("Step description")),
  codeSnippet: z.string().optional(),
  imageUrl: wireText(500, "Image URL"),
  diagramUrl: wireText(500, "Diagram URL"),
});

export const showcaseStepUpdateSchema = showcaseStepCreateSchema.partial();

export const showcaseReviewStatusSchema = z.object({
  reviewStatus: z.enum(SHOWCASE_REVIEW_STATUSES, {
    message: `reviewStatus must be one of ${SHOWCASE_REVIEW_STATUSES.join(", ")}`,
  }),
  rejectionReason: wireText(2000, "Rejection reason"),
});

export const COVER_MAX_BYTES = 5 * 1024 * 1024;
export const COVER_ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
export const COVER_ASPECT = 16 / 9;

export function validateImageFile(file: File): string | null {
  if (!COVER_ACCEPTED.includes(file.type)) {
    return "Only PNG, JPG, or WebP images are accepted";
  }
  if (file.size > COVER_MAX_BYTES) {
    return `Image must be 5MB or smaller (this one is ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}
