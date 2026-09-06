import { baseApi } from "../baseApi";
import { excerptOf } from "@/lib/markdown-excerpt";
import type { AdminFlaggableType } from "@/lib/validations/moderation";

/**
 * A flag carries only `flaggableType` + `flaggableId` — no title, no snippet.
 * To let an admin judge a report without opening a second tab, each reported
 * item is fetched from its own public endpoint and rendered beside the flag.
 *
 * That is N+1 requests per page of reports. They are issued in parallel and
 * cached under one key per page, but if the queue gets busy the real fix is a
 * title + snippet on FlagResponse itself.
 */

export interface FlagTarget {
  type: AdminFlaggableType;
  id: string;
}

export interface ContentPreview {
  type: AdminFlaggableType;
  id: string;
  title: string | null;
  excerpt: string | null;
  authorName: string | null;
  authorId: string | null;
  status: string | null;
  /** Where an admin can open the live item, when it has a public page. */
  href: string | null;
  /** 404 from the detail endpoint — already deleted or taken down. */
  missing: boolean;
  /** The fetch failed for some other reason; the row degrades, not the page. */
  unavailable: boolean;
}

export type ContentPreviewMap = Record<string, ContentPreview>;

export const previewKey = (type: string, id: string) => `${type}:${id}`;

const DETAIL_PATHS: Record<AdminFlaggableType, (id: string) => string> = {
  PROBLEM: (id) => `/problems/${id}`,
  SHOWCASE: (id) => `/showcases/${id}`,
  SOLUTION: (id) => `/solutions/${id}`,
  COMMENT: (id) => `/comments/${id}`,
  PROGRAM: (id) => `/programs/${id}`,
};

/** Detail payloads differ per resource, so read tolerantly rather than guess. */
function readString(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function readAuthor(source: Record<string, unknown>): {
  name: string | null;
  id: string | null;
} {
  const author = source.author;
  if (author && typeof author === "object") {
    const record = author as Record<string, unknown>;
    return {
      name: readString(record, ["fullName", "displayName", "username"]),
      id: readString(record, ["id"]),
    };
  }
  return {
    name: readString(source, ["authorName", "ownerFullName"]),
    id: readString(source, ["authorId", "ownerId"]),
  };
}

function toPreview(
  target: FlagTarget,
  payload: Record<string, unknown>,
): ContentPreview {
  const author = readAuthor(payload);
  const body =
    readString(payload, [
      "description",
      "bodyMarkdown",
      "content",
      "overview",
      "summary",
    ]) ?? "";

  const title =
    readString(payload, ["title", "name", "summary"]) ??
    (body ? excerptOf(body, 80) : null);

  const problemId = readString(payload, ["problemId"]);

  const href =
    target.type === "PROBLEM"
      ? `/community/${target.id}`
      : target.type === "SHOWCASE"
        ? `/showcases/${target.id}`
        : target.type === "SOLUTION" && problemId
          ? `/community/${problemId}#solution-${target.id}`
          : target.type === "PROGRAM"
            ? `/programs/${target.id}`
            : null;

  return {
    type: target.type,
    id: target.id,
    title,
    excerpt: body ? excerptOf(body, 240) : null,
    authorName: author.name,
    authorId: author.id,
    status: readString(payload, ["status", "reviewStatus", "submissionState"]),
    href,
    missing: false,
    unavailable: false,
  };
}

function blankPreview(
  target: FlagTarget,
  kind: "missing" | "unavailable",
): ContentPreview {
  return {
    type: target.type,
    id: target.id,
    title: null,
    excerpt: null,
    authorName: null,
    authorId: null,
    status: null,
    href: null,
    missing: kind === "missing",
    unavailable: kind === "unavailable",
  };
}

export const flaggedContentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFlaggedContentPreviews: builder.query<ContentPreviewMap, FlagTarget[]>({
      async queryFn(targets, _api, _extra, fetchWithBQ) {
        // One flag per report, but the same post can be reported many times.
        const unique = new Map<string, FlagTarget>();
        for (const target of targets) {
          if (target.id) unique.set(previewKey(target.type, target.id), target);
        }

        const entries = await Promise.all(
          [...unique.entries()].map(async ([key, target]) => {
            const path = DETAIL_PATHS[target.type];
            if (!path) return [key, blankPreview(target, "unavailable")] as const;

            const result = await fetchWithBQ(path(target.id));

            if (result.error) {
              return [
                key,
                blankPreview(
                  target,
                  result.error.status === 404 ? "missing" : "unavailable",
                ),
              ] as const;
            }

            return [
              key,
              toPreview(target, (result.data ?? {}) as Record<string, unknown>),
            ] as const;
          }),
        );

        return { data: Object.fromEntries(entries) };
      },
      // A takedown changes what these previews should say.
      providesTags: [{ type: "ContentReport", id: "PREVIEWS" }],
      keepUnusedDataFor: 60,
    }),
  }),
  overrideExisting: true,
});

export const { useGetFlaggedContentPreviewsQuery } = flaggedContentApi;
