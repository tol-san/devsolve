import * as z from "zod";

/**
 * Admin moderation contracts.
 *
 * These mirror the `/api/v1/admin/*` moderation endpoints. The user-facing
 * flag form in `engagement.ts` deliberately offers a narrower set of targets —
 * a reporter cannot flag a PROGRAM, but the admin queue can receive one, so the
 * admin-side union is wider.
 */

export const ADMIN_FLAGGABLE_TYPES = [
  "PROGRAM",
  "PROBLEM",
  "SOLUTION",
  "COMMENT",
  "SHOWCASE",
] as const;

export type AdminFlaggableType = (typeof ADMIN_FLAGGABLE_TYPES)[number];

export const FLAG_STATUSES = ["PENDING", "REVIEWED", "DISMISSED"] as const;
export type FlagStatus = (typeof FLAG_STATUSES)[number];

export const FLAG_SOURCES = ["USER", "SYSTEM"] as const;
export type FlagSource = (typeof FLAG_SOURCES)[number];

/** Every takedown reason and resolution note shares this 2000-char ceiling. */
const REASON_TEXT = z
  .string()
  .trim()
  .min(1, "A reason is required")
  .max(2000, "Keep this under 2000 characters");

export const flagResolveSchema = z.object({
  resolutionNote: REASON_TEXT.max(
    2000,
    "Keep the resolution note under 2000 characters",
  ),
  removeContent: z.boolean().default(false),
});

export type FlagResolveValues = z.input<typeof flagResolveSchema>;

export const takedownSchema = z.object({
  reason: REASON_TEXT,
});

export type TakedownValues = z.infer<typeof takedownSchema>;

/** Content types that accept `POST /admin/{type}/{id}/takedown`. */
export const TAKEDOWN_TARGETS = [
  "PROBLEM",
  "SHOWCASE",
  "SOLUTION",
  "COMMENT",
  "PROGRAM",
] as const;

export type TakedownTarget = (typeof TAKEDOWN_TARGETS)[number];

/** REPORT and USER are rejected with 400 by the takedown endpoints. */
export function isTakedownTarget(value: string): value is TakedownTarget {
  return (TAKEDOWN_TARGETS as readonly string[]).includes(value);
}

export const ACCOUNT_ACTIONS = [
  "WARN",
  "SUSPEND",
  "REMOVE",
  "BAN",
  "REINSTATE",
] as const;

export type AccountAction = (typeof ACCOUNT_ACTIONS)[number];

/**
 * `expiresAt` is required for SUSPEND and rejected for every other action —
 * the backend returns 400 either way, so the form enforces it up front.
 */
export const accountModerationSchema = z
  .object({
    action: z.enum(ACCOUNT_ACTIONS),
    reason: REASON_TEXT,
    expiresAt: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    const hasExpiry = Boolean(value.expiresAt && value.expiresAt.length > 0);

    if (value.action === "SUSPEND" && !hasExpiry) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "A suspension needs an end date",
      });
      return;
    }

    if (value.action !== "SUSPEND" && hasExpiry) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: `${value.action} does not take an end date`,
      });
      return;
    }

    if (hasExpiry && Number.isNaN(Date.parse(value.expiresAt!))) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Enter a valid date and time",
      });
    }
  });

export type AccountModerationValues = z.infer<typeof accountModerationSchema>;

export const FLAG_REASON_LABELS: Record<string, string> = {
  SPAM: "Spam",
  OFFENSIVE: "Offensive",
  DUPLICATE: "Duplicate",
  OFF_TOPIC: "Off topic",
  OTHER: "Other",
};

export const FLAGGABLE_TYPE_LABELS: Record<AdminFlaggableType, string> = {
  PROGRAM: "Program",
  PROBLEM: "Problem",
  SOLUTION: "Solution",
  COMMENT: "Comment",
  SHOWCASE: "Showcase",
};

export const ACCOUNT_ACTION_LABELS: Record<AccountAction, string> = {
  WARN: "Warn",
  SUSPEND: "Suspend",
  REMOVE: "Remove",
  BAN: "Ban",
  REINSTATE: "Reinstate",
};
