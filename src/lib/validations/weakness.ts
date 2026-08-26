import * as z from "zod";
import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

/**
 * Mirrors the backend `CreateWeaknessRequest`: `name` is the only required
 * field, and the lengths are the upstream's own (`cweId` 20, `name` 255,
 * `description` 2000).
 */
export const weaknessCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must not exceed 255 characters")
    .refine(isCleanText, profanityMessage("Weakness name"))
    .refine(isReadableText, readabilityMessage("Weakness name")),
  /* Free text upstream, but a catalogue whose ids are typed inconsistently is
     one nobody can group by — so the familiar `CWE-79` shape is required when
     the field is filled at all. */
  cweId: z
    .string()
    .trim()
    .max(20, "CWE id must not exceed 20 characters")
    .regex(/^CWE-\d+$/i, "Use the CWE-<number> form, e.g. CWE-79")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(2000, "Description must not exceed 2000 characters")
    .refine(isCleanText, profanityMessage("Description"))
    .refine(isReadableText, readabilityMessage("Description"))
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});

/** Mirrors `UpdateWeaknessRequest` — every field optional. */
export const weaknessPatchSchema = weaknessCreateSchema.partial();

export type WeaknessCreateInput = z.input<typeof weaknessCreateSchema>;
export type WeaknessCreateValues = z.output<typeof weaknessCreateSchema>;
export type WeaknessPatchValues = z.output<typeof weaknessPatchSchema>;
