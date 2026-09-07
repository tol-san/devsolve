import { useMemo } from "react";
import { useGetAdminOverviewQuery } from "@/lib/redux/services/adminApi";
import type {
  AdminDashboardOverviewResponse,
  AdminOverviewResponse,
} from "@/lib/types/admin/types";

export interface PieSegment {
  name: string;
  value: number;
  color: string;
  barBg: string;
}

function toDashboardView(
  overview: AdminOverviewResponse,
): AdminDashboardOverviewResponse {
  const communityPending =
    overview.moderation.problems +
    overview.moderation.showcases +
    overview.moderation.solutions;

  return {
    stats: [
      {
        id: "stat_orgs",
        title: "Organizations",
        value: overview.organizations.total.toLocaleString(),
        subtext: `${overview.organizations.pendingReview} pending review`,
        type: "organizations",
      },
      {
        id: "stat_programs",
        title: "Programs",
        value: overview.programs.total.toLocaleString(),
        subtext: `${overview.programs.active} active`,
        type: "programs",
      },
      {
        id: "stat_reports",
        title: "Reports",
        value: overview.reports.total.toLocaleString(),
        subtext: `${overview.reports.open} open`,
        type: "total_reports",
      },
      {
        id: "stat_users",
        title: "Users",
        value: overview.users.total.toLocaleString(),
        subtext: `${overview.users.active} active`,
        type: "users",
      },
      {
        id: "stat_community",
        title: "Community Reviews",
        value: communityPending.toLocaleString(),
        subtext: "Pending moderation",
        type: "community_posts",
      },
      {
        id: "stat_flags",
        title: "Content Flags",
        value: overview.moderation.contentFlags.toLocaleString(),
        subtext: "Awaiting action",
        type: "disputes",
      },
    ],
    activityChart: [],
    reportStatusBreakdown: {
      confirmed: overview.reports.validConfirmed + overview.reports.resolved,
      pending: overview.reports.newReports + overview.reports.needsMoreInfo,
      rejected: overview.reports.rejected + overview.reports.duplicate,
      inReview: overview.reports.triaging,
      total: overview.reports.total,
    },
    actionQueue: {
      totalCount: overview.moderation.totalPending,
      items: [
        {
          id: "organizations",
          title: "Organization Verifications",
          subtitle: "Company and domain review",
          count: overview.moderation.organizations,
          status: overview.moderation.organizations > 0 ? "urgent" : "normal",
          linkHref: "/dashboard/company-verification",
          type: "verification",
        },
        {
          id: "programs",
          title: "Program Reviews",
          subtitle: "Security programs awaiting approval",
          count: overview.moderation.programs,
          status: overview.moderation.programs > 0 ? "pending" : "normal",
          linkHref: "/dashboard/program-management?scope=admin",
          type: "report_confirmation",
        },
        {
          id: "community",
          title: "Community Moderation",
          subtitle: "Problems, showcases, and solutions",
          count: communityPending,
          status: communityPending > 0 ? "pending" : "normal",
          linkHref: "/dashboard/content-moderation",
          type: "moderation",
        },
        {
          id: "content_flags",
          title: "Content Flags",
          subtitle: "User-reported content requiring review",
          count: overview.moderation.contentFlags,
          status: overview.moderation.contentFlags > 0 ? "urgent" : "normal",
          linkHref: "/dashboard/content-moderation",
          type: "user_review",
        },
      ],
    },
    recentActivity: [],
  };
}

export function useAdminOverview() {
  const { data: overview, isLoading, isFetching, isError, error, refetch } =
    useGetAdminOverviewQuery();

  const adminData = useMemo(
    () => (overview ? toDashboardView(overview) : undefined),
    [overview],
  );

  const pieData: PieSegment[] = adminData
    ? [
        {
          name: "Confirmed",
          value: adminData.reportStatusBreakdown.confirmed,
          color: "#2563eb",
          barBg: "bg-primary",
        },
        {
          name: "Pending",
          value: adminData.reportStatusBreakdown.pending,
          color: "#3b82f6",
          barBg: "bg-blue-500",
        },
        {
          name: "In Review",
          value: adminData.reportStatusBreakdown.inReview,
          color: "#60a5fa",
          barBg: "bg-blue-400",
        },
        {
          name: "Rejected",
          value: adminData.reportStatusBreakdown.rejected,
          color: "#94a3b8",
          barBg: "bg-slate-400",
        },
      ]
    : [];

  return {
    overview,
    adminData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    pieData,
  };
}
