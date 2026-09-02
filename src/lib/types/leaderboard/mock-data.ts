import {
  LeaderboardCountryOption,
  LeaderboardEntry,
  LeaderboardHighlight,
  LeaderboardPeriod,
  LeaderboardStats,
  REPUTATION_POINTS,
  SeverityLabel,
} from "./types";

/* Deterministic PRNG — the same seed always yields the same board, so the
   server render and the client render never disagree. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Person = {
  username: string;
  displayName: string;
  countryCode: string;
  countryName: string;
};

/** Roster only — every number below is generated, never hand-written, so the
 *  totals stay internally consistent (valid ≤ total, severities sum to valid). */
const PEOPLE: Person[] = [
  { username: "darkp4tch", displayName: "Amara Diallo", countryCode: "SN", countryName: "Senegal" },
  { username: "n1ghtw0lf", displayName: "Ivan Petrov", countryCode: "RU", countryName: "Russia" },
  { username: "cipherqueen", displayName: "Lin Xiaoyu", countryCode: "CN", countryName: "China" },
  { username: "byte_reaper", displayName: "Diego Alvarez", countryCode: "MX", countryName: "Mexico" },
  { username: "ghostsh3ll", displayName: "Fatima Noor", countryCode: "PK", countryName: "Pakistan" },
  { username: "sok_vireak", displayName: "Sok Vireak", countryCode: "KH", countryName: "Cambodia" },
  { username: "h4ck_atlas", displayName: "Pavel Novikov", countryCode: "RU", countryName: "Russia" },
  { username: "seoyeon", displayName: "Seo Yeon Park", countryCode: "KR", countryName: "South Korea" },
  { username: "v3ct0r_x", displayName: "Riya Sharma", countryCode: "IN", countryName: "India" },
  { username: "shellsh0ck", displayName: "Tobias Müller", countryCode: "DE", countryName: "Germany" },
  { username: "pixelp0wn", displayName: "Yasmine Cherkaoui", countryCode: "MA", countryName: "Morocco" },
  { username: "deadc0de", displayName: "Arjun Kapoor", countryCode: "IN", countryName: "India" },
  { username: "bl4ckm1rror", displayName: "Sofia Andersson", countryCode: "SE", countryName: "Sweden" },
  { username: "zeroway", displayName: "Tariq Hassan", countryCode: "EG", countryName: "Egypt" },
  { username: "exploit_echo", displayName: "Mei Lin Chen", countryCode: "TW", countryName: "Taiwan" },
  { username: "chan_dara", displayName: "Chan Dara", countryCode: "KH", countryName: "Cambodia" },
  { username: "nullstack", displayName: "Grace Okonkwo", countryCode: "NG", countryName: "Nigeria" },
  { username: "raccoon_dev", displayName: "Lucas Ferreira", countryCode: "BR", countryName: "Brazil" },
  { username: "s3gfault", displayName: "Hana Yamamoto", countryCode: "JP", countryName: "Japan" },
  { username: "kernelkate", displayName: "Kate O'Neill", countryCode: "IE", countryName: "Ireland" },
  { username: "phantombit", displayName: "Omar Haddad", countryCode: "JO", countryName: "Jordan" },
  { username: "quietfuzz", displayName: "Elin Bakken", countryCode: "NO", countryName: "Norway" },
  { username: "srey_pich", displayName: "Srey Pich", countryCode: "KH", countryName: "Cambodia" },
  { username: "overflow_ana", displayName: "Ana Kovač", countryCode: "SI", countryName: "Slovenia" },
  { username: "tracebackt", displayName: "Marcus Bennett", countryCode: "GB", countryName: "United Kingdom" },
  { username: "kh4nti", displayName: "Khan Piseth", countryCode: "KH", countryName: "Cambodia" },
  { username: "saltyhash", displayName: "Priya Menon", countryCode: "IN", countryName: "India" },
  { username: "wraith_io", displayName: "Nikolai Sorokin", countryCode: "RU", countryName: "Russia" },
  { username: "cve_hunter", displayName: "Daniel Weiss", countryCode: "DE", countryName: "Germany" },
  { username: "mirrorbyte", displayName: "Zara Ahmed", countryCode: "AE", countryName: "United Arab Emirates" },
  { username: "loopback_lu", displayName: "Lu Wei", countryCode: "CN", countryName: "China" },
  { username: "packetpilot", displayName: "Emma Laurent", countryCode: "FR", countryName: "France" },
  { username: "silent_sam", displayName: "Samuel Adeyemi", countryCode: "NG", countryName: "Nigeria" },
  { username: "heapspray", displayName: "Bogdan Ilie", countryCode: "RO", countryName: "Romania" },
  { username: "thea_scan", displayName: "Thea Nilsen", countryCode: "NO", countryName: "Norway" },
  { username: "rootkitrio", displayName: "Rio Santoso", countryCode: "ID", countryName: "Indonesia" },
  { username: "bitflipper", displayName: "Carlos Mendez", countryCode: "MX", countryName: "Mexico" },
  { username: "sandboxed", displayName: "Aoife Byrne", countryCode: "IE", countryName: "Ireland" },
  { username: "vuln_vera", displayName: "Vera Lindqvist", countryCode: "SE", countryName: "Sweden" },
  { username: "keo_sophea", displayName: "Keo Sophea", countryCode: "KH", countryName: "Cambodia" },
  { username: "hexhunter", displayName: "Youssef Amrani", countryCode: "MA", countryName: "Morocco" },
  { username: "obsidian_q", displayName: "Quang Trần", countryCode: "VN", countryName: "Vietnam" },
];

/** The signed-in researcher, so "your rank" has something to point at. */
export const CURRENT_USERNAME = "kh4nti";

/** Volume multiplier per window — a week's board is naturally sparse. */
const PERIOD_SCALE: Record<LeaderboardPeriod, number> = {
  all: 1,
  month: 0.16,
  week: 0.045,
};

/** Shorter windows shuffle harder: a quiet month can sink a top researcher. */
const PERIOD_NOISE: Record<LeaderboardPeriod, number> = {
  all: 0.16,
  month: 0.62,
  week: 0.95,
};

const PERIOD_SEED: Record<LeaderboardPeriod, number> = {
  all: 1013,
  month: 5387,
  week: 9241,
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function topSeverityOf(critical: number, high: number, medium: number): SeverityLabel {
  if (critical > 0) return "Critical";
  if (high > 0) return "High";
  if (medium > 0) return "Medium";
  return "Low";
}

type RawEntry = Omit<LeaderboardEntry, "rank" | "previousRank">;

function buildRawEntry(person: Person, index: number, period: LeaderboardPeriod): RawEntry {
  const rand = mulberry32(index * 7919 + PERIOD_SEED[period]);
  const noise = PERIOD_NOISE[period];

  // Roster order sets baseline strength; noise decides how far a window
  // can move someone away from it.
  const baseline = 1 - index / PEOPLE.length;
  const factor = Math.max(0.04, baseline * (1 - noise / 2) + rand() * noise);

  const totalReports = Math.max(
    1,
    Math.round((12 + factor * 168) * PERIOD_SCALE[period]),
  );
  const validRate = 0.52 + rand() * 0.4; // 52–92% of submissions hold up
  const validReports = Math.max(1, Math.round(totalReports * validRate));

  const critical = Math.round(validReports * (0.04 + rand() * 0.13));
  const high = Math.round(validReports * (0.16 + rand() * 0.18));
  const medium = Math.round(validReports * (0.22 + rand() * 0.16));
  const low = Math.max(0, validReports - critical - high - medium);

  const recognitionCount = Math.round(
    critical * (0.5 + rand() * 0.9) + high * 0.18 + rand() * 2,
  );

  /* Severity alone. Recognition is public credit and pays no reputation, so
     the term for it was dropped rather than zeroed — this fixture is only a
     plausible-looking stand-in, and the real board reads `reputation` from
     the API rather than deriving it from counts. */
  const reputation =
    critical * REPUTATION_POINTS.critical +
    high * REPUTATION_POINTS.high +
    medium * REPUTATION_POINTS.medium +
    low * REPUTATION_POINTS.low;

  return {
    id: `${person.username}-${period}`,
    username: person.username,
    displayName: person.displayName,
    avatarInitials: initials(person.displayName),
    countryCode: person.countryCode,
    countryName: person.countryName,
    reputation,
    totalReports: period === "all" ? totalReports : null,
    validReports: period === "all" ? validReports : null,
    criticalReports: critical,
    recognitionCount,
    severity: { critical, high, medium, low },
    topSeverity: topSeverityOf(critical, high, medium),
    isCurrentUser: person.username === CURRENT_USERNAME,
  };
}

function rankEntries(period: LeaderboardPeriod): LeaderboardEntry[] {
  const raw = PEOPLE.map((person, i) => buildRawEntry(person, i, period));

  // Previous window: the same generator one seed step back, ranked on its own.
  const previous = PEOPLE.map((person, i) =>
    buildRawEntry(person, i, period),
  ).map((entry, i) => ({
    username: entry.username,
    score: entry.reputation * (0.7 + mulberry32(i * 104729 + PERIOD_SEED[period])() * 0.6),
  }));

  const previousRankByUser = new Map(
    [...previous]
      .sort((a, b) => b.score - a.score)
      .map((p, i) => [p.username, i + 1] as const),
  );

  return [...raw]
    .sort((a, b) => b.reputation - a.reputation || b.criticalReports - a.criticalReports)
    .map((entry, i) => ({
      ...entry,
      rank: i + 1,
      previousRank: previousRankByUser.get(entry.username) ?? null,
    }));
}

/** Boards are pure functions of the period, so they are computed once. */
const BOARDS: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
  all: rankEntries("all"),
  month: rankEntries("month"),
  week: rankEntries("week"),
};

export function getLeaderboardEntries(period: LeaderboardPeriod): LeaderboardEntry[] {
  return BOARDS[period];
}

export function getCountryOptions(
  period: LeaderboardPeriod,
): LeaderboardCountryOption[] {
  const counts = new Map<string, LeaderboardCountryOption>();
  for (const entry of BOARDS[period]) {
    const existing = counts.get(entry.countryCode);
    if (existing) existing.count += 1;
    else
      counts.set(entry.countryCode, {
        code: entry.countryCode,
        name: entry.countryName,
        count: 1,
      });
  }
  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getHighlights(period: LeaderboardPeriod): LeaderboardHighlight[] {
  const entries = BOARDS[period];

  const pick = (
    kind: LeaderboardHighlight["kind"],
    label: string,
    unit: string,
    score: (e: LeaderboardEntry) => number,
  ): LeaderboardHighlight => {
    const winner = entries.reduce((best, e) => (score(e) > score(best) ? e : best));
    return {
      kind,
      label,
      unit,
      value: score(winner),
      username: winner.username,
      displayName: winner.displayName,
      avatarUrl: winner.avatarUrl,
      avatarInitials: winner.avatarInitials,
    };
  };

  return [
    pick("valid", "Most valid reports", "valid", (e) => e.validReports ?? 0),
    pick("critical", "Most criticals found", "critical", (e) => e.criticalReports),
    pick("recognition", "Most recognized", "thanks", (e) => e.recognitionCount),
    pick("climb", "Biggest climber", "places", (e) =>
      e.previousRank ? Math.max(0, e.previousRank - e.rank) : 0,
    ),
  ];
}

export const mockLeaderboardStats: LeaderboardStats = {
  activeResearchers: PEOPLE.length,
  validReports: BOARDS.all.reduce((sum, e) => sum + (e.validReports ?? 0), 0),
  programsLive: 312,
};
