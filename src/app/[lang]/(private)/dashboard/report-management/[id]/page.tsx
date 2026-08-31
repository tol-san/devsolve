"use client";

import React from "react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";

import { ReportDetailAssessment } from "@/components/report-management/ReportDetailAssessment";
import { ReportDetailClassification } from "@/components/report-management/ReportDetailClassification";
import { ReportDetailHeader } from "@/components/report-management/ReportDetailHeader";
import { ReportDetailProofOfConcept } from "@/components/report-management/ReportDetailProofOfConcept";
import { ReportDetailReferences } from "@/components/report-management/ReportDetailReferences";
import { ReportDetailSidebar } from "@/components/report-management/ReportDetailSidebar";
import { ReportDetailTargetScope } from "@/components/report-management/ReportDetailTargetScope";
import {
  buildReportDetailFromManagedReport,
  findManagedReportByRouteId,
  getReportDetailById,
} from "@/components/report-management/mock-data";
import { useGetManagedReportsQuery } from "@/lib/redux/services/reportsApi";

export default function ReportManagementDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: managedReports = [], isLoading } = useGetManagedReportsQuery();

  const liveReport = findManagedReportByRouteId(managedReports, params.id);
  const detail = liveReport
    ? buildReportDetailFromManagedReport(liveReport)
    : getReportDetailById(params.id);

  if (isLoading && !detail) {
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
          <ReportDetailAssessment detail={detail} />
          <ReportDetailProofOfConcept detail={detail} />
          <ReportDetailTargetScope detail={detail} />
          <ReportDetailReferences detail={detail} />
        </div>

        {/* Right Column (1/3 Width: Sticky Triage Actions, CVSS, Submitter) */}
        <div className="lg:col-span-1 space-y-6 min-w-0">
          <ReportDetailSidebar detail={detail} />
        </div>
      </div>
    </motion.div>
  );
}
