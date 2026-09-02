"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";

import { ReviewQueueHeader } from "@/components/report-management/review-queue/ReviewQueueHeader";
import { ReviewQueueLanes } from "@/components/report-management/review-queue/ReviewQueueLanes";
import { ReviewQueuePriorityList } from "@/components/report-management/review-queue/ReviewQueuePriorityList";
import type {
  PriorityReviewItem,
  ReviewQueueLane,
  ReviewQueueLaneFilter,
  ReviewQueueLaneKey,
  ReviewSeverity,
} from "@/components/report-management/review-queue/types";
import { useGetManagedReportsQuery } from "@/lib/redux/services/reportsApi";

import type { ReportWorkflowState } from "@/components/report-management/types";

function toReviewQueue(
  queueState?: ReportWorkflowState,
): ReviewQueueLaneKey | null {
  if (queueState === "PENDING") return "Pending Intake";
  if (queueState === "UNDER_REVIEW" || queueState === "RETESTING") return "Under Review";
  if (queueState === "APPROVED") return "Approval Ready";
  return null;
}

function queueStatusLabel(queue: Exclude<ReviewQueueLaneFilter, "All">): string {
  if (queue === "Pending Intake") return "Needs scope validation";
  if (queue === "Under Review") return "Evidence review in progress";
  return "Ready for final approval";
}

function submittedAtValue(value?: string) {
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export default function Page() {
  const { data: managedReports = [] } = useGetManagedReportsQuery();
  const [activeQueue, setActiveQueue] = useState<ReviewQueueLaneFilter>("All");
  const [severityFilter, setSeverityFilter] = useState<"All" | ReviewSeverity>("All");
  const [sortBy, setSortBy] = useState<"priority" | "recent">("priority");

  const queueItems = useMemo(() => {
    return managedReports
      .map((report) => {
        const queue = toReviewQueue(report.queueState);
        if (!queue) return null;

        return {
          id: report.id,
          reportId: report.reportId ?? String(report.id),
          title: report.title,
          severity: report.severity,
          reporter: report.author,
          submittedAt: report.submittedAt,
          submittedAtIso: report.submittedAtIso,
          queue,
          status: queueStatusLabel(queue),
          assets: report.assets,
          reportType: report.type,
          authorInitials: report.authorInitials,
          logoSrc: report.programLogo,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [managedReports]);

  const queueCounts = useMemo(() => {
    return {
      all: queueItems.length,
      pending: queueItems.filter((item) => item.queue === "Pending Intake").length,
      review: queueItems.filter((item) => item.queue === "Under Review").length,
      ready: queueItems.filter((item) => item.queue === "Approval Ready").length,
    };
  }, [queueItems]);

  const lanes = useMemo<ReviewQueueLane[]>(() => {
    return [
      {
        title: "Pending Intake",
        count: queueCounts.pending,
        description:
          "New submissions waiting for first-pass moderation and scope validation.",
        accent: "amber",
      },
      {
        title: "Under Review",
        count: queueCounts.review,
        description:
          "Analysts are checking evidence quality, impact, and report completeness.",
        accent: "blue",
      },
      {
        title: "Approval Ready",
        count: queueCounts.ready,
        description:
          "Reports cleared for final sign-off, payout confirmation, or closure.",
        accent: "emerald",
      },
    ];
  }, [queueCounts.pending, queueCounts.ready, queueCounts.review]);

  const filteredItems = useMemo(() => {
    const filtered = queueItems.filter((item) => {
      const matchesQueue = activeQueue === "All" || item.queue === activeQueue;
      const matchesSeverity = severityFilter === "All" || item.severity === severityFilter;
      return matchesQueue && matchesSeverity;
    });

    const severityRank: Record<ReviewSeverity, number> = {
      Critical: 0,
      High: 1,
      Medium: 2,
      Low: 3,
    };

    return [...filtered].sort((a, b) => {
      if (sortBy === "priority") {
        return (
          severityRank[a.severity] - severityRank[b.severity] ||
          submittedAtValue(b.submittedAtIso) - submittedAtValue(a.submittedAtIso)
        );
      }

      return submittedAtValue(b.submittedAtIso) - submittedAtValue(a.submittedAtIso);
    });
  }, [activeQueue, queueItems, severityFilter, sortBy]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <ReviewQueueHeader />
      <ReviewQueueLanes
        activeQueue={activeQueue}
        onQueueChange={setActiveQueue}
        lanes={lanes}
      />
      <ReviewQueuePriorityList
        activeQueue={activeQueue}
        onQueueChange={setActiveQueue}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        queueCounts={queueCounts}
        items={filteredItems}
      />
    </motion.section>
  );
}
