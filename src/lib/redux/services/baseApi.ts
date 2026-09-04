import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { clearAccessToken, getAccessToken } from "@/lib/auth/access-token";

const rawBaseQuery = fetchBaseQuery({
  // All requests MUST route through the Next.js server-side proxy (/api/...),
  // which adds the Bearer token and forwards server-to-server to the backend.
  // Never point directly at NEXT_PUBLIC_BACKEND_API_URL from the client.
  baseUrl: "/api",
  /* Sized for the slowest thing a request can legitimately do, which is now
     sending a 10 MiB attachment over a poor connection — not scanning.
     Uploads used to block on VirusTotal polling for up to ~95s on a file it
     had never seen; the guard now asks by hash, submits unrecognised content
     once, and collects the verdict in the background, so that wait is gone.
     The ceiling is kept rather than tightened: it costs nothing on a request
     that finishes, and lowering it would abort large uploads that are merely
     slow. */
  timeout: 120000,
  prepareHeaders: async (headers) => {
    // The token lives with better-auth against the session cookie, not in
    // localStorage — asking the client for it is the only way to get one.
    const token = await getAccessToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

/**
 * A token that expired between cache and send comes back as a 401. Drop the
 * cached copy so better-auth mints a fresh one, then replay the request once.
 * A second 401 is a real authorization failure and is passed through.
 */
/**
 * The `/organizations/me/*` calls that take an organization.
 *
 * An account can belong to several organizations, and these endpoints name
 * none — so they answer 409 rather than guessing which one is meant. The
 * choice lives in `activeOrganization`, which until now never left the browser:
 * the switcher moved a value the API never saw, so a second membership broke
 * the company workspace outright.
 *
 * Paths are matched against the proxy URL, which mirrors the upstream's.
 */
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

/** `/organizations/me/members/{userId}` and its role/permissions children. */
const ORGANIZATION_SCOPED_PATTERN =
  /^\/organizations\/me\/members\/[^/]+(\/(role|permissions))?$/;

function takesOrganization(url: string): boolean {
  const [path] = url.split("?");
  return (
    ORGANIZATION_SCOPED.includes(path) || ORGANIZATION_SCOPED_PATTERN.test(path)
  );
}

/** Adds the active organization, leaving an explicit one alone. */
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
  /* Which organization the workspace is showing has to travel with the
     request; the proxy runs on the server and cannot read the choice. */
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
