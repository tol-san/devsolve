import { baseApi } from "./baseApi";
import {
  environmentLabel,
  parseCvssScore,
  severityForCvss,
} from "@/lib/validations/report";
import { formatDate, formatDateTime, toDate } from "@/lib/format/datetime";
import {
  formatBountyAmount,
  hasBountyReward,
  openRetestAttempt,
} from "@/lib/reports/retest";
import {
  toApiSeverity,
  type ApiSeverity as SharedApiSeverity,
} from "@/lib/reports/severity";
import { attachmentUrl } from "@/lib/api/attachment-url";
import type { ReportActivity } from "@/lib/types/reports/activity";
import {
  ReportItem,
  ReportsFilterParams,
  ReportDetail,
  ActivityUpdate,
  CommentItem,
  SubmitReportPayload,
  SubmitReportResponse,
} from "@/lib/types/reports/types";
import type { ManagedReport } from "@/components/report-management/types";

export * from "@/lib/types/reports/types";
export * from "@/lib/types/reports/mock-data";

type ApiSeverity = SharedApiSeverity;
type ApiState =
  | "NEW"
  | "TRIAGING"
  | "NEEDS_MORE_INFO"
  | "VALID_CONFIRMED"
  | "RETESTING"
  | "RESOLVED"
  | "REJECTED"
  | "DUPLICATE";

export type ReportEnvironment =
  | "PRODUCTION"
  | "STAGING"
  | "DEVELOPMENT"
  | "TESTING"
  | "LOCAL";

export type RetestVerdict = "VERIFIED_FIXED" | "STILL_VULNERABLE";

export interface ActorSummary {
  id: string;
  name: string;
}

export interface RetestSummary {
  id: string;
  attemptNumber: number;
  environment: ReportEnvironment | null;
  targetEndpoint: string | null;
  requestedAt: string;
  dueAt: string | null;
  requestedBy: ActorSummary;
  requestNotes: string | null;
  bountyReward: string | number | null;
  completedAt: string | null;
  completedBy: ActorSummary | null;
  verdict: RetestVerdict | null;
  resultNotes: string | null;
  attachmentIds: string[] | null;
}

interface ReportApiResponse {
  id: string;
  programId: string;
  reporterId?: string;
  title: string;
  reportedSeverity?: ApiSeverity;
  triageSeverity?: ApiSeverity;
  severity?: ApiSeverity;
  state: ApiState;
  rewards?: { amount?: number; note?: string; awardedAt?: string }[];
  retestHistory?: RetestSummary[];
  reputationPoints?: number | null;
  reputationAwardedAt?: string | null;
  firstRespondedAt?: string | null;
  submittedAt?: string;
  triagedAt?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  programName?: string;
  authorName?: string;
  authorEmail?: string;
  submitterName?: string;
  submitterEmail?: string;
  researcherName?: string;
  researcherEmail?: string;
  userName?: string;
  reporter?: {
    id?: string;
    name?: string;
    email?: string;
    username?: string;
  };
  attachments?: Array<{
    id?: string;
    fileName?: string;
    filename?: string;
    name?: string;
    sizeBytes?: number;
    fileSize?: number;
    size?: number;
    mimeType?: string;
    contentType?: string;
    type?: string;
    downloadUrl?: string;
    createdAt?: string;
  }>;
  stepsToReproduce?: string;
  proofOfConcept?: string;
  remediationRecommendation?: string;
  targetEndpoint?: string;
  environment?: string;
  discoveredAt?: string;
  referenceLinks?: string[];
  cvssScore?: number;
  cvssVector?: string;
  weakness?: { id?: string; cweId?: string; name?: string };
  suggestedWeakness?: string | null;
  dispute?: {
    id?: string;
    status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
    reason?: string;
    resolvedSeverity?: ApiSeverity | null;
  } | null;
  asset?: { id?: string; assetType?: string; identifier?: string };
  disclosureStatus?: string;
}

interface ProgramApiResponse {
  id: string;
  name: string;
  organizationId?: string;
  engagementType?: string;
  offersBounties?: boolean;
  assets?: Array<{
    id?: string;
    identifier?: string;
  }>;
  inScopeAssets?: Array<{
    id?: string;
    identifier?: string;
  }>;
}

interface ReportsEnvelope<T> {
  content?: T[];
  items?: T[];
  data?: T[];
}

function toSeverity(value: ApiSeverity | null | undefined): ReportItem["severity"] {
  if (!value) return null;
  return value === "CRITICAL" || value === "HIGH" || value === "MEDIUM" || value === "LOW" ? value : null;
}

function toStatus(state: ApiState): ReportItem["status"] {
  switch (state) {
    case "NEW":
      return "SUBMITTED";
    case "TRIAGING":
    case "NEEDS_MORE_INFO":
      return "TRIAGING";
    case "RETESTING":
      return "RETESTING";
    case "VALID_CONFIRMED":
      return "ACCEPTED";
    case "RESOLVED":
      return "RESOLVED";
    case "REJECTED":
    case "DUPLICATE":
      return "REJECTED";
    default:
      return "SUBMITTED";
  }
}

function toActivityBadge(status: ReportItem["status"]): string {
  switch (status) {
    case "SUBMITTED":
      return "RECEIVED";
    case "TRIAGING":
      return "UNDER TRIAGE";
    case "RETESTING":
      return "RETEST REQUESTED";
    case "ACCEPTED":
      return "STATUS UPDATE";
    case "RESOLVED":
      return "PAYMENT ISSUED";
    case "REJECTED":
      return "CLOSURE";
  }
}

function toBountyDisplay(
  report: ReportApiResponse,
  status: ReportItem["status"]
): Pick<ReportItem, "bountyOrRep" | "isBountyHighlight" | "isBountyDim"> {
  const openRetest = openRetestAttempt(report.retestHistory);
  if (status === "RETESTING" && hasBountyReward(openRetest?.bountyReward)) {
    return {
      bountyOrRep: `+${formatBountyAmount(openRetest?.bountyReward)} Bonus`,
      isBountyHighlight: true,
    };
  }

  const total =
    report.rewards?.reduce(
      (sum, reward) => sum + (Number(reward.amount) || 0),
      0
    ) ?? 0;
  if (total > 0)
    return {
      bountyOrRep: `$${total.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      isBountyHighlight: true,
    };
  if (status === "REJECTED") return { bountyOrRep: "$0.00", isBountyDim: true };
  if (status === "RESOLVED" || status === "ACCEPTED")
    return { bountyOrRep: "Reputation Points", isBountyHighlight: true };
  return { bountyOrRep: "Pending Triage" };
}

function toLastActivityDate(report: ReportApiResponse): string {
  return formatDateTime(
    report.updatedAt ||
      report.resolvedAt ||
      report.triagedAt ||
      report.submittedAt ||
      report.createdAt,
  );
}

function toReportId(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function extractReports(
  response: ReportsEnvelope<ReportApiResponse> | ReportApiResponse[] | undefined,
): ReportApiResponse[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function composeVulnerabilityInformation(payload: SubmitReportPayload): string {
  const summary = payload.summaryPoC ?? "";

  if (payload.weaknessMode === "custom" && payload.cweIdentifier) {
    return `## Summary\n${summary}\n\n## Classification\nCWE: ${payload.cweIdentifier}`;
  }

  return summary;
}

function composeStepsToReproduce(payload: SubmitReportPayload): string | undefined {
  const steps = (payload.reproduceStepsList ?? [])
    .map((step) => step.trim())
    .filter(Boolean);

  const sections: string[] = [];
  if (steps.length) {
    sections.push(steps.map((step, index) => `${index + 1}. ${step}`).join("\n"));
  }

  const outcome = [
    payload.expectedResult ? `Expected: ${payload.expectedResult}` : null,
    payload.actualResult ? `Actual: ${payload.actualResult}` : null,
  ].filter((line): line is string => Boolean(line));
  if (outcome.length) sections.push(outcome.join("\n"));

  return sections.length ? sections.join("\n\n") : undefined;
}

function toInstant(day?: string): string | undefined {
  if (!day) return undefined;
  const parsed = new Date(day);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

const blankToUndefined = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

function toReportItem(
  report: ReportApiResponse,
  programName: string,
  organizationId?: string,
): ReportItem {
  const status = toStatus(report.state);
  return {
    id: report.id,
    reportId: toReportId(report.id),
    title: report.title,
    program: programName,
    programId: report.programId,
    organizationId,
    organizationName:
      (report as any).organizationName ||
      (report as any).org_name ||
      undefined,
    organizationLogoUrl:
      (report as any).organizationLogoUrl ||
      (report as any).org_logo ||
      undefined,
    organizationSlug:
      (report as any).organizationSlug ||
      (report as any).slug ||
      undefined,
    organizationWebsiteUrl:
      (report as any).organizationWebsiteUrl ||
      (report as any).website_url ||
      undefined,
    avatarLetter: programName.slice(0, 1).toUpperCase(),
    type: "Bounty",
    severity: toSeverity(report.severity),
    reportedSeverity: report.reportedSeverity ?? null,
    triageSeverity: report.triageSeverity ?? null,
    agreedSeverity: report.severity ?? null,
    settledSeverity: toSeverity(report.severity),
    hasSeverityDisagreement:
      report.severity === null &&
      report.triageSeverity != null &&
      report.reportedSeverity != null &&
      report.triageSeverity !== report.reportedSeverity,
    dispute: report.dispute ?? null,
    weaknessObj: report.weakness ?? null,
    suggestedWeakness: report.suggestedWeakness ?? (report as any).suggested_weakness ?? null,
    status,
    rawStatus: report.state,
    retestHistory: Array.isArray(report.retestHistory) ? report.retestHistory : [],
    reputationPoints: report.reputationPoints ?? null,
    reputationAwardedAt: report.reputationAwardedAt ?? null,
    firstRespondedAt: report.firstRespondedAt ?? null,
    ...toBountyDisplay(report, status),
    lastActivityDate: toLastActivityDate(report),
    lastActivityBadge: toActivityBadge(status),
    submittedAt: report.submittedAt || report.createdAt,
  };
}

function toReportDetail(
  report: ReportApiResponse,
  programName: string,
  organizationId?: string,
  programOffersBounties?: boolean,
): ReportDetail {
  const item = toReportItem(report, programName, organizationId);

  const submittedRaw = report.submittedAt || report.createdAt;
  const submittedDate = toDate(submittedRaw);
  const submittedAgo = submittedDate
    ? formatDateTime(submittedRaw)
    : "Recently";

  const attachments = (report.attachments ?? []).map((att) => ({
    id: att.id,
    name: att.fileName || att.filename || att.name || "Attachment",
    size:
      att.sizeBytes || att.fileSize || att.size
        ? `${Math.round((att.sizeBytes || att.fileSize || att.size || 0) / 1024)} KB`
        : undefined,
    type: att.mimeType || att.contentType || att.type || "file",
    url:
      attachmentUrl(
        att.downloadUrl || (att as any).fileUrl || (att as any).url,
      ) || undefined,
  }));

  const description =
    report.vulnerabilityInformation || report.summary || "No detailed description provided.";
  const impact =
    report.impact || "Impact information has not been explicitly provided for this report.";

  const reproduceSteps = (report.stepsToReproduce ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const updates: ActivityUpdate[] = [];

  if (report.submittedAt || report.createdAt) {
    updates.push({
      id: "submitted",
      actor: "Reporter",
      actionText: "submitted this report",
      statusBadge: "SUBMITTED",
      timestamp: formatDateTime(report.submittedAt || report.createdAt),
    });
  }

  if (report.triagedAt) {
    updates.push({
      id: "triaged",
      actor: "Triage",
      actionText: "reviewed the report",
      statusBadge: "TRIAGED",
      timestamp: formatDateTime(report.triagedAt),
    });
  }

  if (report.resolvedAt) {
    updates.push({
      id: "resolved",
      actor: "Program",
      actionText: "resolved the report",
      statusBadge: "RESOLVED",
      timestamp: formatDateTime(report.resolvedAt),
    });
  }

  const weakness = report.weakness
    ? [report.weakness.cweId, report.weakness.name].filter(Boolean).join(" · ")
    : "";

  return {
    ...item,
    submittedAgo,
    claimedSeverity: report.reportedSeverity ?? "Not specified",
    confirmedSeverity: report.triageSeverity ?? "Pending triage",
    cvssScore: typeof report.cvssScore === "number" ? report.cvssScore.toFixed(1) : null,
    cvssVector: report.cvssVector || null,
    rewardStatus: item.bountyOrRep,
    assetType:
      report.asset?.identifier ||
      report.assetName ||
      report.assetIdentifier ||
      "Not specified",
    environment: report.environment ? environmentLabel(report.environment) : null,
    policyUrl: `/dashboard/programs/${report.programId || ""}`,
    description,
    impact,
    reproduceSteps,
    proofOfConcept: report.proofOfConcept || null,
    remediation: report.remediationRecommendation || null,
    targetEndpoint: report.targetEndpoint || null,
    discoveredAt: report.discoveredAt ? formatDate(report.discoveredAt) : null,
    referenceLinks: Array.isArray(report.referenceLinks) ? report.referenceLinks : [],
    weakness: weakness || null,
    weaknessObj: report.weakness ?? null,
    suggestedWeakness: report.suggestedWeakness ?? (report as any).suggested_weakness ?? null,
    dispute: report.dispute ?? null,
    reporterId: report.reporterId || report.reporter?.id,
    reporterName:
      report.reporter?.name ||
      report.reporter?.username ||
      report.authorName ||
      report.researcherName ||
      report.submitterName,
    reporterEmail:
      report.reporter?.email ||
      report.authorEmail ||
      report.researcherEmail ||
      report.submitterEmail,
    reporterUsername: report.reporter?.username,
    attachments,
    comments: [],
    updates,
    retestHistory: Array.isArray(report.retestHistory) ? report.retestHistory : [],
    rewards: (Array.isArray(report.rewards) ? report.rewards : [])
      .filter((reward) => typeof reward.amount === "number")
      .map((reward) => ({
        amount: reward.amount as number,
        note: reward.note || undefined,
        awardedAt: reward.awardedAt || undefined,
      })),
    programOffersBounties: programOffersBounties ?? null,
  };
}

const isUuid = (value?: string | null): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export interface RequestRetestArgs {
  id: string;
  environment?: ReportEnvironment;
  targetEndpoint?: string;
  notes?: string;
  bountyReward?: string;
}

export interface SubmitRetestArgs {
  id: string;
  verdict: RetestVerdict;
  notes?: string;
  attachmentIds?: string[];
}

export interface ReopenReportArgs {
  id: string;
  triageSeverity: ApiSeverity;
}

async function applyReportResponse(
  id: string,
  dispatch: (action: unknown) => unknown,
  queryFulfilled: Promise<{ data: ReportDetail }>,
): Promise<void> {
  try {
    const { data } = await queryFulfilled;
    dispatch(reportsApi.util.upsertQueryData("getReportById", id, data));
  } catch {
    /* Surfaced by the component that called it. */
  }
}

async function toDetailWithProgram(
  report: ReportApiResponse,
  fetchWithBQ: (arg: string) => Promise<{ data?: unknown; error?: unknown }>,
): Promise<ReportDetail> {
  let programName = report.programName || "Security Program";
  let organizationId: string | undefined;
  let offersBounties: boolean | undefined;

  if (report.programId) {
    const progResult = await fetchWithBQ(`/programs/${report.programId}`);
    if (!progResult.error && progResult.data) {
      const program = progResult.data as ProgramApiResponse;
      programName = program.name || programName;
      organizationId = program.organizationId;
      offersBounties = program.offersBounties;
    }
  }

  return toReportDetail(report, programName, organizationId, offersBounties);
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getManagedReports: builder.query<ManagedReport[], void>({
      query: () => "/reports/management",
      providesTags: ["Report"],
    }),

    getReports: builder.query<ReportItem[], ReportsFilterParams | void>({
      async queryFn(params, _api, _extraOptions, fetchWithBQ) {
        const reportsResult = await fetchWithBQ(`/reports/mine?size=100&sort=submittedAt,DESC`);
        if (reportsResult.error) return { error: reportsResult.error };

        const raw = extractReports(
          reportsResult.data as
            | ReportsEnvelope<ReportApiResponse>
            | ReportApiResponse[]
            | undefined,
        );

        const programIds = Array.from(new Set(raw.map((report) => report.programId).filter(Boolean)));
        const programResults = await Promise.all(programIds.map((id) => fetchWithBQ(`/programs/${id}`)));
        const programNames = new Map<string, string>();
        const programOrgs = new Map<string, string>();
        programIds.forEach((id, index) => {
          const result = programResults[index];
          if (result.error) return;
          const program = result.data as ProgramApiResponse;
          programNames.set(id, program.name);
          if (program.organizationId) programOrgs.set(id, program.organizationId);
        });

        let results = raw.map((report) =>
          toReportItem(
            report,
            programNames.get(report.programId) ?? "Unknown Program",
            programOrgs.get(report.programId),
          ),
        );

        if (params?.search) {
          const q = params.search.toLowerCase();
          results = results.filter(
            (item) =>
              item.reportId.toLowerCase().includes(q) ||
              item.title.toLowerCase().includes(q) ||
              item.program.toLowerCase().includes(q)
          );
        }

        if (params?.status && params.status !== "All") {
          if (params.status === "Retesting" || params.status === "RETESTING") {
            results = results.filter(
              (item) => item.status === "RETESTING" || item.rawStatus === "RETESTING"
            );
          } else if (params.status === "Open") {
            results = results.filter(
              (item) => item.status === "TRIAGING" || item.status === "SUBMITTED" || item.status === "RETESTING"
            );
          } else if (params.status === "Resolved") {
            results = results.filter(
              (item) => item.status === "RESOLVED" || item.status === "ACCEPTED" || item.status === "REJECTED"
            );
          } else {
            results = results.filter(
              (item) => item.status.toLowerCase() === params.status?.toLowerCase()
            );
          }
        }

        if (params?.severity && params.severity !== "All" && params.severity !== "Severity: All") {
          results = results.filter(
            (item) => (item.severity ? item.severity.toLowerCase() === params.severity?.toLowerCase() : false)
          );
        }

        if (params?.program && params.program !== "All" && params.program !== "All programs") {
          results = results.filter(
            (item) =>
              item.program.toLowerCase() === params.program?.toLowerCase() ||
              item.programId === params.program
          );
        }

        if (params?.programId && params.programId !== "All") {
          results = results.filter(
            (item) => item.programId === params.programId
          );
        }

        return { data: results };
      },
      providesTags: ["Report"],
    }),

    getReportActivities: builder.query<ReportActivity[], string>({
      query: (id) => `/reports/${id}/activities`,
      transformResponse: (response: ReportActivity[] | null) =>
        Array.isArray(response) ? response : [],
      providesTags: (_result, _error, id) => [
        { type: "Report", id: `activities-${id}` },
      ],
    }),

    getReportById: builder.query<ReportDetail, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBQ) {
        const reportResult = await fetchWithBQ(`/reports/${id}`);

        if (reportResult.error) return { error: reportResult.error };

        const reportData = reportResult.data as ReportApiResponse;
        let programName = reportData.programName || "Security Program";
        let organizationId: string | undefined;
        let offersBounties: boolean | undefined;
        if (reportData.programId) {
          const progResult = await fetchWithBQ(`/programs/${reportData.programId}`);
          if (!progResult.error && progResult.data) {
            const program = progResult.data as ProgramApiResponse;
            programName = program.name || programName;
            organizationId = program.organizationId;
            offersBounties = program.offersBounties;
          }
        }

        return {
          data: toReportDetail(
            reportData,
            programName,
            organizationId,
            offersBounties,
          ),
        };
      },
      providesTags: (_result, _error, id) => [{ type: "Report", id }],
    }),

    addReportComment: builder.mutation<CommentItem, { reportId: string; text: string }>({
      queryFn: ({ text }) => {
        const newComment: CommentItem = {
          id: `c_${Date.now()}`,
          author: "hunter_x_ray",
          avatar: "H",
          isAdmin: false,
          timestamp: "Just now",
          text,
        };
        return { data: newComment };
      },
      invalidatesTags: (_result, _error, { reportId }) => [{ type: "Report", id: reportId }],
    }),

    submitReport: builder.mutation<SubmitReportResponse, SubmitReportPayload>({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        const reportedSeverity = payload.severity;
        const parsedScore = parseCvssScore(payload.cvssScore);
        const scoreAgreesWithSeverity =
          parsedScore !== null && severityForCvss(parsedScore) === payload.severity;

        const result = await fetchWithBQ({
          url: `/programs/${payload.programId}/reports`,
          method: "POST",
          body: {
            title: payload.title,
            vulnerabilityInformation: composeVulnerabilityInformation(payload),
            impact: blankToUndefined(payload.impact),
            stepsToReproduce: composeStepsToReproduce(payload),
            proofOfConcept: blankToUndefined(payload.pocPayload),
            remediationRecommendation: blankToUndefined(payload.remediation),
            targetEndpoint: blankToUndefined(payload.targetAsset),
            environment: blankToUndefined(payload.environment),
            discoveredAt: toInstant(payload.discoveredAt),
            referenceLinks: payload.externalLinks?.length
              ? payload.externalLinks.map((link) => link.trim()).filter(Boolean).slice(0, 10)
              : undefined,
            reportedSeverity,
            cvssVector: scoreAgreesWithSeverity
              ? blankToUndefined(payload.cvssVector)
              : undefined,
            cvssScore: scoreAgreesWithSeverity ? parsedScore ?? undefined : undefined,
            assetId: isUuid(payload.assetId) ? payload.assetId : undefined,
            weaknessId:
              payload.weaknessMode === "catalog" && isUuid(payload.weaknessId)
                ? payload.weaknessId
                : payload.weaknessMode === "custom" || payload.weaknessMode === "unsure"
                ? null
                : isUuid(payload.weaknessId) && (!payload.suggestedWeakness || !payload.suggestedWeakness.trim())
                ? payload.weaknessId
                : null,
            suggestedWeakness:
              payload.weaknessMode === "custom" && payload.suggestedWeakness && payload.suggestedWeakness.trim()
                ? payload.suggestedWeakness.trim().slice(0, 255)
                : payload.weaknessMode === "catalog" || payload.weaknessMode === "unsure"
                ? null
                : payload.suggestedWeakness && payload.suggestedWeakness.trim() && !isUuid(payload.weaknessId)
                ? payload.suggestedWeakness.trim().slice(0, 255)
                : null,
            suggested_weakness:
              payload.weaknessMode === "custom" && payload.suggestedWeakness && payload.suggestedWeakness.trim()
                ? payload.suggestedWeakness.trim().slice(0, 255)
                : payload.weaknessMode === "catalog" || payload.weaknessMode === "unsure"
                ? null
                : payload.suggestedWeakness && payload.suggestedWeakness.trim() && !isUuid(payload.weaknessId)
                ? payload.suggestedWeakness.trim().slice(0, 255)
                : null,
          },
        });
        if (result.error) return { error: result.error };

        const report = result.data as { id: string; submittedAt?: string; createdAt?: string };
        return {
          data: {
            success: true,
            reportId: toReportId(report.id),
            id: report.id,
            message: "Vulnerability report submitted successfully.",
            status: "TRIAGING",
            createdAt: report.submittedAt || report.createdAt || new Date().toISOString(),
          },
        };
      },
      invalidatesTags: ["Report"],
    }),

    uploadReportAttachment: builder.mutation<
      unknown,
      { reportId: string; file: File }
    >({
      query: ({ reportId, file }) => {
        const body = new FormData();
        body.append("file", file, file.name);
        return {
          url: `/reports/${reportId}/attachments`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: (_result, _error, { reportId }) => [
        { type: "Report", id: reportId },
        "Report",
      ],
    }),

    approveReport: builder.mutation<
      { success: boolean; message: string; reportId?: string },
      {
        id: string;
        severity: "Critical" | "High" | "Medium" | "Low" | "Info";
        explanation?: string;
        findingsSummary?: string;
        decisionReason?: string;
        improvementSuggestions?: string;
        bountyAmount?: string;
        files?: string[];
        weaknessId?: string;
      }
    >({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        const triageResult = await fetchWithBQ({
          url: `/reports/${payload.id}/triage`,
          method: "PATCH",
          body: {
            triageSeverity: toApiSeverity(payload.severity) ?? "NONE",
            state: "VALID_CONFIRMED",
            ...(isUuid(payload.weaknessId)
              ? { weaknessId: payload.weaknessId }
              : {}),
          },
        });

        if (triageResult.error) {
          return { error: triageResult.error };
        }

        if (payload.bountyAmount) {
          const numericAmount = parseFloat(
            payload.bountyAmount.replace(/[^0-9.]/g, "")
          );
          if (!isNaN(numericAmount) && numericAmount > 0) {
            const rewardResult = await fetchWithBQ({
              url: `/reports/${payload.id}/rewards`,
              method: "POST",
              body: {
                amount: numericAmount,
                ...(payload.explanation || payload.decisionReason
                  ? { note: payload.explanation || payload.decisionReason }
                  : {}),
              },
            });

            if (rewardResult.error) {
              return { error: rewardResult.error };
            }
          }
        }

        const feedback = [
          payload.findingsSummary,
          payload.explanation || payload.decisionReason,
          payload.improvementSuggestions,
        ]
          .map((part) => part?.trim())
          .filter((part): part is string => Boolean(part));

        if (feedback.length) {
          await fetchWithBQ({
            url: "/comments",
            method: "POST",
            body: {
              commentableType: "REPORT",
              commentableId: payload.id,
              content: `**[Report Accepted]** ${feedback.join("\n\n")}`,
              internal: false,
            },
          });
        }

        return {
          data: {
            success: true,
            message: `Report #${payload.id} successfully approved and severity set to ${payload.severity}.`,
            reportId: payload.id,
          },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Report", id },
        "Report",
        "Profile",
      ],
    }),

    rejectReport: builder.mutation<
      { success: boolean; message: string; reportId?: string },
      {
        id: string;
        reason?: string;
        explanation?: string;
        decisionReason?: string;
        files?: string[];
      }
    >({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        const triageResult = await fetchWithBQ({
          url: `/reports/${payload.id}/triage`,
          method: "PATCH",
          body: {
            triageSeverity: "NONE",
            state: "REJECTED",
          },
        });

        if (triageResult.error) {
          return { error: triageResult.error };
        }

        const reason =
          payload.decisionReason || payload.reason || payload.explanation;
        if (reason) {
          await fetchWithBQ({
            url: "/comments",
            method: "POST",
            body: {
              commentableType: "REPORT",
              commentableId: payload.id,
              content: `**[Report Rejected]** ${reason}`,
              internal: false,
            },
          });
        }

        return {
          data: {
            success: true,
            message: `Report #${payload.id} has been rejected.`,
            reportId: payload.id,
          },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Report", id }, "Report"],
    }),

    requestMoreInfo: builder.mutation<
      { success: boolean; message: string; reportId?: string },
      { id: string; severity?: string; question: string }
    >({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        const triageResult = await fetchWithBQ({
          url: `/reports/${payload.id}/triage`,
          method: "PATCH",
          body: {
            triageSeverity: toApiSeverity(payload.severity) ?? "NONE",
            state: "NEEDS_MORE_INFO",
          },
        });

        if (triageResult.error) return { error: triageResult.error };

        const question = payload.question?.trim();
        if (question) {
          await fetchWithBQ({
            url: "/comments",
            method: "POST",
            body: {
              commentableType: "REPORT",
              commentableId: payload.id,
              content: `**[More Information Needed]** ${question}`,
              internal: false,
            },
          });
        }

        return {
          data: {
            success: true,
            message: "The reporter has been asked for more information.",
            reportId: payload.id,
          },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Report", id },
        "Report",
      ],
    }),

    markDuplicate: builder.mutation<
      { success: boolean; message: string; reportId?: string },
      { id: string; duplicateOfId: string; note?: string }
    >({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        if (!isUuid(payload.duplicateOfId)) {
          return {
            error: {
              status: 400,
              data: {
                message:
                  "The original report's id must be a UUID. Copy it from that report's address bar.",
              },
            },
          };
        }

        const triageResult = await fetchWithBQ({
          url: `/reports/${payload.id}/triage`,
          method: "PATCH",
          body: {
            triageSeverity: "NONE",
            state: "DUPLICATE",
            duplicateOfId: payload.duplicateOfId,
          },
        });

        if (triageResult.error) return { error: triageResult.error };

        const note = payload.note?.trim();
        await fetchWithBQ({
          url: "/comments",
          method: "POST",
          body: {
            commentableType: "REPORT",
            commentableId: payload.id,
            content: `**[Closed as Duplicate]** This finding was already reported as ${payload.duplicateOfId}.${note ? ` ${note}` : ""}`,
            internal: false,
          },
        });

        return {
          data: {
            success: true,
            message: "The report has been closed as a duplicate.",
            reportId: payload.id,
          },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Report", id },
        "Report",
      ],
    }),

    awardRecognition: builder.mutation<
      {
        id: string;
        userId: string;
        programId: string;
        reportId: string;
        title: string;
        description?: string | null;
        awardedBy: string;
        awardedAt: string;
        severity?: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | string;
        createdAt?: string;
        updatedAt?: string;
        program?: {
          id: string;
          name: string;
          handle: string;
          organizationId: string;
          organizationName: string;
          organizationSlug: string;
          organizationLogoUrl?: string | null;
        } | null;
      },
      {
        reportId: string;
        title: string;
        description?: string | null;
        userId?: string;
        programId?: string;
      }
    >({
      query: ({ reportId, title, description }) => ({
        url: "/recognitions",
        method: "POST",
        body: {
          reportId,
          title: title.trim(),
          ...(description?.trim() ? { description: description.trim() } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { reportId, userId, programId }) => [
        { type: "Report", id: reportId },
        { type: "Report" },
        { type: "Profile" },
        ...(userId ? [{ type: "Profile" as const, id: `${userId}-recognitions` }] : []),
        { type: "Leaderboard" },
        { type: "Program" },
        ...(programId ? [{ type: "Program" as const, id: `${programId}-thanks` }] : []),
        { type: "Organization" },
      ],
    }),

    recordReward: builder.mutation<
      { success: boolean; message?: string },
      { id: string; amount: number; note?: string }
    >({
      query: ({ id, amount, note }) => ({
        url: `/reports/${id}/rewards`,
        method: "POST",
        body: {
          amount,
          ...(note ? { note } : {}),
        },
      }),
      invalidatesTags: ["Report", "Profile", "Leaderboard"],
    }),

    resolveReport: builder.mutation<
      { success: boolean; message: string; reportId?: string },
      {
        id: string;
        severity?: "Critical" | "High" | "Medium" | "Low" | "Info" | string;
        resolutionNote?: string;
        comment?: string;
      }
    >({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        const triageSeverity = toApiSeverity(payload.severity) ?? "MEDIUM";
        const triageResult = await fetchWithBQ({
          url: `/reports/${payload.id}/triage`,
          method: "PATCH",
          body: {
            triageSeverity,
            state: "RESOLVED",
          },
        });

        if (triageResult.error) {
          return { error: triageResult.error };
        }

        const note = payload.resolutionNote || payload.comment;
        if (note) {
          await fetchWithBQ({
            url: "/comments",
            method: "POST",
            body: {
              commentableType: "REPORT",
              commentableId: payload.id,
              content: `**[Report Resolved]** ${note}`,
              internal: false,
            },
          });
        }

        return {
          data: {
            success: true,
            message: `Report #${payload.id} successfully marked as Resolved.`,
            reportId: payload.id,
          },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Report", id },
        "Report",
        "Profile",
        "Leaderboard",
      ],
    }),

    acceptSeverity: builder.mutation<ReportDetail, { id: string }>({
      async queryFn({ id }, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ({
          url: `/reports/${id}/severity/accept`,
          method: "POST",
        });

        if (result.error) return { error: result.error };

        return {
          data: await toDetailWithProgram(
            result.data as ReportApiResponse,
            fetchWithBQ as never,
          ),
        };
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await applyReportResponse(id, dispatch, queryFulfilled);
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Report", id: `activities-${id}` },
        "Report",
      ],
    }),

    rejectSeverity: builder.mutation<
      ReportDetail,
      { id: string; reason: string }
    >({
      async queryFn({ id, reason }, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ({
          url: `/reports/${id}/severity/reject`,
          method: "POST",
          body: { reason: reason.trim() },
        });

        if (result.error) return { error: result.error };

        return {
          data: await toDetailWithProgram(
            result.data as ReportApiResponse,
            fetchWithBQ as never,
          ),
        };
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await applyReportResponse(id, dispatch, queryFulfilled);
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Report", id: `activities-${id}` },
        "Report",
      ],
    }),

    requestRetest: builder.mutation<ReportDetail, RequestRetestArgs>({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ({
          url: `/reports/${payload.id}/retest/request`,
          method: "POST",
          body: {
            environment: payload.environment || "STAGING",
            targetEndpoint: payload.targetEndpoint || undefined,
            notes: payload.notes || undefined,
            bountyReward: payload.bountyReward
              ? Number(payload.bountyReward)
              : undefined,
          },
        });

        if (result.error) return { error: result.error };

        return {
          data: await toDetailWithProgram(
            result.data as ReportApiResponse,
            fetchWithBQ as never,
          ),
        };
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await applyReportResponse(id, dispatch, queryFulfilled);
      },
      invalidatesTags: ["Report"],
    }),

    submitRetest: builder.mutation<ReportDetail, SubmitRetestArgs>({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ({
          url: `/reports/${payload.id}/retest/submit`,
          method: "POST",
          body: {
            verdict: payload.verdict,
            notes: payload.notes || undefined,
            attachmentIds: payload.attachmentIds?.length
              ? payload.attachmentIds
              : undefined,
          },
        });

        if (result.error) return { error: result.error };

        return {
          data: await toDetailWithProgram(
            result.data as ReportApiResponse,
            fetchWithBQ as never,
          ),
        };
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await applyReportResponse(id, dispatch, queryFulfilled);
      },
      invalidatesTags: ["Report", "Profile", "Leaderboard"],
    }),

    reopenResolvedReport: builder.mutation<ReportDetail, ReopenReportArgs>({
      async queryFn(payload, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ({
          url: `/reports/${payload.id}/triage`,
          method: "PATCH",
          body: {
            triageSeverity: payload.triageSeverity,
            state: "VALID_CONFIRMED",
          },
        });

        if (result.error) return { error: result.error };

        return {
          data: await toDetailWithProgram(
            result.data as ReportApiResponse,
            fetchWithBQ as never,
          ),
        };
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        await applyReportResponse(id, dispatch, queryFulfilled);
      },
      invalidatesTags: ["Report"],
    }),

    getCompanyReportsQueue: builder.query<
      {
        content: ReportApiResponse[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
      },
      {
        programId?: string;
        state?: string;
        page?: number;
        size?: number;
        sort?: string;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) queryParams.set("page", params.page.toString());
        if (params?.size !== undefined) queryParams.set("size", params.size.toString());
        if (params?.sort) queryParams.set("sort", params.sort);
        if (params?.programId) queryParams.set("programId", params.programId);
        if (params?.state) queryParams.set("state", params.state);
        const qs = queryParams.toString();
        return qs ? `/reports?${qs}` : "/reports";
      },
      providesTags: ["Report"],
    }),

    getProgramReports: builder.query<
      {
        content: ReportApiResponse[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
      },
      {
        programId: string;
        page?: number;
        size?: number;
        sort?: string;
        state?: string;
      }
    >({
      query: ({ programId, page = 0, size = 20, sort = "submittedAt,desc", state }) => {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          sort,
        });
        if (state) queryParams.set("state", state);
        return `/programs/${programId}/reports?${queryParams.toString()}`;
      },
      providesTags: ["Report"],
    }),
  }),
});

export const {
  useGetManagedReportsQuery,
  useGetReportsQuery,
  useGetReportByIdQuery,
  useGetReportActivitiesQuery,
  useAcceptSeverityMutation,
  useRejectSeverityMutation,
  useGetCompanyReportsQueueQuery,
  useGetProgramReportsQuery,
  useAddReportCommentMutation,
  useSubmitReportMutation,
  useUploadReportAttachmentMutation,
  useApproveReportMutation,
  useRejectReportMutation,
  useRequestMoreInfoMutation,
  useMarkDuplicateMutation,
  useAwardRecognitionMutation,
  useRecordRewardMutation,
  useResolveReportMutation,
  useRequestRetestMutation,
  useSubmitRetestMutation,
  useReopenResolvedReportMutation,
} = reportsApi;
