import type { EventType, Severity } from "@/lib/types/hacktivity/types";

/**
 * How the feed says things.
 *
 * Severity, money and the sentence on a card are decided once here so a card,
 * the featured strip and the filter chips cannot drift apart — and so severity
 * always ships with a word beside its colour.
 */

export interface SeverityStyle {
  label: string;
  /** The chip itself. Critical is solid; the rest are tinted. */
  chip: string;
  /** The rail down the left of a card. */
  rail: string;
  /** The chip while it is an active filter. */
  active: string;
}

export const SEVERITY_STYLE: Record<Severity, SeverityStyle> = {
  CRITICAL: {
    label: "Critical",
    chip: "bg-red-600 text-white dark:bg-red-500 dark:text-white",
    rail: "bg-red-500",
    active: "bg-red-600 text-white hover:bg-red-600/90 dark:bg-red-500",
  },
  HIGH: {
    label: "High",
    chip: "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/25",
    rail: "bg-orange-400",
    active: "bg-orange-500 text-white hover:bg-orange-500/90",
  },
  MEDIUM: {
    label: "Medium",
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25",
    rail: "bg-amber-400",
    active: "bg-amber-500 text-white hover:bg-amber-500/90",
  },
  LOW: {
    label: "Low",
    chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/25",
    rail: "bg-sky-400",
    active: "bg-sky-600 text-white hover:bg-sky-600/90",
  },
  NONE: {
    label: "None",
    chip: "bg-muted text-muted-foreground ring-1 ring-border",
    rail: "bg-border",
    active: "bg-foreground text-background hover:bg-foreground/90",
  },
};

/** Shown when a severity dispute is still open upstream. */
export const UNRATED_STYLE: SeverityStyle = {
  label: "In review",
  chip: "bg-muted text-muted-foreground ring-1 ring-border",
  rail: "bg-border",
  active: "",
};

export const EVENT_LABEL: Record<EventType, string> = {
  RECOGNITION_AWARDED: "Recognition",
  BOUNTY_AWARDED: "Bounty awarded",
  REPORT_RESOLVED: "Resolved",
  REPORT_DISCLOSED: "Disclosed",
};

/** The verb between a researcher and the program on a card. */
export function eventPhrase(eventType?: string): string {
  switch (eventType) {
    case "BOUNTY_AWARDED":
      return "earned a bounty from";
    case "RECOGNITION_AWARDED":
      return "was recognised by";
    case "REPORT_DISCLOSED":
      return "disclosed a finding in";
    case "REPORT_RESOLVED":
      return "had a finding resolved by";
    default:
      return "was credited by";
  }
}

/** `$20,500` — cents only when there are any. */
export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/** `$28.4M` for a badge, with {@link formatMoney} behind it on hover. */
export function formatCompactMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** `31 Aug 2026, 12:04 UTC` — the exact time behind a relative one. */
export function formatUtc(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return `${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date)} UTC`;
}
