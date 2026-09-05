import { baseApi } from "./baseApi";
import { excerptOf } from "@/lib/markdown-excerpt";
import type {
  ShowcaseEngagement,
  ShowcaseViewer,
} from "./showcasesApi";

export type MyPostKind = "Problem" | "Solution" | "Showcase";

export interface MyPost {
  id: string;
  kind: MyPostKind;
  title: string;
  excerpt: string;
  href?: string;
  editHref?: string;
  createdAt: string;
  views?: number;
  votes?: number;
  bookmarks?: number;
  comments?: number;
  coverImageUrl?: string;
  state: {
    label: string;
    tone: "live" | "pending" | "blocked" | "draft";
  };
  note?: string;
  hasPendingEdit?: boolean;
  canSubmit?: boolean;
  problemId?: string;
  isDraft?: boolean;
}

interface Paged<T> {
  content?: T[];
  totalElements?: number;
}

interface MyProblem {
  id: string;
  title: string;
  description?: string;
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "PUBLISHED"
    | "RESOLVED"
    | "CLOSED"
    | "REJECTED";
  viewCount?: number;
  canEdit?: boolean;
  publishedAt?: string;
  createdAt?: string;
}

interface MySolution {
  id: string;
  problemId?: string;
  summary?: string;
  bodyMarkdown?: string;
  isAccepted?: boolean;
  moderation?: {
    status?: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
  };
  createdAt?: string;
}

interface MyShowcase {
  id: string;
  title: string;
  overview?: string;
  coverImageUrl?: string;
  reviewStatus?: "PENDING" | "APPROVED" | "REJECTED";
  hasUnpublishedRevision?: boolean;
  rejectionReason?: string;
  viewCount?: number;
  commentCount?: number;
  engagement?: ShowcaseEngagement;
  viewer?: ShowcaseViewer;
  createdAt?: string;
}

interface MyShowcaseDraft {
  id: string;
  title?: string;
  overview?: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MySolutionDraft {
  id: string;
  problemId?: string;
  summary?: string;
  bodyMarkdown?: string;
  createdAt?: string;
  updatedAt?: string;
}

const PAGE_SIZE = 50;

const PROBLEM_STATE: Record<MyProblem["status"], MyPost["state"]> = {
  DRAFT: { label: "Draft", tone: "draft" },
  PENDING_APPROVAL: { label: "Awaiting review", tone: "pending" },
  PUBLISHED: { label: "Published", tone: "live" },
  RESOLVED: { label: "Resolved", tone: "live" },
  CLOSED: { label: "Closed", tone: "draft" },
  REJECTED: { label: "Rejected", tone: "blocked" },
};

function firstLine(text: string, max = 90): string {
  const opening = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return opening.length > max ? `${opening.slice(0, max).trimEnd()}…` : opening;
}

export const myCommunityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPosts: builder.query<MyPost[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const [
          problemsResult,
          solutionsResult,
          showcasesResult,
          showcaseDraftsResult,
          solutionDraftsResult,
        ] = await Promise.all([
          fetchWithBQ(`/problems/mine?size=${PAGE_SIZE}`),
          fetchWithBQ(`/solutions/mine?pageSize=${PAGE_SIZE}`),
          fetchWithBQ(`/showcases/mine?pageSize=${PAGE_SIZE}`),
          fetchWithBQ(`/showcase-drafts?size=${PAGE_SIZE}`),
          fetchWithBQ(`/solution-drafts?size=${PAGE_SIZE}`),
        ]);

        if (
          problemsResult.error &&
          solutionsResult.error &&
          showcasesResult.error &&
          showcaseDraftsResult.error &&
          solutionDraftsResult.error
        ) {
          return { error: problemsResult.error };
        }

        const contentOf = <T,>(result: { data?: unknown; error?: unknown }) =>
          result.error ? [] : ((result.data as Paged<T> | undefined)?.content ?? []);

        const problems = contentOf<MyProblem>(problemsResult).map(
          (problem): MyPost => ({
            id: problem.id,
            kind: "Problem",
            title: problem.title,
            excerpt: excerptOf(problem.description ?? "", 200),
            href:
              problem.status === "DRAFT" || problem.status === "PENDING_APPROVAL"
                ? undefined
                : `/community/${problem.id}`,
            createdAt:
              problem.publishedAt ||
              problem.createdAt ||
              new Date().toISOString(),
            editHref: `/community/${problem.id}/edit`,
            canSubmit: problem.status === "DRAFT",
            isDraft: problem.status === "DRAFT",
            views: problem.viewCount ?? 0,
            state: PROBLEM_STATE[problem.status],
          }),
        );

        const solutions = contentOf<MySolution>(solutionsResult).map(
          (solution): MyPost => {
            const body = excerptOf(solution.bodyMarkdown ?? "", 200);
            const review = solution.moderation?.status;
            return {
              id: solution.id,
              kind: "Solution",
              title: solution.summary?.trim() || firstLine(body) || "Solution",
              excerpt: body,
              href: solution.problemId
                ? `/community/${solution.problemId}`
                : undefined,
              editHref: solution.problemId
                ? `/community/${solution.problemId}/solutions/${solution.id}/edit`
                : undefined,
              problemId: solution.problemId,
              createdAt: solution.createdAt || new Date().toISOString(),
              state: solution.isAccepted
                ? { label: "Accepted", tone: "live" }
                : review === "REJECTED"
                  ? { label: "Rejected", tone: "blocked" }
                  : { label: "Published", tone: "live" },
              note: solution.moderation?.rejectionReason,
            };
          },
        );

        const showcases = contentOf<MyShowcase>(showcasesResult).map(
          (showcase): MyPost => ({
            id: showcase.id,
            kind: "Showcase",
            title: showcase.title,
            excerpt: excerptOf(showcase.overview ?? "", 200),
            href:
              showcase.reviewStatus === "APPROVED"
                ? `/showcases/${showcase.id}`
                : undefined,
            editHref: `/dashboard/showcases/${showcase.id}/edit`,
            createdAt: showcase.createdAt || new Date().toISOString(),
            views: showcase.viewCount ?? 0,
            votes: showcase.engagement?.voteScore ?? 0,
            bookmarks: showcase.engagement?.bookmarkCount ?? 0,
            comments: showcase.commentCount ?? 0,
            coverImageUrl: showcase.coverImageUrl,
            state:
              showcase.reviewStatus === "APPROVED"
                ? { label: "Live", tone: "live" }
                : showcase.reviewStatus === "REJECTED"
                  ? { label: "Changes requested", tone: "blocked" }
                  : { label: "Awaiting review", tone: "pending" },
            note: showcase.rejectionReason,
            hasPendingEdit: showcase.hasUnpublishedRevision,
          }),
        );

        const showcaseDrafts = contentOf<MyShowcaseDraft>(showcaseDraftsResult).map(
          (draft): MyPost => ({
            id: draft.id,
            kind: "Showcase",
            title: draft.title?.trim() || "Untitled showcase draft",
            excerpt: excerptOf(draft.overview ?? "", 200),
            editHref: `/community/create/showcase?draftId=${draft.id}`,
            createdAt: draft.updatedAt || draft.createdAt || new Date().toISOString(),
            coverImageUrl: draft.coverImageUrl,
            state: { label: "Draft", tone: "draft" },
            isDraft: true,
          }),
        );

        const solutionDrafts = contentOf<MySolutionDraft>(solutionDraftsResult).map(
          (draft): MyPost => {
            const body = excerptOf(draft.bodyMarkdown ?? "", 200);
            return {
              id: draft.id,
              kind: "Solution",
              title: draft.summary?.trim() || firstLine(body) || "Untitled solution draft",
              excerpt: body,
              editHref: draft.problemId
                ? `/community/${draft.problemId}/solutions/create?draftId=${draft.id}`
                : undefined,
              problemId: draft.problemId,
              createdAt: draft.updatedAt || draft.createdAt || new Date().toISOString(),
              state: { label: "Draft", tone: "draft" },
              isDraft: true,
            };
          },
        );

        return {
          data: [
            ...problems,
            ...solutions,
            ...showcases,
            ...showcaseDrafts,
            ...solutionDrafts,
          ].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        };
      },
      providesTags: [
        { type: "Showcase", id: "MINE" },
        { type: "Problem", id: "MINE" },
        { type: "Solution", id: "MINE" },
        { type: "Discussion", id: "LIST" },
        { type: "ShowcaseDraft", id: "MINE" },
        { type: "SolutionDraft", id: "MINE" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const { useGetMyPostsQuery } = myCommunityApi;
