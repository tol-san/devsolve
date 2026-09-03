import { baseApi } from "../baseApi";
import {
  ModerationItem,
  ContentReportItem,
  ReportReasonsBreakdownData,
  ModerationActionType,
} from "@/lib/types/admin/types";

export type {
  ContentReportItem,
  ModerationItem,
  ModerationActionType,
  ReportReasonsBreakdownData,
};

export interface FlagDetailResponse {
  id: string;
  flaggableId: string;
  flaggableType: string;
  reporterId: string;
  reporterName?: string;
  reason: string;
  description?: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetContentReportsParams {
  status?: "PENDING" | "REVIEWED" | "DISMISSED";
  flaggableType?: "PROBLEM" | "SOLUTION" | "COMMENT" | "SHOWCASE";
  reason?: "SPAM" | "OFFENSIVE" | "DUPLICATE" | "OFF_TOPIC" | "OTHER";
  pageNumber?: number;
  pageSize?: number;
}

export interface ContentReportsResponse {
  items: ContentReportItem[];
  breakdown: ReportReasonsBreakdownData;
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

interface RawBackendFlag {
  id: string;
  reporterId?: string;
  reporterName?: string;
  flaggableType?: "PROBLEM" | "SOLUTION" | "COMMENT" | "PROGRAM" | string;
  flaggableId?: string;
  reason?: "SPAM" | "OFFENSIVE" | "DUPLICATE" | "OFF_TOPIC" | "OTHER" | string;
  description?: string;
  status?: string;
  createdAt?: string;
}

interface RawBackendPageResponse {
  content?: RawBackendFlag[];
  items?: RawBackendFlag[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

export const moderationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContentReports: builder.query<
      ContentReportsResponse,
      GetContentReportsParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set("status", params.status);
        if (params?.flaggableType)
          searchParams.set("flaggableType", params.flaggableType);
        if (params?.reason) searchParams.set("reason", params.reason);
        if (typeof params?.pageNumber === "number")
          searchParams.set("pageNumber", String(params.pageNumber));
        if (typeof params?.pageSize === "number")
          searchParams.set("pageSize", String(params.pageSize));
        else searchParams.set("pageSize", "100");

        const qs = searchParams.toString();
        return `/admin/flags${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (
        response: RawBackendPageResponse | RawBackendFlag[]
      ) => {
        const rawFlags: RawBackendFlag[] = Array.isArray(response)
          ? response
          : response?.content || response?.items || [];

        const reasonMap: Record<
          string,
          "Spam" | "Harmful" | "Offensive" | "Off-topic"
        > = {
          SPAM: "Spam",
          OFFENSIVE: "Offensive",
          DUPLICATE: "Harmful",
          OFF_TOPIC: "Off-topic",
          OTHER: "Harmful",
        };

        const statusMap: Record<
          string,
          "PENDING" | "DISMISSED" | "WARNED" | "REMOVED"
        > = {
          PENDING: "PENDING",
          DISMISSED: "DISMISSED",
          RESOLVED: "REMOVED",
          REVIEWED: "WARNED",
        };

        const items: ContentReportItem[] = rawFlags.map((flag) => ({
          id: flag.id,
          type:
            (flag.flaggableType as ContentReportItem["type"]) || "PROBLEM",
          title:
            flag.description ||
            `${flag.flaggableType || "Content"} Flag #${flag.id.slice(0, 8)}`,
          timestamp: flag.createdAt
            ? new Date(flag.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Recent",
          reportCount: 1,
          reason: (flag.reason && reasonMap[flag.reason]) || "Spam",
          author: flag.reporterName || "Community User",
          authorId: flag.reporterId || undefined,
          status: (flag.status && statusMap[flag.status]) || "PENDING",
          snippet: flag.description || undefined,
        }));

        const pendingItems = items.filter((r) => r.status === "PENDING");
        const spam = pendingItems.filter((r) => r.reason === "Spam").length;
        const harmful = pendingItems.filter((r) => r.reason === "Harmful").length;
        const offensive = pendingItems.filter(
          (r) => r.reason === "Offensive"
        ).length;
        const offTopic = pendingItems.filter(
          (r) => r.reason === "Off-topic"
        ).length;
        const total = pendingItems.length;

        const pageData = Array.isArray(response) ? null : response;

        return {
          items,
          breakdown: { spam, harmful, offensive, offTopic, total },
          totalElements: pageData?.totalElements ?? items.length,
          totalPages: pageData?.totalPages ?? 1,
          pageNumber: pageData?.number ?? 0,
          pageSize: pageData?.size ?? items.length,
        };
      },
      providesTags: ["ContentReport"],
    }),

    getFlagDetail: builder.query<FlagDetailResponse, string>({
      query: (id) => `/admin/flags/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ContentReport", id }],
    }),

    updateContentReportAction: builder.mutation<
      unknown,
      {
        id: string;
        action: ModerationActionType | "DISMISS";
        resolutionNote?: string;
        removeContent?: boolean;
      }
    >({
      query: ({ id, action, resolutionNote, removeContent }) => ({
        url:
          action === "DISMISS"
            ? `/admin/flags/${id}/dismiss`
            : `/admin/flags/${id}/resolve`,
        method: "PATCH",
        body:
          action !== "DISMISS"
            ? {
                resolutionNote:
                  resolutionNote || `Flag resolved by Admin (${action})`,
                removeContent: removeContent ?? action === "REMOVE",
              }
            : undefined,
      }),
      invalidatesTags: ["ContentReport", "ModerationAction"],
    }),
  }),
});

export const {
  useGetContentReportsQuery,
  useGetFlagDetailQuery,
  useUpdateContentReportActionMutation,
} = moderationApi;

