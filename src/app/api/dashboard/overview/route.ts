import { NextResponse, type NextRequest } from "next/server";
import * as z from "zod";
import {
  bearerTokenFor,
  relay,
  unauthorized,
  unreachable,
  upstreamFetch,
} from "@/lib/api/proxy";
import type {
  ActionQueueItem,
  DashboardOverviewResponse,
  DashboardProgram,
  ReportSeverityDistribution,
  ReportStatusDistribution,
  SecurityFeedItem,
  StatMetric,
} from "@/lib/types/dashboard/types";

const audienceSchema = z.enum(["company", "user"]);

const organizationSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string().nullish(),
    logoUrl: z.string().nullish(),
    status: z.string().nullish(),
  })
  .passthrough();

const programSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    organizationName: z.string().nullish(),
    handle: z.string().nullish(),
    state: z.string().nullish(),
    submissionState: z.string().nullish(),
    visibility: z.string().nullish(),
    organizationLogoUrl: z.string().nullish(),
    updatedAt: z.string().nullish(),
    createdAt: z.string().nullish(),
  })
  .passthrough();

const rewardSchema = z
  .object({
    amount: z.number().nullish(),
  })
  .passthrough();

const reportSchema = z
  .object({
    id: z.string(),
    programId: z.string(),
    title: z.string(),
    state: z.string(),
    reportedSeverity: z.string().nullish(),
    triageSeverity: z.string().nullish(),
    severity: z.string().nullish(),
    rewards: z.array(rewardSchema).nullish(),
    submittedAt: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish(),
  })
  .passthrough();

const pageSchema = <T extends z.ZodType>(itemSchema: T) =>
  z
    .object({
      content: z.array(itemSchema).default([]),
      totalElements: z.number().optional(),
      totalPages: z.number().optional(),
    })
    .passthrough();

const userProfileSchema = z
  .object({
    totalBountyEarned: z.number().nullish(),
    bountyCurrency: z.string().nullish(),
    rewardedReports: z.number().int().nullish(),
  })
  .passthrough();

type ProgramRecord = z.output<typeof programSchema>;
type ReportRecord = z.output<typeof reportSchema>;
type UserProfileRecord = z.output<typeof userProfileSchema>;

function formatBountyCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount.toLocaleString()}`;
  }
}

async function upstreamJson(path: string, token: string) {
  const response = await upstreamFetch(path, token);
  if (!response.ok) return { response, data: null };

  const raw = await response.text();
  try {
    return { response, data: raw ? (JSON.parse(raw) as unknown) : null };
  } catch {
    return { response, data: null };
  }
}

function reportDate(report: ReportRecord) {
  return report.updatedAt ?? report.submittedAt ?? report.createdAt ?? "";
}

function programDate(program: ProgramRecord) {
  return program.updatedAt ?? program.createdAt ?? "";
}

function toProgramStatus(program: ProgramRecord): DashboardProgram["status"] {
  if (program.state === "ACTIVE") return "Open";
  if (program.state === "CLOSED") return "Closed";
  if (program.visibility === "PRIVATE" || program.visibility === "INVITE_ONLY") {
    return "Private";
  }
  return "Reviewing";
}

function stateCount(reports: ReportRecord[], ...states: string[]) {
  const wanted = new Set(states);
  return reports.filter((report) => wanted.has(report.state)).length;
}

function severityOf(report: ReportRecord) {
  return report.severity ?? report.triageSeverity ?? report.reportedSeverity;
}

function relativeTime(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "Recently";

  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function dashboardFrom(
  audience: "COMPANY" | "USER",
  reports: ReportRecord[],
  programs: ProgramRecord[],
  organization?: z.output<typeof organizationSchema>,
  userProfile?: UserProfileRecord,
): DashboardOverviewResponse {
  const programNames = new Map(programs.map((program) => [program.id, program.name]));
  const reportCounts = new Map<string, number>();
  for (const report of reports) {
    reportCounts.set(report.programId, (reportCounts.get(report.programId) ?? 0) + 1);
  }

  const totalRewards = reports.reduce(
    (total, report) =>
      total +
      (report.rewards ?? []).reduce(
        (reportTotal, reward) => reportTotal + (reward.amount ?? 0),
        0,
      ),
    0,
  );
  const rewardedReports = reports.filter((report) =>
    (report.rewards ?? []).some((reward) => (reward.amount ?? 0) > 0),
  ).length;
  const validReports = stateCount(reports, "VALID_CONFIRMED", "RESOLVED");
  const acceptanceRate = reports.length
    ? Math.round((validReports / reports.length) * 100)
    : 0;
  const activePrograms = programs.filter((program) => program.state === "ACTIVE").length;

  const userTotalBounty = userProfile?.totalBountyEarned ?? 0;
  const userCurrency = userProfile?.bountyCurrency || "USD";
  const userRewardedReports = userProfile?.rewardedReports ?? 0;
  const userBountyFormatted = formatBountyCurrency(userTotalBounty, userCurrency);

  const stats: StatMetric[] =
    audience === "COMPANY"
      ? [
          {
            id: "active_programs",
            title: "Active Programs",
            value: activePrograms,
            subtext: `${programs.length} total programs`,
            trend: "neutral",
            type: "active_programs",
          },
          {
            id: "total_reports",
            title: "Accessible Reports",
            value: reports.length,
            subtext: `${stateCount(reports, "NEW")} new reports`,
            trend: "neutral",
            type: "total_reports",
          },
          {
            id: "total_bounties",
            title: "Bounties Awarded",
            value: `$${totalRewards.toLocaleString()}`,
            subtext: `${rewardedReports} rewarded reports`,
            trend: "neutral",
            type: "total_bounties",
          },
          {
            id: "valid_reports",
            title: "Valid Reports",
            value: validReports,
            subtext: `${acceptanceRate}% validation rate`,
            trend: "neutral",
            type: "valid_reports",
          },
        ]
      : [
          {
            id: "submitted_reports",
            title: "Reports Submitted",
            value: reports.length,
            subtext: `${stateCount(reports, "NEW", "TRIAGING")} under review`,
            trend: "neutral",
            type: "total_reports",
          },
          {
            id: "accepted_reports",
            title: "Accepted Reports",
            value: stateCount(reports, "VALID_CONFIRMED"),
            subtext: `${acceptanceRate}% validation rate`,
            trend: "neutral",
            type: "valid_reports",
          },
          {
            id: "resolved_reports",
            title: "Resolved Reports",
            value: stateCount(reports, "RESOLVED"),
            subtext: "Completed disclosures",
            trend: "neutral",
            type: "active_programs",
          },
          {
            id: "earned_bounties",
            title: "Bounties Earned",
            value: userBountyFormatted,
            subtext: `${userRewardedReports} rewarded ${userRewardedReports === 1 ? "report" : "reports"}`,
            trend: "neutral",
            type: "total_bounties",
          },
        ];

  const pendingPrograms = programs.filter(
    (program) => program.submissionState === "PENDING_REVIEW",
  ).length;
  const actionItems: ActionQueueItem[] =
    audience === "COMPANY"
      ? [
          {
            id: "new_reports",
            title: "New reports for triage",
            subtitle: "Awaiting organization review",
            count: stateCount(reports, "NEW"),
            status: "urgent",
            linkHref: "/dashboard/report-management",
            type: "triage",
          },
          {
            id: "reports_in_review",
            title: "Reports in review",
            subtitle: "Triage in progress",
            count: stateCount(reports, "TRIAGING", "NEEDS_MORE_INFO"),
            status: "pending",
            linkHref: "/dashboard/report-management",
            type: "review",
          },
          {
            id: "confirmed_reports",
            title: "Confirmed reports",
            subtitle: "Ready for resolution",
            count: stateCount(reports, "VALID_CONFIRMED"),
            status: "normal",
            linkHref: "/dashboard/report-management",
            type: "retest",
          },
          {
            id: "pending_programs",
            title: "Programs pending review",
            subtitle: "Waiting for platform approval",
            count: pendingPrograms,
            status: "normal",
            linkHref: "/dashboard/program-management",
            type: "invite",
          },
        ]
      : [
          {
            id: "awaiting_triage",
            title: "Awaiting triage",
            subtitle: "Reports not reviewed yet",
            count: stateCount(reports, "NEW"),
            status: "pending",
            linkHref: "/dashboard/my-reports?status=SUBMITTED",
            type: "triage",
          },
          {
            id: "triaging",
            title: "Under triage",
            subtitle: "Organization review in progress",
            count: stateCount(reports, "TRIAGING"),
            status: "normal",
            linkHref: "/dashboard/my-reports?status=TRIAGING",
            type: "review",
          },
          {
            id: "needs_information",
            title: "Needs more information",
            subtitle: "Your response may be required",
            count: stateCount(reports, "NEEDS_MORE_INFO"),
            status: "urgent",
            linkHref: "/dashboard/my-reports",
            type: "retest",
          },
          {
            id: "accepted",
            title: "Accepted reports",
            subtitle: "Validated by the organization",
            count: stateCount(reports, "VALID_CONFIRMED", "RESOLVED"),
            status: "normal",
            linkHref: "/dashboard/my-reports?status=ACCEPTED",
            type: "invite",
          },
        ];

  const myPrograms: DashboardProgram[] = [...programs]
    .sort((first, second) => Date.parse(programDate(second)) - Date.parse(programDate(first)))
    .slice(0, 5)
    .map((program) => ({
      id: program.id,
      name: program.name,
      companyName: program.organizationName ?? organization?.name ?? "Organization",
      status: toProgramStatus(program),
      reportCount: reportCounts.get(program.id) ?? 0,
      logoUrl: program.organizationLogoUrl ?? organization?.logoUrl ?? undefined,
    }));

  const reportStatus: ReportStatusDistribution = {
    resolved: stateCount(reports, "RESOLVED"),
    accepted: stateCount(reports, "VALID_CONFIRMED"),
    pending: stateCount(reports, "NEW", "TRIAGING", "NEEDS_MORE_INFO"),
    other: stateCount(reports, "REJECTED", "DUPLICATE"),
    total: reports.length,
  };

  const reportSeverity: ReportSeverityDistribution = {
    critical: reports.filter((report) => severityOf(report) === "CRITICAL").length,
    high: reports.filter((report) => severityOf(report) === "HIGH").length,
    medium: reports.filter((report) => severityOf(report) === "MEDIUM").length,
    low: reports.filter((report) => ["LOW", "NONE", null, undefined].includes(severityOf(report))).length,
    total: reports.length,
  };

  const securityFeed: SecurityFeedItem[] = [...reports]
    .sort((first, second) => Date.parse(reportDate(second)) - Date.parse(reportDate(first)))
    .slice(0, 5)
    .map((report) => ({
      id: report.id,
      title: report.title,
      programName: programNames.get(report.programId) ?? "Security program",
      timestamp: relativeTime(reportDate(report)),
      type:
        report.state === "RESOLVED"
          ? "resolved"
          : report.state === "VALID_CONFIRMED"
            ? "confirmed"
            : "joined",
      severity:
        severityOf(report) === "CRITICAL"
          ? "Critical"
          : severityOf(report) === "HIGH"
            ? "High"
            : severityOf(report) === "MEDIUM"
              ? "Medium"
              : "Low",
    }));

  return {
    audience,
    organization: organization
      ? {
          id: organization.id,
          name: organization.name,
          slug: organization.slug ?? undefined,
          logoUrl: organization.logoUrl ?? undefined,
          status: organization.status ?? undefined,
        }
      : undefined,
    stats,
    actionQueue: {
      totalCount: actionItems.reduce((total, item) => total + item.count, 0),
      items: actionItems,
    },
    myPrograms,
    reportStatus,
    reportSeverity,
    securityFeed,
  };
}

export async function GET(request: NextRequest) {
  const token = await bearerTokenFor(request);
  if (!token) return unauthorized();

  const parsedAudience = audienceSchema.safeParse(
    new URL(request.url).searchParams.get("view") ?? "user",
  );
  if (!parsedAudience.success) {
    return NextResponse.json(
      { message: "Dashboard view must be company or user" },
      { status: 400 },
    );
  }

  const isCompany = parsedAudience.data === "company";

  try {
    const [reportsResult, programsResult, organizationResult, userProfileResult] =
      await Promise.all([
        upstreamJson(
          isCompany
            ? "/reports?size=100&sort=submittedAt,DESC"
            : "/reports/mine?size=100&sort=submittedAt,DESC",
          token,
        ),
        isCompany
          ? upstreamJson(
              "/organizations/me/programs?size=100&sort=updatedAt,DESC",
              token,
            )
          : Promise.resolve(null),
        isCompany
          ? upstreamJson("/organizations/me", token)
          : Promise.resolve(null),
        !isCompany
          ? upstreamJson("/user-profiles/me", token)
          : Promise.resolve(null),
      ]);

    if (reportsResult.response.status === 401) {
      return relay(reportsResult.response, "Unable to load dashboard reports.");
    }
    /* Both of these are the company's, and an invited member may hold neither.
       `/organizations/me` is owner-only and answers 404 for a member;
       `/organizations/me/programs` answers 403 without VIEW_PROGRAMS and 409
       for an account in more than one organization. None of those is a broken
       dashboard — they are sections this account cannot see, so the overview
       is built from what it can and the rest comes back empty. A 401 is
       different: the session itself is finished, and saying so is the only
       useful answer. */
    if (isCompany && programsResult && programsResult.response.status === 401) {
      return relay(programsResult.response, "Unable to load organization programs.");
    }

    if (!isCompany && userProfileResult && userProfileResult.response.status === 401) {
      return relay(userProfileResult.response, "Unable to load user profile.");
    }

    const reportsPage = pageSchema(reportSchema).safeParse(
      reportsResult.response.ok ? reportsResult.data : { content: [] },
    );
    const programsPage = pageSchema(programSchema).safeParse(
      programsResult?.response.ok ? programsResult.data : { content: [] },
    );
    const organization =
      isCompany && organizationResult?.response.ok
        ? organizationSchema.safeParse(organizationResult.data)
        : null;
    const userProfile =
      !isCompany && userProfileResult?.response.ok
        ? userProfileSchema.safeParse(userProfileResult.data)
        : null;

    if (!reportsPage.success || !programsPage.success || (organization && !organization.success)) {
      return NextResponse.json(
        { message: "The dashboard service returned an unexpected response." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      dashboardFrom(
        isCompany ? "COMPANY" : "USER",
        reportsPage.data.content,
        programsPage.data.content,
        organization?.data,
        userProfile?.data,
      ),
      { status: 200 },
    );
  } catch {
    return unreachable("dashboard");
  }
}
