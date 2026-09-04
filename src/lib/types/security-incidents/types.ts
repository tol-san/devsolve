
export type MalwareVerdict = "MALICIOUS" | "SUSPICIOUS";

export interface MalwareUploader {
  id: string; 
  username: string | null;
  email: string | null;
  status?: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING" | "REMOVED" | string | null;
}

export interface IncidentOrganization {
  id: string; 
  name: string | null;
}

export interface MalwareStats {
  malicious: number;
  suspicious: number;
  total: number;
}

export interface SecurityIncident {
  id: string; 
  uploader: MalwareUploader;
  organization: IncidentOrganization | null;
  reportId: string | null; 
  filename: string;
  fileSizeBytes: number;
  sha256Hash: string;
  verdict: MalwareVerdict;
  stats: MalwareStats;
  blockedAt: string; 
}

export interface SecurityIncidentsPage {
  content: SecurityIncident[];
  totalElements: number;
  totalPages: number;
  number: number; 
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type IncidentSortColumn = "blockedAt" | "filename" | "verdict";
export type SortDirection = "ASC" | "DESC";

export interface GetSecurityIncidentsParams {
  search?: string;
  verdict?: MalwareVerdict;
  page?: number;
  size?: number;
  sort?: `${IncidentSortColumn},${SortDirection}` | IncidentSortColumn;
  organizationId?: string; 
}
