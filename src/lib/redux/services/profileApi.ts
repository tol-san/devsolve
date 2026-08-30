import { baseApi } from "./baseApi";
import {
  Profile,
  ProfileStats,
  SeverityStats,
  ProfileBadge,
  Severity,
  HacktivityEntry,
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
import {
  mockProfile,
  mockEditProfileFormData,
} from "@/lib/types/profile/mock-data";

interface ProfileOverviewResponse {
  profile: Profile;
  stats: ProfileStats;
  severity: SeverityStats;
  badges: ProfileBadge[];
}

// Real shape of GET/PATCH /api/v1/user-profiles/me (confirmed against the live
// OpenAPI spec at devsolve-api.quizzy.it.com/v3/api-docs). The backend has no
// public username lookup, no badges/hacktivity/community/thanks/following
// endpoints — only the signed-in user's own profile.
interface UserProfileApiResponse {
  id: string;
  /** The published handle. Absent on records predating it. */
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  biography?: string;
  phone?: string;
  avatarUrl?: string;
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
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  /**
   * `GET /user-profiles/{userId}` answers with PublicUserProfileResponse, not
   * the shape above: it carries only id, fullName, biography, avatarUrl,
   * country, socialLinks, the four counters, and `joinedAt`. Everything else
   * here — email, firstName/lastName, phone, dateOfBirth, gender, status,
   * createdAt — is private and absent for anyone but the signed-in user.
   */
  joinedAt?: string;
}

// Real shape of GET /api/v1/reports/mine content items (per the live OpenAPI
// spec). No program/organization display name is included anywhere on this
// object — only programId — so it has to be resolved separately per report.
interface ReportApiResponse {
  id: string;
  programId: string;
  severity?: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  state: "NEW" | "TRIAGING" | "NEEDS_MORE_INFO" | "VALID_CONFIRMED" | "RESOLVED" | "REJECTED" | "DUPLICATE";
  rewards?: { amount: number }[];
  submittedAt?: string;
  resolvedAt?: string;
}

// Real shape of GET /api/v1/programs/{id} — only the fields used to enrich
// a hacktivity entry with a display name.
interface ProgramApiResponse {
  id: string;
  name: string;
}

// Real shape of GET /api/v1/problems/mine content items. There's no distinct
// "Solutions" or "Discussion" post type on the backend — those are solutions
// and comments attached to a problem, not standalone posts — so only problems
// map cleanly onto CommunityPost's card shape (title/description/votes/views).
interface ProblemApiResponse {
  id: string;
  title: string;
  description?: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "RESOLVED" | "CLOSED" | "REJECTED";
  viewCount?: number;
  publishedAt?: string;
  createdAt?: string;
}

// Real shape of GET /api/v1/user-profiles/{userId}/solutions content items.
// `summary` is the one-line heading the author wrote; `isAccepted` is the
// asker having picked this answer, which is separate from moderation.
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

// Real shape of GET /api/v1/user-profiles/{userId}/showcases content items
// (ShowCasesSummaryResponse), trimmed to what a portfolio card shows.
interface ShowcaseApiResponse {
  id: string;
  title: string;
  overview?: string;
  coverImageUrl?: string;
  reviewStatus?: "PENDING" | "APPROVED" | "REJECTED";
  viewCount?: number;
  createdAt?: string;
}

// Real shape of GET /api/v1/votes/{type}/{targetId}/summary — `score` is the
// net (upvotes - downvotes) count, which is what the vote-count UI expects.
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


/**
 * How many of each kind of post a portfolio pulls. Votes are not embedded in
 * any of the three list responses, so this is also the bound on the per-item
 * enrichment fan-out behind the community tab.
 */
const PORTFOLIO_PAGE_SIZE = 10;

/**
 * Problem descriptions, solution bodies and showcase overviews are all
 * markdown. The card clamps them to two lines, where `##` and `[a](b)` read as
 * noise rather than as formatting.
 */
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

/** The opening sentence, for content that has no title of its own. */
function firstLine(text: string, max = 90): string {
  const opening = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return opening.length > max ? `${opening.slice(0, max).trimEnd()}…` : opening;
}

// socialLinks comes back as a flat platform/url array — map the platforms our
// UI actually has fields for onto SocialLinksForm. "X" is the platform's name
// for what our UI calls "twitter". FACEBOOK/TELEGRAM/OTHER have no field in
// this app's UI (see ProfileBio.tsx, BioSocialSection.tsx) so they're dropped
// on read; toSocialLinksPayload only ever writes the four platforms below, so
// a link stored under one of those unsupported platforms elsewhere would be
// silently omitted the next time this app saves — same as before this app had
// any real social-links support at all.
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
      .slice(0, 2) || mockProfile.avatarInitials
  );
}

function fullNameOf(raw: UserProfileApiResponse, fallback: string): string {
  return raw.fullName || [raw.firstName, raw.lastName].filter(Boolean).join(" ") || fallback;
}

/**
 * The API exposes no username, so the one in profile URLs is the local part of
 * the email. It is a display handle only — never send it anywhere the backend
 * expects a `userId`.
 */
/**
 * The account's handle.
 *
 * The backend publishes one now. Deriving it from the email is kept only for
 * records written before that existed — and it was never more than a guess:
 * two people whose addresses differ only by domain derive the same name, and
 * the email is returned for the signed-in user alone, so everybody else came
 * out blank.
 */
function usernameOf(raw: UserProfileApiResponse, fallback: string): string {
  if (raw.username?.trim()) return raw.username.trim();
  return raw.email ? raw.email.split("@")[0] : fallback;
}

/** Tells a real `userId` path segment from a derived username. */
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

// Derives the severity-breakdown bars and rejected/duplicate/retest counters
// from the user's own reports (GET /reports/mine) — there's no dedicated
// stats-breakdown endpoint, so this is computed client-side. Rejected/duplicate
// reports are counted separately from the severity bars rather than double
// counted. There's no retest endpoint at all yet, so `retests` is always 0 —
// a real "nothing tracked" rather than a fabricated placeholder count.
function severityStatsOf(reports: ReportApiResponse[]): SeverityStats {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, rejected: 0, duplicate: 0 };
  for (const report of reports) {
    if (report.state === "REJECTED") counts.rejected += 1;
    else if (report.state === "DUPLICATE") counts.duplicate += 1;
    else if (report.severity === "CRITICAL") counts.critical += 1;
    else if (report.severity === "HIGH") counts.high += 1;
    else if (report.severity === "MEDIUM") counts.medium += 1;
    else if (report.severity === "LOW") counts.low += 1;
  }
  return { ...counts, retests: 0 };
}

function totalEarnedOf(reports: ReportApiResponse[]): number {
  return reports.reduce((sum, report) => sum + (report.rewards?.reduce((s, reward) => s + (reward.amount ?? 0), 0) ?? 0), 0);
}

// Shared by toProfileOverview and getAccountStatus so the submission/accepted
// counts shown on the profile page and the Settings sidebar can't drift apart.
// raw.totalReports/validReports are trusted when present; reports.length is
// only a fallback for when the profile response omits them.
function reportCountsOf(raw: UserProfileApiResponse, reports: ReportApiResponse[]) {
  const total = raw.totalReports ?? reports.length;
  const valid = raw.validReports ?? reports.filter((r) => r.state === "RESOLVED" || r.state === "VALID_CONFIRMED").length;
  return { total, valid };
}

function toProfileOverview(
  raw: UserProfileApiResponse,
  social: { followers: number; following: number },
  reports: ReportApiResponse[],
  isOwnProfile: boolean
): ProfileOverviewResponse {
  const displayName = fullNameOf(raw, "DevSolve user");
  const { total: totalReports, valid: validReports } = reportCountsOf(raw, reports);

  /* Deliberately not spread over `mockProfile`. Doing that quietly backfilled
     every field the response didn't carry, and a public profile is missing ten
     of them — so another researcher's page showed the mock's username, bio,
     location and join date, and inherited its `isOwnProfile: true`, which put
     owner-only controls on a stranger's profile and made the followers and
     following tabs load the viewer's own lists. Absent data now reads as
     absent. */
  const profile: Profile = {
    id: raw.id,
    // Derived from the email, which only `/me` returns — blank for everyone
    // else, since there is no username on the API at all.
    username: usernameOf(raw, ""),
    displayName,
    avatarInitials: initialsOf(displayName),
    avatarUrl: raw.avatarUrl,
    bio: raw.biography || "",
    location: raw.country || undefined,
    // Public profiles carry `joinedAt`; `/me` carries `createdAt`.
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
    // No leaderboard/rank endpoint exists yet — omitted rather than faked.
    globalRank: undefined,
    reportsSubmitted: totalReports,
    accepted: validReports,
    acceptedRate: acceptedRateOf(totalReports, validReports),
    // Rewards live on the reports themselves, and `/reports/mine` is the only
    // endpoint that returns any — so this is unknowable for another user.
    totalEarned: isOwnProfile ? totalEarnedOf(reports) : 0,
  };

  /* Same limitation: a per-severity breakdown needs the individual reports.
     The public profile exposes one aggregate, `criticalReports`, so that is
     the only band that can be filled in. */
  const severity = isOwnProfile
    ? severityStatsOf(reports)
    : {
        critical: raw.criticalReports ?? 0,
        high: 0,
        medium: 0,
        low: 0,
        rejected: 0,
        duplicate: 0,
        retests: 0,
      };

  // No badges endpoint exists yet — an empty grid is honest; the mock badge
  // set was fabricated achievement data with no backing from the backend.
  return { profile, stats, severity, badges: [] };
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Resolves the `[username]` route segment to a profile.
     *
     * The API keys profiles on a UUID (`GET /user-profiles/{userId}`) and
     * returns no username field at all — the one in our URLs is derived from
     * the email by `usernameOf`. So a segment that is not a UUID is a name
     * only we know about, and handing it to `/user-profiles/{userId}` makes
     * the backend reject it as a malformed UUID with a 400 before it looks
     * anything up. The shape is therefore checked here, and a derived name is
     * resolved against `/user-profiles/me`, the one place it can be matched.
     */
    getProfileByUsername: builder.query<ProfileOverviewResponse, string>({
      async queryFn(username, _api, _extraOptions, fetchWithBQ) {
        const isMeRoute = !username || username === "me";
        const isUserId = !isMeRoute && UUID_PATTERN.test(username);

        /* Three ways in, and each is a real lookup. The handle used to be the
           odd one out: with no way to resolve it, the query fetched `/me` and
           checked whether the segment matched a name derived from that
           account's email — so a handle only ever resolved for the person
           already signed in, and everybody else's URL answered 404. */
        const path = isMeRoute
          ? "/user-profiles/me"
          : isUserId
            ? `/user-profiles/${username}`
            : `/user-profiles/by-username/${encodeURIComponent(username)}`;

        const profileResult = await fetchWithBQ(path);

        /* Errors are passed through rather than answered with a stand-in
           profile. A 404 here means the backend has no record for that id, and
           filling the page with mock reputation, badges and severity stats
           attributed it all to a person who does not exist — a reader had no
           way to tell invented numbers from real ones. The screens tell the
           two cases apart from this status. */
        if (profileResult.error) {
          return { error: profileResult.error };
        }

        const raw = profileResult.data as UserProfileApiResponse;

        /* `me` is the only route that is self by construction. A handle or an
           id may well be the viewer's own, but proving it needs the session,
           which the profile screens hold and this query does not — they widen
           this before rendering owner controls. */
        const isSelf = isMeRoute;

        /* Reports are confidential: `/reports/mine` is the only per-user report
           endpoint the API has, so there is nothing to fetch for anyone else.
           This used to fall back to `/user-profiles/{id}/problems` and read the
           result as reports — but problems carry `status`, not `state`, and no
           `severity` or `rewards`, so every field derived from them came out
           empty anyway. It just cost a 100-row request to produce zeros. */
        const [followingResult, followersResult, reportsResult] = await Promise.all([
          fetchWithBQ(isSelf ? `/follows/mine?size=1` : `/follows/users/${raw.id}/following?size=1`),
          fetchWithBQ(`/follows/USER/${raw.id}/followers?size=1`),
          isSelf ? fetchWithBQ(`/reports/mine?size=100`) : Promise.resolve(null),
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

        return {
          data: toProfileOverview(
            raw,
            {
              followers: followersCount ?? 0,
              following: followingCount ?? 0,
            },
            reports,
            isSelf
          ),
        };
      },
      providesTags: ["Profile"],
    }),

    getHacktivity: builder.query<HacktivityEntry[], string>({
      async queryFn(username, _api, _extraOptions, fetchWithBQ) {
        /* This is built from `/reports/mine`, which is the signed-in user's
           own reports and takes no user parameter — the API exposes no
           per-user report endpoint, because reports are confidential. The
           argument used to be ignored outright, so opening anyone else's
           profile rendered the *viewer's* reports under their name. A UUID
           segment means another user, and there is nothing to show. */
        if (UUID_PATTERN.test(username)) {
          return { data: [] };
        }

        const reportsResult = await fetchWithBQ(`/reports/mine?size=50&sort=submittedAt,DESC`);
        if (reportsResult.error) return { error: reportsResult.error };

        const resolved = (
          (reportsResult.data as { content?: ReportApiResponse[] } | undefined)?.content ?? []
        ).filter((report) => report.state === "RESOLVED");

        const programIds = Array.from(new Set(resolved.map((report) => report.programId).filter(Boolean)));
        const programResults = await Promise.all(programIds.map((id) => fetchWithBQ(`/programs/${id}`)));
        const programNames = new Map<string, string>();
        programIds.forEach((id, index) => {
          const result = programResults[index];
          if (!result.error) programNames.set(id, (result.data as ProgramApiResponse).name);
        });

        const entries: HacktivityEntry[] = resolved
          .map((report) => ({
            id: report.id,
            type: "resolved" as const,
            actorHandle: `@${username}`,
            date: report.resolvedAt || report.submittedAt || new Date().toISOString(),
            severity: report.severity && report.severity !== "NONE" ? (report.severity.toLowerCase() as Severity) : undefined,
            program: programNames.get(report.programId) ?? "Unknown Program",
            bounty: report.rewards?.length ? report.rewards.reduce((sum, reward) => sum + (reward.amount ?? 0), 0) : undefined,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { data: entries };
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
            fetchWithBQ(`/user-profiles/${userId}/showcases${query}`),
          ]);

        const contentOf = <T,>(result: { data?: unknown; error?: unknown }) =>
          result.error
            ? []
            : ((result.data as { content?: T[] } | undefined)?.content ?? []);

        /* Drafts, pending-approval and rejected problems are not community
           content — only what someone can actually open is listed. */
        const problems = contentOf<ProblemApiResponse>(problemsResult).filter(
          (problem) =>
            problem.status === "PUBLISHED" ||
            problem.status === "RESOLVED" ||
            problem.status === "CLOSED",
        );
        const solutions = contentOf<SolutionApiResponse>(solutionsResult);
        const showcases = contentOf<ShowcaseApiResponse>(showcasesResult);

        /* Every list failed — report it rather than showing an empty tab that
           looks like "this person has posted nothing". */
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
              /* The author's own summary is the heading. Its opening line
                 stands in for answers posted before that field existed. */
              title: solution.summary?.trim() || firstLine(body) || "Solution",
              description: body,
              tag: "Solutions",
              votes: scoreOf(solutionVotes[index]) || solution.voteScore || 0,
              status: solution.isAccepted
                ? { label: "Accepted", tone: "positive" }
                : solution.moderation?.status === "PENDING"
                  ? { label: "Pending review", tone: "pending" }
                  : undefined,
              date: solution.createdAt || new Date().toISOString(),
              /* Solutions are read on the problem they answer. */
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
            votes: scoreOf(showcaseVotes[index]),
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

    // No backend endpoint yet — mocked until a hall-of-thanks API exists.
    /* The API has no thanks/recognition endpoint — only the `recognitionCount`
       aggregate on the profile — so there is nothing to read. It returned a
       fixed mock list, which put the same invented names and messages on every
       profile including strangers'. An empty tab is at least true. */
    getThanks: builder.query<ThanksEntry[], string>({
      queryFn: () => ({ data: [] as ThanksEntry[] }),
      providesTags: ["Profile"],
    }),

    /**
     * The first authenticated request after login, which is what makes the
     * backend create the user's profile row — for social sign-ups there is no
     * registration call, so this is the only thing that provisions them.
     *
     * `strict=1` keeps the proxy from papering a 404 over with a synthesised
     * profile: here a 404 is the whole signal, meaning authenticated but
     * unprovisioned, i.e. a backend/Keycloak misconfiguration.
     */
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

    // firstName/lastName/biography/phone/avatarUrl/dateOfBirth/gender/country
    // are real, persisted fields (per UpdateUserProfileRequest). username, email,
    // socialLinks, 2FA, and notification prefs have no backend support yet and are
    // kept client-side only.
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

    // Same totalSubmissions/acceptedReports derivation as toProfileOverview
    // (via reportCountsOf) so the Settings sidebar never disagrees with the
    // main profile page's numbers.
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
            memberSince: memberSinceOf(raw.createdAt, mockProfile.memberSince),
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

    // GET /api/v1/follows/mine — always the signed-in user's own follows (same
    // "me only" constraint as /user-profiles/me). Fetched at a large page size
    // so the counts pills reflect what's actually in the list rather than just
    // the first page; there's no documented filter-by-type query param yet.
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

    // GET /api/v1/follows/{type}/{targetId}/followers — who follows a given
    // followable target. Takes the target's real user id (from getProfileByUsername's
    // `profile.id`, itself sourced from /user-profiles/me) rather than a username,
    // since the backend has no username-based lookup.
    /**
     * Who follows this account.
     *
     * The page returns `FollowerResponse` — `userId`, `fullName`, `avatarUrl`,
     * `followedAt` — which is not the shape of a `FollowRecord`. It used to be
     * handed straight through under that name, so every field the list reads
     * arrived `undefined`: React warned about missing keys, and the item
     * crashed outright on `record.id.slice()` while building a fallback name.
     *
     * There is no username on this payload, so a follower is addressed by id.
     * The profile route resolves a UUID as readily as a handle.
     */
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

    // GET /api/v1/follows/users/{userId}/following — entities followed by a specific user
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

    // GET /api/v1/follows/{type}/{targetId}/summary — status & follower count
    getFollowSummary: builder.query<
      { followableType: string; followableId: string; followerCount: number; following: boolean },
      { type: string; targetId: string }
    >({
      query: ({ type, targetId }) => `/follows/${type}/${targetId}/summary`,
      providesTags: ["Profile"],
    }),

    // PUT /api/v1/follows/{type}/{targetId} — follow an entity
    followTarget: builder.mutation<FollowRecord, { type: string; targetId: string }>({
      query: ({ type, targetId }) => ({
        url: `/follows/${type}/${targetId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Profile"],
    }),

    // DELETE /api/v1/follows/{type}/{targetId} — unfollow an entity
    unfollowTarget: builder.mutation<void, { type: string; targetId: string }>({
      query: ({ type, targetId }) => ({
        url: `/follows/${type}/${targetId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),

    // PUT /api/v1/user-profiles/me/cover — upload cover image
    uploadCoverImage: builder.mutation<UserProfileApiResponse, FormData>({
      query: (body) => ({
        url: "/user-profiles/me/cover",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),

    // DELETE /api/v1/user-profiles/me/cover — remove cover image
    removeCoverImage: builder.mutation<UserProfileApiResponse, void>({
      query: () => ({
        url: "/user-profiles/me/cover",
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
    }),

    // GET /api/v1/user-profiles — search / list public profiles
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
  useGetHacktivityQuery,
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
