"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Mail,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Tag,
  Trophy,
  User,
  XCircle,
} from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGetProfileByUsernameQuery } from "@/lib/redux/services/profileApi";

type ReportDetailSidebarProps = {
  detail: ReportManagementDetail;
};

export function ReportDetailSidebar({ detail }: ReportDetailSidebarProps) {
  const [copiedVector, setCopiedVector] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const profileIdentifier = detail.submitterId || detail.submitter;

  const { data: profileOverview, isLoading: isLoadingProfile } =
    useGetProfileByUsernameQuery(profileIdentifier, {
      skip: !profileIdentifier,
    });

  const profile = profileOverview?.profile;
  const stats = profileOverview?.stats;

  const displayName = profile?.fullName || detail.submitter;
  const username =
    profile?.username ||
    detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const contactEmail =
    profile?.email || detail.submitterEmail?.trim() || "";
  const avatarUrl =
    profile?.avatarUrl || (detail as any).submitterAvatarUrl;
  const biography = profile?.bio;
  const country = profile?.country;
  const joinedAt = profile?.joinedDate;
  const coverImageUrl = (profile as any)?.coverImageUrl;

  const handleCopyVector = async () => {
    try {
      await navigator.clipboard.writeText(detail.vectorString);
      setCopiedVector(true);
      setTimeout(() => setCopiedVector(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyEmail = async () => {
    if (!contactEmail) return;
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // ignore
    }
  };

  const cweNumber = detail.cweIdentifier.replace(/[^0-9]/g, "");
  const cweUrl = cweNumber
    ? `https://cwe.mitre.org/data/definitions/${cweNumber}.html`
    : "#";

  const profileHref = `/profile/${encodeURIComponent(profileIdentifier)}`;

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
          {detail.isReviewed ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Triage Decision Recorded</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This finding has been reviewed. Severity is confirmed as{" "}
                <strong className="text-foreground">{detail.severity}</strong>{" "}
                {detail.cvssScore && detail.cvssScore !== "N/A"
                  ? `(${detail.cvssScore} CVSS)`
                  : ""}.
              </p>
              <Link
                href={`/dashboard/report-management/${detail.id}/severity-review`}
                className="block pt-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs font-semibold rounded-lg border-border hover:bg-muted"
                >
                  Adjust / Re-evaluate Severity
                </Button>
              </Link>
            </div>
          ) : (
            <>
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
            </>
          )}
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

      {/* 3. Researcher Profile — redesigned with real data */}
      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-md overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-20 overflow-hidden">
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600/30 via-indigo-500/20 to-violet-600/30" />
          )}
          {/* Top row: title + profile link */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white/90 drop-shadow">
              <User className="size-3.5" />
              Researcher Profile
            </span>
            <Link
              href={profileHref}
              className="flex items-center gap-1 text-[11px] font-semibold text-white/90 hover:text-white transition-colors"
            >
              <span>View Profile</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>

        {/* Avatar pinned over the cover */}
        <div className="relative px-4 pb-0">
          <div className="-mt-7 mb-3 flex items-end justify-between">
            <div className="relative">
              {isLoadingProfile ? (
                <div className="size-14 rounded-full bg-muted animate-pulse ring-2 ring-card shadow" />
              ) : avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="size-14 rounded-full object-cover ring-2 ring-card shadow-md"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-lg ring-2 ring-card shadow-md">
                  {detail.submitterInitials}
                </div>
              )}
              {profile && (
                <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 ring-1 ring-card">
                  <Check className="size-2.5 text-white stroke-[3]" />
                </span>
              )}
            </div>

            {/* Quick email actions */}
            {contactEmail && (
              <div className="flex items-center gap-1.5 mb-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyEmail}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                  title="Copy email"
                >
                  {copiedEmail ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
                <a
                  href={`mailto:${contactEmail}`}
                  className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={`Email ${displayName}`}
                >
                  <Mail className="size-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Name & Handle */}
          <div className="space-y-0.5 mb-3">
            <Link href={profileHref} className="group block">
              <h3 className="font-bold text-base text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {isLoadingProfile ? (
                  <span className="inline-block h-4 w-28 rounded bg-muted animate-pulse" />
                ) : (
                  displayName
                )}
              </h3>
            </Link>
            <p className="text-xs text-muted-foreground font-mono">@{username}</p>
          </div>

          {/* Bio */}
          {biography && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {biography}
            </p>
          )}

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-3 gap-1.5 mb-3 rounded-xl border border-border bg-muted/30 p-2 text-center">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Rep</p>
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-0.5">
                  <Trophy className="size-3 text-amber-500" />
                  {(stats.reputation ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-0.5 border-x border-border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Reports</p>
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-0.5">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  {stats.totalReports ?? 0}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Accepted</p>
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-0.5">
                  <Check className="size-3 text-blue-500" />
                  {stats.acceptedReports ?? stats.validReports ?? 0}
                </p>
              </div>
            </div>
          )}

          {/* Meta row */}
          <div className="space-y-1.5 mb-3 text-xs text-muted-foreground">
            {country && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                <span>{country}</span>
              </div>
            )}
            {joinedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                <span>Joined {joinedAt}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" />
              <span>Submitted {detail.submittedDate}</span>
            </div>
          </div>

          {/* Program / Status row */}
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 mb-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Program Scope</span>
              <span className="font-semibold text-foreground">{detail.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Report Status</span>
              <span
                className={cn(
                  "font-bold",
                  detail.status === "Open"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {detail.status}
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link href={profileHref} className="block pb-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>View Full Researcher Profile</span>
              <ExternalLink className="size-3.5 text-blue-600 dark:text-blue-400" />
            </Button>
          </Link>
        </div>
      </Card>
    </aside>
  );
}

