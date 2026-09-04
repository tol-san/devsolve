import * as z from "zod";
import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

export const CATEGORY_SCOPES = ["PROBLEM", "SHOWCASE"] as const;

export type CategoryScope = (typeof CATEGORY_SCOPES)[number];

export const categoryCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name must not exceed 50 characters")
    .refine(isCleanText, profanityMessage("Category name"))
    .refine(isReadableText, readabilityMessage("Category name")),
  scope: z.enum(CATEGORY_SCOPES, { message: "Pick a scope" }),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .refine(isCleanText, profanityMessage("Description"))
    .refine(isReadableText, readabilityMessage("Description"))
    .optional(),
  iconUrl: z
    .string()
    .trim()
    .max(255, "Icon URL must not exceed 255 characters")
    .optional(),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .optional(),
  isActive: z.boolean().optional(),
});

export const categoryPatchSchema = categoryCreateSchema
  .extend({
    slug: z
      .string()
      .trim()
      .max(50, "Slug must not exceed 50 characters")
      .optional(),
  })
  .partial();

export type CategoryCreateInput = z.input<typeof categoryCreateSchema>;
export type CategoryCreateValues = z.output<typeof categoryCreateSchema>;
export type CategoryPatchValues = z.output<typeof categoryPatchSchema>;

export const ICON_MAX_BYTES = 1024 * 1024;

export const ICON_ACCEPTED = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

export function validateIconFile(file: File): string | null {
  if (!ICON_ACCEPTED.includes(file.type)) {
    return "Icons must be PNG, JPG, WebP, or SVG";
  }
  if (file.size > ICON_MAX_BYTES) {
    return `Icon must be 1MB or smaller (this one is ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}
