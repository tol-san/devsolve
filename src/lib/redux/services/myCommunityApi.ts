import { baseApi } from "./baseApi";
import { excerptOf } from "@/lib/markdown-excerpt";

/**
 * Everything the signed-in author has posted, for the dashboard's My Community
 * page: `/problems/mine`, `/solutions/mine` and `/showcases/mine`.
 *
 * Deliberately the "mine" endpoints rather than the public portfolio ones — a
 * showcase awaiting review, a rejected one, and a problem still in draft are
 * invisible on a profile but are exactly what an author comes here to find.
 */

export type MyPostKind = "Problem" | "Solution" | "Showcase";

export interface MyPost {
  id: string;
  kind: MyPostKind;
  title: string;
  excerpt: string;
  /** Where the post can be read, when it is readable at all. */
  href?: string;
  /** Where it can be edited, for the kinds this app can edit yet. */
  editHref?: string;
  createdAt: string;
  views?: number;
  coverImageUrl?: string;
  /** The workflow state, in the author's words. */
  state: {
    label: string;
    tone: "live" | "pending" | "blocked" | "draft";
  };
  /** What a reviewer asked for, when something was sent back. */
  note?: string;
  /** A showcase with an edit queued behind the live version. */
  hasPendingEdit?: boolean;
  /** A draft problem, which the author still has to send to review. */
  canSubmit?: boolean;
  /** For a solution, the problem it answers — needed to delete it cleanly. */
  problemId?: string;
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
  /**
   * Whether this problem may still be revised — but do not gate the edit link
   * on it. `/problems/mine` answers `false` for problems that `/problems/{id}`
   * answers `true` for, so trusting it here hides the button on posts the
   * author can in fact edit. See `editHref` below.
   */
  canEdit?: boolean;
  publishedAt?: string;
  createdAt?: string;
}

/**
 * `SolutionResponse`, trimmed to what a row here shows. Acceptance and review
 * are two separate things upstream: `isAccepted` is the asker picking this
 * answer, `moderation.status` is a moderator letting it be seen at all.
 */
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
  createdAt?: string;
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

/** The opening sentence, for content that has no title of its own. */
function firstLine(text: string, max = 90): string {
  const opening = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return opening.length > max ? `${opening.slice(0, max).trimEnd()}…` : opening;
}

export const myCommunityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPosts: builder.query<MyPost[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const [problemsResult, solutionsResult, showcasesResult] =
          await Promise.all([
            fetchWithBQ(`/problems/mine?size=${PAGE_SIZE}`),
            fetchWithBQ(`/solutions/mine?pageSize=${PAGE_SIZE}`),
            fetchWithBQ(`/showcases/mine?pageSize=${PAGE_SIZE}`),
          ]);

        /* One list failing leaves the others usable — the three are separate
           upstream, and an author with no solutions should still see their
           showcases if that endpoint happens to be down. */
        if (
          problemsResult.error &&
          solutionsResult.error &&
          showcasesResult.error
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
            /* A draft has no public page to open. */
            href:
              problem.status === "DRAFT" || problem.status === "PENDING_APPROVAL"
                ? undefined
                : `/community/${problem.id}`,
            createdAt:
              problem.publishedAt ||
              problem.createdAt ||
              new Date().toISOString(),
            /* Always linked, deliberately. Every problem in this list belongs
               to the caller, and the edit screen re-reads `canEdit` off the
               detail response before it shows a form — which is the copy of
               the flag that is right. Gating here on the list's copy meant a
               problem the author could edit showed a dead, greyed-out button
               with no reason given. */
            editHref: `/community/${problem.id}/edit`,
            /* Only a draft has somewhere to be submitted to. */
            canSubmit: problem.status === "DRAFT",
            views: problem.viewCount ?? 0,
            state: PROBLEM_STATE[problem.status],
          }),
        );

        const solutions = contentOf<MySolution>(solutionsResult).map(
          (solution): MyPost => {
            const body = excerptOf(solution.bodyMarkdown ?? "", 200);
            /* The summary is written to be the title. Falling back to the
               first line of the body covers answers posted before it existed. */
            const review = solution.moderation?.status;
            return {
              id: solution.id,
              kind: "Solution",
              title: solution.summary?.trim() || firstLine(body) || "Solution",
              excerpt: body,
              href: solution.problemId
                ? `/community/${solution.problemId}`
                : undefined,
              /* The edit route is nested under the problem, so an answer that
                 does not name one cannot be edited from here. */
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

        return {
          data: [...problems, ...solutions, ...showcases].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        };
      },
      /* One tag per source list, so deleting a post of any kind refreshes this
         page without the other two being refetched for nothing. */
      providesTags: [
        { type: "Showcase", id: "MINE" },
        { type: "Problem", id: "MINE" },
        { type: "Solution", id: "MINE" },
        { type: "Discussion", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const { useGetMyPostsQuery } = myCommunityApi;
