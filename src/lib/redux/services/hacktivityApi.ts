import { baseApi } from "./baseApi";
import type {
  DisclosureStatus,
  HacktivityActivity,
  HacktivityApiEntry,
  HacktivityApiPage,
  HacktivityFeed,
  HacktivityQueryParams,
  HacktivityStats,
  Researcher,
  Reward,
  Severity,
} from "@/lib/types/hacktivity/types";
import { SEVERITIES } from "@/lib/types/hacktivity/types";

export * from "@/lib/types/hacktivity/types";

/** The upstream caps a page at 100 and defaults to 10. */
export const HACKTIVITY_PAGE_SIZE = 20;

function severityOf(raw?: string | null): Severity | null {
  if (!raw) return null;
  const value = raw.toUpperCase() as Severity;
  return SEVERITIES.includes(value) ? value : null;
}

/**
 * A reward is money, points, or nothing — and the three read differently on a
 * card. `amount: null` with points is the points-only case the contract calls
 * out; collapsing it to zero would claim the researcher was paid nothing.
 */
function rewardOf(raw: HacktivityApiEntry["reward"]): Reward {
  if (!raw) return { kind: "none" };

  const amount = typeof raw.amount === "number" ? raw.amount : null;
  const points = typeof raw.points === "number" ? raw.points : null;

  if (amount !== null && amount > 0) {
    return {
      kind: "cash",
      amount,
      currency: raw.currency || "USD",
      points,
    };
  }
  if (points !== null && points > 0) return { kind: "points", points };
  return { kind: "none" };
}

function researcherOf(raw: HacktivityApiEntry["user"]): Researcher {
  const name = raw?.fullName?.trim();
  const username = raw?.username?.trim();

  return {
    username,
    /* `fullName` is what a person recognises. Falling back to the handle beats
       printing "Unknown", and the handle is what the link uses anyway. */
    name: name || username || "A researcher",
    avatarUrl: raw?.avatarUrl?.trim() || undefined,
    reputation:
      typeof raw?.reputation === "number" ? raw.reputation : undefined,
  };
}

function toActivity(entry: HacktivityApiEntry): HacktivityActivity {
  const disclosureStatus: DisclosureStatus =
    entry.report?.disclosureStatus ?? "NOT_DISCLOSED";
  const isDisclosed = disclosureStatus === "DISCLOSED";

  const programName = entry.program?.name?.trim();
  const organizationName = entry.organization?.name?.trim();
  const weakness = entry.report?.weakness;

  return {
    id: entry.id,
    eventType: entry.eventType,
    createdAt: entry.createdAt,
    researcher: researcherOf(entry.user),
    program: programName
      ? {
          id: entry.program?.id,
          name: programName,
          handle: entry.program?.handle?.trim() || undefined,
        }
      : undefined,
    organization: organizationName
      ? {
          id: entry.organization?.id,
          name: organizationName,
          slug: entry.organization?.slug?.trim() || undefined,
          logoUrl: entry.organization?.logoUrl?.trim() || undefined,
        }
      : undefined,
    severity: severityOf(entry.report?.severity),
    weakness:
      weakness?.cweId || weakness?.name
        ? { cweId: weakness.cweId, name: weakness.name }
        : undefined,
    /* The one place disclosure is enforced. An undisclosed title is dropped
       here rather than hidden in the markup, so no later change can leak it. */
    title: isDisclosed ? entry.report?.title?.trim() || null : null,
    disclosureStatus,
    isDisclosed,
    reportId: entry.report?.id,
    recognition: entry.recognition?.title?.trim() || undefined,
    reward: rewardOf(entry.reward),
  };
}

function toFeed(page: HacktivityApiPage): HacktivityFeed {
  const activities = (page.content ?? []).map(toActivity);

  return {
    activities,
    total: page.totalElements ?? activities.length,
    page: page.number ?? 0,
    totalPages: page.totalPages ?? 0,
    size: page.size ?? HACKTIVITY_PAGE_SIZE,
  };
}

/** Repeatable keys are appended, which is how the upstream reads them. */
function queryStringOf(params: HacktivityQueryParams): string {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  for (const severity of params.severity ?? []) search.append("severity", severity);
  for (const event of params.eventType ?? []) search.append("eventType", event);
  if (params.programId) search.set("programId", params.programId);
  if (params.organizationId) search.set("organizationId", params.organizationId);
  search.set("page", String(Math.max(0, params.page ?? 0)));
  search.set("size", String(params.size ?? HACKTIVITY_PAGE_SIZE));
  if (params.sort) search.set("sort", params.sort);

  return search.toString();
}

export const hacktivityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * The public stream. Every filter is a server parameter — the page used to
     * narrow the loaded page in the browser, which quietly meant searching
     * only what was already on screen.
     */
    getHacktivityFeed: builder.query<HacktivityFeed, HacktivityQueryParams | void>({
      query: (params) => `/hacktivity?${queryStringOf(params ?? {})}`,
      transformResponse: toFeed,
      providesTags: ["Post"],
    }),

    /** Platform-wide totals for the badges above the feed. */
    getHacktivityStats: builder.query<HacktivityStats, void>({
      query: () => "/hacktivity/stats",
      providesTags: ["Post"],
    }),

    /**
     * One researcher's activity, for the Hacktivity tab on a profile.
     *
     * Keyed on the profile's UUID, which is the only thing the endpoint
     * accepts. This used to be assembled from `/reports/mine` — the signed-in
     * user's own reports, which take no user parameter — so it could only ever
     * describe the viewer, and opening someone else's profile showed an empty
     * tab. It also saw nothing but resolved reports: recognitions, bounties
     * and disclosures are activity too, and they arrive here.
     */
    getUserHacktivity: builder.query<
      HacktivityFeed,
      { userId: string } & HacktivityQueryParams
    >({
      query: ({ userId, ...params }) =>
        `/user-profiles/${userId}/hacktivity?${queryStringOf(params)}`,
      transformResponse: toFeed,
      providesTags: ["Post"],
    }),
  }),
});

export const {
  useGetHacktivityFeedQuery,
  useGetHacktivityStatsQuery,
  useGetUserHacktivityQuery,
} = hacktivityApi;
