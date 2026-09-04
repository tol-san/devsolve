import { baseApi } from "./baseApi";
import type { FlaggableType, FlagReason } from "@/lib/validations/engagement";

export interface CreateFlagRequest {
  flaggableType: FlaggableType;
  flaggableId: string;
  reason: FlagReason;
  description?: string;
}

export interface FlagResponse {
  id: string;
  flaggableType: FlaggableType;
  flaggableId: string;
  reason: FlagReason;
  description?: string;
  status?: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt?: string;
}

export const flagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createFlag: builder.mutation<FlagResponse, CreateFlagRequest>({
      query: (body) => ({ url: "/flags", method: "POST", body }),
    }),
  }),
  overrideExisting: true,
});

export const { useCreateFlagMutation } = flagsApi;
