import {
  SEVERITIES,
  type DisclosureStatus,
  type HacktivityActivity,
  type HacktivityApiEntry,
  type HacktivityApiPage,
  type HacktivityFeed,
  type Researcher,
  type Reward,
  type Severity,
} from "@/lib/types/hacktivity/types";

export const DEFAULT_HACKTIVITY_PAGE_SIZE = 20;

export function severityOf(raw?: string | null): Severity | null {
  if (!raw) return null;
  const value = raw.toUpperCase() as Severity;
  return SEVERITIES.includes(value) ? value : null;
}

export function rewardOf(raw: HacktivityApiEntry["reward"]): Reward {
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

export function researcherOf(raw: HacktivityApiEntry["user"]): Researcher {
  const name = raw?.fullName?.trim();
  const username = raw?.username?.trim();

  return {
    username,
    name: name || username || "A researcher",
    avatarUrl: raw?.avatarUrl?.trim() || undefined,
    reputation:
      typeof raw?.reputation === "number" ? raw.reputation : undefined,
  };
}

export function toActivity(entry: HacktivityApiEntry): HacktivityActivity {
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
    title: isDisclosed ? entry.report?.title?.trim() || null : null,
    disclosureStatus,
    isDisclosed,
    reportId: entry.report?.id,
    recognition: entry.recognition
      ? {
          id: entry.recognition.id,
          title: entry.recognition.title?.trim(),
          description: entry.recognition.description?.trim(),
        }
      : null,
    reward: rewardOf(entry.reward),
  };
}

export function toFeed(
  page: HacktivityApiPage,
  fallbackSize = DEFAULT_HACKTIVITY_PAGE_SIZE,
): HacktivityFeed {
  const activities = (page.content ?? []).map(toActivity);

  return {
    activities,
    total: page.totalElements ?? activities.length,
    page: page.number ?? 0,
    totalPages: page.totalPages ?? 0,
    size: page.size ?? fallbackSize,
  };
}
