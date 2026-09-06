import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiOrigin =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://devsolve-api.quizzy.it.com";

export const PUBLIC_API_BASE_URL = `${apiOrigin.replace(/\/+$/, "")}/api/v1`;

// ── Types ─────────────────────────────────────────────────────────────

export type PlatformStats = {
  totalDisbursedUsd: number;
  activeResearchers: number;
  livePrograms: number;
  validatedReports: number;
  historicalSeries: {
    disbursedUsd: number[];
    researchers: number[];
    livePrograms: number[];
    validatedReports: number[];
  } | null;
  seriesPeriod: "MONTHLY";
  seriesMonths: number;
};

export type ProgramSummary = {
  id: string;
  organizationId: string;
  organizationName: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    description: string | null;
    industry: string | null;
    country: string | null;
    verifiedAt: string | null;
  } | null;
  handle: string;
  name: string;
  description: string | null;
  engagementType: "BOUNTY" | "RESPONSE" | null;
  offersBounties: boolean | null;
  minimumBounty: number | null;
  maximumBounty: number | null;
  inScopeAssets: {
    id: string;
    assetType: string;
    identifier: string;
    description: string | null;
    isInScope: boolean;
    maxSeverity: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  }[];
  scope: string[];
  topSeverity: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  viewCount: number;
  followerCount: number;
  totalSubmissions: number;
  resolvedReports: number;
  avgTriageDays: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProblemCard = {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string | null;
  viewCount: number;
  solutionCount: number;
  commentCount: number;
  voteScore: number;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    reputation: number;
  } | null;
  tags: { id: string; name: string; slug: string }[];
};

export type ShowcaseCard = {
  id: string;
  title: string;
  overview: string | null;
  coverImageUrl: string | null;
  viewCount: number | null;
  commentCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  } | null;
  engagement: {
    voteScore: number;
    upvoteCount: number;
    downvoteCount: number;
    bookmarkCount: number;
    followerCount: number;
  };
  tags: { id: string; name: string; slug: string }[];
};

export type LeaderboardRow = {
  rank: number;
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  country: string | null;
  reputation: number;
  totalReports: number | null;
  validReports: number | null;
  criticalReports: number;
  recognitionCount: number;
};

// ── Paged response unwrapper ──────────────────────────────────────────

export function unwrapPage<T>(json: any): { items: T[]; total: number } {
  const items: T[] = json?.content ?? [];
  const total: number =
    json?.totalElements ?? json?.page?.totalElements ?? items.length;
  return { items, total };
}

// ── Public RTK Query Api ──────────────────────────────────────────────

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: PUBLIC_API_BASE_URL,
    timeout: 30000,
    // Note: Public endpoints intentionally DO NOT send Authorization header
  }),
  tagTypes: ["PublicStats", "PublicPrograms", "PublicProblems", "PublicShowcases", "PublicLeaderboard"],
  endpoints: (builder) => ({
    getPublicStats: builder.query<PlatformStats, void>({
      query: () => "/public/stats",
      providesTags: ["PublicStats"],
    }),

    getPublicPrograms: builder.query<
      { items: ProgramSummary[]; total: number },
      { page?: number; size?: number; sort?: string } | void
    >({
      query: (args) => ({
        url: "/programs",
        params: {
          page: args?.page ?? 0,
          size: args?.size ?? 5,
          sort: args?.sort ?? "maximumBounty,desc",
        },
      }),
      transformResponse: (response: any) => unwrapPage<ProgramSummary>(response),
      providesTags: ["PublicPrograms"],
    }),

    getPublicProblems: builder.query<
      { items: ProblemCard[]; total: number },
      { sort?: string; size?: number } | void
    >({
      async queryFn(args, _api, _extraOptions, baseQuery) {
        const size = args?.size ?? 4;
        const sort = args?.sort ?? "TRENDING";

        const primaryResult = await baseQuery({
          url: "/problems",
          params: { sort, size },
        });

        if (!primaryResult.error) {
          return { data: unwrapPage<ProblemCard>(primaryResult.data) };
        }

        // Defensive fallback: if sort=TRENDING fails (e.g. 500 on backend), query without sort
        const fallbackResult = await baseQuery({
          url: "/problems",
          params: { size },
        });

        if (fallbackResult.error) {
          return { error: fallbackResult.error };
        }

        return { data: unwrapPage<ProblemCard>(fallbackResult.data) };
      },
      providesTags: ["PublicProblems"],
    }),

    getPublicShowcases: builder.query<
      { items: ShowcaseCard[]; total: number },
      { sort?: string; pageSize?: number } | void
    >({
      async queryFn(args, _api, _extraOptions, baseQuery) {
        const pageSize = args?.pageSize ?? 4;
        const sort = args?.sort ?? "TOP";

        const primaryResult = await baseQuery({
          url: "/showcases",
          params: { sort, pageSize },
        });

        if (!primaryResult.error) {
          return { data: unwrapPage<ShowcaseCard>(primaryResult.data) };
        }

        // Defensive fallback: if sort=TOP returns 500 on backend, query without sort
        const fallbackResult = await baseQuery({
          url: "/showcases",
          params: { pageSize },
        });

        if (fallbackResult.error) {
          return { error: fallbackResult.error };
        }

        return { data: unwrapPage<ShowcaseCard>(fallbackResult.data) };
      },
      providesTags: ["PublicShowcases"],
    }),

    getPublicLeaderboard: builder.query<
      { items: LeaderboardRow[]; total: number },
      { period?: string; size?: number } | void
    >({
      query: (args) => ({
        url: "/reputation/leaderboard",
        params: {
          period: args?.period ?? "ALL_TIME",
          size: args?.size ?? 5,
        },
      }),
      transformResponse: (response: any) => unwrapPage<LeaderboardRow>(response),
      providesTags: ["PublicLeaderboard"],
    }),
  }),
});

export const {
  useGetPublicStatsQuery,
  useGetPublicProgramsQuery,
  useGetPublicProblemsQuery,
  useGetPublicShowcasesQuery,
  useGetPublicLeaderboardQuery,
} = publicApi;
