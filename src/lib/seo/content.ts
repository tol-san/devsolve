import { cache } from "react";
import type { ProblemResponse } from "@/lib/redux/services/problemsApi";
import type { ShowcaseResponse } from "@/lib/redux/services/showcasesApi";
import type { SolutionResponse } from "@/lib/redux/services/solutionsApi";
import type { Program } from "@/lib/types/programs/types";
import type { DiscussionPost } from "@/lib/types/dicussion/types";
import { authorNameOf } from "@/lib/discussions/format";
import type {
  HacktivityApiPage,
  HacktivityFeed,
  HacktivityStats,
} from "@/lib/types/hacktivity/types";
import { toFeed } from "@/lib/hacktivity/transform";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const CONTENT_TTL_SECONDS = 300;

const LISTING_TTL_SECONDS = 3600;

interface PageEnvelope<T> {
  content?: T[];
  last?: boolean;
  totalPages?: number;
}

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
      next: { revalidate },
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

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
  const rawAny = raw as unknown as Record<string, unknown>;
  const avatarUrl =
    raw.author?.avatarUrl ||
    (typeof rawAny.authorAvatarUrl === "string" ? rawAny.authorAvatarUrl : "") ||
    (typeof rawAny.avatarUrl === "string" ? rawAny.avatarUrl : "") ||
    "";
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
      id: raw.author?.id || (typeof rawAny.authorId === "string" ? rawAny.authorId : undefined),
      name: authorNameOf(raw.author, "Community Member"),
      avatarUrl,
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
  const rawAny = raw as unknown as Record<string, unknown>;
  const authorName = authorNameOf(
    raw.author,
    raw.authorName || (typeof rawAny.fullName === "string" ? rawAny.fullName : "") || "Community Member",
  );
  const avatarUrl =
    raw.author?.avatarUrl ||
    (typeof rawAny.authorAvatarUrl === "string" ? rawAny.authorAvatarUrl : "") ||
    (typeof rawAny.avatarUrl === "string" ? rawAny.avatarUrl : "") ||
    (typeof rawAny.author_avatar_url === "string" ? rawAny.author_avatar_url : "") ||
    "";
  const authorId =
    raw.author?.id ||
    raw.authorId ||
    (typeof rawAny.authorId === "string" ? rawAny.authorId : undefined) ||
    (typeof rawAny.userId === "string" ? rawAny.userId : undefined);
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
      id: authorId,
      name: authorName,
      avatarUrl: avatarUrl,
      reputation: raw.author?.reputation ?? 0,
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

export interface InitialHacktivityData {
  feed: HacktivityFeed | null;
  stats: HacktivityStats | null;
}

export const getInitialHacktivity = cache(
  async (): Promise<InitialHacktivityData> => {
    try {
      const [feedPage, stats] = await Promise.all([
        backendJson<HacktivityApiPage>(
          "/hacktivity?page=0&size=20&sort=createdAt,DESC",
        ),
        backendJson<HacktivityStats>("/hacktivity/stats"),
      ]);

      return {
        feed: feedPage ? toFeed(feedPage) : null,
        stats: stats ?? null,
      };
    } catch {
      return { feed: null, stats: null };
    }
  },
);

