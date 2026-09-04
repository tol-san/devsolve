import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { clearAccessToken, getAccessToken } from "@/lib/auth/access-token";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  timeout: 120000,
  prepareHeaders: async (headers) => {
    const token = await getAccessToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const ORGANIZATION_SCOPED = [
  "/organizations/me",
  "/organizations/me/members",
  "/organizations/me/members/invitations",
  "/organizations/me/programs",
  "/organizations/me/programs/deleted",
  "/organizations/me/hacktivity",
  "/organizations/me/analytics",
  "/organizations/me/analytics/export",
];

const ORGANIZATION_SCOPED_PATTERN =
  /^\/organizations\/me\/members\/[^/]+(\/(role|permissions))?$/;

function takesOrganization(url: string): boolean {
  const [path] = url.split("?");
  return (
    ORGANIZATION_SCOPED.includes(path) || ORGANIZATION_SCOPED_PATTERN.test(path)
  );
}

function withOrganization(url: string, organizationId: string): string {
  if (!takesOrganization(url)) return url;
  if (/[?&]organizationId=/.test(url)) return url;

  return `${url}${url.includes("?") ? "&" : "?"}organizationId=${encodeURIComponent(organizationId)}`;
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const organizationId = (
    api.getState() as { activeOrganization?: { organizationId?: string | null } }
  ).activeOrganization?.organizationId;

  const scopedArgs =
    organizationId == null
      ? args
      : typeof args === "string"
        ? withOrganization(args, organizationId)
        : { ...args, url: withOrganization(args.url, organizationId) };

  const result = await rawBaseQuery(scopedArgs, api, extraOptions);

  if (result.error?.status === 401) {
    clearAccessToken();
    return rawBaseQuery(scopedArgs, api, extraOptions);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "/api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Program",
    "Report",
    "Bounty",
    "Discussion",
    "Bookmark",
    "Profile",
    "User",
    "Organization",
    "OrganizationVerification",
    "OrganizationMember",
    "OrganizationMembers",
    "OrganizationInvitations",
    "Profile",
    "Report",
    "Bookmark",
    "Post",
    "Notification",
    "CompanyVerification",
    "AdminUser",
    "ModerationItem",
    "ContentReport",
    "AdminUser",
    "ModerationAction",
    "Showcase",
    "ShowcaseStep",
    "ShowcaseRevision",
    "ShowcaseReview",
    "ShowcaseDraft",
    "Problem",
    "ProblemReview",
    "Solution",
    "SolutionDraft",
    "Category",
    "Vote",
    "Comment",
    "AdminProgram",
    "AdminProblem",
    "AdminSolution",
    "VirusTotal",
    "SecurityIncident",
    "Leaderboard",
    "AdminAutoApproval",
  ],
  endpoints: () => ({}),
});
