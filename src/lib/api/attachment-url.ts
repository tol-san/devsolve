/**
 * Turning an attachment's `downloadUrl` into something a browser can load.
 *
 * The API returns it as a path, not a URL — `/api/v1/problems/{id}/
 * attachments/{id}/download` — while sibling fields like `author.avatarUrl`
 * are absolute. Dropped into `<img src>` the relative one resolves against
 * *our* origin, so the browser asks Next.js for a route it does not serve and
 * the image never renders.
 *
 * The fix is to point it at our own proxy rather than at the backend host.
 * Both would load a public problem attachment, but only the proxy works for
 * the private ones: report attachments are confidential and their endpoint
 * wants a bearer token, which a bare `<img>` cannot send. The proxy holds the
 * session and adds the header server-side, so one rule covers every kind —
 * and it keeps attachments on the same origin as every other API call, which
 * is what this app requires of anything leaving the browser.
 *
 * The mapping is mechanical: our routes mirror the upstream's shape one for
 * one under `/api` instead of `/api/v1`.
 */

const UPSTREAM_PREFIX = "/api/v1/";

/**
 * A loadable URL for an attachment, or `undefined` when there is nothing to
 * load — which the caller should render as "no preview", never as a broken
 * image.
 *
 * An absolute URL is passed through untouched: presigned storage links are
 * already fetchable and are not ours to rewrite.
 */
export function attachmentUrl(
  downloadUrl: string | null | undefined,
): string | undefined {
  const trimmed = downloadUrl?.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  /* `/api/v1/reports/…` becomes `/api/reports/…`, the route that adds the
     caller's token and follows the 307 to storage on their behalf. */
  if (trimmed.startsWith(UPSTREAM_PREFIX)) {
    return `/api/${trimmed.slice(UPSTREAM_PREFIX.length)}`;
  }

  /* Already one of ours — a path some screens build themselves. */
  if (trimmed.startsWith("/")) return trimmed;

  return undefined;
}
