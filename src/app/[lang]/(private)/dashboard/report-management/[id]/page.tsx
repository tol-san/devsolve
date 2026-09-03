"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";


import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ReportDetailAssessment } from "@/components/report-management/ReportDetailAssessment";
import { ReportDetailClassification } from "@/components/report-management/ReportDetailClassification";
import { ReportDetailHeader } from "@/components/report-management/ReportDetailHeader";
import { ReportDetailProofOfConcept } from "@/components/report-management/ReportDetailProofOfConcept";
import { ReportDetailReferences } from "@/components/report-management/ReportDetailReferences";
import { ReportDetailSidebar } from "@/components/report-management/ReportDetailSidebar";
import { ReportDetailTargetScope } from "@/components/report-management/ReportDetailTargetScope";
import { RetestHistoryTimeline } from "@/components/report-management/RetestHistoryTimeline";
import { buildReportManagementDetailFromApiReport } from "@/components/report-management/mock-data";
import { useGetReportByIdQuery } from "@/lib/redux/services/reportsApi";

export default function ReportManagementDetailPage() {
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
    error,
    refetch: refetchReport,
  } = useGetReportByIdQuery(reportId, { skip: !reportId });

  const handleRefresh = React.useCallback(() => {
    void refetchReport();
  }, [refetchReport]);

  const detail = React.useMemo(() => {
    if (apiReport) {
      return buildReportManagementDetailFromApiReport(apiReport);
    }
    return null;
  }, [apiReport]);

  if (isReportLoading || (!detail && !isError)) {
    return (
      <div className="space-y-6 w-full pb-12 animate-pulse">
        {/* Skeleton Header */}
        <div className="h-8 w-64 bg-muted/60 rounded-xl" />
        <div className="h-48 w-full bg-muted/40 rounded-2xl" />

        {/* Skeleton 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 w-full bg-muted/40 rounded-2xl" />
            <div className="h-72 w-full bg-muted/40 rounded-2xl" />
            <div className="h-48 w-full bg-muted/40 rounded-2xl" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <div className="h-64 w-full bg-muted/40 rounded-2xl" />
            <div className="h-64 w-full bg-muted/40 rounded-2xl" />
          </div>
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
          <Button
            onClick={() => refetchReport()}
            variant="outline"
            className="rounded-xl"
          >
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
      className="space-y-6 w-full pb-12"
    >
      {/* 1. Header & Summary Hero Banner */}
      <ReportDetailHeader detail={detail} />

      {/* 2. Responsive 2-Column Layout (2/3 Main Write-up + 1/3 Sticky Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 Width: Write-up, PoC, Scope & References) */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {detail.retestHistory && detail.retestHistory.length > 0 && (
            <RetestHistoryTimeline history={detail.retestHistory} />
          )}
          <ReportDetailAssessment detail={detail} />
          <ReportDetailProofOfConcept detail={detail} />
          <ReportDetailTargetScope detail={detail} />
          <ReportDetailReferences detail={detail} />
        </div>

        {/* Right Column (1/3 Width: Sticky Triage Actions, CVSS, Submitter) */}
        <div className="lg:col-span-1 space-y-6 min-w-0">
          <ReportDetailSidebar detail={detail} onRefresh={handleRefresh} />
        </div>
      </div>
    </motion.div>
  );
}
