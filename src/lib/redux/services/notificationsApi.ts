import { baseApi } from "./baseApi";
import {
  GetNotificationsParams,
  Notification,
  NotificationPage,
  UnreadCountResponse,
} from "@/lib/types/notifications/types";

export * from "@/lib/types/notifications/types";

interface ApiQueryCacheEntry {
  endpointName?: string;
  status?: string;
  originalArgs?: GetNotificationsParams | void;
}

interface NotificationStateShape {
  [key: string]: {
    queries?: Record<string, ApiQueryCacheEntry>;
  } | undefined;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationPage,
      GetNotificationsParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.pageNumber !== undefined)
          queryParams.set("pageNumber", params.pageNumber.toString());
        if (params?.pageSize !== undefined)
          queryParams.set("pageSize", params.pageSize.toString());
        if (params?.unreadOnly !== undefined)
          queryParams.set("unreadOnly", params.unreadOnly.toString());

        const queryString = queryParams.toString();
        return `/notifications${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Notification"],
      keepUnusedDataFor: 300,
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
      keepUnusedDataFor: 300,
    }),

    markAsRead: builder.mutation<Notification, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      async onQueryStarted(notificationId, { dispatch, getState, queryFulfilled }) {
        const state = getState() as NotificationStateShape;
        const queries = state?.[baseApi.reducerPath]?.queries || {};
        const patches: Array<{ undo: () => void }> = [];

        for (const queryKey of Object.keys(queries)) {
          const query = queries[queryKey];
          if (query?.endpointName === "getNotifications" && query?.status === "fulfilled") {
            const patchResult = dispatch(
              notificationsApi.util.updateQueryData(
                "getNotifications",
                query.originalArgs,
                (draft) => {
                  if (draft?.content) {
                    const target = draft.content.find((n) => n.id === notificationId);
                    if (target && !target.read) {
                      target.read = true;
                    }
                  }
                },
              ),
            );
            patches.push(patchResult);
          }
        }

        const unreadPatch = dispatch(
          notificationsApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
            if (draft && typeof draft.unreadCount === "number") {
              draft.unreadCount = Math.max(0, draft.unreadCount - 1);
            }
          }),
        );
        patches.push(unreadPatch);

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: ["Notification"],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      async onQueryStarted(_, { dispatch, getState, queryFulfilled }) {
        const state = getState() as NotificationStateShape;
        const queries = state?.[baseApi.reducerPath]?.queries || {};
        const patches: Array<{ undo: () => void }> = [];

        for (const queryKey of Object.keys(queries)) {
          const query = queries[queryKey];
          if (query?.endpointName === "getNotifications" && query?.status === "fulfilled") {
            const patchResult = dispatch(
              notificationsApi.util.updateQueryData(
                "getNotifications",
                query.originalArgs,
                (draft) => {
                  if (draft?.content) {
                    draft.content.forEach((n) => {
                      n.read = true;
                    });
                  }
                },
              ),
            );
            patches.push(patchResult);
          }
        }

        const unreadPatch = dispatch(
          notificationsApi.util.updateQueryData("getUnreadCount", undefined, (draft) => {
            if (draft) {
              draft.unreadCount = 0;
            }
          }),
        );
        patches.push(unreadPatch);

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: ["Notification"],
    }),

    getNotificationPreferences: builder.query<unknown[], void>({
      query: () => "/notifications/preferences",
      providesTags: ["Notification"],
    }),

    updateNotificationPreferences: builder.mutation<unknown[], unknown>({
      query: (body) => ({
        url: "/notifications/preferences",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationsApi;
