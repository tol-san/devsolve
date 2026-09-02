/**
 * Security & Malware Incidents types mirroring the backend VirusTotal incident persistence.
 */

export type MalwareVerdict = "MALICIOUS" | "SUSPICIOUS";

export interface MalwareUploader {
  id: string; // UUID
  username: string | null;
  email: string | null;
  status?: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING" | "REMOVED" | string | null;
}

export interface IncidentOrganization {
  id: string; // UUID
  name: string | null;
}

export interface MalwareStats {
  malicious: number;
  suspicious: number;
  total: number;
}

export interface SecurityIncident {
  id: string; // UUID
  uploader: MalwareUploader;
  organization: IncidentOrganization | null;
  reportId: string | null; // UUID
  filename: string;
  fileSizeBytes: number;
  sha256Hash: string;
  verdict: MalwareVerdict;
  stats: MalwareStats;
  blockedAt: string; // ISO-8601 UTC string (e.g. "2026-09-01T10:15:30Z")
}

/**
 * Spring Page root response format (same as Hacktivity response format).
 */
export interface SecurityIncidentsPage {
  content: SecurityIncident[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based page index
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Strict sort allow-list accepted by upstream. Passing any other column returns 400.
 */
export type IncidentSortColumn = "blockedAt" | "filename" | "verdict";
export type SortDirection = "ASC" | "DESC";

export interface GetSecurityIncidentsParams {
  search?: string;
  verdict?: MalwareVerdict;
  page?: number;
  size?: number;
  sort?: `${IncidentSortColumn},${SortDirection}` | IncidentSortColumn;
  organizationId?: string; // Admin endpoint only
}
