import { baseApi } from "./baseApi";
import type { FlaggableType, FlagReason } from "@/lib/validations/engagement";
import {
  unwrapPage,
  type FlagPage,
  type FlagResponse,
} from "./admin/adminFlagsApi";

export type { FlagResponse, FlagPage };

export interface CreateFlagRequest {
  flaggableType: FlaggableType;
  flaggableId: string;
  reason: FlagReason;
  description?: string;
}

export interface MyFlagsQuery {
  status?: "PENDING" | "REVIEWED" | "DISMISSED";
  pageNumber?: number;
  pageSize?: number;
}

export const flagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createFlag: builder.mutation<FlagResponse, CreateFlagRequest>({
      query: (body) => ({ url: "/flags", method: "POST", body }),
      invalidatesTags: [{ type: "ContentReport", id: "MINE" }],
    }),

    getMyFlags: builder.query<FlagPage, MyFlagsQuery | void>({
      query: (input) => {
        const { status, pageNumber = 0, pageSize = 20 } = input ?? {};
        const params = new URLSearchParams({
          pageNumber: String(Math.max(0, pageNumber)),
          pageSize: String(Math.min(Math.max(1, pageSize), 100)),
        });
        if (status) params.set("status", status);
        return `/flags/mine?${params.toString()}`;
      },
      transformResponse: (response: unknown) =>
        unwrapPage<FlagResponse>(response),
      providesTags: (result) => [
        { type: "ContentReport" as const, id: "MINE" },
        ...(result?.items ?? []).map((flag) => ({
          type: "ContentReport" as const,
          id: flag.id,
        })),
      ],
    }),
  }),
  overrideExisting: true,
});

export const { useCreateFlagMutation, useGetMyFlagsQuery } = flagsApi;

