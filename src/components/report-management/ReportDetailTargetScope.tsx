"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Crosshair,
  Globe,
  Layers,
  Link2,
  Server,
} from "lucide-react";

import { ReportDetailSectionCard } from "@/components/report-management/ReportDetailSectionCard";
import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReportDetailTargetScopeProps = {
  detail: ReportManagementDetail;
};

export function ReportDetailTargetScope({
  detail,
}: ReportDetailTargetScopeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(detail.affectedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <ReportDetailSectionCard
      title="Target & Scope Verification"
      icon={<Crosshair className="size-4.5" />}
      contentClassName="space-y-6"
      headerRight={
        <Badge
          variant="outline"
          className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-bold text-xs px-2.5 py-0.5"
        >
          ✓ In-Scope Asset
        </Badge>
      }
    >
      {/* 1. Affected URL, Method & Parameter Grid */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.8fr)_0.8fr_1fr]">
        <FieldBlock label="Affected Endpoint / URL">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-sm text-foreground min-h-10">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <code className="truncate font-mono text-xs sm:text-sm font-semibold">
                {detail.affectedUrl || "—"}
              </code>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopyUrl}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              title="Copy URL"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>
        </FieldBlock>

        {/* Only when the report actually carries one. The method the reporter
            chose lives in the write-up, not in a field of its own. */}
        {detail.httpMethod && (
          <FieldBlock label="HTTP Method">
            <div className="flex items-center min-h-10 px-3.5 rounded-xl border border-border bg-muted/30">
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold",
                  detail.httpMethod === "GET" && "bg-blue-500/10 text-blue-700 dark:text-blue-300",
                  detail.httpMethod === "POST" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  detail.httpMethod === "PUT" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                  detail.httpMethod === "DELETE" && "bg-red-500/10 text-red-700 dark:text-red-300"
                )}
              >
                {detail.httpMethod}
              </span>
            </div>
          </FieldBlock>
        )}

        <FieldBlock label="Vulnerable Parameter">
          <div className="flex items-center min-h-10 px-3.5 rounded-xl border border-border bg-muted/30">
            <code className="font-mono text-xs sm:text-sm font-bold text-foreground truncate">
              {detail.parameter || "N/A"}
            </code>
          </div>
        </FieldBlock>
      </div>

      {/* 2. Environment callout — only when the report states one. It used to
             claim Production and "validated against live endpoints" for any
             report that named no environment, which is a claim about where the
             finding was proven that nobody made. */}
      {detail.environment && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Target Environment: {detail.environment}
            </p>
            {detail.environmentNote && (
              <p className="text-sm leading-relaxed text-amber-600 dark:text-amber-300">
                {detail.environmentNote}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 3. In-Scope Asset List */}
      {detail.assets && detail.assets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="size-3.5 text-blue-600 dark:text-blue-400" />
            Program Asset Scope
          </p>
          <div className="flex flex-wrap gap-2">
            {detail.assets.map((asset) => (
              <span
                key={asset}
                className="inline-flex items-center rounded-lg border border-border bg-muted/40 px-3 py-1.5 font-mono text-xs font-medium text-foreground"
              >
                {asset}
              </span>
            ))}
          </div>
        </div>
      )}
    </ReportDetailSectionCard>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
