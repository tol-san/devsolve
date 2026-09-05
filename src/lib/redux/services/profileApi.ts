import { baseApi } from "./baseApi";
import {
  Profile,
  ProfileStats,
  SeverityStats,
  ProfileBadge,
  CommunityPost,
  ThanksEntry,
  EditProfileFormData,
  SocialLinksForm,
  AccountStatus,
  FollowingCounts,
  FollowRecord,
  FollowingUser,
  FollowingUsersResponse,
} from "@/lib/types/profile/types";
import { mockEditProfileFormData } from "@/lib/types/profile/mock-data";
import type {
  ShowcaseEngagement,
  ShowcaseViewer,
} from "./showcasesApi";

interface ProfileOverviewResponse {
  profile: Profile;
  stats: ProfileStats;
  severity: SeverityStats;
  badges: ProfileBadge[];
}

interface UserProfileApiResponse {
  id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  biography?: string;
  phone?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  country?: string;
  status?: "ACTIVE" | "SUSPENDED" | "REMOVED";
  socialLinks?: { platform: "GITHUB" | "LINKEDIN" | "WEBSITE" | "X" | "FACEBOOK" | "TELEGRAM" | "OTHER"; url: string }[];
  reputation?: number;
  totalReports?: number;
  validReports?: number;
  criticalReports?: number;
  recognitionCount?: number;
  totalBountyEarned?: number;
  bountyCurrency?: string;
  rewardedReports?: number;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  joinedAt?: string;
}

interface ReportApiResponse {
  id: string;
  programId: string;
  severity?: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  state: "NEW" | "TRIAGING" | "NEEDS_MORE_INFO" | "VALID_CONFIRMED" | "RESOLVED" | "REJECTED" | "DUPLICATE";
  rewards?: { amount: number }[];
  submittedAt?: string;
  resolvedAt?: string;
}

interface ProblemApiResponse {
  id: string;
  title: string;
  description?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "RESOLVED" | "CLOSED" | "REJECTED";
  viewCount?: number;
  publishedAt?: string;
  createdAt?: string;
}

interface SolutionApiResponse {
  id: string;
  problemId?: string;
  summary?: string;
  bodyMarkdown?: string;
  approachType?: "FIX" | "WORKAROUND" | "EXPLANATION" | "ALTERNATIVE";
  isAccepted?: boolean;
  voteScore?: number;
  moderation?: { status?: "PENDING" | "APPROVED" | "REJECTED" };
  createdAt?: string;
}

interface ShowcaseApiResponse {
  id: string;
  title: string;
  overview?: string;
  coverImageUrl?: string;
  reviewStatus?: "PENDING" | "APPROVED" | "REJECTED";
  viewCount?: number;
  commentCount?: number;
  engagement?: ShowcaseEngagement;
  viewer?: ShowcaseViewer;
  createdAt?: string;
}

interface VoteSummaryApiResponse {
  score?: number;
}

export interface PublicUserProfileItem {
  id: string;
  fullName?: string;
  biography?: string;
  avatarUrl?: string;
  country?: string;
  socialLinks?: { platform: string; url: string }[];
  reputation?: number;
  totalReports?: number;
  validReports?: number;
  criticalReports?: number;
  recognitionCount?: number;
  joinedAt?: string;
}

export interface PagePublicUserProfileResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: PublicUserProfileItem[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const PORTFOLIO_PAGE_SIZE = 10;

function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstLine(text: string, max = 90): string {
  const opening = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return opening.length > max ? `${opening.slice(0, max).trimEnd()}…` : opening;
}

function socialLinksOf(raw: UserProfileApiResponse): SocialLinksForm {
  const links = raw.socialLinks ?? [];
  const urlFor = (platform: string) => links.find((link) => link.platform === platform)?.url ?? "";
  return {
    github: urlFor("GITHUB"),
    twitter: urlFor("X"),
    linkedin: urlFor("LINKEDIN"),
    website: urlFor("WEBSITE"),
  };
}

function toSocialLinksPayload(form: SocialLinksForm | undefined): { platform: string; url: string }[] | undefined {
  if (!form) return undefined;
  const entries: { platform: string; url: string }[] = [];
  if (form.github) entries.push({ platform: "GITHUB", url: form.github });
  if (form.twitter) entries.push({ platform: "X", url: form.twitter });
  if (form.linkedin) entries.push({ platform: "LINKEDIN", url: form.linkedin });
  if (form.website) entries.push({ platform: "WEBSITE", url: form.website });
  return entries;
}

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

function fullNameOf(raw: UserProfileApiResponse, fallback: string): string {
  return raw.fullName || [raw.firstName, raw.lastName].filter(Boolean).join(" ") || fallback;
}

function usernameOf(raw: UserProfileApiResponse, fallback: string): string {
  if (raw.username?.trim()) return raw.username.trim();
  return raw.email ? raw.email.split("@")[0] : fallback;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function memberSinceOf(iso: string | undefined, fallback: string): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function acceptedRateOf(total: number, valid: number): number {
  return total > 0 ? Math.round((valid / total) * 1000) / 10 : 0;
}

function severityStatsOf(reports: ReportApiResponse[]): SeverityStats {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, rejected: 0, duplicate: 0 };
  for (const report of reports) {
    const state = report.state?.toUpperCase();
    const sev = report.severity?.toUpperCase();

    if (state === "REJECTED") counts.rejected += 1;
    else if (state === "DUPLICATE") counts.duplicate += 1;
    else if (sev === "CRITICAL") counts.critical += 1;
    else if (sev === "HIGH") counts.high += 1;
    else if (sev === "MEDIUM") counts.medium += 1;
    else if (sev === "LOW") counts.low += 1;
  }
  return { ...counts, retests: 0 };
}

interface HacktivitySummaryApiResponse {
  id: string;
  eventType?: string;
  report?: {
    id?: string;
    severity?: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    disclosureStatus?: "DISCLOSED" | "NOT_DISCLOSED";
  };
}

function severityStatsFromHacktivity(
  activities: HacktivitySummaryApiResponse[],
  raw: UserProfileApiResponse
): SeverityStats {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, rejected: 0, duplicate: 0 };
  const seenReports = new Set<string>();

  for (const item of activities) {
    const reportId = item.report?.id || item.id;
    if (seenReports.has(reportId)) continue;
    seenReports.add(reportId);

    const sev = item.report?.severity?.toUpperCase();
    if (sev === "CRITICAL") counts.critical += 1;
    else if (sev === "HIGH") counts.high += 1;
    else if (sev === "MEDIUM") counts.medium += 1;
    else if (sev === "LOW") counts.low += 1;
  }

  if (typeof raw.criticalReports === "number" && raw.criticalReports > counts.critical) {
    counts.critical = raw.criticalReports;
  }

  return { ...counts, retests: 0 };
}

function totalEarnedOf(reports: ReportApiResponse[]): number {
  return reports.reduce((sum, report) => sum + (report.rewards?.reduce((s, reward) => s + (reward.amount ?? 0), 0) ?? 0), 0);
}

function reportCountsOf(raw: UserProfileApiResponse, reports: ReportApiResponse[]) {
  const total = raw.totalReports ?? reports.length;
  const valid = raw.validReports ?? reports.filter((r) => r.state === "RESOLVED" || r.state === "VALID_CONFIRMED").length;
  return { total, valid };
}

function toProfileOverview(
  raw: UserProfileApiResponse,
  social: { followers: number; following: number },
  reports: ReportApiResponse[],
  hacktivities: HacktivitySummaryApiResponse[] = [],
  isOwnProfile: boolean = false
): ProfileOverviewResponse {
  const displayName = fullNameOf(raw, "DevSolve user");
  const { total: totalReports, valid: validReports } = reportCountsOf(raw, reports);

  const profile: Profile = {
    id: raw.id,
    username: usernameOf(raw, ""),
    displayName,
    avatarInitials: initialsOf(displayName),
    avatarUrl: raw.avatarUrl,
    coverUrl: raw.coverImageUrl,
    bio: raw.biography || "",
    location: raw.country || undefined,
    memberSince: memberSinceOf(raw.joinedAt ?? raw.createdAt, ""),
    socialLinks: socialLinksOf(raw),
    followers: social.followers,
    following: social.following,
    isOwnProfile,
    phone: raw.phone,
    dateOfBirth: raw.dateOfBirth,
    gender: raw.gender,
  };

  const stats: ProfileStats = {
    reputation: raw.reputation ?? 0,
    globalRank: undefined,
    reportsSubmitted: totalReports,
    accepted: validReports,
    acceptedRate: acceptedRateOf(totalReports, validReports),
    totalEarned:
      typeof raw.totalBountyEarned === "number"
        ? raw.totalBountyEarned
        : isOwnProfile
          ? totalEarnedOf(reports)
          : 0,
    bountyCurrency: raw.bountyCurrency || "USD",
    rewardedReports: typeof raw.rewardedReports === "number" ? raw.rewardedReports : 0,
  };

  const severity = isOwnProfile
    ? severityStatsOf(reports)
    : severityStatsFromHacktivity(hacktivities, raw);

  return { profile, stats, severity, badges: [] };
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfileByUsername: builder.query<ProfileOverviewResponse, string>({
      async queryFn(username, _api, _extraOptions, fetchWithBQ) {
        const isMeRoute = !username || username === "me";
        const isUserId = !isMeRoute && UUID_PATTERN.test(username);

        const path = isMeRoute
          ? "/user-profiles/me"
          : isUserId
            ? `/user-profiles/${username}`
            : `/user-profiles/by-username/${encodeURIComponent(username)}`;

        const profileResult = await fetchWithBQ(path);

        if (profileResult.error) {
          return { error: profileResult.error };
        }

        const raw = profileResult.data as UserProfileApiResponse;

        let isSelf = isMeRoute;
        if (!isSelf) {
          const meResult = await fetchWithBQ("/user-profiles/me");
          if (!meResult.error && meResult.data) {
            const meRaw = meResult.data as UserProfileApiResponse;
            if (
              (meRaw.id && raw.id && meRaw.id === raw.id) ||
              (meRaw.username && raw.username && meRaw.username.toLowerCase() === raw.username.toLowerCase())
            ) {
              isSelf = true;
            }
          }
        }

        const [followingResult, followersResult, reportsResult, hacktivityResult] = await Promise.all([
          fetchWithBQ(isSelf ? `/follows/mine?size=1` : `/follows/users/${raw.id}/following?size=1`),
          fetchWithBQ(`/follows/USER/${raw.id}/followers?size=1`),
          isSelf ? fetchWithBQ(`/reports/mine?size=100`) : Promise.resolve(null),
          !isSelf && raw.id ? fetchWithBQ(`/user-profiles/${raw.id}/hacktivity?size=100`) : Promise.resolve(null),
        ]);

        const followingCount = !followingResult.error
          ? (followingResult.data as { totalElements?: number } | undefined)?.totalElements
          : undefined;
        const followersCount = !followersResult.error
          ? (followersResult.data as { totalElements?: number } | undefined)?.totalElements
          : undefined;
        const reports =
          reportsResult && !reportsResult.error
            ? (reportsResult.data as { content?: ReportApiResponse[] } | undefined)?.content ?? []
            : [];
        const hacktivities =
          hacktivityResult && !hacktivityResult.error
            ? (hacktivityResult.data as { content?: HacktivitySummaryApiResponse[] } | undefined)?.content ?? []
            : [];

        return {
          data: toProfileOverview(
            raw,
            {
              followers: followersCount ?? 0,
              following: followingCount ?? 0,
            },
            reports,
            hacktivities,
            isSelf
          ),
        };
      },
      providesTags: ["Profile"],
    }),

    getCommunityPosts: builder.query<CommunityPost[], string>({
      async queryFn(userId, _api, _extraOptions, fetchWithBQ) {
        if (!userId) return { data: [] };

        const query = `?pageSize=${PORTFOLIO_PAGE_SIZE}`;
        const [problemsResult, solutionsResult, showcasesResult] =
          await Promise.all([
            fetchWithBQ(`/user-profiles/${userId}/problems${query}`),
            fetchWithBQ(`/user-profiles/${userId}/solutions${query}`),
            fetchWithBQ(`/showcases/users/${userId}${query}`),
          ]);

        const contentOf = <T,>(result: { data?: unknown; error?: unknown }) =>
          result.error
            ? []
            : ((result.data as { content?: T[] } | undefined)?.content ?? []);

        const problems = contentOf<ProblemApiResponse>(problemsResult).filter(
          (problem) =>
            problem.status === "PUBLISHED" ||
            problem.status === "RESOLVED" ||
            problem.status === "CLOSED",
        );
        const solutions = contentOf<SolutionApiResponse>(solutionsResult);
        const showcases = contentOf<ShowcaseApiResponse>(showcasesResult);

        if (problemsResult.error && solutionsResult.error && showcasesResult.error) {
          return { error: problemsResult.error };
        }

        const votesFor = (type: string, id: string) =>
          fetchWithBQ(`/votes/${type}/${id}/summary`);

        const [problemExtras, solutionVotes, showcaseVotes] = await Promise.all([
          Promise.all(
            problems.map((problem) =>
              Promise.all([
                votesFor("PROBLEM", problem.id),
                fetchWithBQ(`/problems/${problem.id}/solutions?pageSize=1`),
              ]),
            ),
          ),
          Promise.all(
            solutions.map((solution) => votesFor("SOLUTION", solution.id)),
          ),
          Promise.all(
            showcases.map((showcase) => votesFor("SHOWCASE", showcase.id)),
          ),
        ]);

        const scoreOf = (result: { data?: unknown; error?: unknown }) =>
          result.error
            ? 0
            : ((result.data as VoteSummaryApiResponse | undefined)?.score ?? 0);

        const posts: CommunityPost[] = [
          ...problems.map((problem, index): CommunityPost => {
            const [voteResult, answersResult] = problemExtras[index];
            return {
              id: problem.id,
              title: problem.title,
              description: plainText(problem.description ?? ""),
              tag: "Problem",
              votes: scoreOf(voteResult),
              answers: answersResult.error
                ? 0
                : ((answersResult.data as { totalElements?: number } | undefined)
                    ?.totalElements ?? 0),
              views: problem.viewCount ?? 0,
              status:
                problem.status === "RESOLVED"
                  ? { label: "Solved", tone: "positive" }
                  : undefined,
              date:
                problem.publishedAt ||
                problem.createdAt ||
                new Date().toISOString(),
              href: `/community/${problem.id}`,
            };
          }),

          ...solutions.map((solution, index): CommunityPost => {
            const body = plainText(solution.bodyMarkdown ?? "");
            return {
              id: solution.id,
              title: solution.summary?.trim() || firstLine(body) || "Solution",
              description: body,
              tag: "Solutions",
              votes: scoreOf(solutionVotes[index]) || solution.voteScore || 0,
              status: solution.isAccepted
                ? { label: "Accepted", tone: "positive" }
                : undefined,
              date: solution.createdAt || new Date().toISOString(),
              href: solution.problemId
                ? `/community/${solution.problemId}`
                : undefined,
            };
          }),

          ...showcases.map((showcase, index): CommunityPost => ({
            id: showcase.id,
            title: showcase.title,
            description: plainText(showcase.overview ?? ""),
            tag: "Showcase",
            votes: showcase.engagement?.voteScore ?? scoreOf(showcaseVotes[index]),
            bookmarks: showcase.engagement?.bookmarkCount ?? 0,
            answers: showcase.commentCount ?? 0,
            views: showcase.viewCount ?? 0,
            status:
              showcase.reviewStatus === "PENDING"
                ? { label: "Pending review", tone: "pending" }
                : showcase.reviewStatus === "REJECTED"
                  ? { label: "Changes requested", tone: "pending" }
                  : undefined,
            date: showcase.createdAt || new Date().toISOString(),
            href: `/showcases/${showcase.id}`,
            thumbnailUrl: showcase.coverImageUrl,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { data: posts };
      },
      providesTags: ["Profile"],
    }),

    getThanks: builder.query<ThanksEntry[], string>({
      queryFn: () => ({ data: [] as ThanksEntry[] }),
      providesTags: ["Profile"],
    }),

    getProfileProvisioningStatus: builder.query<UserProfileApiResponse, void>({
      query: () => `/user-profiles/me?strict=1`,
      providesTags: ["Profile"],
    }),

    getEditProfileForm: builder.query<EditProfileFormData, void>({
      query: () => `/user-profiles/me`,
      transformResponse: (raw: UserProfileApiResponse): EditProfileFormData => {
        const fullName = fullNameOf(raw, mockEditProfileFormData.fullName);
        return {
          ...mockEditProfileFormData,
          fullName,
          avatarInitials: initialsOf(fullName),
          avatarUrl: raw.avatarUrl || undefined,
          coverUrl: raw.coverImageUrl || undefined,
          username: usernameOf(raw, mockEditProfileFormData.username),
          email: raw.email || mockEditProfileFormData.email,
          bio: raw.biography || mockEditProfileFormData.bio,
          location: raw.country || mockEditProfileFormData.location,
          phone: raw.phone || "",
          dateOfBirth: raw.dateOfBirth || "",
          gender: raw.gender,
          socialLinks: socialLinksOf(raw),
        };
      },
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation<EditProfileFormData, Partial<EditProfileFormData>>({
      query: (body) => {
        const [firstName, ...rest] = (body.fullName ?? "").trim().split(/\s+/).filter(Boolean);
        return {
          url: `/user-profiles/me`,
          method: "PATCH",
          body: {
            firstName: firstName || undefined,
            lastName: rest.join(" ") || undefined,
            biography: body.bio,
            country: body.location,
            phone: body.phone || undefined,
            avatarUrl: body.avatarUrl || undefined,
            dateOfBirth: body.dateOfBirth || undefined,
            gender: body.gender || undefined,
            socialLinks: toSocialLinksPayload(body.socialLinks),
          },
        };
      },
      transformResponse: (raw: UserProfileApiResponse, _meta, arg): EditProfileFormData => {
        const fullName = fullNameOf(raw, arg.fullName || mockEditProfileFormData.fullName);
        return {
          ...mockEditProfileFormData,
          ...arg,
          fullName,
          avatarInitials: initialsOf(fullName),
          avatarUrl: raw.avatarUrl ?? arg.avatarUrl,
          email: raw.email || arg.email || mockEditProfileFormData.email,
          bio: raw.biography ?? arg.bio ?? mockEditProfileFormData.bio,
          location: raw.country ?? arg.location ?? mockEditProfileFormData.location,
          phone: raw.phone ?? arg.phone ?? "",
          dateOfBirth: raw.dateOfBirth ?? arg.dateOfBirth ?? "",
          gender: raw.gender ?? arg.gender,
          socialLinks: socialLinksOf(raw),
        };
      },
      invalidatesTags: ["Profile"],
    }),

    getAccountStatus: builder.query<AccountStatus, void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const [profileResult, reportsResult] = await Promise.all([
          fetchWithBQ(`/user-profiles/me`),
          fetchWithBQ(`/reports/mine?size=100`),
        ]);
        if (profileResult.error) return { error: profileResult.error };
        const raw = profileResult.data as UserProfileApiResponse;
        const reports = !reportsResult.error
          ? (reportsResult.data as { content?: ReportApiResponse[] } | undefined)?.content ?? []
          : [];

        const { total, valid } = reportCountsOf(raw, reports);
        return {
          data: {
            memberSince: memberSinceOf(raw.createdAt, ""),
            totalSubmissions: total,
            acceptedReports: valid,
            reputationPoints: raw.reputation ?? 0,
            acceptanceRate: acceptedRateOf(total, valid),
            phone: raw.phone,
            dateOfBirth: raw.dateOfBirth,
            gender: raw.gender,
          },
        };
      },
      providesTags: ["Profile"],
    }),

    getMyFollows: builder.query<{ counts: FollowingCounts; items: FollowRecord[] }, void>({
      query: () => `/follows/mine?size=100`,
      transformResponse: (raw: { content?: FollowRecord[] }) => {
        const items = raw.content ?? [];
        const counts: FollowingCounts = { hackers: 0, orgs: 0, topics: 0 };
        for (const item of items) {
          if (item.followableType === "USER") counts.hackers += 1;
          else if (item.followableType === "ORGANIZATION") counts.orgs += 1;
          else counts.topics += 1;
        }
        return { counts, items };
      },
      providesTags: ["Profile"],
    }),

    getFollowers: builder.query<{ total: number; items: FollowRecord[] }, string>({
      query: (userId) => `/follows/USER/${userId}/followers?size=100`,
      transformResponse: (raw: {
        content?: {
          userId?: string;
          fullName?: string;
          avatarUrl?: string | null;
          followedAt?: string;
        }[];
        totalElements?: number;
      }) => {
        const items: FollowRecord[] = (raw.content ?? [])
          /* A row with no id cannot be keyed, linked or followed back. */
          .filter((follower) => Boolean(follower.userId))
          .map((follower) => ({
            id: follower.userId as string,
            followableType: "USER",
            followableId: follower.userId as string,
            createdAt: follower.followedAt ?? "",
            displayName: follower.fullName?.trim() || undefined,
            avatarUrl: follower.avatarUrl || undefined,
          }));

        return { total: raw.totalElements ?? items.length, items };
      },
      providesTags: ["Profile"],
    }),

    getUserFollowing: builder.query<{ counts: FollowingCounts; items: FollowRecord[] }, string>({
      query: (userId) => `/follows/users/${userId}/following?size=100`,
      transformResponse: (raw: { content?: FollowRecord[] }) => {
        const items = raw.content ?? [];
        const counts: FollowingCounts = { hackers: 0, orgs: 0, topics: 0 };
        for (const item of items) {
          if (item.followableType === "USER") counts.hackers += 1;
          else if (item.followableType === "ORGANIZATION") counts.orgs += 1;
          else counts.topics += 1;
        }
        return { counts, items };
      },
      providesTags: ["Profile"],
    }),

    getFollowingUsers: builder.query<
      FollowingUsersResponse,
      {
        userId: string;
        pageNumber?: number;
        pageSize?: number;
      }
    >({
      query: ({ userId, pageNumber = 0, pageSize = 20 }) => ({
        url: `/follows/users/${userId}/following/users`,
        params: {
          pageNumber,
          pageSize,
        },
      }),
      transformResponse: (raw: FollowingUsersResponse): FollowingUsersResponse => ({
        ...raw,
        content: Array.isArray(raw.content)
          ? raw.content.map((user) => ({
              ...user,
              fullName: user.fullName?.trim() || "Unknown user",
              avatarUrl: user.avatarUrl || null,
              biography: user.biography?.trim() || null,
              followerCount: user.followerCount ?? 0,
              following: Boolean(user.following),
            }))
          : ([] as FollowingUser[]),
      }),
      providesTags: ["Profile"],
    }),

    getFollowSummary: builder.query<
      { followableType: string; followableId: string; followerCount: number; following: boolean },
      { type: string; targetId: string }
    >({
      query: ({ type, targetId }) => `/follows/${type}/${targetId}/summary`,
      providesTags: ["Profile"],
    }),

    followTarget: builder.mutation<FollowRecord, { type: string; targetId: string }>({
      query: ({ type, targetId }) => ({
        url: `/follows/${type}/${targetId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Profile"],
    }),

    unfollowTarget: builder.mutation<void, { type: string; targetId: string }>({
      query: ({ type, targetId }) => ({
        url: `/follows/${type}/${targetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),

    uploadCoverImage: builder.mutation<UserProfileApiResponse, FormData>({
      query: (body) => ({
        url: "/user-profiles/me/cover",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),

    removeCoverImage: builder.mutation<UserProfileApiResponse, void>({
      query: () => ({
        url: "/user-profiles/me/cover",
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),

    getPublicProfiles: builder.query<
      PagePublicUserProfileResponse,
      { query?: string; pageNumber?: number; pageSize?: number } | void
    >({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.query) search.set("query", params.query);
        if (params?.pageNumber !== undefined) search.set("pageNumber", String(params.pageNumber));
        if (params?.pageSize !== undefined) search.set("pageSize", String(params.pageSize));
        const q = search.toString();
        return `/user-profiles${q ? `?${q}` : ""}`;
      },
      providesTags: ["Profile"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetProfileByUsernameQuery,
  useGetPublicProfilesQuery,
  useGetCommunityPostsQuery,
  useGetThanksQuery,
  useGetEditProfileFormQuery,
  useGetProfileProvisioningStatusQuery,
  useUpdateProfileMutation,
  useUploadCoverImageMutation,
  useRemoveCoverImageMutation,
  useGetAccountStatusQuery,
  useGetMyFollowsQuery,
  useGetFollowersQuery,
  useGetUserFollowingQuery,
  useGetFollowingUsersQuery,
  useGetFollowSummaryQuery,
  useFollowTargetMutation,
  useUnfollowTargetMutation,
} = profileApi;
