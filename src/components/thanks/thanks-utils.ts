/**
 * Utilities for formatting Hall of Thanks dates and country indicators.
 */

/**
 * Parses an ISO LocalDateTime string from the server (e.g. "2026-08-30T14:02:11.482").
 * As specified in the contract, the server local time is UTC+7 without a timezone suffix.
 */
export function parseServerDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // If there's already a timezone indicator (Z, +07:00, etc.), parse directly
  if (/[zZ]|[+-]\d{2}(:?\d{2})?$/.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }

  // Otherwise append +07:00 as documented in the backend specification
  const withTz = `${trimmed}+07:00`;
  const d = new Date(withTz);
  if (!isNaN(d.getTime())) return d;

  // Fallback to direct parse
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Returns a human-friendly relative time string (e.g. "2 days ago", "Aug 30, 2026").
 */
export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  const date = typeof dateInput === "string" ? parseServerDate(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Full date formatted with time for tooltips.
 */
export function formatFullDateTime(dateInput: string | Date | null | undefined): string {
  const date = typeof dateInput === "string" ? parseServerDate(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Maps 2-letter ISO country code to emoji flag.
 */
export function countryCodeToFlag(countryCode: string | null | undefined): string | null {
  if (!countryCode) return null;
  const code = countryCode.trim().toUpperCase();
  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return null;

  const codePoints = [...code].map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
