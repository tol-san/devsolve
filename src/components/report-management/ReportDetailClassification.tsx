"use client";

import React, { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Shield,
  Tag,
} from "lucide-react";

import { ReportDetailSectionCard } from "@/components/report-management/ReportDetailSectionCard";
import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReportDetailClassificationProps = {
  detail: ReportManagementDetail;
};

export function ReportDetailClassification({
  detail,
}: ReportDetailClassificationProps) {
  const [copiedVector, setCopiedVector] = useState(false);

  const handleCopyVector = async () => {
    try {
      await navigator.clipboard.writeText(detail.vectorString);
      setCopiedVector(true);
      setTimeout(() => setCopiedVector(false), 2000);
    } catch {
      // ignore
    }
  };

  const severityBadgeClass =
    detail.severity === "Critical"
      ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
      : detail.severity === "High"
      ? "border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20"
      : detail.severity === "Medium"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
      : "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";

  const cweNumber = detail.cweIdentifier.replace(/[^0-9]/g, "");
  const cweUrl = cweNumber
    ? `https://cwe.mitre.org/data/definitions/${cweNumber}.html`
    : "#";

  return (
    <ReportDetailSectionCard
      title="Vulnerability Classification & CVSS"
      icon={<Shield className="size-4.5" />}
      contentClassName="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoBlock label="Vulnerability Type">
          <p className="text-sm sm:text-base font-bold tracking-tight text-foreground">
            {detail.vulnerabilityType}
          </p>
        </InfoBlock>

        <InfoBlock label="CWE Identifier">
          <a
            href={cweUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>{detail.cweIdentifier}</span>
            <ExternalLink className="size-3.5" />
          </a>
        </InfoBlock>

        <InfoBlock label="CVSS 3.1 Base Score">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-foreground">
              {detail.cvssScore}
            </span>
            <Badge
              variant="outline"
              className={cn("rounded-full px-2.5 font-bold text-xs", severityBadgeClass)}
            >
              {detail.severity}
            </Badge>
          </div>
        </InfoBlock>
      </div>

      <InfoBlock label="CVSS Vector String">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3.5 py-2">
          <code className="block overflow-x-auto font-mono text-xs text-foreground font-semibold">
            {detail.vectorString}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopyVector}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title="Copy CVSS Vector"
          >
            {copiedVector ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      </InfoBlock>
    </ReportDetailSectionCard>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
