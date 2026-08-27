/**
 * Reading an RTK Query rejection.
 *
 * The route handlers under `src/app/api/*` all answer a failure the same way —
 * `{ message, details }` with the upstream's status — so the message the
 * backend wrote survives the hop and can be shown as written. That matters for
 * the authorization failures, where the upstream's wording names the company
 * and says what to do next, and anything invented here would say less.
 */

/** The HTTP status of a rejection, when it has one. */
export function apiErrorStatus(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return null;
}

/** The upstream's own message, falling back only when there is none. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data.trim()) return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
  }
  return fallback;
}
