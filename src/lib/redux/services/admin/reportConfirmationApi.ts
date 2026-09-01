import { baseApi } from "../baseApi";
import { ReportConfirmationItem } from "@/lib/types/admin/types";
import {
  mockReportConfirmationsStore,
  updateMockReportConfirmationsStore,
} from "./adminMockData";

export const reportConfirmationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportConfirmations: builder.query<ReportConfirmationItem[], void>({
      async queryFn(_args, _api, _extraOptions, fetchWithBQ) {
        const result = await fetchWithBQ("/reports/management");
        if (!result.error && Array.isArray(result.data) && result.data.length > 0) {
          const mapped: ReportConfirmationItem[] = (result.data as any[]).map((r) => {
            const statusMap: Record<string, "PENDING" | "CONFIRMED" | "REJECTED" | "ESCALATED"> = {
              PENDING: "PENDING",
              UNDER_REVIEW: "PENDING",
              APPROVED: "CONFIRMED",
              CLOSED: "REJECTED",
            };
            const status = statusMap[r.queueState] || (r.status === "Open" ? "PENDING" : "CONFIRMED");
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
              hackerClaimedSeverity: {
                tier: r.severity || "Medium",
                cvss: "7.5",
                typicalReward: "$1,000+",
              },
              companyConfirmedSeverity: {
                tier: r.severity || "Medium",
                cvss: "7.5",
                typicalReward: "$1,000+",
              },
              severitiesAgree: true,
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
          const raw = (result.data as any[]).find((r) => r.id === id);
          if (raw) {
            const mapped: ReportConfirmationItem = {
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
              hackerClaimedSeverity: {
                tier: raw.severity || "Medium",
                cvss: "7.5",
                typicalReward: "$1,000+",
              },
              companyConfirmedSeverity: {
                tier: raw.severity || "Medium",
                cvss: "7.5",
                typicalReward: "$1,000+",
              },
              severitiesAgree: true,
              ...(foundMock || {}),
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
        const triageSeverity = severity ? severity.toUpperCase() : undefined;

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
