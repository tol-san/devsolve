"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  CalendarDays,
  Check,
  Pencil,
  Settings,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Profile } from "@/lib/types/profile/types";
import FollowButton from "@/components/profile/FollowButton";
import { isUuid } from "@/components/Leaderboard/leaderboard-ui";
import { authClient } from "@/lib/auth/auth-client";

/** Where "edit" goes: the profile form, opened directly. */
function editProfileHref(username?: string) {
  return username
    ? `/dashboard/profile/${encodeURIComponent(username)}?edit=1`
    : "/dashboard/profile";
}

interface ProfileHeroBannerProps {
  profile: Profile;
  onEdit?: () => void;
}

export default function ProfileHeroBanner({
  profile,
  onEdit,
}: ProfileHeroBannerProps) {
  const {
    avatarUrl,
    avatarInitials,
    displayName,
    username,
    memberSince,
    isOwnProfile,
    id,
    coverUrl,
  } = profile;

  const { data: session } = authClient.useSession();
  const sessionUserId = session?.user?.id;
  const sessionEmail = session?.user?.email;
  const sessionUsername = sessionEmail ? sessionEmail.split("@")[0].toLowerCase() : "";

  const isOwn = Boolean(
    isOwnProfile ||
    (sessionUserId && id && sessionUserId === id) ||
    (sessionUsername && username && username.toLowerCase() === sessionUsername)
  );

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* ── Cover Backdrop Banner ─────────────────────────────────── */}
      <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/20 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10">
        {/* An uploaded cover replaces the decorative wash rather than sitting
            under it — the grid and the two radial tints exist to give an empty
            band some depth, and over a photograph they only muddy it. */}
        {coverUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Keeps the avatar and the name legible against a bright photo. */}
            <div className="absolute inset-0 bg-gradient-to-t from-card/70 to-transparent" />
          </>
        ) : null}
        {/* Subtle decorative grid and ambient blooms */}
        {!coverUrl && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.25),transparent_60%)]" />}
        {!coverUrl && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.2),transparent_50%)]" />}
        {!coverUrl && <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 dark:opacity-20" />}
      </div>

      {/* ── Profile Info Bar (Overlapping) ────────────────────────── */}
      <div className="px-5 pb-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          {/* Left: Avatar & Identity Details */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-16 sm:-mt-20">
            {/* Avatar with ring */}
            <div className="relative size-28 sm:size-36 shrink-0 rounded-full border-4 border-card bg-muted shadow-md overflow-hidden ring-2 ring-primary/20">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-extrabold text-white sm:text-4xl">
                  {avatarInitials}
                </div>
              )}
            </div>

            {/* Name, Handle, Meta Chips */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {displayName}
                </h1>
                <span
                  title="Verified Researcher"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400"
                >
                  <ShieldCheck className="size-5" />
                </span>
                {isOwn && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    You
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {username && !isUuid(username) && (
                  <span className="font-medium text-foreground/80 font-mono">
                    @{username}
                  </span>
                )}
                {memberSince && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    Joined {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions Hub */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0">
            {isOwn ? (
              <>
                {onEdit ? (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:bg-accent cursor-pointer"
                  >
                    <Pencil className="size-4" />
                    <span>Edit profile</span>
                  </button>
                ) : (
                  /* No handler here means the public view, which has no form of
                     its own — so this crosses to the dashboard and opens it.
                     It used to point at account settings, which is 2FA and
                     password: the one page that cannot edit a profile. */
                  <Link
                    href={editProfileHref(username)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:bg-accent cursor-pointer"
                  >
                    <Pencil className="size-4" />
                    <span>Edit profile</span>
                  </Link>
                )}
                <Link
                  href="/dashboard/profile/settings"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:bg-accent cursor-pointer"
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <FollowButton type="USER" targetId={id} />
            )}

            {/* Share Profile Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleCopyLink}
              title="Share profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-4" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
