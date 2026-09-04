import { baseApi } from "./baseApi";
import {
  BookmarkItem,
  BookmarkFilterParams,
  BookmarksResponse,
  BookmarkableType,
} from "@/lib/types/bookmarks/types";

export * from "@/lib/types/bookmarks/types";

interface BookmarkApiResponse {
  id: string;
  bookmarkableType: BookmarkableType;
  bookmarkableId: string;
  available: boolean;
  targetTitle: string;
  targetPreview: string;
  targetImageUrl?: string;
  createdAt: string;
}

interface PageBookmarkApiResponse {
  content: BookmarkApiResponse[];
  totalElements: number;
}

function toCategory(type: BookmarkableType): BookmarkItem["category"] {
  switch (type) {
    case "PROGRAM":
      return "Program";
    case "SOLUTION":
      return "Solutions";
    case "PROBLEM":
      return "Problems";
    case "SHOWCASE":
      return "Showcases";
  }
}

function toDetailUrl(
  type: BookmarkableType,
  targetId: string,
  solutionProblemId?: string,
): string {
  switch (type) {
    case "PROGRAM":
      return `/dashboard/programs/${targetId}`;
    case "PROBLEM":
      return `/community/${targetId}`;
    case "SHOWCASE":
      return `/showcases/${targetId}`;
    case "SOLUTION":
      return solutionProblemId
        ? `/community/${solutionProblemId}#solution-${targetId}`
        : "/community";
  }
}

function toSavedAt(iso: string): string {
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

function toBookmarkItem(
  raw: BookmarkApiResponse,
  solutionProblemId?: string,
): BookmarkItem {
  return {
    id: raw.id,
    bookmarkableId: raw.bookmarkableId,
    bookmarkableType: raw.bookmarkableType,
    category: toCategory(raw.bookmarkableType),
    title: raw.targetTitle,
    description: raw.targetPreview,
    savedAt: toSavedAt(raw.createdAt),
    tags: [],
    url: toDetailUrl(
      raw.bookmarkableType,
      raw.bookmarkableId,
      solutionProblemId,
    ),
    logoUrl: raw.targetImageUrl,
  };
}

function bookmarkableDiscussionTags(type: BookmarkableType, targetId: string) {
  return type === "PROBLEM" || type === "SHOWCASE"
    ? [{ type: "Discussion" as const, id: targetId }]
    : [];
}

export const bookmarksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookmarks: builder.query<BookmarksResponse, BookmarkFilterParams | void>({
      async queryFn(params, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ(`/bookmarks/mine?pageSize=100`);
        if (result.error) return { error: result.error };

        const page = result.data as PageBookmarkApiResponse;
        const solutionParents = new Map<string, string>();

        await Promise.all(
          page.content.map(async (bookmark) => {
            if (bookmark.bookmarkableType !== "SOLUTION") return;

            const detail = await fetchWithBQ(
              `/solutions/${bookmark.bookmarkableId}`,
            );
            if (detail.error) return;

            const problemId = (detail.data as { problemId?: string })
              .problemId;
            if (problemId) {
              solutionParents.set(bookmark.bookmarkableId, problemId);
            }
          }),
        );

        let items = page.content.map((bookmark) =>
          toBookmarkItem(
            bookmark,
            solutionParents.get(bookmark.bookmarkableId),
          ),
        );

        const counts = {
          all: items.length,
          Program: items.filter((b) => b.category === "Program").length,
          Problems: items.filter((b) => b.category === "Problems").length,
          Solutions: items.filter((b) => b.category === "Solutions").length,
          Showcases: items.filter((b) => b.category === "Showcases").length,
        };

        if (params?.category && params.category !== "all") {
          items = items.filter((b) => b.category === params.category);
        }

        if (params?.search && params.search.trim() !== "") {
          const q = params.search.toLowerCase().trim();
          items = items.filter(
            (b) => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
          );
        }

        if (params?.sortBy === "title") {
          items = [...items].sort((a, b) => a.title.localeCompare(b.title));
        } else if (params?.sortBy === "oldest") {
          items = [...items].reverse();
        }

        return { data: { data: items, counts, totalCount: page.totalElements } };
      },
      providesTags: ["Bookmark"],
    }),

    getBookmarkStatus: builder.query<boolean, { type: BookmarkableType; targetId: string }>({
      async queryFn({ type, targetId }, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ(`/bookmarks/${type}/${targetId}/status`);
        if (result.error) return { data: false };
        return { data: (result.data as { bookmarked: boolean }).bookmarked };
      },
      providesTags: (_result, _error, { type, targetId }) => [
        { type: "Bookmark", id: `${type}:${targetId}` },
      ],
    }),

    addBookmark: builder.mutation<void, { type: BookmarkableType; targetId: string }>({
      query: ({ type, targetId }) => ({
        url: `/bookmarks/${type}/${targetId}`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { type, targetId }) => [
        "Bookmark",
        { type: "Bookmark", id: `${type}:${targetId}` },
        ...bookmarkableDiscussionTags(type, targetId),
      ],
    }),

    removeBookmark: builder.mutation<void, { type: BookmarkableType; targetId: string }>({
      query: ({ type, targetId }) => ({
        url: `/bookmarks/${type}/${targetId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { type, targetId }) => [
        "Bookmark",
        { type: "Bookmark", id: `${type}:${targetId}` },
        ...bookmarkableDiscussionTags(type, targetId),
      ],
    }),
  }),
});

export const {
  useGetBookmarksQuery,
  useGetBookmarkStatusQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} = bookmarksApi;
