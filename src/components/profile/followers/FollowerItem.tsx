"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { UserCheck, UserPlus, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import { FollowRecord } from "@/lib/types/profile/types";
import {
  useFollowTargetMutation,
  useUnfollowTargetMutation,
} from "@/lib/redux/services/profileApi";

interface FollowerItemProps {
  record: FollowRecord;
  baseProfilePath?: string;
}

function formatFollowedSince(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function FollowerItem({ record, baseProfilePath = "/dashboard/profile" }: FollowerItemProps) {
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { isLoggingIn, handleLogin } = useKeycloakLogin();
  const [isFollowing, setIsFollowing] = useState(record.isFollowing ?? false);
  const [followTarget, { isLoading: isFollowingLoading }] = useFollowTargetMutation();
  const [unfollowTarget, { isLoading: isUnfollowingLoading }] = useUnfollowTargetMutation();

  const isPending =
    isSessionPending || isLoggingIn || isFollowingLoading || isUnfollowingLoading;
  const targetId = record.followableId || record.id;
  const targetType = record.followableType || "USER";

  const handleToggleFollow = async () => {
    if (isPending) return;
    if (!session) {
      const redirectTo =
        typeof window === "undefined"
          ? pathname
          : `${window.location.pathname}${window.location.search}${window.location.hash}`;
      await handleLogin(redirectTo);
      return;
    }

    const previousState = isFollowing;
    setIsFollowing(!previousState);

    try {
      if (previousState) {
        await unfollowTarget({ type: targetType, targetId }).unwrap();
        toast.success("Unfollowed successfully");
      } else {
        await followTarget({ type: targetType, targetId }).unwrap();
        toast.success("Following back");
      }
    } catch (err: unknown) {
      setIsFollowing(previousState);
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Failed to update follow status";
      toast.error(message);
    }
  };

  /* `targetId` rather than `record.id`: both name the same account, and one of
     them is always present. Reading `record.id` directly threw here whenever a
     payload arrived without it, taking the whole page down rather than
     degrading one row. */
  const shortId = targetId ? targetId.slice(0, 8) : "";

  const displayName =
    record.displayName ??
    record.username ??
    (shortId ? `Follower #${shortId}` : "Follower");
  const handle = record.username ? `@${record.username}` : shortId ? `#${shortId}` : "";
  const initials = record.avatarInitials ?? displayName.slice(0, 2).toUpperCase();

  /* Followers come back without a handle, so they are addressed by id — the
     profile route takes either. */
  const profileSegment = record.username ?? targetId;
  const profileUrl = profileSegment ? `${baseProfilePath}/${profileSegment}` : "#";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs transition-all hover:bg-muted/20"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {/* Avatar */}
        <Link href={profileUrl} className="relative shrink-0 group">
          {record.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={record.avatarUrl}
              alt={displayName}
              className="size-12 rounded-2xl object-cover ring-1 ring-border transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white text-sm shadow-2xs group-hover:opacity-95 transition-opacity">
              {initials}
            </div>
          )}
        </Link>

        {/* User Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={profileUrl}
              className="text-base font-bold text-foreground hover:text-primary transition-colors truncate"
            >
              {displayName}
            </Link>
            <span className="text-xs font-semibold text-muted-foreground truncate">
              {handle}
            </span>
            {record.reputation !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldCheck size={12} />
                {record.reputation.toLocaleString()} rep
              </span>
            )}
          </div>

          {record.bio && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {record.bio}
            </p>
          )}

          <p className="text-[11px] font-medium text-muted-foreground">
            Followed since {formatFollowedSince(record.createdAt)}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
        <button
          type="button"
          disabled={isPending}
          onClick={handleToggleFollow}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-70 ${
            isFollowing
              ? "border border-border bg-muted/40 text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
          }`}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isFollowing ? (
            <>
              <UserCheck size={14} className="text-emerald-500" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={14} />
              <span>Follow back</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
