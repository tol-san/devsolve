import { cache } from "react";
import type { ProblemResponse } from "@/lib/redux/services/problemsApi";
import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import type { SolutionResponse } from "@/lib/redux/services/solutionsApi";
import type { Program } from "@/lib/types/programs/types";

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

export const getPublicProfile = cache(async (id: string) => {
  if (!id) return null;
  return isUuid(id)
    ? backendJson<PublicProfile>(`/user-profiles/${id}`)
    : backendJson<PublicProfile>(`/user-profiles/by-username/${encodeURIComponent(id)}`);
});

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

export const listPrograms = cache(async () => collectPages<Program>("/programs"));

export const listPublicProfiles = cache(async () =>
  collectPages<PublicProfile>("/user-profiles", {
    pageParam: "pageNumber",
    sizeParam: "pageSize",
  }),
);
