import type { EventType, Severity } from "@/lib/types/hacktivity/types";

export interface SeverityStyle {
  label: string;
  chip: string;
  rail: string;
  active: string;
  dot: string;
  borderAccent: string;
}

export const SEVERITY_STYLE: Record<Severity, SeverityStyle> = {
  CRITICAL: {
    label: "Critical",
    chip: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/25",
    rail: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
    active: "bg-red-600 text-white shadow-xs hover:bg-red-600/90 dark:bg-red-600",
    dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]",
    borderAccent: "border-red-500/20 dark:border-red-500/30",
  },
  HIGH: {
    label: "High",
    chip: "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/25",
    rail: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]",
    active: "bg-orange-500 text-white shadow-xs hover:bg-orange-500/90",
    dot: "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]",
    borderAccent: "border-orange-500/20 dark:border-orange-500/30",
  },
  MEDIUM: {
    label: "Medium",
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25",
    rail: "bg-amber-500",
    active: "bg-amber-500 text-white shadow-xs hover:bg-amber-500/90",
    dot: "bg-amber-500",
    borderAccent: "border-amber-500/20 dark:border-amber-500/30",
  },
  LOW: {
    label: "Low",
    chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/25",
    rail: "bg-sky-500",
    active: "bg-sky-600 text-white shadow-xs hover:bg-sky-600/90",
    dot: "bg-sky-500",
    borderAccent: "border-sky-500/20 dark:border-sky-500/30",
  },
  NONE: {
    label: "None",
    chip: "bg-muted text-muted-foreground ring-1 ring-border",
    rail: "bg-border",
    active: "bg-foreground text-background shadow-xs hover:bg-foreground/90",
    dot: "bg-muted-foreground/60",
    borderAccent: "border-border",
  },
};

export const UNRATED_STYLE: SeverityStyle = {
  label: "In review",
  chip: "bg-muted text-muted-foreground ring-1 ring-border",
  rail: "bg-border",
  active: "",
  dot: "bg-muted-foreground/60",
  borderAccent: "border-border",
};

export const EVENT_LABEL: Record<EventType, string> = {
  RECOGNITION_AWARDED: "Recognition",
  BOUNTY_AWARDED: "Bounty awarded",
  REPORT_RESOLVED: "Resolved",
  REPORT_DISCLOSED: "Disclosed",
};

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

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

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
