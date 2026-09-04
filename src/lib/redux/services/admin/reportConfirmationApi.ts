import { baseApi } from "../baseApi";
import { toApiSeverity } from "@/lib/reports/severity";
import {
  ReportConfirmationItem,
  DisputeItem,
  ResolveDisputePayload,
} from "@/lib/types/admin/types";
import {
  mockReportConfirmationsStore,
  updateMockReportConfirmationsStore,
} from "./adminMockData";

type ApiTier = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
type DisplayTier = NonNullable<ReportConfirmationItem["severity"]>;

/**
 * A row of `GET /reports/management`, as far as this screen reads it.
 */
type ManagementRow = {
  id: string;
  reportId?: string;
  title?: string;
  author?: string;
  type?: string;
  severity?: DisplayTier | null;
  reportedSeverity?: ApiTier | string | null;
  triageSeverity?: ApiTier | string | null;
  cvssScore?: number | null;
  cvssVector?: string | null;
  queueState?: string;
  status?: string;
  submittedAt?: string;
  summary?: string;
  assets?: string[];
  dispute?: {
    id?: string;
    status?: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED" | "AWAITING_REPORTER";
    reason?: string;
    resolvedSeverity?: ApiTier | string | null;
    respondBy?: string | null;
  } | null;
};

/** The API's constant as it reads on screen. */
function toTier(value: ApiTier | string | null | undefined): DisplayTier | null {
  if (!value) return null;
  const upper = value.toUpperCase();
  switch (upper) {
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

/**
 * The two sides of the severity rating, kept apart.
 *
 * Never falls back to settled rating to mask disagreements.
 */
function toSeverityPair(
  raw: Pick<
    ManagementRow,
    "severity" | "reportedSeverity" | "triageSeverity" | "cvssScore"
  >,
): Pick<
  ReportConfirmationItem,
  "hackerClaimedSeverity" | "companyConfirmedSeverity" | "severitiesAgree"
> {
  const claimedTier = toTier(raw.reportedSeverity) ?? (raw.severity || "Medium");
  const confirmedTier = toTier(raw.triageSeverity) ?? (raw.severity || "Medium");
  const triaged = toTier(raw.triageSeverity) !== null;
  const cvss =
    typeof raw.cvssScore === "number" ? `CVSS ${raw.cvssScore}` : undefined;

  return {
    hackerClaimedSeverity: { tier: claimedTier, cvss },
    companyConfirmedSeverity: { tier: confirmedTier, cvss },
    severitiesAgree: triaged && raw.severity != null ? claimedTier === confirmedTier : false,
  };
}

export const reportConfirmationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportConfirmations: builder.query<ReportConfirmationItem[], void>({
      async queryFn(_args, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ("/reports/management");
        if (!result.error && Array.isArray(result.data) && result.data.length > 0) {
          const mapped: ReportConfirmationItem[] = (result.data as ManagementRow[]).map((r) => {
            const statusMap: Record<string, "PENDING" | "CONFIRMED" | "REJECTED" | "ESCALATED"> = {
              PENDING: "PENDING",
              UNDER_REVIEW: "PENDING",
              APPROVED: "CONFIRMED",
              CLOSED: "REJECTED",
            };
            const isDisputed = Boolean(
              r.dispute &&
              r.dispute.status !== "RESOLVED" &&
              r.dispute.status !== "DISMISSED"
            );
            const status = isDisputed
              ? "ESCALATED"
              : statusMap[r.queueState ?? ""] || (r.status === "Open" ? "PENDING" : "CONFIRMED");
            return {
              id: r.id,
              reportCode: r.reportId || `RPT-${r.id.slice(0, 8)}`,
              title: r.title || "Untitled Vulnerability Report",
              researcherName: r.author || "Security Researcher",
              companyName: "DevSolve Security",
              programName: r.type ? `${r.type} Program` : "Bug Bounty Program",
              severity: r.severity ?? null,
              reportedSeverity: toTier(r.reportedSeverity),
              triageSeverity: toTier(r.triageSeverity),
              status,
              submittedAt: r.submittedAt || "Recently",
              rewardEstimate:
                r.severity === "Critical"
                  ? "$2,500 - $5,000"
                  : r.severity === "High"
                  ? "$1,000 - $2,500"
                  : "$250 - $1,000",
              category: r.type || "Vulnerability",
              targetAsset: r.assets?.[0] || "Target System",
              description: r.summary || "Submitted vulnerability report awaiting organization triage.",
              impact: r.summary || "Vulnerability impact details.",
              disputeId: r.dispute?.id,
              disputeReason: r.dispute?.reason,
              disputeStatus: r.dispute?.status,
              disputeResolvedSeverity: toTier(r.dispute?.resolvedSeverity),
              disputeRespondBy: r.dispute?.respondBy,
              ...toSeverityPair(r),
            };
          });
          return { data: mapped };
        }
        return { data: mockReportConfirmationsStore.map((r) => ({ ...r })) };
      },
      providesTags: ["Report"],
    }),
    getReportConfirmationById: builder.query<ReportConfirmationItem, string>({
      async queryFn(id, _api, _extraOptions, fetchWithBQ) {
        const foundMock = mockReportConfirmationsStore.find((r) => r.id === id);

        // 1. Fetch live report details first for full dispute & severity fidelity
        const reportRes = await fetchWithBQ(`/reports/${id}`);
        if (!reportRes.error && reportRes.data && typeof reportRes.data === "object") {
          const raw = reportRes.data as any;
          const claimedTier = toTier(raw.reportedSeverity) ?? "Medium";
          const confirmedTier = toTier(raw.triageSeverity) ?? "Medium";
          const agreedTier = toTier(raw.severity);
          const isDisputed = Boolean(
            raw.dispute &&
            raw.dispute.status !== "RESOLVED" &&
            raw.dispute.status !== "DISMISSED"
          );

          const mapped: ReportConfirmationItem = {
            ...(foundMock || {}),
            id: raw.id,
            reportCode: raw.reportCode || raw.reportId || `RPT-${raw.id.slice(0, 8)}`,
            title: raw.title || "Untitled Vulnerability Report",
            researcherName:
              raw.reporter?.name ||
              raw.researcherName ||
              raw.authorName ||
              raw.submitterName ||
              "Security Researcher",
            companyName: raw.organizationName || "DevSolve Security",
            programName: raw.programName ? `${raw.programName}` : "Bug Bounty Program",
            severity: agreedTier,
            reportedSeverity: toTier(raw.reportedSeverity),
            triageSeverity: toTier(raw.triageSeverity),
            status: isDisputed
              ? "ESCALATED"
              : raw.state === "RESOLVED" || raw.state === "VALID_CONFIRMED"
              ? "CONFIRMED"
              : raw.state === "REJECTED"
              ? "REJECTED"
              : "PENDING",
            submittedAt: raw.submittedAt || raw.createdAt || "Recently",
            rewardEstimate:
              raw.rewards?.[0]?.amount
                ? `$${raw.rewards[0].amount}`
                : agreedTier === "Critical"
                ? "$2,500 - $5,000"
                : agreedTier === "High"
                ? "$1,000 - $2,500"
                : "$250 - $1,000",
            rewardAmount: raw.rewards?.[0]?.amount ? `$${raw.rewards[0].amount}` : undefined,
            category: raw.type || raw.category || "Vulnerability",
            cwe: raw.weakness?.cweId || raw.cweIdentifier,
            cvssScore: typeof raw.cvssScore === "number" ? raw.cvssScore.toFixed(1) : undefined,
            cvssVector: raw.cvssVector || undefined,
            targetAsset: raw.targetEndpoint || raw.asset?.identifier || raw.assetName || "Target System",
            description: raw.summary || raw.vulnerabilityInformation || raw.description || "Submitted vulnerability report awaiting triage.",
            impact: raw.impact || "Vulnerability impact details.",
            reproduceSteps: raw.stepsToReproduce ? raw.stepsToReproduce.split("\n") : (raw.reproduceStepsList || []),
            pocPayload: raw.proofOfConcept || raw.pocPayload,
            attachments: Array.isArray(raw.attachments)
              ? raw.attachments.map((a: any) => ({
                  name: a.fileName || a.name || "attachment",
                  size: a.sizeBytes ? `${(a.sizeBytes / 1024).toFixed(1)} KB` : undefined,
                  type: a.mimeType || a.type || "application/octet-stream",
                  previewUrl: a.downloadUrl,
                }))
              : [],
            hackerClaimedSeverity: {
              tier: claimedTier,
              cvss: raw.cvssScore ? `CVSS ${raw.cvssScore}` : undefined,
            },
            companyConfirmedSeverity: {
              tier: confirmedTier,
              cvss: raw.cvssScore ? `CVSS ${raw.cvssScore}` : undefined,
            },
            severitiesAgree: raw.severity != null && claimedTier === confirmedTier,
            disputeId: raw.dispute?.id,
            disputeReason: raw.dispute?.reason,
            disputeStatus: raw.dispute?.status,
            disputeResolvedSeverity: toTier(raw.dispute?.resolvedSeverity),
            disputeRespondBy: raw.dispute?.respondBy,
          };
          return { data: mapped };
        }

        // 2. Fallback to /reports/management list
        const result = await fetchWithBQ("/reports/management");
        if (!result.error && Array.isArray(result.data)) {
          const raw = (result.data as ManagementRow[]).find((r) => r.id === id);
          if (raw) {
            const mapped: ReportConfirmationItem = {
              ...(foundMock || {}),
              id: raw.id,
              reportCode: raw.reportId || `RPT-${raw.id.slice(0, 8)}`,
              title: raw.title || "Untitled Vulnerability Report",
              researcherName: raw.author || "Security Researcher",
              companyName: "DevSolve Security",
              programName: raw.type ? `${raw.type} Program` : "Bug Bounty Program",
              severity: raw.severity ?? null,
              reportedSeverity: toTier(raw.reportedSeverity),
              triageSeverity: toTier(raw.triageSeverity),
              status:
                raw.dispute?.status === "OPEN" || raw.dispute?.status === "UNDER_REVIEW"
                  ? "ESCALATED"
                  : raw.queueState === "PENDING"
                  ? "PENDING"
                  : raw.queueState === "APPROVED"
                  ? "CONFIRMED"
                  : raw.queueState === "CLOSED"
                  ? "REJECTED"
                  : "PENDING",
              submittedAt: raw.submittedAt || "Recently",
              rewardEstimate:
                raw.severity === "Critical"
                  ? "$2,500 - $5,000"
                  : raw.severity === "High"
                  ? "$1,000 - $2,500"
                  : "$250 - $1,000",
              category: raw.type || "Vulnerability",
              targetAsset: raw.assets?.[0] || "Target System",
              description: raw.summary || "Submitted vulnerability report awaiting organization triage.",
              impact: raw.summary || "Vulnerability impact details.",
              disputeId: raw.dispute?.id,
              disputeReason: raw.dispute?.reason,
              disputeStatus: raw.dispute?.status,
              disputeResolvedSeverity: toTier(raw.dispute?.resolvedSeverity),
              disputeRespondBy: raw.dispute?.respondBy,
              ...toSeverityPair(raw),
            };
            return { data: mapped };
          }
        }
        if (foundMock) return { data: { ...foundMock } };
        return { data: { ...mockReportConfirmationsStore[0] } };
      },
      providesTags: (_result, _error, id) => [{ type: "Report", id }],
    }),
    updateConfirmReport: builder.mutation<
      ReportConfirmationItem,
      {
        id: string;
        status: "CONFIRMED" | "REJECTED" | "ESCALATED";
        severity?: "Critical" | "High" | "Medium" | "Low";
        rewardEstimate?: string;
        rewardAmount?: string;
        companyReasoning?: string;
        triageNotes?: string;
      }
    >({
      async queryFn(
        { id, status, severity, rewardEstimate, rewardAmount, companyReasoning, triageNotes },
        _api,
        _extraOptions,
        fetchWithBQ
      ) {
        const stateMap: Record<string, string> = {
          CONFIRMED: "VALID_CONFIRMED",
          REJECTED: "REJECTED",
          ESCALATED: "TRIAGING",
        };
        /* "Info" uppercases to a value `ReportSeverity` does not contain,
           which the backend reports as an unreadable body rather than as a
           bad severity. Undefined when the label names nothing: the call then
           carries no severity instead of an invented one. */
        const triageSeverity = toApiSeverity(severity) ?? undefined;

        // 1. Call real triage endpoint: POST /reports/${id}/triage
        const triageResult = await fetchWithBQ({
          url: `/reports/${id}/triage`,
          method: "POST",
          body: {
            status,
            state: stateMap[status] || "TRIAGING",
            severity,
            triageSeverity,
            triageNotes: triageNotes || companyReasoning,
            companyReasoning,
            rewardAmount,
            rewardEstimate,
          },
        });

        if (triageResult.error) {
          console.warn("Triage API error:", triageResult.error);
        }

        // 2. Call real rewards endpoint: POST /reports/${id}/rewards
        if (rewardAmount || rewardEstimate || status === "CONFIRMED") {
          const numericAmount = parseFloat(
            (rewardAmount || rewardEstimate || "").replace(/[^0-9.]/g, "")
          );
          if (!isNaN(numericAmount) && numericAmount > 0) {
            const rewardsResult = await fetchWithBQ({
              url: `/reports/${id}/rewards`,
              method: "POST",
              body: {
                amount: numericAmount,
                ...(triageNotes || companyReasoning
                  ? { note: triageNotes || companyReasoning }
                  : {}),
              },
            });
            if (rewardsResult.error) {
              console.warn("Rewards API error:", rewardsResult.error);
            }
          }
        }

        // 3. Update local mock store so UI stays consistent
        updateMockReportConfirmationsStore((prev) =>
          prev.map((r) => {
            if (r.id !== id) return r;
            const updatedAudit = [...(r.auditLog || [])];
            updatedAudit.push({
              id: `al_${Date.now()}`,
              action: `Status set to ${status}`,
              actor: "Admin Triage Officer",
              timestamp: "Just now",
              note: triageNotes || companyReasoning,
            });

            const newSeverity = severity || r.severity;
            const hackerSev = r.hackerClaimedSeverity?.tier || r.severity;
            const agree = hackerSev === newSeverity;

            const updatedConfirmedSeverity = r.companyConfirmedSeverity
              ? { ...r.companyConfirmedSeverity, tier: newSeverity }
              : {
                  tier: newSeverity,
                  cvss: r.cvssVector || "7.0 - 8.9",
                  typicalReward: rewardEstimate || r.rewardEstimate,
                };

            return {
              ...r,
              status,
              severity: newSeverity,
              severitiesAgree: agree,
              companyConfirmedSeverity: updatedConfirmedSeverity,
              ...(rewardEstimate ? { rewardEstimate } : {}),
              ...(rewardAmount ? { rewardAmount } : {}),
              ...(companyReasoning ? { companyReasoning } : {}),
              ...(triageNotes ? { triageNotes } : {}),
              auditLog: updatedAudit,
            };
          })
        );

        const updated = mockReportConfirmationsStore.find((r) => r.id === id);
        const data =
          (triageResult.data as ReportConfirmationItem) ||
          updated ||
          { ...mockReportConfirmationsStore[0], id, status };

        return { data };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Report", id },
        "Report",
        "Profile",
        "Leaderboard",
      ],
    }),
    getAdminDisputes: builder.query<
      DisputeItem[],
      { status?: string; pendingOnly?: boolean; page?: number; size?: number } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set("status", params.status);
        if (params?.pendingOnly !== undefined)
          searchParams.set("pendingOnly", String(params.pendingOnly));
        if (params?.page !== undefined) searchParams.set("page", String(params.page));
        if (params?.size !== undefined) searchParams.set("size", String(params.size));
        const qs = searchParams.toString();
        return `/admin/disputes${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: { content?: DisputeItem[] } | DisputeItem[]) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.content)) return response.content;
        return [];
      },
      providesTags: ["Report"],
    }),
    getAdminDisputeById: builder.query<DisputeItem, string>({
      query: (id) => `/admin/disputes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Report", id }],
    }),
    resolveAdminDispute: builder.mutation<DisputeItem, ResolveDisputePayload>({
      query: ({ id, ...body }) => ({
        url: `/admin/disputes/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Report", id },
        "Report",
      ],
    }),
  }),
});

export const {
  useGetReportConfirmationsQuery,
  useGetReportConfirmationByIdQuery,
  useUpdateConfirmReportMutation,
  useGetAdminDisputesQuery,
  useGetAdminDisputeByIdQuery,
  useResolveAdminDisputeMutation,
} = reportConfirmationApi;

