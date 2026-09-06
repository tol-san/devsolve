import { baseApi } from "../baseApi";
import {
  CreateModerationActionRequest,
  GetModerationHistoryParams,
  ModerationActionResponse,
  PageModerationActionResponse,
} from "@/lib/types/admin/types";
import { unwrapPage } from "./adminFlagsApi";

export const moderationActionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getModerationHistory: builder.query<
      PageModerationActionResponse,
      GetModerationHistoryParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.targetType) searchParams.set("targetType", params.targetType);
        if (params?.targetId) searchParams.set("targetId", params.targetId);
        if (params?.action) searchParams.set("action", params.action);
        if (typeof params?.pageNumber === "number")
          searchParams.set("pageNumber", String(params.pageNumber));
        if (typeof params?.pageSize === "number")
          searchParams.set("pageSize", String(params.pageSize));

        const qs = searchParams.toString();
        return `/admin/moderation-actions${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["ModerationAction"],
    }),

    getModerationActionById: builder.query<
      ModerationActionResponse,
      { actionId: string }
    >({
      query: ({ actionId }) => `/admin/moderation-actions/${actionId}`,
      providesTags: (_result, _error, { actionId }) => [
        { type: "ModerationAction", id: actionId },
      ],
    }),

    getTargetModerationHistory: builder.query<
      ModerationActionResponse[],
      { targetType: GetModerationHistoryParams["targetType"]; targetId: string }
    >({
      query: ({ targetType, targetId }) => {
        const params = new URLSearchParams({
          targetId,
          pageNumber: "0",
          pageSize: "20",
        });
        if (targetType) params.set("targetType", targetType);
        return `/admin/moderation-actions?${params.toString()}`;
      },
      transformResponse: (response: unknown) =>
        unwrapPage<ModerationActionResponse>(response).items,
      providesTags: (_result, _error, { targetId }) => [
        { type: "ModerationAction", id: targetId },
      ],
    }),

    createModerationAction: builder.mutation<
      ModerationActionResponse,
      { id: string; body: CreateModerationActionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}/moderation-actions`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ModerationAction", "AdminUser", "ContentReport"],
    }),
  }),
});

export const {
  useGetModerationHistoryQuery,
  useGetModerationActionByIdQuery,
  useGetTargetModerationHistoryQuery,
  useCreateModerationActionMutation,
} = moderationActionsApi;
