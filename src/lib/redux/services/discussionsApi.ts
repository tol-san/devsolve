import { baseApi } from "./baseApi";
import {
  DiscussionPost,
  DiscussionSort,
  TopicCount,
} from "@/lib/types/dicussion/types";
import { authorNameOf } from "@/lib/discussions/format";
import type {
  ShowcaseEngagement,
  ShowcaseViewer,
} from "./showcasesApi";

export interface DiscussionsFilterParams {
  category?: "All" | "Problems" | "Showcase";
  topic?: string | null;
  problemCategoryId?: string;
  showcaseCategoryId?: string;
  tag?: string | null;
  searchQuery?: string;
  sort?: DiscussionSort;
  page?: number;
  limit?: number;
}

export interface DiscussionsResponse {
  data: DiscussionPost[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DiscussionStats {
  problems: number;
  showcases: number;
}

interface CategorySummary {
  id: string;
  name: string;
}

interface ProblemApiResponse {
  id: string;
  author?: { id?: string; fullName?: string; avatarUrl?: string };
  category?: CategorySummary;
  title: string;
  description?: string;
  viewCount?: number;
  solutionCount?: number;
  commentCount?: number;
  voteScore?: number;
  isBookmarkedByViewer?: boolean;
  viewerVote?: string | null;
  status?: "PUBLISHED" | "RESOLVED" | "CLOSED";
  tags?: { name: string }[];
  publishedAt?: string;
  createdAt?: string;
}

interface PageProblemApiResponse {
  content: ProblemApiResponse[];
  totalElements: number;
  totalPages?: number;
}

interface ShowcaseApiResponse {
  id: string;
  authorId?: string;
  authorName?: string;
  author?: {
    id?: string;
    fullName?: string;
    displayName?: string;
    avatarUrl?: string;
    reputation?: number;
  };
  categoryName?: string;
  title: string;
  overview?: string;
  coverImageUrl?: string;
  viewCount?: number;
  commentCount?: number;
  engagement?: ShowcaseEngagement;
  viewer?: ShowcaseViewer;
  hasUnpublishedRevision?: boolean;
  tags?: { name?: string }[];
  createdAt?: string;
}

interface PageShowcaseApiResponse {
  content: ShowcaseApiResponse[];
  totalElements: number;
  totalPages?: number;
}

interface VoteSummaryApiResponse {
  score: number;
  currentUserVote: number;
}

interface ActiveCategoryApiResponse {
  id: string;
  name: string;
  scope: "PROBLEM" | "SHOWCASE";
}

const LIST_PAGE_SIZE = 100;

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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toProblemPost(
  raw: ProblemApiResponse,
): DiscussionPost {
  const timestamp = raw.publishedAt || raw.createdAt;
  const rawAny = raw as unknown as Record<string, unknown>;
  const avatarUrl =
    raw.author?.avatarUrl ||
    (typeof rawAny.authorAvatarUrl === "string" ? rawAny.authorAvatarUrl : "") ||
    (typeof rawAny.avatarUrl === "string" ? rawAny.avatarUrl : "") ||
    "";
  return {
    id: raw.id,
    title: raw.title,
    category: "Problems",
    topic: raw.category?.name ?? "General",
    description: raw.description ?? "",
    tags: (raw.tags ?? []).map((t) => t.name),
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
    isBookmarked: raw.isBookmarkedByViewer ?? false,
    isUpvoted: raw.viewerVote === "UP" || raw.viewerVote === "UPVOTE",
  };
}

function toShowcasePost(
  raw: ShowcaseApiResponse,
): DiscussionPost {
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

  const engagement = raw.engagement;
  const viewer = raw.viewer;
  const votes = engagement?.voteScore ?? 0;
  const isBookmarked = Boolean(viewer?.bookmarked);
  const isUpvoted = viewer?.vote === "UP";

  return {
    id: raw.id,
    title: raw.title,
    category: "Showcase",
    topic: raw.categoryName ?? "General",
    description: raw.overview ?? "",
    tags: (raw.tags ?? []).flatMap((tag) => tag.name ? [tag.name] : []),
    votes,
    answersCount: raw.commentCount ?? 0,
    viewsCount: raw.viewCount ?? 0,
    thumbnailUrl: raw.coverImageUrl,
    author: {
      id: authorId,
      name: authorName,
      avatarUrl,
      reputation: raw.author?.reputation ?? 0,
    },
    createdAt: toRelativeDate(raw.createdAt),
    sortTimestamp: raw.createdAt,
    isBookmarked,
    isUpvoted,
    engagement,
    viewer,
    hasUnpublishedRevision: raw.hasUnpublishedRevision,
  };
}

function createdAtTime(post: DiscussionPost): number {
  const parsed = Date.parse(post.sortTimestamp ?? post.createdAt);
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function newestFirst(a: DiscussionPost, b: DiscussionPost): number {
  return createdAtTime(b) - createdAtTime(a) || a.id.localeCompare(b.id);
}

function sortDiscussions<T extends DiscussionPost>(
  list: T[],
  sort: DiscussionSort,
): T[] {
  const sorted = [...list];
  switch (sort) {
    case "oldest":
      return sorted.sort(
        (a, b) => createdAtTime(a) - createdAtTime(b) || a.id.localeCompare(b.id),
      );
    case "trending":
    case "top":
      return sorted.sort((a, b) => b.votes - a.votes || newestFirst(a, b));
    case "discussed":
      return sorted.sort(
        (a, b) => b.answersCount - a.answersCount || newestFirst(a, b),
      );
    case "viewed":
      return sorted.sort(
        (a, b) => b.viewsCount - a.viewsCount || newestFirst(a, b),
      );
    case "newest":
    default:
      return sorted.sort(newestFirst);
  }
}

function apiUrl(path: string, params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const encoded = query.toString();
  return encoded ? `${path}?${encoded}` : path;
}

export const discussionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscussions: builder.query<DiscussionsResponse, DiscussionsFilterParams | void>({
      async queryFn(params, _api, _extraOptions, fetchWithBQ) {
        const category = params?.category ?? "All";
        const topicSelected = Boolean(params?.topic);
        const wantProblems =
          (category === "All" || category === "Problems") &&
          (!topicSelected || Boolean(params?.problemCategoryId));
        const wantShowcases =
          (category === "All" || category === "Showcase") &&
          (!topicSelected || Boolean(params?.showcaseCategoryId));
        const limit = Math.min(LIST_PAGE_SIZE, Math.max(1, params?.limit ?? 10));
        const requestedPage = Math.max(1, params?.page ?? 1);
        const sort = params?.sort ?? "newest";
        const fetchCompleteResult = sort !== "newest";
        const prefixSize = requestedPage * limit;
        const apiPageSize = fetchCompleteResult
          ? LIST_PAGE_SIZE
          : Math.min(LIST_PAGE_SIZE, prefixSize);

        const problemUrl = (page: number) =>
          apiUrl("/problems", {
            categoryId: params?.problemCategoryId,
            tag: params?.tag ?? undefined,
            q: params?.searchQuery || undefined,
            page,
            size: apiPageSize,
          });

        const showcaseSort =
          sort === "trending"
            ? "TRENDING"
            : sort === "top"
              ? "TOP"
              : sort === "oldest"
                ? "OLDEST"
                : sort === "viewed"
                  ? "MOST_VIEWED"
                  : "NEWEST";

        const showcaseUrl = (page: number) =>
          apiUrl("/showcases", {
            categoryId: params?.showcaseCategoryId,
            tag: params?.tag ?? undefined,
            query: params?.searchQuery || undefined,
            sort: showcaseSort,
            pageNumber: page,
            pageSize: apiPageSize,
          });

        const [firstProblemsResult, firstShowcasesResult] = await Promise.all([
          wantProblems ? fetchWithBQ(problemUrl(0)) : Promise.resolve(null),
          wantShowcases ? fetchWithBQ(showcaseUrl(0)) : Promise.resolve(null),
        ]);

        if (firstProblemsResult?.error) return { error: firstProblemsResult.error };
        if (firstShowcasesResult?.error) return { error: firstShowcasesResult.error };

        const firstProblemPage = firstProblemsResult
          ? (firstProblemsResult.data as PageProblemApiResponse)
          : null;
        const firstShowcasePage = firstShowcasesResult
          ? (firstShowcasesResult.data as PageShowcaseApiResponse)
          : null;
        const problemPages: PageProblemApiResponse[] = firstProblemPage
          ? [firstProblemPage]
          : [];
        const showcasePages: PageShowcaseApiResponse[] = firstShowcasePage
          ? [firstShowcasePage]
          : [];

        const neededPageCount = (totalElements: number, reportedPages?: number) => {
          const available = reportedPages ?? Math.ceil(totalElements / apiPageSize);
          const needed = fetchCompleteResult
            ? available
            : Math.ceil(Math.min(prefixSize, totalElements) / apiPageSize);
          return Math.max(1, Math.min(available, needed));
        };

        const problemPageCount = firstProblemPage
          ? neededPageCount(firstProblemPage.totalElements, firstProblemPage.totalPages)
          : 0;
        const showcasePageCount = firstShowcasePage
          ? neededPageCount(firstShowcasePage.totalElements, firstShowcasePage.totalPages)
          : 0;
        const remainingProblems = Array.from(
          { length: Math.max(0, problemPageCount - 1) },
          (_, index) => fetchWithBQ(problemUrl(index + 1)),
        );
        const remainingShowcases = Array.from(
          { length: Math.max(0, showcasePageCount - 1) },
          (_, index) => fetchWithBQ(showcaseUrl(index + 1)),
        );
        const [problemResults, showcaseResults] = await Promise.all([
          Promise.all(remainingProblems),
          Promise.all(remainingShowcases),
        ]);

        const failedProblemPage = problemResults.find((result) => result.error);
        if (failedProblemPage?.error) return { error: failedProblemPage.error };
        const failedShowcasePage = showcaseResults.find((result) => result.error);
        if (failedShowcasePage?.error) return { error: failedShowcasePage.error };

        problemPages.push(
          ...problemResults.map((result) => result.data as PageProblemApiResponse),
        );
        showcasePages.push(
          ...showcaseResults.map((result) => result.data as PageShowcaseApiResponse),
        );

        const problems = problemPages.flatMap((result) => result.content);
        const showcases = showcasePages.flatMap((result) => result.content);
        let results: DiscussionPost[] = [
          ...problems.map(toProblemPost),
          ...showcases.map(toShowcasePost),
        ];

        results = sortDiscussions(results, sort);

        const totalCount =
          (firstProblemPage?.totalElements ?? 0) +
          (firstShowcasePage?.totalElements ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalCount / limit));
        const page = Math.min(requestedPage, totalPages);
        const start = (page - 1) * limit;

        return {
          data: {
            data: results.slice(start, start + limit),
            totalCount,
            page,
            limit,
            totalPages,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Discussion" as const,
                id,
              })),
              { type: "Discussion" as const, id: "LIST" },
            ]
          : [{ type: "Discussion" as const, id: "LIST" }],
    }),

    getDiscussionById: builder.query<DiscussionPost | null, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBQ) {
        const [problemResult, statusResult, voteResult] = await Promise.all([
          fetchWithBQ(`/problems/${id}`),
          fetchWithBQ(`/bookmarks/PROBLEM/${id}/status`),
          fetchWithBQ(`/votes/PROBLEM/${id}/summary`),
        ]);

        if (!problemResult.error) {
          const isBookmarked = !statusResult.error && (statusResult.data as { bookmarked: boolean }).bookmarked;
          const isUpvoted = !voteResult.error && (voteResult.data as VoteSummaryApiResponse).currentUserVote > 0;
          const post = toProblemPost(problemResult.data as ProblemApiResponse);
          post.isBookmarked = isBookmarked;
          post.isUpvoted = isUpvoted;
          if (!voteResult.error) post.votes = (voteResult.data as VoteSummaryApiResponse).score;
          return { data: post };
        }

        const [showcaseResult, showcaseStatusResult, showcaseVoteResult] = await Promise.all([
          fetchWithBQ(`/showcases/${id}`),
          fetchWithBQ(`/bookmarks/SHOWCASE/${id}/status`),
          fetchWithBQ(`/votes/SHOWCASE/${id}/summary`),
        ]);
        if (showcaseResult.error) return { data: null };

        const post = toShowcasePost(showcaseResult.data as ShowcaseApiResponse);
        if (!showcaseStatusResult.error) {
          post.isBookmarked = (showcaseStatusResult.data as { bookmarked: boolean }).bookmarked;
        }
        if (!showcaseVoteResult.error) {
          const v = showcaseVoteResult.data as VoteSummaryApiResponse;
          post.isUpvoted = v.currentUserVote > 0;
          post.votes = v.score;
        }
        return { data: post };
      },
      providesTags: (_result, _error, id) => [{ type: "Discussion" as const, id }],
    }),

    getDiscussionTopics: builder.query<TopicCount[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const [problemCategoriesResult, showcaseCategoriesResult] = await Promise.all([
          fetchWithBQ("/categories/active?scope=PROBLEM"),
          fetchWithBQ("/categories/active?scope=SHOWCASE"),
        ]);
        if (problemCategoriesResult.error) {
          return { error: problemCategoriesResult.error };
        }
        if (showcaseCategoriesResult.error) {
          return { error: showcaseCategoriesResult.error };
        }

        const problemCategories =
          problemCategoriesResult.data as ActiveCategoryApiResponse[];
        const showcaseCategories =
          showcaseCategoriesResult.data as ActiveCategoryApiResponse[];
        const [problemCounts, showcaseCounts] = await Promise.all([
          Promise.all(
            problemCategories.map((category) =>
              fetchWithBQ(
                apiUrl("/problems", { categoryId: category.id, page: 0, size: 1 }),
              ),
            ),
          ),
          Promise.all(
            showcaseCategories.map((category) =>
              fetchWithBQ(
                apiUrl("/showcases", {
                  categoryId: category.id,
                  pageNumber: 0,
                  pageSize: 1,
                }),
              ),
            ),
          ),
        ]);

        const topicsByName = new Map<string, TopicCount>();
        problemCategories.forEach((category, index) => {
          const result = problemCounts[index];
          const count = result.error
            ? 0
            : (result.data as PageProblemApiResponse).totalElements;
          topicsByName.set(category.name, {
            name: category.name,
            count,
            problemCategoryId: category.id,
          });
        });
        showcaseCategories.forEach((category, index) => {
          const result = showcaseCounts[index];
          const count = result.error
            ? 0
            : (result.data as PageShowcaseApiResponse).totalElements;
          const existing = topicsByName.get(category.name);
          topicsByName.set(category.name, {
            name: category.name,
            count: (existing?.count ?? 0) + count,
            problemCategoryId: existing?.problemCategoryId,
            showcaseCategoryId: category.id,
          });
        });

        const topics = Array.from(topicsByName.values()).sort(
          (a, b) => b.count - a.count || a.name.localeCompare(b.name),
        );
        return { data: topics };
      },
      providesTags: [{ type: "Discussion" as const, id: "TOPICS" }],
    }),

    getTrendingTags: builder.query<string[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ(`/problems?size=${LIST_PAGE_SIZE}`);
        if (result.error) return { error: result.error };

        const counts = new Map<string, number>();
        (result.data as PageProblemApiResponse).content.forEach((p) => {
          (p.tags ?? []).forEach((t) => counts.set(t.name, (counts.get(t.name) ?? 0) + 1));
        });

        const tags = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([name]) => name);
        return { data: tags };
      },
      providesTags: [{ type: "Discussion" as const, id: "TAGS" }],
    }),

    getDiscussionStats: builder.query<DiscussionStats, void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const [problemsResult, showcasesResult] = await Promise.all([
          fetchWithBQ(`/problems?size=1`),
          fetchWithBQ(`/showcases?pageSize=1`),
        ]);
        return {
          data: {
            problems: problemsResult.error ? 0 : (problemsResult.data as PageProblemApiResponse).totalElements,
            showcases: showcasesResult.error ? 0 : (showcasesResult.data as PageShowcaseApiResponse).totalElements,
          },
        };
      },
      providesTags: [{ type: "Discussion" as const, id: "STATS" }],
    }),

    getDiscussionCategories: builder.query<{ id: string; name: string }[], "PROBLEM" | "SHOWCASE">({
      query: (scope) => `/categories/active?scope=${scope}`,
      providesTags: [{ type: "Discussion" as const, id: "CATEGORIES" }],
    }),

    voteDiscussion: builder.mutation<
      { id: string; votes: number; isUpvoted: boolean },
      { id: string; type: "PROBLEM" | "SHOWCASE"; isUpvoted: boolean }
    >({
      async queryFn({ id, type, isUpvoted }, _api, _extraOptions, fetchWithBQ) {
        const result = isUpvoted
          ? await fetchWithBQ({ url: `/votes/${type}/${id}`, method: "PUT", body: { value: 1 } })
          : await fetchWithBQ({ url: `/votes/${type}/${id}`, method: "DELETE" });
        if (result.error) return { error: result.error };

        const summary = await fetchWithBQ(`/votes/${type}/${id}/summary`);
        const votes = summary.error ? 0 : (summary.data as VoteSummaryApiResponse).score;
        return { data: { id, votes, isUpvoted } };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Discussion" as const, id }],
    }),

    createDiscussion: builder.mutation<
      DiscussionPost,
      {
        title: string;
        category: "Problems" | "Showcase";
        categoryId?: string;
        description: string;
        tags: string[];
        techStack?: string[];
        codeSnippet?: string;
        thumbnailUrl?: string;
      }
    >({
      async queryFn(newPost, _api, _extraOptions, fetchWithBQ) {
        if (newPost.category === "Problems") {
          const description = newPost.codeSnippet
            ? `${newPost.description}\n\n\`\`\`\n${newPost.codeSnippet}\n\`\`\``
            : newPost.description;
          const result = await fetchWithBQ({
            url: "/problems",
            method: "POST",
            body: {
              categoryId: newPost.categoryId || undefined,
              title: newPost.title,
              description,
              tags: newPost.tags.map((t) => t.replace(/^#/, "")),
            },
          });
          if (result.error) return { error: result.error };
          return { data: toProblemPost(result.data as ProblemApiResponse) };
        }

        const result = await fetchWithBQ({
          url: "/showcases",
          method: "POST",
          body: {
            categoryId: newPost.categoryId || undefined,
            title: newPost.title,
            overview: newPost.techStack?.length
              ? `${newPost.description}\n\n**Tech stack:** ${newPost.techStack.join(", ")}`
              : newPost.description,
            coverImageUrl: newPost.thumbnailUrl,
          },
        });
        if (result.error) return { error: result.error };
        return { data: toShowcasePost(result.data as ShowcaseApiResponse) };
      },
      invalidatesTags: [{ type: "Discussion" as const, id: "LIST" }],
    }),
  }),
});

export const {
  useGetDiscussionsQuery,
  useGetDiscussionByIdQuery,
  useGetDiscussionTopicsQuery,
  useGetTrendingTagsQuery,
  useGetDiscussionStatsQuery,
  useGetDiscussionCategoriesQuery,
  useVoteDiscussionMutation,
  useCreateDiscussionMutation,
} = discussionsApi;
