"use client";

import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Pencil,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { Profile } from "@/lib/types/profile/types";
import FollowButton from "@/components/profile/FollowButton";
import { isUuid } from "@/components/Leaderboard/leaderboard-ui";
import { authClient } from "@/lib/auth/auth-client";

function editProfileHref(username?: string) {
  return username
    ? `/dashboard/profile/${encodeURIComponent(username)}?edit=1`
    : "/dashboard/profile";
}

interface ProfileHeroBannerProps {
  profile: Profile;
  onEdit?: () => void;
  baseProfilePath?: string;
}

export default function ProfileHeroBanner({
  profile,
  onEdit,
  baseProfilePath,
}: ProfileHeroBannerProps) {
  const {
    avatarUrl,
    avatarInitials,
    displayName,
    username,
    memberSince,
    location,
    followers = 0,
    following = 0,
    isOwnProfile,
    id,
    coverUrl,
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

  const profileBasePath =
    baseProfilePath ?? `/dashboard/profile/${encodeURIComponent(username ?? "")}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="relative h-40 w-full overflow-hidden sm:h-52">
        {coverUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/8 to-transparent" />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:28px_28px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </>
        )}
      </div>

      <div className="relative px-5 pb-5 sm:px-8 sm:pb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative -mt-16 size-28 shrink-0 overflow-hidden rounded-full border-4 border-card bg-muted shadow-md ring-2 ring-primary/20 sm:-mt-20 sm:size-36">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-3xl font-extrabold text-primary-foreground sm:text-4xl">
                  {avatarInitials}
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {displayName}
                </h1>
                <span
                  title="Verified Researcher"
                  className="inline-flex items-center text-primary"
                >
                  <ShieldCheck className="size-5" />
                </span>
                {isOwn && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    You
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                {username && !isUuid(username) && (
                  <span className="font-mono font-medium text-foreground/80">
                    @{username}
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {location}
                  </span>
                )}
                {memberSince && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    Joined {memberSince}
                  </span>
                )}
              </div>

              {/* Social counters belong with the identity, not buried in a widget. */}
              <div className="flex flex-wrap items-center gap-4 pt-0.5 text-sm">
                <Link
                  href={`${profileBasePath}/followers`}
                  className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Users className="size-3.5" />
                  <span className="font-bold tabular-nums text-foreground">
                    {followers.toLocaleString()}
                  </span>
                  <span className="group-hover:underline">followers</span>
                </Link>

                <Link
                  href={`${profileBasePath}/following`}
                  className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <UserRound className="size-3.5" />
                  <span className="font-bold tabular-nums text-foreground">
                    {following.toLocaleString()}
                  </span>
                  <span className="group-hover:underline">following</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 lg:pb-1">
            {isOwn ? (
              <>
                {onEdit ? (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:bg-accent"
                  >
                    <Pencil className="size-4" />
                    <span>Edit profile</span>
                  </button>
                ) : (
                  <Link
                    href={editProfileHref(username)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:bg-accent"
                  >
                    <Pencil className="size-4" />
                    <span>Edit profile</span>
                  </Link>
                )}
                <Link
                  href="/dashboard/profile/settings"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-2xs transition-colors hover:bg-accent"
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <FollowButton type="USER" targetId={id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
