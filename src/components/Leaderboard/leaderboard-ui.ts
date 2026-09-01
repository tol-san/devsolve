import { LeaderboardPeriod, SeverityLabel } from "@/lib/types/leaderboard/types";

/* Brand palette — mirrors design.md and the landing page. */
export const PRIMARY = "#2563EB";
export const SECONDARY = "#1E293B";
export const ACCENT = "#10B981";

/** Medal tones for the top three — gold, violet-silver, coral-bronze.
 *
 *  Each place owns one hue across the whole feature: `podium.block` fills the
 *  pedestal, `podium.edge` draws its rim and the avatar ring, `soft` / `ink`
 *  tint the rank chip, and `ring` accents the table row. Saturation is pushed
 *  well past a wash so the board actually reads as a podium, while every ink
 *  pairing below still clears 4.5:1 on its own surface. Rank is stated in text
 *  too, so colour is never the only carrier. */
export const MEDALS = [
  {
    ring: "#D9A404",
    soft: "#FEF3C7",
    ink: "#7A5406",
    label: "1st",
    podium: {
      block: "#FBDD7A",
      edge: "#E9BE3F",
      heading: "#7A5406",
      figure: "#1E293B",
      muted: "#6E5312",
    },
  },
  {
    ring: "#8B84D6",
    soft: "#EEEBFB",
    ink: "#453D80",
    label: "2nd",
    podium: {
      block: "#C7C0F2",
      edge: "#A79BE8",
      heading: "#3F3583",
      figure: "#1E293B",
      muted: "#443A85",
    },
  },
  {
    ring: "#E4714F",
    soft: "#FDE7E1",
    ink: "#8E3520",
    label: "3rd",
    podium: {
      block: "#FBC0B4",
      edge: "#F09A87",
      heading: "#8E3520",
      figure: "#1E293B",
      muted: "#85321E",
    },
  },
] as const;

/** Severity ink — text-safe on white (all ≥ 4.5:1). */
export const SEVERITY_STYLES: Record<
  SeverityLabel,
  { text: string; chip: string }
> = {
  Critical: {
    text: "text-rose-700 dark:text-rose-400",
    chip: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  },
  High: {
    text: "text-orange-700 dark:text-orange-400",
    chip: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20",
  },
  Medium: {
    text: "text-amber-700 dark:text-amber-400",
    chip: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  },
  Low: {
    text: "text-muted-foreground",
    chip: "bg-muted text-muted-foreground ring-border",
  },
};

export const PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "month", label: "This month" },
  { value: "week", label: "This week" },
];

/** Compact period wording for eyebrows and inline captions. */
export const PERIOD_LABEL_SHORT: Record<LeaderboardPeriod, string> = {
  all: "All-time",
  month: "This month's",
  week: "This week's",
};

/** Points earned inside the window vs. cumulative — worth saying out loud,
 *  because the two answer different questions. */
export const PERIOD_CAPTION: Record<LeaderboardPeriod, string> = {
  all: "Cumulative reputation points earned since joining.",
  month: "Reputation points earned in the last 30 days.",
  week: "Reputation points earned in the last 7 days.",
};

export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

/** Stable tint per researcher so an avatar looks the same everywhere. */
const AVATAR_TINTS = [
  "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  "bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20",
  "bg-teal-50 text-teal-700 ring-teal-100 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20",
  "bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  "bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
  "bg-muted text-muted-foreground ring-border",
];

export function tintFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
}

export function profileHref(username: string) {
  return `/profile/${username}`;
}

/** Rank movement, expressed as a sign so it never depends on colour alone. */
export function rankDelta(rank: number, previousRank: number | null) {
  if (previousRank == null) return { direction: "new" as const, value: 0 };
  const value = previousRank - rank;
  if (value === 0) return { direction: "flat" as const, value: 0 };
  return { direction: value > 0 ? ("up" as const) : ("down" as const), value: Math.abs(value) };
}

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuid(val?: string | null): boolean {
  if (!val) return false;
  return UUID_REGEX.test(val.trim());
}

export function getCountryFlagCode(countryCode?: string, countryName?: string): string | null {
  const codeStr = countryCode?.trim().toLowerCase() ?? "";
  const nameStr = countryName?.trim().toLowerCase() ?? "";
  const combined = `${codeStr} ${nameStr}`;

  if (!combined.trim()) return null;

  if (codeStr.length === 2 && /^[a-z]{2}$/.test(codeStr)) {
    return codeStr;
  }

  if (nameStr.length === 2 && /^[a-z]{2}$/.test(nameStr)) {
    return nameStr;
  }

  if (combined.includes("cambodia") || combined.includes("phnom penh")) return "kh";
  if (combined.includes("united states") || combined.includes("usa") || combined.includes("america")) return "us";
  if (combined.includes("vietnam") || combined.includes("viet nam")) return "vn";
  if (combined.includes("thailand")) return "th";
  if (combined.includes("singapore")) return "sg";
  if (combined.includes("japan")) return "jp";
  if (combined.includes("united kingdom") || combined.includes("uk") || combined.includes("england") || combined.includes("britain")) return "gb";
  if (combined.includes("germany")) return "de";
  if (combined.includes("france")) return "fr";
  if (combined.includes("canada")) return "ca";
  if (combined.includes("australia")) return "au";
  if (combined.includes("india")) return "in";
  if (combined.includes("indonesia")) return "id";
  if (combined.includes("malaysia")) return "my";
  if (combined.includes("philippines")) return "ph";
  if (combined.includes("korea")) return "kr";
  if (combined.includes("china")) return "cn";

  return null;
}


