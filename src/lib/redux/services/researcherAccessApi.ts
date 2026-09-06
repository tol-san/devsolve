import { proxyApi } from "./proxyApi";
import type {
  InviteResearcherValues,
  ProgramReportingAccess,
  ResearcherAccessRecord,
  ResearcherAccessStatus,
  ReviewDecision,
} from "@/lib/validations/researcher-access";

interface AccessPage {
  content?: ResearcherAccessRecord[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
}

export interface ResearcherAccessList {
  rows: ResearcherAccessRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export interface OrganizationResearchersQuery {
  organizationId: string;
  status?: ResearcherAccessStatus | "ALL";
  page?: number;
  size?: number;
}

export const RESEARCHER_PAGE_SIZE = 20;

function toList(
  response: AccessPage | ResearcherAccessRecord[],
): ResearcherAccessList {
  if (Array.isArray(response)) {
    return { rows: response, total: response.length, page: 0, totalPages: 1 };
  }
  const rows = response.content ?? [];
  return {
    rows,
    total: response.totalElements ?? rows.length,
    page: response.number ?? 0,
    totalPages: Math.max(1, response.totalPages ?? 1),
  };
}

export const researcherAccessApi = proxyApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportingAccess: builder.query<ProgramReportingAccess, string>({
      query: (programId) => `/programs/${programId}/reporting-access`,
      providesTags: (result, _error, programId) => [
        { type: "ResearcherAccess" as const, id: `program:${programId}` },
        ...(result?.organizationId
          ? [{ type: "ResearcherAccess" as const, id: result.organizationId }]
          : []),
      ],
    }),

    getMyOrganizationAccess: builder.query<ResearcherAccessRecord | null, string>({
      query: (organizationId) => `/organizations/${organizationId}/researchers/me`,
      providesTags: (_result, _error, organizationId) => [
        { type: "ResearcherAccess", id: organizationId },
      ],
    }),

    getMyResearcherAccess: builder.query<
      ResearcherAccessList,
      { status?: ResearcherAccessStatus | "ALL"; page?: number; size?: number } | void
    >({
      query: (input) => {
        const { status, page = 0, size = RESEARCHER_PAGE_SIZE } = input ?? {};
        const params = new URLSearchParams({
          page: String(Math.max(0, page)),
          size: String(size),
        });
        if (status && status !== "ALL") params.set("status", status);
        return `/researchers/me/access?${params.toString()}`;
      },
      transformResponse: toList,
      providesTags: ["ResearcherAccess"],
    }),

    requestResearcherAccess: builder.mutation<
      ResearcherAccessRecord,
      { organizationId: string; motivation: string }
    >({
      query: ({ organizationId, motivation }) => ({
        url: `/organizations/${organizationId}/researchers`,
        method: "POST",
        body: { motivation },
      }),
      invalidatesTags: ["ResearcherAccess"],
    }),

    getOrganizationResearchers: builder.query<
      ResearcherAccessList,
      OrganizationResearchersQuery
    >({
      query: ({ organizationId, status, page = 0, size = RESEARCHER_PAGE_SIZE }) => {
        const params = new URLSearchParams({
          page: String(Math.max(0, page)),
          size: String(size),
          sort: "requestedAt,ASC",
        });
        if (status && status !== "ALL") params.set("status", status);
        return `/organizations/${organizationId}/researchers?${params.toString()}`;
      },
      transformResponse: toList,
      providesTags: ["ResearcherAccess"],
    }),

    inviteResearcher: builder.mutation<
      ResearcherAccessRecord,
      { organizationId: string } & InviteResearcherValues
    >({
      query: ({ organizationId, userId, note }) => ({
        url: `/organizations/${organizationId}/researchers/invite`,
        method: "POST",
        body: { userId, note },
      }),
      invalidatesTags: ["ResearcherAccess"],
    }),

    reviewResearcher: builder.mutation<
      ResearcherAccessRecord,
      {
        organizationId: string;
        userId: string;
        decision: ReviewDecision;
        note?: string;
      }
    >({
      query: ({ organizationId, userId, decision, note }) => ({
        url: `/organizations/${organizationId}/researchers/${userId}`,
        method: "PATCH",
        body: { decision, note },
      }),
      invalidatesTags: ["ResearcherAccess"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetReportingAccessQuery,
  useGetMyOrganizationAccessQuery,
  useGetMyResearcherAccessQuery,
  useRequestResearcherAccessMutation,
  useGetOrganizationResearchersQuery,
  useInviteResearcherMutation,
  useReviewResearcherMutation,
} = researcherAccessApi;
