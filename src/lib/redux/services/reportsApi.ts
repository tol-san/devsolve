import { baseApi } from "./baseApi";
import {
  environmentLabel,
  parseCvssScore,
  severityForCvss,
} from "@/lib/validations/report";
import { formatDate, formatDateTime, toDate } from "@/lib/format/datetime";
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
import { MOCK_REPORTS } from "@/lib/types/reports/mock-data";

export * from "@/lib/types/reports/types";
export * from "@/lib/types/reports/mock-data";

type ApiSeverity = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type ApiState = "NEW" | "TRIAGING" | "NEEDS_MORE_INFO" | "VALID_CONFIRMED" | "RESOLVED" | "REJECTED" | "DUPLICATE";

// Real shape of GET /api/v1/reports/mine content items (per the live OpenAPI
// spec at devsolve-api.quizzy.it.com/v3/api-docs). No program display name is
// included anywhere on this object — only programId — so it's resolved
// separately per report via GET /programs/{id}, same as getHacktivity in
// profileApi.ts.
interface ReportApiResponse {
  id: string;
  programId: string;
  reporterId?: string;
  title: string;
  reportedSeverity?: ApiSeverity;
  triageSeverity?: ApiSeverity;
  severity?: ApiSeverity;
  state: ApiState;
  rewards?: { amount: number }[];
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
    filename?: string;
    name?: string;
    fileSize?: number;
    size?: number;
    contentType?: string;
    type?: string;
    createdAt?: string;
  }>;
  /* The fields `ReportResponse` grew when the submission form stopped folding
     everything into one write-up. The detail screen filled these in with
     invented values while they had nowhere to come from. */
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
  asset?: { id?: string; assetType?: string; identifier?: string };
  disclosureStatus?: string;
}

interface ProgramApiResponse {
  id: string;
  name: string;
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

interface ReportsEnvelope<T> {
  content?: T[];
  items?: T[];
  data?: T[];
}

// severity/triageSeverity are only set once a report has been triaged, so
// reportedSeverity (the hacker's self-assessment) is the fallback. "NONE"
// has no equivalent in ReportItem's severity union, so it collapses to LOW
// rather than breaking the badge renderer.
function toSeverity(report: ReportApiResponse): ReportItem["severity"] {
  const value = report.severity ?? report.triageSeverity ?? report.reportedSeverity;
  return value === "CRITICAL" || value === "HIGH" || value === "MEDIUM" || value === "LOW" ? value : "LOW";
}

// Backend state enum is more granular than the UI's status union — collapse
// NEEDS_MORE_INFO into TRIAGING (still awaiting the hunter) and DUPLICATE
// into REJECTED (no further action, no reward) since neither has a distinct
// badge in the UI.
function toStatus(state: ApiState): ReportItem["status"] {
  switch (state) {
    case "NEW":
      return "SUBMITTED";
    case "TRIAGING":
    case "NEEDS_MORE_INFO":
      return "TRIAGING";
    case "VALID_CONFIRMED":
      return "ACCEPTED";
    case "RESOLVED":
      return "RESOLVED";
    case "REJECTED":
    case "DUPLICATE":
      return "REJECTED";
  }
}

function toActivityBadge(status: ReportItem["status"]): string {
  switch (status) {
    case "SUBMITTED":
      return "RECEIVED";
    case "TRIAGING":
      return "UNDER TRIAGE";
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
  const total = report.rewards?.reduce((sum, reward) => sum + (reward.amount ?? 0), 0) ?? 0;
  if (total > 0) return { bountyOrRep: `$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, isBountyHighlight: true };
  if (status === "REJECTED") return { bountyOrRep: "$0.00", isBountyDim: true };
  if (status === "RESOLVED" || status === "ACCEPTED") return { bountyOrRep: "Reputation" };
  return { bountyOrRep: "Pending Triage" };
}

/* Down to the second. Two reports touched on the same day are a common sight
   on this list, and the date alone left no way to tell which moved last. */
function toLastActivityDate(report: ReportApiResponse): string {
  return formatDateTime(
    report.updatedAt ||
      report.resolvedAt ||
      report.triagedAt ||
      report.submittedAt ||
      report.createdAt,
  );
}

// The backend identifies reports by UUID with no separate human-readable
// report number, so the first 8 hex chars stand in for the old "#DS-2026-101"
// mock format.
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


/**
 * The write-up, carrying only what `CreateReportRequest` has no field for.
 *
 * It used to carry everything: the request exposed one free-text field, so the
 * whole multi-step form was flattened into a single Markdown document —
 * reproduction steps, PoC, remediation and all. The request now has real
 * fields for those, and they are sent as themselves, which is what lets a
 * triager read, filter and act on them instead of parsing prose.
 *
 * What is left here has genuinely nowhere else to go: the HTTP method and
 * parameter that qualify the endpoint, and the classification. Classification
 * stays as text because `weaknessId` is a UUID into a weakness catalogue the
 * API publishes no endpoint to read — there is no id to look up, so the CWE
 * the reporter typed is preserved as prose rather than dropped.
 */
function composeVulnerabilityInformation(payload: SubmitReportPayload): string {
  const sections: string[] = [`## Summary\n${payload.summaryPoC}`];

  const targetLines = [
    payload.httpMethod ? `HTTP Method: ${payload.httpMethod}` : null,
    payload.vulnerableParameter ? `Vulnerable Parameter: ${payload.vulnerableParameter}` : null,
  ].filter((line): line is string => Boolean(line));
  if (targetLines.length) sections.push(`## Request\n${targetLines.join("\n")}`);

  const classificationLines = [
    `Category: ${payload.category}`,
    payload.cweIdentifier ? `CWE: ${payload.cweIdentifier}` : null,
  ].filter((line): line is string => Boolean(line));
  sections.push(`## Classification\n${classificationLines.join("\n")}`);

  /* Attachment bytes need `POST /reports/{id}/attachments`, which happens
     after the report exists and is not wired yet — so what the reader picked
     is at least named, rather than vanishing without a word. */
  if (payload.attachments?.length) {
    sections.push(
      `## Attachments the reporter prepared\n${payload.attachments
        .map((a) => `- ${a.name} (${a.size}, ${a.type})`)
        .join("\n")}`
    );
  }

  return sections.join("\n\n");
}

/** The numbered steps, with the outcome they were meant to produce. */
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

/** A date input gives `YYYY-MM-DD`; the field is an instant. */
function toInstant(day?: string): string | undefined {
  if (!day) return undefined;
  const parsed = new Date(day);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

const blankToUndefined = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

function toReportItem(report: ReportApiResponse, programName: string): ReportItem {
  const status = toStatus(report.state);
  return {
    id: report.id,
    reportId: toReportId(report.id),
    title: report.title,
    program: programName,
    avatarLetter: programName.slice(0, 1).toUpperCase(),
    type: "Bounty",
    severity: toSeverity(report),
    status,
    ...toBountyDisplay(report, status),
    lastActivityDate: toLastActivityDate(report),
    lastActivityBadge: toActivityBadge(status),
  };
}

function toReportDetail(report: ReportApiResponse, programName: string): ReportDetail {
  const item = toReportItem(report, programName);

  /* Parsed through `toDate` so a timestamp without a zone marker is read as
     the UTC it is; `new Date` alone treated it as local time, which moved the
     age of a report by the reader's own offset — and rounded a report filed
     hours ago up to a whole day. */
  const submittedDate = toDate(report.submittedAt || report.createdAt);
  const submittedAgo = submittedDate
    ? `${Math.max(1, Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)))} days ago`
    : "Recently";

  /* No stand-in file. An attachment list that invents "poc-evidence.png,
     1.8 MB" on every report with none tells the reader there is evidence to
     open, and there is not. Sizes and types are only stated when the response
     carries them. */
  const attachments = (report.attachments ?? []).map((att) => ({
    name: att.filename || att.name || "Attachment",
    size: att.fileSize ? `${Math.round(att.fileSize / 1024)} KB` : undefined,
    type: att.contentType || att.type || "file",
  }));

  const description =
    report.vulnerabilityInformation || report.summary || "No detailed description provided.";
  const impact =
    report.impact || "Impact information has not been explicitly provided for this report.";

  /* The steps arrive as one block of text, numbered by whoever wrote them.
     Splitting on lines keeps that numbering intact instead of renumbering
     someone else's list. */
  const reproduceSteps = (report.stepsToReproduce ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  /* Built from the timestamps the report actually carries. This was a single
     hardcoded "submitted report to triage queue" line regardless of how far
     the report had travelled. */
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
    claimedSeverity: report.reportedSeverity ?? report.severity ?? item.severity,
    confirmedSeverity: report.triageSeverity ?? report.severity ?? item.severity,
    /* The reporter's own score. It used to be derived from the severity band
       with a fixed ladder — 9.8 for anything Critical, 8.1 for High — so every
       report of a given severity displayed the same invented number. */
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
    referenceLinks: report.referenceLinks ?? [],
    weakness: weakness || null,
    attachments,
    /* The API has no comments endpoint, so there is no discussion to show. It
       used to render a "DevSolve Triage Bot" notice that no one had written. */
    comments: [],
    updates,
    retestHistory: [],
  };
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
        programIds.forEach((id, index) => {
          const result = programResults[index];
          if (!result.error) programNames.set(id, (result.data as ProgramApiResponse).name);
        });

        let results = raw.map((report) => toReportItem(report, programNames.get(report.programId) ?? "Unknown Program"));

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
          if (params.status === "Open") {
            results = results.filter(
              (item) => item.status === "TRIAGING" || item.status === "SUBMITTED"
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
            (item) => item.severity.toLowerCase() === params.severity?.toLowerCase()
          );
        }

        return { data: results };
      },
      providesTags: ["Report"],
    }),

    getReportById: builder.query<ReportDetail, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBQ) {
        const reportResult = await fetchWithBQ(`/reports/${id}`);

        /* The error is passed on rather than answered with a stand-in report.
           A failed fetch used to fall through to `MOCK_REPORT_DETAIL` — a
           complete, plausible "Broken Access Control on User Profile API"
           filed against "Global Enterprise VDP" — so a reader opening a report
           that could not be loaded was shown someone else's fiction and had no
           way to know. */
        if (reportResult.error) return { error: reportResult.error };

        const reportData = reportResult.data as ReportApiResponse;
        let programName = reportData.programName || "Security Program";
        if (reportData.programId && !reportData.programName) {
          const progResult = await fetchWithBQ(`/programs/${reportData.programId}`);
          if (!progResult.error && progResult.data) {
            programName = (progResult.data as ProgramApiResponse).name || programName;
          }
        }

        return { data: toReportDetail(reportData, programName) };
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
        const isUuid = (str?: string) =>
          typeof str === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        /* The backend refuses a report whose CVSS score is rated differently
           from its severity ("A CVSS score of 8.6 is rated HIGH, which does
           not match the reported severity LOW"). The severity is what the
           reporter chose on screen, so a score that contradicts it is dropped
           here rather than failing the whole submission — this is the last
           point every path passes through, whichever screen set what. */
        const reportedSeverity =
          payload.severity === "INFO" ? "NONE" : payload.severity;
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
            /* The field is capped at ten, and an empty row is something the
               reader left behind rather than a link. */
            referenceLinks: payload.externalLinks?.length
              ? payload.externalLinks.map((link) => link.trim()).filter(Boolean).slice(0, 10)
              : undefined,
            // Backend has no "INFO" tier — the closest real equivalent is
            // NONE (see CreateReportRequest.reportedSeverity enum).
            reportedSeverity,
            // A vector implies the score it produces, so the two travel together.
            cvssVector: scoreAgreesWithSeverity
              ? blankToUndefined(payload.cvssVector)
              : undefined,
            cvssScore: scoreAgreesWithSeverity ? parsedScore ?? undefined : undefined,
            assetId: isUuid(payload.assetId) ? payload.assetId : undefined,
            /* Present only when the reporter picked a catalogue entry. A
               free-text category has no id, and anything else here would be
               rejected as a bad foreign key. The category is still written
               into the write-up either way — that is what a triager reads. */
            weaknessId: isUuid(payload.weaknessId) ? payload.weaknessId : undefined,
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
  }),
});

export const {
  useGetManagedReportsQuery,
  useGetReportsQuery,
  useGetReportByIdQuery,
  useAddReportCommentMutation,
  useSubmitReportMutation,
} = reportsApi;
