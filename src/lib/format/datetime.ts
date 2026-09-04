
export function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

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

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    sign * amount,
    unit,
  );
}

export function hasPassed(
  value: string | null | undefined,
  now: number,
): boolean {
  const date = toDate(value);
  return date ? date.getTime() <= now : false;
}

export function formatDuration(
  from: string | null | undefined,
  to: string | number | null | undefined,
): string | null {
  const start = toDate(from);
  if (!start) return null;

  const endMs =
    typeof to === "number" ? to : toDate(to as string | null | undefined)?.getTime();
  if (endMs === undefined || Number.isNaN(endMs)) return null;

  const seconds = Math.max(0, Math.round((endMs - start.getTime()) / 1000));

  const plural = (amount: number, unit: string) =>
    `${amount} ${unit}${amount === 1 ? "" : "s"}`;

  if (seconds < 60) return "under a minute";
  if (seconds < 3600) return plural(Math.round(seconds / 60), "minute");
  if (seconds < 86400) return plural(Math.round(seconds / 3600), "hour");
  if (seconds < 2592000) return plural(Math.round(seconds / 86400), "day");
  return plural(Math.round(seconds / 2592000), "month");
}
