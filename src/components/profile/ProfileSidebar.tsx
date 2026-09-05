"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  Globe,
  Link2,
  MapPin,
  Quote,
  ShieldCheck,
  Target,
} from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Profile, ProfileStats } from "@/lib/types/profile/types";
import { authClient } from "@/lib/auth/auth-client";

interface ProfileSidebarProps {
  profile: Profile;
  stats?: ProfileStats;
}

function toHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function displayUrl(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function editProfileHref(username?: string) {
  return username
    ? `/dashboard/profile/${encodeURIComponent(username)}?edit=1`
    : "/dashboard/profile";
}

export default function ProfileSidebar({
  profile,
  stats,
}: ProfileSidebarProps) {
  const {
    bio,
    memberSince,
    location,
    socialLinks = {},
    username,
    isOwnProfile,
    id,
  } = profile;

  const { data: session } = authClient.useSession();
  const sessionUserId = session?.user?.id;
  const sessionEmail = session?.user?.email;
  const sessionUsername = sessionEmail
    ? sessionEmail.split("@")[0].toLowerCase()
    : "";

  const isOwn = Boolean(
    isOwnProfile ||
      (sessionUserId && id && sessionUserId === id) ||
      (sessionUsername && username && username.toLowerCase() === sessionUsername),
  );

  const validSocialLinks = Object.entries(socialLinks).filter(([, url]) =>
    Boolean(url && url.trim().length > 0),
  );

  const acceptedRate = stats
    ? Math.min(100, Math.max(0, stats.acceptedRate))
    : 0;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      <section className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Quote className="size-3.5 text-primary" />
          <span>{isOwn ? "About you" : "About researcher"}</span>
        </h2>

        {bio && bio.trim().length > 0 ? (
          <div className="prose prose-sm dark:prose-invert mt-3 max-w-none text-sm leading-relaxed text-foreground/90 wrap-break-word">
            <ReactMarkdown>{bio}</ReactMarkdown>
          </div>
        ) : isOwn ? (
          <div className="mt-3 space-y-1.5 rounded-xl border border-dashed border-border bg-muted/20 p-3.5 text-center">
            <p className="text-xs text-muted-foreground">
              You haven&apos;t added a bio yet.
            </p>
            <Link
              href={editProfileHref(username)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>Add your research bio</span>
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm italic text-muted-foreground">
            No bio provided yet.
          </p>
        )}
      </section>

      {stats && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>Reliability &amp; trust</span>
          </h2>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Acceptance accuracy
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.acceptedRate}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${acceptedRate}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-emerald-500"
                />
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-center">
                <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Target className="size-3.5" />
                  Valid
                </dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {stats.accepted.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-center">
                <dt className="text-xs font-medium text-muted-foreground">
                  Submitted
                </dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {stats.reportsSubmitted.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Presence &amp; details
        </h2>

        <div className="mt-3.5 space-y-1">
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
                  <Globe className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  <span className="truncate text-sm font-medium">
                    {displayUrl(url!)}
                  </span>
                </div>
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100" />
              </a>
            ))
          ) : isOwn ? (
            <div className="flex items-center justify-between px-2.5 py-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2.5">
                <Link2 className="size-4" />
                No links added
              </span>
              <Link
                href={editProfileHref(username)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Add links
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-muted-foreground">
              <Link2 className="size-4 shrink-0" />
              <span>No external links</span>
            </div>
          )}

          {location && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>Member since {memberSince || "Recently"}</span>
          </div>

          <div className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-muted-foreground">
            <Building2 className="size-4 shrink-0" />
            <span>Independent security researcher</span>
          </div>
        </div>
      </section>
    </motion.aside>
  );
}
