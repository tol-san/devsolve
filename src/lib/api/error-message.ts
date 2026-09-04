
export function apiErrorStatus(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  return null;
}

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
    case 503:
      return "The security scanning service would not accept this file. Your content was not stored; try again shortly.";
    case 504:
      return "Security scanning did not answer in time. Your content was not accepted; try again shortly.";
    default:
      return backendMessage || `${subject} could not be checked or uploaded.`;
  }
}

