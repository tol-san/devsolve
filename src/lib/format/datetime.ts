/**
 * Turning the backend's timestamps into something a reader can act on.
 *
 * Two shapes arrive: `2026-08-16T13:26:37.173010409Z` from some fields and
 * `2026-08-16T13:26:37.173010` from others. The second is UTC with the marker
 * left off, and `new Date` reads a bare timestamp as *local* time — so without
 * normalising it, every such value is displayed shifted by the viewer's own
 * offset. That is invisible while only the date is shown and obvious the
 * moment a clock time is.
 */

/** Parses timestamps directly. Backend timestamps have no timezone suffix (server-local, not UTC) — never append Z. */
export function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** `Aug 16, 2026` — for places where the day is the whole answer. */
export function formatDate(
  value: string | null | undefined,
  fallback = "—",
): string {
  const date = toDate(value);
  if (!date) return fallback;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/**
 * `Aug 16, 2026, 8:42:37 PM` — the day and the full clock time, in the
 * reader's own timezone.
 *
 * Seconds included: on a list where several reports can be touched inside the
 * same minute, they are what settles the order.
 */
export function formatDateTime(
  value: string | null | undefined,
  fallback = "—",
): string {
  const date = toDate(value);
  if (!date) return fallback;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * `in 2 days`, `tomorrow`, `in 5 hours`, `3 minutes ago` — the distance
 * between a timestamp and `now`, in the largest unit that still says
 * something.
 *
 * For deadlines, which is the only reason a raw timestamp is not enough: an
 * invitation that expires on `Sep 3, 2026, 4:40:00 PM` tells the reader
 * nothing until they work out what today is.
 *
 * `now` is a parameter rather than a `Date.now()` inside, so the function is
 * pure and a component cannot read the clock while rendering. Take it from
 * `useNow`, which also keeps it moving.
 */
export function formatTimeDistance(
  value: string | null | undefined,
  now: number,
  fallback = "",
): string {
  const date = toDate(value);
  if (!date) return fallback;

  const seconds = Math.round((date.getTime() - now) / 1000);
  const magnitude = Math.abs(seconds);
  const sign = seconds < 0 ? -1 : 1;

  const [amount, unit]: [number, Intl.RelativeTimeFormatUnit] =
    magnitude < 60
      ? [magnitude, "second"]
      : magnitude < 3600
        ? [Math.round(magnitude / 60), "minute"]
        : magnitude < 86400
          ? [Math.round(magnitude / 3600), "hour"]
          : magnitude < 2592000
            ? [Math.round(magnitude / 86400), "day"]
            : [Math.round(magnitude / 2592000), "month"];

  /* `numeric: "auto"` is what turns one day into "tomorrow" and zero days into
     "today", which is the wording a deadline that close deserves. */
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    sign * amount,
    unit,
  );
}

/** Whether a timestamp is behind `now`. Unusable values are not. */
export function hasPassed(
  value: string | null | undefined,
  now: number,
): boolean {
  const date = toDate(value);
  return date ? date.getTime() <= now : false;
}

/**
 * How long something took, as a span between two moments.
 *
 * Distinct from `formatTimeDistance`, which measures from *now* and phrases
 * its answer relative to it ("3 days ago"). This one names a duration —
 * "4 hours", "3 days" — which is what a time-to-first-response reads as.
 *
 * Null when either end is unusable, so a caller shows nothing rather than a
 * confident "0 seconds" it cannot support.
 */
export function formatDuration(
  from: string | null | undefined,
  to: string | number | null | undefined,
): string | null {
  const start = toDate(from);
  if (!start) return null;

  const endMs =
    typeof to === "number" ? to : toDate(to as string | null | undefined)?.getTime();
  if (endMs === undefined || Number.isNaN(endMs)) return null;

  /* Clock skew between the two stamps can make a span very slightly negative;
     that is noise, not a report answered before it was filed. */
  const seconds = Math.max(0, Math.round((endMs - start.getTime()) / 1000));

  const plural = (amount: number, unit: string) =>
    `${amount} ${unit}${amount === 1 ? "" : "s"}`;

  if (seconds < 60) return "under a minute";
  if (seconds < 3600) return plural(Math.round(seconds / 60), "minute");
  if (seconds < 86400) return plural(Math.round(seconds / 3600), "hour");
  if (seconds < 2592000) return plural(Math.round(seconds / 86400), "day");
  return plural(Math.round(seconds / 2592000), "month");
}
