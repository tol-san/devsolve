"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";

import {
  buildReportDetailFromManagedReport,
  buildReportManagementDetailFromApiReport,
  findManagedReportByRouteId,
  getReportDetailById,
} from "@/components/report-management/mock-data";
import { ReportSeverityAdjustmentForm } from "@/components/report-management/severity-review/ReportSeverityAdjustmentForm";
import { ReportSeverityReviewHeader } from "@/components/report-management/severity-review/ReportSeverityReviewHeader";
import { ReportSeverityReviewSidebar } from "@/components/report-management/severity-review/ReportSeverityReviewSidebar";
import {
  useGetManagedReportsQuery,
  useGetReportByIdQuery,
} from "@/lib/redux/services/reportsApi";

export default function ReportSeverityReviewPage() {
  const params = useParams<{ id: string }>();
  const reportId = params?.id ?? "";

  const { data: apiReport } = useGetReportByIdQuery(reportId, {
    skip: !reportId,
  });
  const { data: managedReports = [] } = useGetManagedReportsQuery();
  const [outcome, setOutcome] = useState<"approved" | "rejected" | null>(null);

  const detail = useMemo(() => {
    if (apiReport) {
      return buildReportManagementDetailFromApiReport(apiReport);
    }
    const liveReport = findManagedReportByRouteId(managedReports, reportId);
    if (liveReport) {
      return buildReportDetailFromManagedReport(liveReport);
    }
    return getReportDetailById(reportId);
  }, [apiReport, managedReports, reportId]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-6 pb-12 w-full"
    >
      {!outcome && <ReportSeverityReviewHeader detail={detail} />}
      <div className={outcome ? "w-full max-w-4xl mx-auto" : "grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"}>
        <ReportSeverityAdjustmentForm detail={detail} onOutcomeChange={setOutcome} />
        {!outcome && <ReportSeverityReviewSidebar detail={detail} />}
      </div>
    </motion.section>
  );
}

