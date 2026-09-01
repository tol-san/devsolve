"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Coins,
  ExternalLink,
  Eye,
  Globe,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Tag,
  User,
  X,
} from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportDetailHeaderProps = {
  detail: ReportManagementDetail;
};

function getStatusBadge(detail: ReportManagementDetail) {
  if (detail.rawStatus === "ACCEPTED") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
      >
        <CheckCircle2 className="size-3.5 text-emerald-500" />
        TRIAGED & ACCEPTED
      </Badge>
    );
  }

  if (detail.rawStatus === "RESOLVED") {
    return (
      <Badge
        variant="outline"
        className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
      >
        <ShieldCheck className="size-3.5 text-purple-500" />
        RESOLVED & PAID
      </Badge>
    );
  }

  if (detail.rawStatus === "REJECTED") {
    return (
      <Badge
        variant="outline"
        className="bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
      >
        <X className="size-3.5 text-red-500" />
        REJECTED
      </Badge>
    );
  }

  if (detail.isReviewed || detail.status === "Closed") {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
      >
        <CheckCircle2 className="size-3.5 text-emerald-500" />
        TRIAGED
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
    >
      <span className="size-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
      PENDING REVIEW
    </Badge>
  );
}

function getSeverityBadge(
  severity: ReportManagementDetail["severity"],
  cvssScore?: string
) {
  switch (severity) {
    case "Critical":
      return (
        <Badge className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <ShieldAlert className="size-3.5" />
          CRITICAL {cvssScore && cvssScore !== "N/A" ? `(${cvssScore})` : ""}
        </Badge>
      );
    case "High":
      return (
        <Badge className="bg-orange-500 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <CircleAlert className="size-3.5" />
          HIGH {cvssScore && cvssScore !== "N/A" ? `(${cvssScore})` : ""}
        </Badge>
      );
    case "Medium":
      return (
        <Badge className="bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <CircleAlert className="size-3.5" />
          MEDIUM {cvssScore && cvssScore !== "N/A" ? `(${cvssScore})` : ""}
        </Badge>
      );
    default:
      return (
        <Badge className="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          LOW {cvssScore && cvssScore !== "N/A" ? `(${cvssScore})` : ""}
        </Badge>
      );
  }
}

export function ReportDetailHeader({ detail }: ReportDetailHeaderProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const contactEmail =
    detail.submitterEmail?.trim() ||
    `${detail.submitterInitials.toLowerCase()}@devsolve.io`;

  return (
    <div className="space-y-5">
      {/* 1. Breadcrumbs & Top Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/80">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <Link
            href="/dashboard/report-management"
            className="transition-colors hover:text-foreground"
          >
            Report Management
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-semibold text-foreground">
            #{detail.reportId}
          </span>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/report-management">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs h-9 px-3 gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Queue</span>
            </Button>
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
            className="rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs h-9 px-3 gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye className="size-3.5 text-blue-600 dark:text-blue-400" />
            <span>Preview Summary</span>
          </Button>

          {detail.isReviewed ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-9 px-3 gap-1.5 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center"
              >
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Review Completed</span>
              </Badge>

              <Link href={`/dashboard/report-management/${detail.id}/severity-review`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-border bg-card text-foreground hover:bg-muted font-semibold text-xs h-9 px-3 gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Edit Severity</span>
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={`/dashboard/report-management/${detail.id}/severity-review`}>
              <Button
                size="sm"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-3.5 gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Review & Adjust Severity</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Report Overview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className="font-mono font-bold text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
                    #{detail.reportId}
                  </Badge>
                  <h3 className="font-bold text-base text-foreground truncate max-w-sm sm:max-w-md">
                    {detail.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreviewModal(false)}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-5 sm:p-6 space-y-4 text-sm leading-relaxed">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(detail.severity, detail.cvssScore)}
                  {getStatusBadge(detail)}
                  <span className="text-xs text-muted-foreground">
                    Submitted by <strong>{detail.submitter}</strong> on {detail.submittedDate}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Executive Summary
                  </h4>
                  <p className="text-sm text-foreground/90 font-medium bg-muted/30 p-3.5 rounded-xl border border-border/80">
                    {detail.summary || detail.assessmentSummary}
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Target Endpoint
                  </h4>
                  <code className="block text-xs font-mono font-semibold bg-muted/40 p-2.5 rounded-lg border border-border">
                    {detail.httpMethod} {detail.affectedUrl}
                  </code>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Reproduction Summary
                  </h4>
                  <ol className="space-y-1.5 list-decimal pl-5 text-xs text-muted-foreground">
                    {detail.reproductionSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border bg-card px-5 py-3.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviewModal(false)}
                  className="rounded-xl text-xs h-8"
                >
                  Close Preview
                </Button>

                <Link href={`/dashboard/report-management/${detail.id}/severity-review`}>
                  <Button
                    size="sm"
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>{detail.isReviewed ? "Edit Severity Review" : "Open Severity Review"}</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Main Title Banner Card */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardContent className="p-6 sm:p-7 space-y-6">
          {/* Top Row: Badges & Title */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-200 dark:border-blue-500/20 px-2.5 py-0.5 rounded-md"
              >
                #{detail.reportId}
              </Badge>

              {getSeverityBadge(detail.severity, detail.cvssScore)}

              {getStatusBadge(detail)}

              <Badge
                variant="outline"
                className="bg-muted/70 text-foreground border-border font-semibold text-xs px-2.5 py-0.5 rounded-full"
              >
                {detail.type} Program
              </Badge>

              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20 font-semibold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1"
              >
                <Lock className="size-3" />
                Scope Verified
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-snug">
              {detail.title}
            </h1>
          </div>

          {/* Key Facts Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border border-border/80 text-sm">
            {/* Submitter */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-blue-600 dark:text-blue-400" />
                Researcher
              </span>
              <Link
                href={`/profile/${encodeURIComponent(detail.submitterId || detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_"))}`}
                className="font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate inline-flex items-center gap-1 group"
                title={`View ${detail.submitter}'s public profile`}
              >
                <span className="truncate">{detail.submitter}</span>
                <ExternalLink className="size-3 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
              <a
                href={`mailto:${contactEmail}`}
                className="text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 truncate block font-medium"
              >
                {contactEmail}
              </a>
            </div>

            {/* Target Asset */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Globe className="size-3.5 text-blue-600 dark:text-blue-400" />
                Target Asset
              </span>
              <p className="font-mono text-xs font-bold text-foreground truncate" title={detail.affectedUrl}>
                {detail.affectedUrl || detail.assets[0] || "Target Asset"}
              </p>
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                {detail.httpMethod || "GET"}
              </span>
            </div>

            {/* Reward Range */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Coins className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Bounty Estimate
              </span>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {detail.bountyRange}
              </p>
              <span className="text-xs text-muted-foreground font-medium">
                Standard Matrix
              </span>
            </div>

            {/* Submitted Date & Time */}
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-blue-600 dark:text-blue-400" />
                Submitted At
              </span>
              <p className="text-xs font-bold text-foreground">
                {detail.submittedDate}
              </p>
              <span className="text-xs text-muted-foreground font-medium">
                Triage Queue Intake
              </span>
            </div>
          </div>

          {/* Summary Callout */}
          {detail.summary && (
            <div className="text-sm sm:text-base leading-relaxed text-muted-foreground border-l-2 border-blue-500 pl-4 py-0.5">
              <p className="font-medium text-foreground/90">{detail.summary}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
