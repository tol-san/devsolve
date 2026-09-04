
const UPSTREAM_PREFIX = "/api/v1/";

export function attachmentUrl(
  downloadUrl: string | null | undefined,
): string | undefined {
  const trimmed = downloadUrl?.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith(UPSTREAM_PREFIX)) {
    return `/api/${trimmed.slice(UPSTREAM_PREFIX.length)}`;
  }

  if (trimmed.startsWith("/")) return trimmed;

  return undefined;
}
