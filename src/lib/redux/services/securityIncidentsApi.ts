import { baseApi } from "./baseApi";
import type {
  GetSecurityIncidentsParams,
  SecurityIncidentsPage,
} from "@/lib/types/security-incidents/types";

function buildIncidentsQueryString(params: GetSecurityIncidentsParams): string {
  const search = new URLSearchParams();

  if (params.search?.trim()) search.set("search", params.search.trim());
  if (params.verdict) search.set("verdict", params.verdict);
  if (params.organizationId?.trim()) search.set("organizationId", params.organizationId.trim());

  search.set("page", String(Math.max(0, params.page ?? 0)));
  search.set("size", String(Math.min(100, Math.max(1, params.size ?? 20))));

  if (params.sort) {
    search.set("sort", params.sort);
  }

  return search.toString();
}

export const securityIncidentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSecurityIncidents: builder.query<
      SecurityIncidentsPage,
      GetSecurityIncidentsParams | void
    >({
      query: (params) => {
        const qs = buildIncidentsQueryString(params ?? {});
        return `/admin/security/incidents${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: "SecurityIncident" as const,
                id,
              })),
              { type: "SecurityIncident", id: "ADMIN_LIST" },
            ]
          : [{ type: "SecurityIncident", id: "ADMIN_LIST" }],
    }),

    getOrgSecurityIncidents: builder.query<
      SecurityIncidentsPage,
      GetSecurityIncidentsParams & { orgId: string }
    >({
      query: ({ orgId, ...params }) => {
        const qs = buildIncidentsQueryString(params);
        return `/organizations/${orgId}/security/incidents${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result, _error, { orgId }) =>
        result
          ? [
              ...result.content.map(({ id }) => ({
                type: "SecurityIncident" as const,
                id,
              })),
              { type: "SecurityIncident", id: `ORG_${orgId}` },
            ]
          : [{ type: "SecurityIncident", id: `ORG_${orgId}` }],
    }),
  }),
});

export const {
  useGetAdminSecurityIncidentsQuery,
  useGetOrgSecurityIncidentsQuery,
  useLazyGetAdminSecurityIncidentsQuery,
  useLazyGetOrgSecurityIncidentsQuery,
} = securityIncidentsApi;
