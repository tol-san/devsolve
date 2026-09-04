import { baseApi } from "../baseApi";
import { toApiSeverity } from "@/lib/reports/severity";
import { ReportConfirmationItem } from "@/lib/types/admin/types";
import {
  mockReportConfirmationsStore,
  updateMockReportConfirmationsStore,
} from "./adminMockData";

type ApiTier = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
type DisplayTier = ReportConfirmationItem["severity"];

/**
 * A row of `GET /reports/management`, as far as this screen reads it.
 *
 * Deliberately all-optional: the endpoint serves several screens and this one
 * uses a slice of it, so a field it does not need going missing must not be a
 * type error here.
 */
type ManagementRow = {
  id: string;
  reportId?: string;
  title?: string;
  author?: string;
  type?: string;
  /**
   * Already in display form — the route maps it before sending. The two
   * fields below are the raw API constants (`"LOW"`), so they are *not*
   * interchangeable with this one and must not be compared to it directly.
   */
  severity?: DisplayTier;
  reportedSeverity?: ApiTier | null;
  triageSeverity?: ApiTier | null;
  cvssScore?: number | null;
  queueState?: string;
  status?: string;
  submittedAt?: string;
  summary?: string;
  assets?: string[];
};

/** The API's constant as it reads on screen. */
function toTier(value: ApiTier | null | undefined): DisplayTier | null {
  switch (value) {
    case "CRITICAL":
      return "Critical";
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    /* NONE is a real rating — "not a vulnerability" — but this screen's tier
       union has nowhere to put it, and rounding it up to Low would overstate
       the finding. Absent instead, so the caller falls back rather than lies. */
    default:
      return null;
  }
}

/**
 * The two sides of the severity rating, kept apart.
 *
 * This screen exists to compare what the researcher claimed against what the
 * company decided, so the one thing it must never do is read both from the
 * same field. `severity` on the managed report is the *settled* rating — it
 * collapses `severity ?? triageSeverity ?? reportedSeverity` — so filling both
 * boxes from it made every report agree with itself.
 *
 * Each side falls back to the settled rating only when its own field is
 * missing, which is what older reports return.
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
  /* Already display-form; passing it through `toTier` would return null for
     every value and silently make both sides "Medium". */
  const settled: DisplayTier = raw.severity ?? "Medium";
  const claimed = toTier(raw.reportedSeverity) ?? settled;
  const confirmed = toTier(raw.triageSeverity) ?? settled;
  /* Only stated when triage has actually rated it. Before that there is no
     company verdict to agree or disagree with, and claiming agreement would
     put a decision on screen that nobody made. */
  const triaged = toTier(raw.triageSeverity) !== null;
  const cvss =
    typeof raw.cvssScore === "number" ? `CVSS ${raw.cvssScore}` : undefined;

  return {
    hackerClaimedSeverity: { tier: claimed, cvss },
    companyConfirmedSeverity: { tier: confirmed, cvss },
    severitiesAgree: triaged ? claimed === confirmed : undefined,
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
            const status = statusMap[r.queueState ?? ""] || (r.status === "Open" ? "PENDING" : "CONFIRMED");
            return {
              id: r.id,
              reportCode: r.reportId || `RPT-${r.id.slice(0, 8)}`,
              title: r.title || "Untitled Vulnerability Report",
              researcherName: r.author || "Security Researcher",
              companyName: "DevSolve Security",
              programName: r.type ? `${r.type} Program` : "Bug Bounty Program",
              severity: r.severity || "Medium",
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
        const result = await fetchWithBQ("/reports/management");
        if (!result.error && Array.isArray(result.data)) {
          const raw = (result.data as ManagementRow[]).find((r) => r.id === id);
          if (raw) {
            const mapped: ReportConfirmationItem = {
              /* Mock first, live second. This endpoint has no answer for some
                 of the shape (audit log, reproduction steps), so the fixture
                 fills those in — but where the API spoke it wins. Spread last,
                 as it was, a stale fixture silently overwrote the real
                 severities on any report whose id it happened to match. */
              ...(foundMock || {}),
              id: raw.id,
              reportCode: raw.reportId || `RPT-${raw.id.slice(0, 8)}`,
              title: raw.title || "Untitled Vulnerability Report",
              researcherName: raw.author || "Security Researcher",
              companyName: "DevSolve Security",
              programName: raw.type ? `${raw.type} Program` : "Bug Bounty Program",
              severity: raw.severity || "Medium",
              status:
                raw.queueState === "PENDING"
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
  }),
});

export const {
  useGetReportConfirmationsQuery,
  useGetReportConfirmationByIdQuery,
  useUpdateConfirmReportMutation,
} = reportConfirmationApi;
