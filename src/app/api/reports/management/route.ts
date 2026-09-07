import { NextResponse, type NextRequest } from "next/server";
import type { ManagedReport } from "@/components/report-management/types";
import { auth } from "@/lib/auth/auth";
import { getUserProfilesByIds } from "@/lib/server/db";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const PROVIDER_ID = "keycloak";

type ApiSeverity = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type ApiState =
  | "NEW"
  | "TRIAGING"
  | "NEEDS_MORE_INFO"
  | "VALID_CONFIRMED"
  | "RESOLVED"
  | "REJECTED"
  | "DUPLICATE";

interface ResearcherSummary {
  id: string;
  username?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  reputation?: number;
  totalReports?: number;
  validReports?: number;
  country?: string;
}

interface ProgramSummary {
  id: string;
  name: string;
  handle?: string;
  organizationId: string;
  organizationName: string;
  organizationLogoUrl?: string;
}

interface ReportApiResponse {
  id: string;
  programId: string;
  reporterId?: string;
  reporter_id?: string;
  researcher?: ResearcherSummary;
  program?: ProgramSummary;
  isDisputed?: boolean;
  dispute?: import("@/lib/types/reports/types").DisputeDetail | null;
  title: string;
  reportedSeverity?: ApiSeverity;
  triageSeverity?: ApiSeverity;
  severity?: ApiSeverity;
  cvssScore?: number;
  state: ApiState;
  reportId?: string;
  reportCode?: string;
  summary?: string;
  impact?: string;
  vulnerabilityInformation?: string;
  assetId?: string;
  assetName?: string;
  assetIdentifier?: string;
  type?: string;
  programType?: string;
  authorName?: string;
  authorEmail?: string;
  submitterName?: string;
  submitterEmail?: string;
  researcherName?: string;
  researcherEmail?: string;
  userName?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  reporter?: {
    id?: string;
    name?: string;
    email?: string;
    username?: string;
    avatarUrl?: string;
  };
}

interface ProgramApiResponse {
  id: string;
  name: string;
  organizationId?: string;
  organizationName?: string;
  organizationLogoUrl?: string;
  engagementType?: string;
  assets?: Array<{
    id?: string;
    identifier?: string;
  }>;
  inScopeAssets?: Array<{
    id?: string;
    identifier?: string;
  }>;
}

interface UserProfileApiResponse {
  id: string;
  fullName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  reputation?: number | null;
}

interface ReportsEnvelope<T> {
  content?: T[];
  items?: T[];
  data?: T[];
}

async function bearerTokenFor(request: NextRequest): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;

  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: { providerId: PROVIDER_ID },
      headers: request.headers,
    });
    return accessToken ?? null;
  } catch {
    return null;
  }
}

async function readUpstreamBody(upstream: Response) {
  const raw = await upstream.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: raw };
  }
}

async function fetchBackendJson<T>(
  path: string,
  token: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number; body: unknown }> {
  const upstream = await fetch(`${BACKEND_API_URL}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const body = await readUpstreamBody(upstream);

  if (!upstream.ok) {
    return { ok: false, status: upstream.status, body };
  }

  return { ok: true, data: body as T };
}

async function fetchOptionalBackendJson<T>(
  path: string,
  token: string,
): Promise<{ ok: true; data: T } | { ok: false; status: number; body: unknown }> {
  try {
    return await fetchBackendJson<T>(path, token);
  } catch {
    return { ok: false, status: 502, body: null };
  }
}

function extractReports(
  response: ReportsEnvelope<ReportApiResponse> | ReportApiResponse[] | null,
): ReportApiResponse[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function toManagedSeverity(report: ReportApiResponse): ManagedReport["severity"] {
  if (!report.severity) return null;

  switch (report.severity) {
    case "CRITICAL":
      return "Critical";
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    default:
      return null;
  }
}

function toManagedStatus(state: ApiState): ManagedReport["status"] {
  switch (state) {
    case "RESOLVED":
    case "REJECTED":
    case "DUPLICATE":
      return "Closed";
    default:
      return "Open";
  }
}

function toWorkflowState(state: ApiState): ManagedReport["queueState"] {
  switch (state) {
    case "NEW":
      return "PENDING";
    case "TRIAGING":
    case "NEEDS_MORE_INFO":
      return "UNDER_REVIEW";
    case "VALID_CONFIRMED":
      return "APPROVED";
    default:
      return "CLOSED";
  }
}

function toManagedType(
  report: ReportApiResponse,
  program?: ProgramApiResponse,
): ManagedReport["type"] {
  const rawType = (
    report.type ??
    report.programType ??
    program?.engagementType ??
    "BOUNTY"
  ).toUpperCase();

  return rawType === "RESPONSE" ? "Response" : "Bounty";
}

function toSubmittedDate(report: ReportApiResponse): string {
  const iso = report.submittedAt ?? report.createdAt ?? report.updatedAt;
  if (!iso) return "Unknown date";
  const normalized = /(Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}Z`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toDisplayReportId(report: ReportApiResponse): string {
  if (report.reportCode?.trim()) return report.reportCode;
  if (report.reportId?.trim()) return report.reportId;

  const compactId = report.id.replace(/-/g, "");
  if (/^\d+$/.test(compactId)) {
    return `RPT-2026-${compactId.padStart(5, "0")}`;
  }

  return `RPT-${compactId.slice(0, 8).toUpperCase()}`;
}

function toInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "UR";

  return trimmed
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function reporterIdOf(report: any): string | undefined {
  return (
    report.reporterId ??
    report.reporter_id ??
    report.reporter?.id ??
    report.researcher?.id
  );
}

function toAuthorName(
  report: ReportApiResponse,
  reporterProfile?: UserProfileApiResponse,
): string {
  return (
    reporterProfile?.fullName?.trim() ??
    report.submitterName ??
    report.researcherName ??
    report.authorName ??
    report.userName ??
    report.reporter?.name ??
    report.reporter?.username ??
    reporterProfile?.username ??
    "Unknown Researcher"
  );
}

function toAuthorEmail(report: ReportApiResponse): string {
  return (
    report.submitterEmail ??
    report.researcherEmail ??
    report.authorEmail ??
    report.reporter?.email ??
    ""
  );
}

function toSummary(report: ReportApiResponse): string {
  const source =
    report.summary ??
    report.impact ??
    report.vulnerabilityInformation ??
    "Submitted vulnerability report awaiting organization triage.";

  return source
    .replace(/\s+/g, " ")
    .replace(/#+\s*/g, "")
    .trim()
    .slice(0, 220);
}

function getProgramAssets(program?: ProgramApiResponse) {
  return program?.assets?.length ? program.assets : (program?.inScopeAssets ?? []);
}

function toAssets(report: ReportApiResponse, program?: ProgramApiResponse): string[] {
  const directAssets = [report.assetName, report.assetIdentifier].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  if (directAssets.length > 0) {
    return Array.from(new Set(directAssets)).slice(0, 3);
  }

  const programAssets = getProgramAssets(program);
  if (report.assetId) {
    const matchedAsset = programAssets.find((asset) => asset.id === report.assetId);
    if (matchedAsset?.identifier) {
      return [matchedAsset.identifier];
    }
  }

  const fallbackAssets = programAssets
    .map((asset) => asset.identifier)
    .filter((value): value is string => Boolean(value?.trim()))
    .slice(0, 3);

  return fallbackAssets.length > 0 ? fallbackAssets : ["Program asset"];
}

function toManagedReport(
  report: ReportApiResponse,
  program?: ProgramApiResponse,
  reporterProfile?: UserProfileApiResponse,
  orgNameMap?: Map<string, string>,
): ManagedReport {
  const author =
    report.researcher?.fullName?.trim() ||
    reporterProfile?.fullName?.trim() ||
    report.researcher?.username ||
    reporterProfile?.username ||
    toAuthorName(report, reporterProfile);

  const authorUsername =
    report.researcher?.username ||
    report.reporter?.username ||
    reporterProfile?.username ||
    null;

  const authorEmail =
    report.researcher?.email ||
    report.reporter?.email ||
    reporterProfile?.email ||
    toAuthorEmail(report);

  const authorAvatarUrl =
    report.researcher?.avatarUrl ||
    report.reporter?.avatarUrl ||
    reporterProfile?.avatarUrl ||
    null;

  const authorReputation =
    typeof report.researcher?.reputation === "number"
      ? report.researcher.reputation
      : typeof reporterProfile?.reputation === "number"
      ? reporterProfile.reputation
      : null;

  const authorId =
    report.researcher?.id ||
    reporterIdOf(report) ||
    reporterProfile?.id;

  const programId =
    report.program?.id ||
    report.programId;

  const programName =
    report.program?.name ||
    program?.name;

  const programHandle =
    report.program?.handle;

  const organizationId =
    report.program?.organizationId ||
    program?.organizationId;

  const organizationName =
    report.program?.organizationName ||
    program?.organizationName ||
    (organizationId ? orgNameMap?.get(organizationId) : undefined) ||
    programName;

  const organizationLogoUrl =
    report.program?.organizationLogoUrl ||
    program?.organizationLogoUrl;

  const isDisputed =
    report.isDisputed ??
    Boolean(report.dispute);

  return {
    id: report.id,
    reportId: toDisplayReportId(report),
    programId,
    organizationId,
    programName,
    programHandle,
    organizationName,
    organizationLogoUrl,
    title: report.title || programName || "Untitled report",
    programLogo: organizationLogoUrl || undefined,
    author,
    authorUsername,
    authorEmail,
    authorInitials: toInitials(author),
    authorAvatarUrl,
    authorReputation,
    authorId,
    type: toManagedType(report, program),
    status: toManagedStatus(report.state),
    severity: toManagedSeverity(report),
    reportedSeverity: report.reportedSeverity ?? null,
    triageSeverity: report.triageSeverity ?? null,
    cvssScore: typeof report.cvssScore === "number" ? report.cvssScore : null,
    queueState: toWorkflowState(report.state),
    submittedAt: toSubmittedDate(report),
    submittedAtIso: report.submittedAt ?? report.createdAt ?? report.updatedAt,
    summary: toSummary(report),
    assets: toAssets(report, program),
    dispute: report.dispute ?? null,
    isDisputed,
  };
}

const unauthorized = () =>
  NextResponse.json({ message: "Not authenticated" }, { status: 401 });

const unreachable = () =>
  NextResponse.json(
    { message: "Unable to reach the report service. Please try again." },
    { status: 502 },
  );

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  try {
    const reportsResult = await fetchBackendJson<
      ReportsEnvelope<ReportApiResponse> | ReportApiResponse[]
    >("/reports?size=100&sort=submittedAt,DESC", token);

    if (!reportsResult.ok) {
      if (reportsResult.status === 403 || reportsResult.status === 404) {
        return NextResponse.json([], { status: 200 });
      }

      const message =
        (reportsResult.body as { message?: string } | null)?.message ??
        "Unable to load organization reports. Please try again.";

      return NextResponse.json(
        { message, details: reportsResult.body },
        { status: reportsResult.status },
      );
    }

    const rawReports = extractReports(reportsResult.data);
    const missingProgramIds = Array.from(
      new Set(
        rawReports
          .filter((r) => !r.program?.name)
          .map((r) => r.programId)
          .filter(Boolean),
      ),
    );
    const missingReporterIds = Array.from(
      new Set(
        rawReports
          .map((r) => reporterIdOf(r))
          .filter((id): id is string => Boolean(id && typeof id === "string")),
      ),
    );

    const [programResults, reporterResults, dbProfiles] = await Promise.all([
      Promise.all(
        missingProgramIds.map((id) =>
          fetchOptionalBackendJson<ProgramApiResponse>(`/programs/${id}`, token),
        ),
      ),
      Promise.all(
        missingReporterIds.map((id) =>
          fetchOptionalBackendJson<UserProfileApiResponse>(`/user-profiles/${id}`, token),
        ),
      ),
      getUserProfilesByIds(missingReporterIds),
    ]);

    const programMap = new Map<string, ProgramApiResponse>();
    const reporterMap = new Map<string, UserProfileApiResponse>();

    missingProgramIds.forEach((id, index) => {
      const result = programResults[index];
      if (result?.ok) {
        programMap.set(id, result.data);
      }
    });

    missingReporterIds.forEach((id, index) => {
      const result = reporterResults[index];
      const dbProfile = dbProfiles.get(id);
      if (result?.ok && result.data) {
        reporterMap.set(id, {
          id,
          fullName: result.data.fullName || dbProfile?.fullName || null,
          username: result.data.username || dbProfile?.username || null,
          avatarUrl: result.data.avatarUrl || dbProfile?.avatarUrl || null,
          email: result.data.email || dbProfile?.email || null,
          reputation: result.data.reputation ?? dbProfile?.reputation ?? null,
        });
      } else if (dbProfile) {
        reporterMap.set(id, {
          id: dbProfile.id,
          fullName: dbProfile.fullName,
          username: dbProfile.username,
          avatarUrl: dbProfile.avatarUrl,
          email: dbProfile.email,
          reputation: dbProfile.reputation,
        });
      }
    });

    const missingOrgIds = Array.from(
      new Set(
        Array.from(programMap.values())
          .filter((p) => p.organizationId && !p.organizationName)
          .map((p) => p.organizationId as string)
          .concat(
            rawReports
              .filter((r) => r.program?.organizationId && !r.program?.organizationName)
              .map((r) => r.program!.organizationId as string),
          ),
      ),
    );

    const orgResults = await Promise.all(
      missingOrgIds.map((id) =>
        fetchOptionalBackendJson<{ id: string; name: string }>(`/organizations/${id}`, token),
      ),
    );

    const orgNameMap = new Map<string, string>();
    missingOrgIds.forEach((id, index) => {
      const res = orgResults[index];
      if (res?.ok && res.data?.name) {
        orgNameMap.set(id, res.data.name);
      }
    });

    const managedReports = rawReports.map((report) => {
      const repId = reporterIdOf(report);
      return toManagedReport(
        report,
        programMap.get(report.programId),
        repId ? reporterMap.get(repId) : undefined,
        orgNameMap,
      );
    });

    return NextResponse.json(managedReports, { status: 200 });
  } catch {
    return unreachable();
  }
}
