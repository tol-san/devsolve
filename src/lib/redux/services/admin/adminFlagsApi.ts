import { baseApi } from "../baseApi";
import type {
  AdminFlaggableType,
  FlagSource,
  FlagStatus,
} from "@/lib/validations/moderation";
import type { FlagReason } from "@/lib/validations/engagement";

/** The report queue row, exactly as the API returns it — no lossy remapping. */
export interface FlagResponse {
  id: string;
  /** SYSTEM flags come from the profanity filter and have no reporter. */
  source: FlagSource;
  reporterId: string | null;
  reporterName: string | null;
  flaggableType: AdminFlaggableType;
  flaggableId: string;
  reason: FlagReason;
  description: string | null;
  status: FlagStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface AdminFlagQuery {
  status?: FlagStatus;
  flaggableType?: AdminFlaggableType;
  reason?: FlagReason;
  pageNumber?: number;
  pageSize?: number;
}

export interface FlagPage {
  items: FlagResponse[];
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

function flagQueryString(input: AdminFlagQuery | void): string {
  const {
    status,
    flaggableType,
    reason,
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
  return params.toString();
}

export const adminFlagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminFlags: builder.query<FlagPage, AdminFlagQuery | void>({
      query: (input) => `/admin/flags?${flagQueryString(input)}`,
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

    getAdminFlag: builder.query<FlagResponse, string>({
      query: (id) => `/admin/flags/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ContentReport", id }],
    }),

    dismissFlag: builder.mutation<FlagResponse, string>({
      query: (id) => ({ url: `/admin/flags/${id}/dismiss`, method: "PATCH" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ContentReport", id },
        { type: "ContentReport", id: "LIST" },
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
        "ModerationAction",
        // A resolve with removeContent:true takes the post down too.
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
  useGetAdminFlagQuery,
  useDismissFlagMutation,
  useResolveFlagMutation,
} = adminFlagsApi;
