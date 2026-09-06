import { baseApi } from "../baseApi";
import type {
  AdminFlaggableType,
  BulkActionResult,
  FlagReporter,
  FlagSort,
  FlagSource,
  FlagStatus,
  FlagSummary,
  FlagTarget,
  GroupedFlagItem,
} from "@/lib/validations/moderation";
import type { FlagReason } from "@/lib/validations/engagement";

export type {
  BulkActionResult,
  FlagReporter,
  FlagSort,
  FlagSummary,
  FlagTarget,
  GroupedFlagItem,
};

/** The report queue row, exactly as the API returns it — no lossy remapping. */
export interface FlagResponse {
  id: string;
  source: FlagSource;
  reporter: FlagReporter | null;
  flaggableType: AdminFlaggableType;
  flaggableId: string;
  reason: FlagReason;
  description: string | null;
  status: FlagStatus;
  target: FlagTarget;
  reportCountOnTarget: number | null;
  pendingReportCountOnTarget: number | null;
  allReasons: FlagReason[] | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface AdminFlagQuery {
  status?: FlagStatus;
  flaggableType?: AdminFlaggableType;
  reason?: FlagReason;
  search?: string;
  sort?: FlagSort;
  pageNumber?: number;
  pageSize?: number;
}

export interface FlagPage {
  items: FlagResponse[];
  total: number;
}

export interface GroupedFlagPage {
  items: GroupedFlagItem[];
  total: number;
}

/**
 * Admin list endpoints return a Spring `Page`, but the envelope has moved
 * between versions (`totalElements` at the root vs nested under `page`).
 * Unwrap defensively rather than trusting one shape.
 */
export function unwrapPage<T>(json: unknown): { items: T[]; total: number } {
  const source = (json ?? {}) as {
    content?: T[];
    totalElements?: number;
    page?: { totalElements?: number };
  };
  const items: T[] = Array.isArray(json)
    ? (json as T[])
    : (source.content ?? []);
  const total: number =
    source.totalElements ?? source.page?.totalElements ?? items.length;
  return { items, total };
}

function flagQueryString(
  input: AdminFlagQuery | void,
  defaultSort?: FlagSort,
): string {
  const {
    status,
    flaggableType,
    reason,
    search,
    sort = defaultSort,
    pageNumber = 0,
    pageSize = 20,
  } = input ?? {};

  // This queue pages with pageNumber/pageSize, NOT Spring's page/size.
  const params = new URLSearchParams({
    pageNumber: String(Math.max(0, pageNumber)),
    pageSize: String(Math.min(Math.max(1, pageSize), 100)),
  });
  if (status) params.set("status", status);
  if (flaggableType) params.set("flaggableType", flaggableType);
  if (reason) params.set("reason", reason);
  if (search && search.trim()) params.set("search", search.trim().slice(0, 200));
  if (sort) params.set("sort", sort);
  return params.toString();
}

export const adminFlagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminFlags: builder.query<FlagPage, AdminFlagQuery | void>({
      query: (input) => `/admin/flags?${flagQueryString(input, "NEWEST")}`,
      transformResponse: (response: unknown) =>
        unwrapPage<FlagResponse>(response),
      providesTags: (result) => [
        { type: "ContentReport" as const, id: "LIST" },
        ...(result?.items ?? []).map((flag) => ({
          type: "ContentReport" as const,
          id: flag.id,
        })),
      ],
    }),

    getGroupedAdminFlags: builder.query<GroupedFlagPage, AdminFlagQuery | void>({
      query: (input) =>
        `/admin/flags/grouped?${flagQueryString(input, "MOST_REPORTED")}`,
      transformResponse: (response: unknown) =>
        unwrapPage<GroupedFlagItem>(response),
      providesTags: (result) => [
        { type: "ContentReport" as const, id: "GROUPED_LIST" },
        ...(result?.items ?? []).map((item) => ({
          type: "ContentReport" as const,
          id: `${item.flaggableType}:${item.flaggableId}`,
        })),
      ],
    }),

    getAdminFlagsSummary: builder.query<FlagSummary, void>({
      query: () => `/admin/flags/summary`,
      providesTags: [{ type: "ContentReport" as const, id: "SUMMARY" }],
    }),

    getAdminFlag: builder.query<FlagResponse, string>({
      query: (id) => `/admin/flags/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ContentReport", id }],
    }),

    dismissFlag: builder.mutation<FlagResponse, string>({
      query: (id) => ({ url: `/admin/flags/${id}/dismiss`, method: "PATCH" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ContentReport", id },
        { type: "ContentReport", id: "LIST" },
        { type: "ContentReport", id: "GROUPED_LIST" },
        { type: "ContentReport", id: "SUMMARY" },
        "ModerationAction",
      ],
    }),

    resolveFlag: builder.mutation<
      FlagResponse,
      { id: string; resolutionNote: string; removeContent: boolean }
    >({
      query: ({ id, resolutionNote, removeContent }) => ({
        url: `/admin/flags/${id}/resolve`,
        method: "PATCH",
        body: { resolutionNote, removeContent },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ContentReport", id },
        { type: "ContentReport", id: "LIST" },
        { type: "ContentReport", id: "GROUPED_LIST" },
        { type: "ContentReport", id: "SUMMARY" },
        "ModerationAction",
        "Problem",
        "Showcase",
        "Solution",
        "Comment",
        "Program",
      ],
    }),

    dismissFlagTarget: builder.mutation<
      BulkActionResult,
      { flaggableType: AdminFlaggableType; flaggableId: string }
    >({
      query: ({ flaggableType, flaggableId }) => ({
        url: `/admin/flags/targets/${flaggableType}/${flaggableId}/dismiss`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "ContentReport", id: "LIST" },
        { type: "ContentReport", id: "GROUPED_LIST" },
        { type: "ContentReport", id: "SUMMARY" },
        "ModerationAction",
      ],
    }),

    resolveFlagTarget: builder.mutation<
      BulkActionResult,
      {
        flaggableType: AdminFlaggableType;
        flaggableId: string;
        resolutionNote: string;
        removeContent: boolean;
      }
    >({
      query: ({ flaggableType, flaggableId, resolutionNote, removeContent }) => ({
        url: `/admin/flags/targets/${flaggableType}/${flaggableId}/resolve`,
        method: "PATCH",
        body: { resolutionNote, removeContent },
      }),
      invalidatesTags: [
        { type: "ContentReport", id: "LIST" },
        { type: "ContentReport", id: "GROUPED_LIST" },
        { type: "ContentReport", id: "SUMMARY" },
        "ModerationAction",
        "Problem",
        "Showcase",
        "Solution",
        "Comment",
        "Program",
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminFlagsQuery,
  useGetGroupedAdminFlagsQuery,
  useGetAdminFlagsSummaryQuery,
  useGetAdminFlagQuery,
  useDismissFlagMutation,
  useResolveFlagMutation,
  useDismissFlagTargetMutation,
  useResolveFlagTargetMutation,
} = adminFlagsApi;
