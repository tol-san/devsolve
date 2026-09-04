
export type VirusTotalStatus = "queued" | "in-progress" | "completed";

export type VirusTotalVerdict = "PENDING" | "CLEAN" | "SUSPICIOUS" | "MALICIOUS";

export interface VirusTotalStats {
  malicious?: number;
  suspicious?: number;
  harmless?: number;
  undetected?: number;
  timeout?: number;
  "confirmed-timeout"?: number;
  confirmedTimeout?: number;
  failure?: number;
  "type-unsupported"?: number;
  typeUnsupported?: number;
}

export interface VirusTotalAnalysisResponse {
  analysisId: string;
  status: VirusTotalStatus;
  verdict: VirusTotalVerdict;
  stats: VirusTotalStats;
}

export interface VirusTotalErrorDetails {
  analysisId?: string;
  verdict?: VirusTotalVerdict;
  stats?: VirusTotalStats;
}

export interface VirusTotalErrorResponse {
  message: string;
  code: number;
  status: string;
  timestamp?: string;
  errorDetails?: VirusTotalErrorDetails | null;
  violations?: unknown;
  path?: string;
  traceId?: string | null;
}

export interface VirusTotalUrlRequest {
  url: string;
}
