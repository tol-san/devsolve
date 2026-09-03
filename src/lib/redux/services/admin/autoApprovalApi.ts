import { baseApi } from "@/lib/redux/services/baseApi";

export type AutoApprovalTarget = "PROBLEM" | "SHOWCASE";

export interface AutoApprovalRule {
  target: AutoApprovalTarget;
  enabled: boolean;
  available: boolean;
  updatedBy: string | null;
  /** Server-local ISO string without timezone suffix, e.g. "2026-09-03T17:04:11" */
  updatedAt: string | null;
}

export interface UpdateAutoApprovalRequest {
  target: AutoApprovalTarget;
  enabled: boolean;
}

export const autoApprovalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAutoApprovalRules: builder.query<AutoApprovalRule[], void>({
      query: () => "/admin/auto-approval",
      providesTags: [{ type: "AdminAutoApproval", id: "LIST" }],
    }),

    updateAutoApprovalRule: builder.mutation<
      AutoApprovalRule,
      UpdateAutoApprovalRequest
    >({
      query: ({ target, enabled }) => ({
        url: `/admin/auto-approval/${target}`,
        method: "PATCH",
        body: { enabled },
      }),
      invalidatesTags: [{ type: "AdminAutoApproval", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAutoApprovalRulesQuery,
  useUpdateAutoApprovalRuleMutation,
} = autoApprovalApi;
