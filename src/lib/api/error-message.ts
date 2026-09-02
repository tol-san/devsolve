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

export interface ExtractedScanDetails {
  verdict?: string;
  malicious?: number;
  suspicious?: number;
  harmless?: number;
  undetected?: number;
  analysisId?: string;
}

/** Extract VirusTotal scan metrics from 422 error payloads. */
export function extractScanErrorDetails(error: unknown): ExtractedScanDetails | null {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null) {
      const rawDetails =
        (data as { errorDetails?: unknown }).errorDetails ??
        (data as { details?: unknown }).details;
      
      const targetObj =
        typeof rawDetails === "object" && rawDetails !== null
          ? (rawDetails as Record<string, unknown>)
          : (data as Record<string, unknown>);

      const stats = (targetObj.stats ?? {}) as Record<string, unknown>;
      const verdict = typeof targetObj.verdict === "string" ? targetObj.verdict : undefined;
      const malicious = typeof stats.malicious === "number" ? stats.malicious : undefined;
      const suspicious = typeof stats.suspicious === "number" ? stats.suspicious : undefined;
      const harmless = typeof stats.harmless === "number" ? stats.harmless : undefined;
      const undetected = typeof stats.undetected === "number" ? stats.undetected : undefined;
      const analysisId = typeof targetObj.analysisId === "string" ? targetObj.analysisId : undefined;

      if (verdict || malicious !== undefined || suspicious !== undefined) {
        return { verdict, malicious, suspicious, harmless, undetected, analysisId };
      }
    }
  }
  return null;
}

/**
 * Friendly, actionable copy for the statuses content scanning returns.
 *
 * The guard no longer waits for a verdict. It asks VirusTotal about the file's
 * hash — which is the check that catches malware, since a file is known-bad
 * precisely because someone submitted it before — and anything unrecognised is
 * submitted once and let through, with the verdict collected in the
 * background. So the statuses a person can actually hit changed shape:
 *
 * - `422` still means refused before a byte was stored: the hash is known bad.
 * - `429` / `503` now mean VirusTotal refused the *submission*, which is the
 *   failure to expect on a rate-limited key.
 * - `504` should be rare, as nothing polls for a verdict in line any more.
 */
export function contentScanErrorMessage(
  error: unknown,
  subject = "This content",
): string {
  const backendMessage = apiErrorMessage(error, "");
  const status = apiErrorStatus(error);

  switch (status) {
    case 422: {
      const details = extractScanErrorDetails(error);
      if (details) {
        const counts: string[] = [];
        if (details.malicious && details.malicious > 0) {
          counts.push(`${details.malicious} malicious`);
        }
        if (details.suspicious && details.suspicious > 0) {
          counts.push(`${details.suspicious} suspicious`);
        }
        const countsText = counts.length > 0 ? ` (${counts.join(", ")} detections)` : "";
        const verdictText = details.verdict ? ` [${details.verdict}]` : "";
        return `${subject} was rejected by security scanning${verdictText}${countsText}.`;
      }
      return `${subject} matches a known threat and was not stored.`;
    }
    case 429:
      return "Security scanning is rate-limited right now, so this could not be checked. Wait a minute, then try again.";
    case 502:
      return "The security scanning service is unreachable. Your content was not accepted; try again shortly.";
    /* Was "not configured — proceeding with standard upload", which both
       contradicted the refusal it accompanies and no longer describes what
       this status means: the scanner declined to take the file. */
    case 503:
      return "The security scanning service would not accept this file. Your content was not stored; try again shortly.";
    case 504:
      return "Security scanning did not answer in time. Your content was not accepted; try again shortly.";
    default:
      return backendMessage || `${subject} could not be checked or uploaded.`;
  }
}

