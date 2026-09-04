import * as z from "zod";

/**
 * Mirrors the backend `SaveShowcaseDraftRequest`.
 *
 * Every field is optional — drafts are saved while someone types and must
 * never reject incomplete forms. The schema enforces ceilings to catch
 * over-long values before submit.
 */
export const saveShowcaseDraftSchema = z.object({
  categoryId: z.string().uuid().nullish(),
  title: z.string().max(255).optional(),
  overview: z.string().optional(),
  coverImageUrl: z.string().max(500).nullish(),
  liveUrl: z.string().max(500).nullish(),
  repoUrl: z.string().max(500).nullish(),
  videoUrl: z.string().max(500).nullish(),
  tagIds: z.array(z.string().uuid()).max(20).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export type SaveShowcaseDraftValues = z.output<typeof saveShowcaseDraftSchema>;

/** Mirrors `ShowcaseDraftResponse`. */
export interface ShowcaseDraftResponse extends SaveShowcaseDraftValues {
  id: string;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageShowcaseDraftResponse {
  content?: ShowcaseDraftResponse[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}
