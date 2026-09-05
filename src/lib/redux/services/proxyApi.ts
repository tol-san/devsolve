import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "./baseApi";

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
    "OrganizationMemberships",
    "OrganizationInvitations",
    "OrganizationRoles",
    "OrganizationAnalytics",
    "Weakness",
    "ReportDraft",
    "ShowcaseDraft",
    "SolutionDraft",
    "ResearcherAccess",
    "Tag",
    "Leaderboard",
    "Profile",
    "AutoReview",
  ],
  endpoints: () => ({}),
});
