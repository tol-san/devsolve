"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  History,
  LayoutTemplate,
  Lightbulb,
  MessageSquareWarning,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { ReportQueue } from "@/components/admin/ReportQueue";
import { ModerationHistoryTable } from "@/components/admin/ModerationHistoryTable";
import { ShowcaseReviewQueue } from "@/components/admin/showcases/ShowcaseReviewQueue";
import { ProblemReviewQueue } from "@/components/admin/problems/ProblemReviewQueue";
import { SolutionReviewQueue } from "@/components/admin/solutions/SolutionReviewQueue";
import { AutoApprovalSettings } from "@/components/admin/auto-approval/AutoApprovalSettings";
import { SecurityIncidentsTable } from "@/components/security-incidents/SecurityIncidentsTable";
import { useGetAdminFlagsSummaryQuery } from "@/lib/redux/services/admin/adminFlagsApi";
import { useGetShowcaseReviewQueueQuery } from "@/lib/redux/services/admin/showcaseReviewApi";
import { useGetProblemReviewQueueQuery } from "@/lib/redux/services/admin/problemReviewApi";
import { useGetAdminSolutionsQuery } from "@/lib/redux/services/admin/solutionAdminApi";
import { useGetAdminSecurityIncidentsQuery } from "@/lib/redux/services/securityIncidentsApi";
import { cn } from "@/lib/utils";

type TabId = "queue" | "showcases" | "problems" | "solutions" | "security" | "auto-approval" | "history";

const TABS: {
  value: TabId;
  label: string;
  icon: LucideIcon;
  blurb: string;
}[] = [
  {
    value: "queue",
    label: "Reports",
    icon: ShieldAlert,
    blurb:
      "Content the community flagged. It is already public, so acting here takes something down or warns its author.",
  },
  {
    value: "security",
    label: "Malware Incidents",
    icon: ShieldAlert,
    blurb:
      "Uploads refused and discarded by the VirusTotal security guard across all bounty programs and platform attachments.",
  },
  {
    value: "showcases",
    label: "Showcases",
    icon: LayoutTemplate,
    blurb:
      "Showcase submissions waiting on a decision. Nothing here is public until it is approved.",
  },
  {
    value: "problems",
    label: "Problems",
    icon: MessageSquareWarning,
    blurb:
      "Problems waiting on a decision. Approving one publishes it to the feed, open for solutions.",
  },
  {
    value: "solutions",
    label: "Solutions",
    icon: Lightbulb,
    blurb:
      "Answers waiting on a decision. Approving one publishes it on the problem it answers, where the asker can accept it.",
  },
  {
    value: "auto-approval",
    label: "AI Auto-Approval",
    icon: Sparkles,
    blurb:
      "Configure automated quality and safety checks to instantly publish verified community submissions.",
  },
  {
    value: "history",
    label: "History",
    icon: History,
    blurb: "Every moderation action taken, with who took it and when.",
  },
];

export default function ContentManagementPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContentManagement />
    </Suspense>
  );
}

function ContentManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<TabId>(() => {
    const param = searchParams.get("tab") as TabId | null;
    return param && TABS.some((tab) => tab.value === param) ? param : "queue";
  }, [searchParams]);

  const selectTab = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Only the badge count is needed here; ReportQueue fetches its own page.
  const { data: flagSummary } = useGetAdminFlagsSummaryQuery();

  const { data: showcaseQueue } = useGetShowcaseReviewQueueQuery({
    reviewStatus: "PENDING",
    pageSize: 1,
  });
  const { data: problemQueue } = useGetProblemReviewQueueQuery({
    status: "PENDING_APPROVAL",
    size: 1,
  });
  const { data: solutionQueue } = useGetAdminSolutionsQuery({
    reviewStatus: "PENDING",
    pageSize: 1,
  });
  const { data: securityQueue } = useGetAdminSecurityIncidentsQuery({
    size: 1,
  });

  const counts: Record<TabId, number | undefined> = {
    queue: flagSummary?.totalPending ?? 0,
    showcases: showcaseQueue?.totalElements ?? 0,
    problems: problemQueue?.totalElements ?? 0,
    solutions: solutionQueue?.totalElements ?? 0,
    security: securityQueue?.totalElements ?? 0,
    "auto-approval": undefined,
    history: undefined,
  };

  const activeBlurb =
    TABS.find((tab) => tab.value === activeTab)?.blurb ?? TABS[0].blurb;

  const activeTabRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="space-y-1.5 pb-4 border-b border-border/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-bold text-foreground">
            Content Management
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Content Management
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {activeBlurb}
        </p>
      </header>

      {/* Moderation Sections Navigation (Responsive Horizontal Scroll) */}
      <div className="w-full overflow-x-auto py-1 scrollbar-none">
        <nav
          aria-label="Moderation sections"
          className="inline-flex w-max min-w-full items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-xs"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = counts[tab.value];
            const Icon = tab.icon;

            return (
              <button
                key={tab.value}
                ref={isActive ? activeTabRef : undefined}
                type="button"
                onClick={() => selectTab(tab.value)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-1 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                />
                <span className="shrink-0">{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      "min-w-5 shrink-0 rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-2">
        {activeTab === "queue" ? (
          <ReportQueue />
        ) : activeTab === "showcases" ? (
          <ShowcaseReviewQueue />
        ) : activeTab === "problems" ? (
          <ProblemReviewQueue />
        ) : activeTab === "solutions" ? (
          <SolutionReviewQueue />
        ) : activeTab === "security" ? (
          <SecurityIncidentsTable scope="admin" />
        ) : activeTab === "auto-approval" ? (
          <AutoApprovalSettings />
        ) : (
          <ModerationHistoryTable />
        )}
      </div>
    </motion.div>
  );
}

function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading content management"
      className="w-full animate-pulse space-y-6 pb-12"
    >
      <span className="sr-only">Loading content management…</span>
      <div className="space-y-2">
        <div className="h-4 w-48 rounded-lg bg-muted/60" />
        <div className="h-8 w-72 rounded-lg bg-muted/60" />
        <div className="h-4 w-full max-w-2xl rounded-lg bg-muted/60" />
      </div>
      <div className="h-16 w-full rounded-2xl bg-muted/60" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-muted/60"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-muted/60 lg:col-span-4" />
      </div>
    </div>
  );
}
