"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { buildReportManagementDetailFromApiReport } from "@/components/report-management/mock-data";
import { ReportSeverityAdjustmentForm } from "@/components/report-management/severity-review/ReportSeverityAdjustmentForm";
import { ResolvedReviewLog } from "@/components/report-management/severity-review/ResolvedReviewLog";
import { ReportSeverityReviewHeader } from "@/components/report-management/severity-review/ReportSeverityReviewHeader";
import { ReportSeverityReviewSidebar } from "@/components/report-management/severity-review/ReportSeverityReviewSidebar";
import { useGetReportByIdQuery } from "@/lib/redux/services/reportsApi";

export default function ReportSeverityReviewPage() {
  const params = useParams();
  const reportId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const {
    data: apiReport,
    isLoading: isReportLoading,
    isError,
    refetch,
  } = useGetReportByIdQuery(reportId, { skip: !reportId });
  const [outcome, setOutcome] = useState<"approved" | "rejected" | null>(null);

  /* The backend's own state, not the collapsed UI status. */
  const isResolved =
    (apiReport?.rawStatus || apiReport?.status || "").toUpperCase() ===
    "RESOLVED";

  const detail = useMemo(() => {
    if (apiReport) {
      return buildReportManagementDetailFromApiReport(apiReport);
    }
    return null;
  }, [apiReport]);

  if (isReportLoading || (!detail && !isError)) {
    return (
      <div className="space-y-6 w-full pb-12 animate-pulse">
        <div className="h-8 w-64 bg-muted/60 rounded-xl" />
        <div className="h-36 w-full bg-muted/40 rounded-2xl" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-96 w-full bg-muted/40 rounded-2xl" />
          <div className="h-96 w-full bg-muted/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-card p-8 sm:p-12 text-center border border-border"
      >
        <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
          <AlertCircle className="size-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Report Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          The requested report could not be found or you do not have permission to view it.
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
            Retry
          </Button>
          <Link href="/dashboard/report-management">
            <Button className="rounded-xl">Back to Queue</Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12 min-w-0"
    >
      {!outcome && <ReportSeverityReviewHeader detail={detail} />}
      <div
        className={
          outcome
            ? "w-full max-w-4xl mx-auto min-w-0"
            : "grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start min-w-0"
        }
      >
        <div className="min-w-0 w-full">
          {/* A resolved report has nothing left to triage: it cannot be
              approved again, and its reputation was priced and paid at
              resolution, so editing the severity here would move a label away
              from what was actually awarded. It becomes the record its label
              already promised. */}
          {isResolved ? (
            <ResolvedReviewLog detail={detail} />
          ) : (
            <ReportSeverityAdjustmentForm
              detail={detail}
              onOutcomeChange={setOutcome}
            />
          )}
        </div>
        {!outcome && (
          <div className="min-w-0 w-full">
            <ReportSeverityReviewSidebar detail={detail} />
          </div>
        )}
      </div>
    </motion.div>
  );
}


