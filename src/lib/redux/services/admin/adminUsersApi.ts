import { baseApi } from "../baseApi";
import {
  PageAdminUserSummaryResponse,
  GetAdminUsersParams,
} from "@/lib/types/admin/types";


export interface CreateModerationActionParams {
  id: string;
  action: "WARN" | "SUSPEND" | "REMOVE" | "BAN" | "REINSTATE";
  reason: string;
  expiresAt?: string;
}

export const adminUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<PageAdminUserSummaryResponse, GetAdminUsersParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.query) searchParams.set("query", params.query);
        if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);
        if (typeof params?.pageNumber === "number") searchParams.set("pageNumber", String(params.pageNumber));
        if (typeof params?.pageSize === "number") searchParams.set("pageSize", String(params.pageSize));

        const qs = searchParams.toString();
        return `/admin/users${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AdminUser"],
    }),
    createAdminModerationAction: builder.mutation<
      unknown,
      CreateModerationActionParams
    >({
      query: ({ id, action, reason, expiresAt }) => ({
        url: `/admin/users/${id}/moderation-actions`,
        method: "POST",
        body: { action, reason, expiresAt },
      }),
      invalidatesTags: ["AdminUser", "ModerationAction"],
    }),
    /**
     * Reinstate/warn only. A SUSPEND needs an `expiresAt`, which this shortcut
     * has no way to collect — sending one without it is a guaranteed 400, so
     * suspensions go through AccountModerationDialog instead.
     */
    updateAdminUserStatus: builder.mutation<
      unknown,
      { id: string; status: "ACTIVE" | "PENDING"; reason?: string }
    >({
      query: ({ id, status, reason }) => ({
        url: `/admin/users/${id}/moderation-actions`,
        method: "POST",
        body: {
          action: status === "ACTIVE" ? "REINSTATE" : "WARN",
          reason:
            reason ||
            `Account ${status === "ACTIVE" ? "reinstated" : "warned"} via the admin console.`,
        },
      }),
      invalidatesTags: ["AdminUser", "ModerationAction"],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useCreateAdminModerationActionMutation,
  useUpdateAdminUserStatusMutation,
} = adminUsersApi;
