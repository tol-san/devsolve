import { baseApi } from "./baseApi";
import type {
  HacktivityActivity,
  HacktivityApiEntry,
  HacktivityApiPage,
  HacktivityFeedResponse,
  HacktivityQueryParams,
  HacktivitySeverity,
  HacktivityStat,
} from "@/lib/types/hacktivity/types";

export * from "@/lib/types/hacktivity/types";

/** One screenful of the stream. The upstream pages from zero. */
export const HACKTIVITY_PAGE_SIZE = 50;

const SEVERITY_LABELS: Record<string, HacktivitySeverity> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  NONE: "None",
};

/** The nested report carries the enum name, or nothing at all. */
function severityOf(raw?: string | null): HacktivitySeverity | null {
  if (!raw) return null;
  return SEVERITY_LABELS[raw.trim().toUpperCase()] ?? null;
}

function toRelativeDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMins = (Date.now() - date.getTime()) / 60_000;
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) {
    const mins = Math.floor(diffMins);
    return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  }
  const diffHrs = diffMins / 60;
  if (diffHrs < 24) {
    const hrs = Math.floor(diffHrs);
    return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(diffHrs / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Phrased to run into the program name the card prints in bold. */
function actionOf(
  entry: HacktivityApiEntry,
  severity: HacktivitySeverity | null,
): string {
  if (entry.recognition) return "was recognized by";
  const grade = severity && severity !== "None" ? `${severity} severity ` : "";
  return `disclosed a ${grade}finding in`;
}

function toActivity(entry: HacktivityApiEntry): HacktivityActivity {
  const severity = severityOf(entry.report?.severity);
  const title = entry.report?.title?.trim() || entry.recognition?.title?.trim();
  const recognition = entry.recognition?.title?.trim();

  return {
    id: entry.id,
    userId: entry.user?.id,
    handle: entry.user?.username?.trim() || "researcher",
    // Often unset: the card falls back to the handle initials.
    avatarUrl: entry.user?.avatarUrl?.trim() || undefined,
    label: entry.recognition ? "RECOGNITION" : "DISCLOSURE",
    action: actionOf(entry, severity),
    title,
    program:
      entry.program?.name?.trim() ||
      entry.organization?.name?.trim() ||
      "a private program",
    organization: entry.organization?.name?.trim(),
    severity,
    recognition: recognition && recognition !== title ? recognition : undefined,
    timeAgo: toRelativeDate(entry.createdAt),
    createdAt: entry.createdAt,
  };
}

const count = (value: number) => new Intl.NumberFormat("en-US").format(value);

/**
 * The badges above the feed.
 *
 * Only the disclosure count is global — the API publishes no aggregate, so
 * the rest count what this page of the stream actually carries.
 */
function statsOf(
  total: number,
  activities: HacktivityActivity[],
): HacktivityStat[] {
  const distinct = (values: (string | undefined)[]) =>
    new Set(values.filter((value): value is string => Boolean(value))).size;

  return [
    { label: "Disclosures", value: count(total) },
    {
      label: "Researchers",
      value: count(distinct(activities.map((a) => a.userId))),
    },
    { label: "Programs", value: count(distinct(activities.map((a) => a.program))) },
    {
      label: "Organizations",
      value: count(distinct(activities.map((a) => a.organization))),
    },
  ];
}

function toFeed(page: HacktivityApiPage): HacktivityFeedResponse {
  /* Newest first is ordered here rather than asked for with `sort`: the
     upstream would answer a property it does not know with a 500, and the
     timestamps are already on every row. */
  const activities = (page.content ?? [])
    .map(toActivity)
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    );

  return {
    stats: statsOf(page.totalElements ?? activities.length, activities),
    activities,
    total: page.totalElements ?? activities.length,
    page: page.number ?? 0,
    totalPages: Math.max(1, page.totalPages ?? 1),
  };
}

export const hacktivityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * The public stream. Searching and severity filtering happen on the
     * client: the endpoint takes neither, and a query parameter that only
     * changes the cache key would refetch the same page on every keystroke.
     */
    getHacktivityFeed: builder.query<
      HacktivityFeedResponse,
      HacktivityQueryParams | void
    >({
      query: (params) => {
        const { page = 0, size = HACKTIVITY_PAGE_SIZE } = params ?? {};
        return `/hacktivity?page=${Math.max(0, page)}&size=${size}`;
      },
      transformResponse: toFeed,
      providesTags: ["Post"],
    }),
  }),
});

export const { useGetHacktivityFeedQuery } = hacktivityApi;
