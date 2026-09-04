import * as z from "zod";

/**
 * Mirrors the backend `SaveShowcaseDraftRequest`.
 *
 * Every field is optional — drafts are saved while someone types and must
 * never reject incomplete forms. The schema enforces ceilings to catch
 * over-long values before submit.
 */
const optionalUuid = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().uuid().nullish(),
);

const optionalString = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().nullish(),
);

export const saveShowcaseDraftSchema = z.object({
  categoryId: optionalUuid,
  title: z.string().nullish(),
  overview: z.string().nullish(),
  coverImageUrl: optionalString,
  liveUrl: optionalString,
  repoUrl: optionalString,
  videoUrl: optionalString,
  tagIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
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
