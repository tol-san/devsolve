"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Tag,
  User,
  XCircle,
} from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ReportDetailSidebarProps = {
  detail: ReportManagementDetail;
};

export function ReportDetailSidebar({ detail }: ReportDetailSidebarProps) {
  const [copiedVector, setCopiedVector] = useState(false);

  const username = detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const contactEmail =
    detail.submitterEmail?.trim() ||
    `${detail.submitterInitials.toLowerCase()}@devsolve.io`;

  const handleCopyVector = async () => {
    try {
      await navigator.clipboard.writeText(detail.vectorString);
      setCopiedVector(true);
      setTimeout(() => setCopiedVector(false), 2000);
    } catch {
      // ignore
    }
  };

  const cweNumber = detail.cweIdentifier.replace(/[^0-9]/g, "");
  const cweUrl = cweNumber
    ? `https://cwe.mitre.org/data/definitions/${cweNumber}.html`
    : "#";

  const profileIdentifier = detail.submitterId || username;

  return (
    <aside className="space-y-6 lg:sticky lg:top-6">
      {/* 1. Moderation & Triage Actions */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/40 border-b border-border/70 px-5 py-3.5">
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="size-4 text-blue-600 dark:text-blue-400" />
            Triage & Moderation
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Review findings, validate CVSS scoring, and assign appropriate bounty rewards.
          </p>

          <div className="space-y-2.5 pt-1">
            <Link
              href={`/dashboard/report-management/${detail.id}/severity-review`}
              className="block"
            >
              <Button
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white text-xs gap-2 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="size-4" />
                <span>Accept & Adjust Severity</span>
              </Button>
            </Link>

            <a
              href={`mailto:${contactEmail}?subject=Information request regarding report #${detail.reportId}`}
              className="block"
            >
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-xs gap-2 cursor-pointer shadow-2xs"
              >
                <AlertCircle className="size-4 text-amber-500" />
                <span>Request Information</span>
              </Button>
            </a>

            <Link
              href={`/dashboard/report-management/${detail.id}/severity-review?action=reject`}
              className="block"
            >
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl border-red-500/20 bg-red-500/5 hover:bg-red-500/15 font-semibold text-red-600 dark:text-red-400 text-xs gap-2 cursor-pointer shadow-2xs"
              >
                <XCircle className="size-4" />
                <span>Reject Submission</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Vulnerability Classification Snapshot */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/40 border-b border-border/70 px-5 py-3.5">
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tag className="size-4 text-blue-600 dark:text-blue-400" />
            Classification Snapshot
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-sm">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium">Type</span>
            <span className="text-right text-xs font-bold text-foreground">
              {detail.vulnerabilityType}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium">CWE ID</span>
            <a
              href={cweUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>{detail.cweIdentifier}</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium">CVSS Score</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">{detail.cvssScore}</span>
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0 text-[10px] font-bold rounded-md",
                  detail.severity === "Critical" && "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
                  detail.severity === "High" && "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
                  detail.severity === "Medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
                  detail.severity === "Low" && "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                )}
              >
                {detail.severity}
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Vector String</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyVector}
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-1.5 cursor-pointer"
              >
                {copiedVector ? (
                  <>
                    <Check className="size-3 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <code className="block p-2 rounded-lg bg-muted font-mono text-[11px] text-foreground font-semibold break-all">
              {detail.vectorString}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* 3. Submitter Information with Hover Profile Preview */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardHeader className="bg-muted/40 border-b border-border/70 px-5 py-3.5 flex flex-row items-center justify-between rounded-t-2xl">
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="size-4 text-blue-600 dark:text-blue-400" />
            Researcher Profile
          </CardTitle>
          <Link
            href={`/profile/${encodeURIComponent(profileIdentifier)}`}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Profile</span>
            <ExternalLink className="size-3" />
          </Link>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/profile/${encodeURIComponent(profileIdentifier)}`}
              className="flex items-center gap-3 min-w-0 group cursor-pointer"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                {detail.submitterInitials}
              </div>
              <div className="min-w-0 text-left">
                <p className="font-bold text-sm text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {detail.submitter}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  @{username}
                </p>
              </div>
            </Link>

            <a
              href={`mailto:${contactEmail}`}
              className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              title={`Email ${detail.submitter}`}
            >
              <Mail className="size-3.5" />
            </a>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-border text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Program Scope</span>
              <span className="font-semibold text-foreground">{detail.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {detail.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Intake Timestamp</span>
              <span className="font-semibold text-foreground">
                {detail.submittedDate}
              </span>
            </div>
          </div>

          <Link
            href={`/profile/${encodeURIComponent(profileIdentifier)}`}
            className="block pt-1"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8.5 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>View Full Researcher Profile</span>
              <ExternalLink className="size-3.5 text-blue-600 dark:text-blue-400" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
}
