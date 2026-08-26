import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

/**
 * Endpoints that go through the Next route handlers under `src/app/api/*`.
 * Uses `baseQueryWithReauth` to dynamically inject the Keycloak JWT Bearer
 * token via `getAccessToken()` and replay on 401.
 */
export const proxyApi = createApi({
  reducerPath: "proxyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Category",
    "Program",
    "Report",
    "AdminProgram",
    "Organization",
    "OrganizationVerification",
    "CompanyVerification",
    "OrganizationMembers",
    "OrganizationInvitations",
    "Weakness",
    "ReportDraft",
  ],
  endpoints: () => ({}),
});
