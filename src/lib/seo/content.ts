import { cache } from "react";
import type { ProblemResponse } from "@/lib/redux/services/problemsApi";
import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import type { SolutionResponse } from "@/lib/redux/services/solutionsApi";
import type { Program } from "@/lib/types/programs/types";
import type { DiscussionPost } from "@/lib/types/dicussion/types";
import { authorNameOf } from "@/lib/discussions/format";

/**
 * Server-side reads of public content, for the two things that cannot go
 * through RTK Query: `generateMetadata` and the sitemap. Both run before —
 * or entirely without — a browser, so there is no store to dispatch into and
 * no hook to call.
 *
 * Every request here is anonymous on purpose. A crawler has no session, so
 * metadata must be built from exactly what an anonymous caller can see: the
 * backend serves published problems, approved showcases and public programs
 * to anyone, and refuses the rest, which is the same line the pages draw.
 *
 * Nothing here throws. A page whose metadata could not be fetched still has
 * to render, so an unreachable backend degrades to the site defaults.
 */

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

/** How stale a title or description may be before it is fetched again. */
const CONTENT_TTL_SECONDS = 300;

/** Listings only feed the sitemap, which no one reads more than hourly. */
const LISTING_TTL_SECONDS = 3600;

/** Spring's page envelope, narrowed to the fields the sitemap walks. */
interface PageEnvelope<T> {
  content?: T[];
  last?: boolean;
  totalPages?: number;
}

/** `PublicUserProfileResponse` — the fields a profile's metadata needs. */
export interface PublicProfile {
  id?: string;
  fullName?: string;
  biography?: string;
  avatarUrl?: string;
  country?: string;
  reputation?: number;
  totalReports?: number;
  validReports?: number;
  joinedAt?: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Path ids are UUIDs upstream, so a malformed one is refused before the trip. */
export const isUuid = (value: string | undefined): value is string =>
  Boolean(value && UUID_PATTERN.test(value));

async function backendJson<T>(
  path: string,
  revalidate: number = CONTENT_TTL_SECONDS,
): Promise<T | null> {
  if (!BACKEND_API_URL) return null;

  try {
    const response = await fetch(`${BACKEND_API_URL}${path}`, {
      headers: { Accept: "application/json" },
      // Metadata is regenerated on a timer rather than per request: a crawler
      // hitting a popular problem should not cost an upstream round trip.
      next: { revalidate },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // Backend down, DNS failure, timeout — the caller falls back to defaults.
    return null;
  }
}

/**
 * Walks a paged listing until it runs out or hits the cap.
 *
 * The cap is what keeps a sitemap build bounded as the site grows; a single
 * sitemap may carry 50,000 URLs, and splitting past that is `generateSitemaps`
 * territory rather than a bigger loop here.
 */
async function collectPages<T>(
  path: string,
  {
    pageSize = 100,
    maxPages = 20,
    pageParam = "page",
    sizeParam = "size",
  }: {
    pageSize?: number;
    maxPages?: number;
    pageParam?: "page" | "pageNumber";
    sizeParam?: "size" | "pageSize";
  } = {},
): Promise<T[]> {
  const collected: T[] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const envelope = await backendJson<PageEnvelope<T>>(
      `${path}${separator}${pageParam}=${page}&${sizeParam}=${pageSize}`,
      LISTING_TTL_SECONDS,
    );

    const rows = envelope?.content ?? [];
    collected.push(...rows);

    if (!envelope || envelope.last !== false || rows.length === 0) break;
  }

  return collected;
}

/* `cache` dedupes within one render: `generateMetadata`, the page body and the
   OG image route all ask for the same problem, and only one fetch is made. */

export const getProblem = cache(async (id: string) =>
  isUuid(id) ? backendJson<ProblemResponse>(`/problems/${id}`) : null,
);

export const getProblemSolutions = cache(async (id: string) => {
  if (!isUuid(id)) return [];
  const envelope = await backendJson<PageEnvelope<SolutionResponse>>(
    `/problems/${id}/solutions?page=0&size=20`,
  );
  return envelope?.content ?? [];
});

export const getShowcase = cache(async (id: string) =>
  isUuid(id) ? backendJson<ShowcaseResponse>(`/showcases/${id}`) : null,
);

export const getProgram = cache(async (id: string) =>
  isUuid(id) ? backendJson<Program>(`/programs/${id}`) : null,
);

export const getPublicProfile = cache(async (id: string) =>
  isUuid(id) ? backendJson<PublicProfile>(`/user-profiles/${id}`) : null,
);

/** Every published problem, newest first — the sitemap's largest section. */
export const listProblems = cache(async () =>
  collectPages<ProblemResponse>("/problems?sort=NEWEST"),
);

export const listShowcases = cache(async () =>
  collectPages<ShowcaseResponse>("/showcases", {
    pageParam: "pageNumber",
    sizeParam: "pageSize",
  }),
);

export const listPrograms = cache(async () =>
  collectPages<Program>("/programs"),
);

export const listPublicProfiles = cache(async () =>
  collectPages<PublicProfile>("/user-profiles", {
    pageParam: "pageNumber",
    sizeParam: "pageSize",
  }),
);

function toRelativeDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffHrs = (Date.now() - date.getTime()) / 3_600_000;
  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) {
    const hrs = Math.floor(diffHrs);
    return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(diffHrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function problemToDiscussionPost(raw: ProblemResponse): DiscussionPost {
  const timestamp = raw.publishedAt || raw.createdAt;
  const id = raw.id ?? "";
  return {
    id,
    title: raw.title ?? "",
    category: "Problems",
    topic: raw.category?.name ?? "General",
    description: raw.description ?? "",
    tags: (raw.tags ?? []).map((t) => t.name).filter(Boolean) as string[],
    votes: raw.voteScore ?? 0,
    answersCount: raw.solutionCount ?? 0,
    viewsCount: raw.viewCount ?? 0,
    status: raw.status === "RESOLVED" ? "Solved" : "Open",
    author: {
      name: authorNameOf(raw.author, "Community Member"),
      avatarUrl:
        raw.author?.avatarUrl ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
    },
    createdAt: toRelativeDate(timestamp),
    sortTimestamp: timestamp,
    isBookmarked: false,
    isUpvoted: false,
  };
}

export function showcaseToDiscussionPost(
  raw: ShowcaseResponse,
): DiscussionPost {
  const id = raw.id ?? "";
  return {
    id,
    title: raw.title ?? "",
    category: "Showcase",
    topic: raw.categoryName ?? "General",
    description: raw.overview ?? "",
    tags: (raw.tags ?? []).flatMap((tag) => (tag.name ? [tag.name] : [])),
    votes: 0,
    answersCount: 0,
    viewsCount: raw.viewCount ?? 0,
    thumbnailUrl: raw.coverImageUrl,
    author: {
      name: raw.authorName || "Community Member",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
    },
    createdAt: toRelativeDate(raw.createdAt),
    sortTimestamp: raw.createdAt,
    isBookmarked: false,
    isUpvoted: false,
  };
}

export interface InitialDiscussionsData {
  data: DiscussionPost[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getInitialDiscussions = cache(
  async (
    feed: "community" | "problems" | "showcases",
    limit = 10,
  ): Promise<InitialDiscussionsData | null> => {
    try {
      if (feed === "problems") {
        const problems = await listProblems();
        const valid = (problems ?? []).filter((p) => p.id && !p.deletedAt);
        if (valid.length === 0) return null;
        return {
          data: valid.slice(0, limit).map(problemToDiscussionPost),
          totalCount: valid.length,
          page: 1,
          limit,
          totalPages: Math.max(1, Math.ceil(valid.length / limit)),
        };
      }

      if (feed === "showcases") {
        const showcases = await listShowcases();
        const valid = (showcases ?? []).filter(
          (s) => s.id && s.reviewStatus === "APPROVED",
        );
        if (valid.length === 0) return null;
        return {
          data: valid.slice(0, limit).map(showcaseToDiscussionPost),
          totalCount: valid.length,
          page: 1,
          limit,
          totalPages: Math.max(1, Math.ceil(valid.length / limit)),
        };
      }

      const [problems, showcases] = await Promise.all([
        listProblems(),
        listShowcases(),
      ]);
      const validProblems = (problems ?? [])
        .filter((p) => p.id && !p.deletedAt)
        .map(problemToDiscussionPost);
      const validShowcases = (showcases ?? [])
        .filter((s) => s.id && s.reviewStatus === "APPROVED")
        .map(showcaseToDiscussionPost);
      const combined = [...validProblems, ...validShowcases].sort((a, b) => {
        const timeA = Date.parse(a.sortTimestamp ?? a.createdAt) || 0;
        const timeB = Date.parse(b.sortTimestamp ?? b.createdAt) || 0;
        return timeB - timeA;
      });
      if (combined.length === 0) return null;
      return {
        data: combined.slice(0, limit),
        totalCount: combined.length,
        page: 1,
        limit,
        totalPages: Math.max(1, Math.ceil(combined.length / limit)),
      };
    } catch {
      return null;
    }
  },
);


