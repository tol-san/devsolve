
export function formatDate(iso?: string, empty = "—"): string {
  if (!iso) return empty;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return empty;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function initialsOf(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return initials || "?";
}

export interface AuthorLike {
  fullName?: string;
  displayName?: string;
}

export function authorNameOf(
  author?: AuthorLike | null,
  fallback = "Unknown author",
): string {
  const name = author?.fullName?.trim() || author?.displayName?.trim();
  return name || fallback;
}

export function messageOf(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data) return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  return fallback;
}
