"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  ShieldCheck,
  TimerReset,
  Trophy,
  User,
} from "lucide-react";

import type { ReportManagementDetail } from "@/components/report-management/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetProfileByUsernameQuery } from "@/lib/redux/services/profileApi";

type ReportSeverityReviewSidebarProps = {
  detail: ReportManagementDetail;
};

export function ReportSeverityReviewSidebar({
  detail,
}: ReportSeverityReviewSidebarProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const profileIdentifier = detail.submitterId || detail.submitter;

  const { data: profileOverview } = useGetProfileByUsernameQuery(
    profileIdentifier,
    { skip: !profileIdentifier }
  );

  const profile = profileOverview?.profile;
  const stats = profileOverview?.stats;

  const displayName = profile?.fullName || detail.submitter;
  const username = profile?.username || detail.submitter.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  const contactEmail = profile?.email || detail.submitterEmail || "";
  const avatarUrl = profile?.avatarUrl || (detail as any).submitterAvatarUrl;
  const biography = profile?.bio;
  const location = profile?.location || profile?.country;
  const memberSince = profile?.joinedDate || detail.submittedDate;

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

  const profileHref = `/profile/${encodeURIComponent(profileIdentifier)}`;

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Submitter Snapshot & Intelligence Card */}
      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs">
        <CardHeader className="gap-2 pb-3">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="size-4.5 text-blue-600 dark:text-blue-400" />
              Submitter Info
            </span>
            {profile && (
              <Badge variant="outline" className="text-[10px] font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Verified
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/40">
            <Link
              href={profileHref}
              className="flex items-center gap-3 min-w-0 group cursor-pointer"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="size-11 shrink-0 rounded-full object-cover ring-2 ring-blue-500/20 shadow-2xs group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
                  {detail.submitterInitials}
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="font-bold text-sm sm:text-base text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  @{username}
                </p>
              </div>
            </Link>

            {contactEmail && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyEmail}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                  title="Copy email address"
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

          {/* Bio snippet if available */}
          {biography && (
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 px-1">
              {biography}
            </p>
          )}

          {/* Submitter Stats if available */}
          {stats && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/30 p-2.5 text-center">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Reputation</p>
                <p className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-center gap-1">
                  <Trophy className="size-3.5 text-amber-500" />
                  {stats.reputation.toLocaleString()}
                </p>
              </div>
              <div className="space-y-0.5 border-l border-border">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Disclosures</p>
                <p className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  {stats.totalReports}
                </p>
              </div>
            </div>
          )}

          {/* Location & Metadata */}
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground px-1">
            {location && (
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                <span>{location}</span>
              </span>
            )}
            {memberSince && (
              <span className="flex items-center gap-1.5 truncate">
                <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                <span>Submitted: {memberSince}</span>
              </span>
            )}
          </div>

          <Link href={profileHref} className="block mt-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 rounded-xl border-border bg-card hover:bg-muted font-semibold text-foreground text-xs gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>View Full Profile</span>
              <ExternalLink className="size-3.5 text-blue-600 dark:text-blue-400" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* 2. Current Submission Snapshot */}
      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-bold text-foreground">
            Current Submission
          </CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Snapshot of the researcher-submitted severity before the company decision.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Submitted severity
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
              >
                {detail.severity} ({detail.cvssScore})
              </Badge>
              <Badge
                variant="outline"
                className="border-border bg-card text-muted-foreground"
              >
                {detail.status}
              </Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Reward estimate
            </span>
            <p className="mt-3 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {detail.bountyRange}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-card text-card-foreground ring-1 ring-foreground/5 dark:ring-foreground/10 border-none shadow-xs">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-bold text-foreground">
            Review Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[
            {
              icon: ShieldCheck,
              title: "Confirm real impact",
              description: "Validate whether the exploit changes actual business risk or data exposure.",
            },
            {
              icon: TimerReset,
              title: "Compare with policy",
              description: "Align the final severity with your bounty rubric and triage conventions.",
            },
            {
              icon: FileText,
              title: "Leave clear feedback",
              description: "Explain why the final decision changed so the researcher understands it.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border border-border bg-muted/50 p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-foreground ring-1 ring-border">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
