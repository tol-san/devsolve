"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  Quote,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Profile, ProfileStats } from "@/lib/types/profile/types";

interface ProfileSidebarProps {
  profile: Profile;
  stats?: ProfileStats;
  baseProfilePath?: string;
}

function toHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function displayUrl(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export default function ProfileSidebar({
  profile,
  stats,
  baseProfilePath,
}: ProfileSidebarProps) {
  const {
    bio,
    memberSince,
    socialLinks = {},
    followers = 0,
    following = 0,
    username,
  } = profile;

  const profileBasePath = baseProfilePath ?? `/dashboard/profile/${username}`;

  const validSocialLinks = Object.entries(socialLinks).filter(
    ([, url]) => Boolean(url && url.trim().length > 0)
  );

  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* ── About / Bio Card ────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Quote className="size-3.5 text-primary" />
          <span>About Researcher</span>
        </h2>

        {bio && bio.trim().length > 0 ? (
          <div className="prose prose-sm prose-slate dark:prose-invert mt-3 max-w-none text-sm leading-relaxed text-foreground/90 wrap-break-word">
            <ReactMarkdown>{bio}</ReactMarkdown>
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-muted-foreground">
            No bio provided yet.
          </p>
        )}

        {/* ── Community Network Stats ───────────────────────────── */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
          <Link
            href={`${profileBasePath}/followers`}
            className="group flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/40 p-3 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground">
              <Users className="size-3.5" />
              <span>Followers</span>
            </div>
            <span className="mt-1 text-lg font-bold tabular-nums text-foreground">
              {followers.toLocaleString()}
            </span>
          </Link>

          <Link
            href={`${profileBasePath}/following`}
            className="group flex flex-col items-center justify-center rounded-xl border border-border/60 bg-muted/40 p-3 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-foreground">
              <Shield className="size-3.5" />
              <span>Following</span>
            </div>
            <span className="mt-1 text-lg font-bold tabular-nums text-foreground">
              {following.toLocaleString()}
            </span>
          </Link>
        </div>
      </div>

      {/* ── Contact & Web Presence Card ─────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Online Presence & Details
        </h2>

        <div className="mt-3.5 space-y-2.5">
          {validSocialLinks.length > 0 ? (
            validSocialLinks.map(([platform, url]) => (
              <a
                key={platform}
                href={toHref(url!)}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Globe className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="truncate text-sm font-medium">
                    {displayUrl(url!)}
                  </span>
                </div>
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100" />
              </a>
            ))
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="size-4 shrink-0" />
              <span>No external links linked</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-2.5 py-1 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>Member since {memberSince || "Recently"}</span>
          </div>

          <div className="flex items-center gap-2.5 px-2.5 py-1 text-sm text-muted-foreground">
            <Building2 className="size-4 shrink-0" />
            <span>Independent Security Researcher</span>
          </div>
        </div>
      </div>

      {/* ── Security Trust Metrics (if stats provided) ───────────── */}
      {stats && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Reliability & Trust
          </h2>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Acceptance Accuracy</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {stats.acceptedRate}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, stats.acceptedRate))}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
              <span className="text-muted-foreground">Total Valid Findings</span>
              <span className="font-bold text-foreground">
                {stats.accepted.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
