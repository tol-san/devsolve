"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Flame,
  Lightbulb,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { ReportDetailSectionCard } from "@/components/report-management/ReportDetailSectionCard";
import type { ReportManagementDetail } from "@/components/report-management/types";
import { MarkdownView } from "@/components/ui/markdown-view";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReportDetailAssessmentProps = {
  detail: ReportManagementDetail;
};

export function ReportDetailAssessment({
  detail,
}: ReportDetailAssessmentProps) {
  return (
    <ReportDetailSectionCard
      title="Detailed Assessment & Analysis"
      icon={<ClipboardList className="size-4.5" />}
      contentClassName="space-y-6"
    >
      {/* 1. Assessment Summary */}
      <section className="space-y-2.5">
        <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          Executive Summary
        </h3>
        <div className="w-full text-foreground">
          <MarkdownView
            source={detail.assessmentSummary}
            className="text-sm sm:text-base leading-relaxed text-foreground font-normal"
          />
        </div>
      </section>

      {/* 2. Steps to Reproduce */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            Steps to Reproduce
          </h3>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {detail.reproductionSteps.length} Steps Documented
          </span>
        </div>

        <div className="space-y-2.5">
          {detail.reproductionSteps.map((step, idx) => (
            <div
              key={step}
              className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0 text-sm leading-relaxed text-foreground font-medium">
                <MarkdownView source={step} className="text-sm leading-relaxed" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Impact & Root Cause Analysis Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InsightCard
          icon={<Flame className="size-4 text-red-600 dark:text-red-400" />}
          title="Security Impact"
          tone="red"
          content={detail.impact}
        />
        <InsightCard
          icon={<Wrench className="size-4 text-blue-600 dark:text-blue-400" />}
          title="Identified Root Cause"
          tone="blue"
          content={detail.rootCause}
        />
      </div>

      {/* 4. Remediation Guidance */}
      <section className="space-y-2.5">
        <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="size-4.5 text-emerald-600 dark:text-emerald-400" />
          Suggested Remediation
        </h3>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-sm sm:text-base leading-relaxed text-foreground/90 space-y-2">
          <MarkdownView source={detail.remediation} className="text-sm leading-relaxed" />
        </div>
      </section>

      {/* 5. Analyst Security Tip */}
      {detail.analystTip && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Security Analyst Note
            </p>
            <p className="text-sm leading-relaxed text-blue-600 dark:text-blue-300">
              {detail.analystTip}
            </p>
          </div>
        </div>
      )}

      {/* 6. Review Action Callout Footer */}
      {!detail.isReviewed && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/40">
          <div>
            <p className="text-sm font-bold text-foreground">
              Ready to adjust severity & approve?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Proceed to the severity review step to validate CVSS score, bounty amount, and company notes.
            </p>
          </div>

          <Link
            href={`/dashboard/report-management/${detail.id}/severity-review`}
            className="shrink-0"
          >
            <Button
              size="sm"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9 px-4 gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Proceed to Severity Review</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </ReportDetailSectionCard>
  );
}

function InsightCard({
  icon,
  title,
  content,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  tone: "red" | "blue";
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 border space-y-2",
        tone === "red"
          ? "border-red-500/20 bg-red-500/5 dark:bg-red-500/10"
          : "border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-wider",
            tone === "red"
              ? "text-red-700 dark:text-red-400"
              : "text-blue-700 dark:text-blue-400"
          )}
        >
          {title}
        </p>
      </div>
      <div className="text-sm leading-relaxed text-foreground/90 font-medium">
        <MarkdownView source={content} className="text-sm leading-relaxed" />
      </div>
    </div>
  );
}
