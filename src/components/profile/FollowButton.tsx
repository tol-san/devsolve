"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Check, UserPlus, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import {
  useGetFollowSummaryQuery,
  useFollowTargetMutation,
  useUnfollowTargetMutation,
} from "@/lib/redux/services/profileApi";
import type { FollowableType } from "@/lib/types/profile/types";

interface FollowButtonProps {
  type?: FollowableType;
  targetId?: string;
  initialFollowing?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export default function FollowButton({
  type = "USER",
  targetId,
  initialFollowing = false,
  className = "",
  size = "md",
}: FollowButtonProps) {
  const pathname = usePathname();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { isLoggingIn, handleLogin } = useKeycloakLogin();
  const { data: summary, isLoading: isSummaryLoading } = useGetFollowSummaryQuery(
    { type, targetId: targetId ?? "" },
    { skip: !targetId }
  );

  const [followTarget, { isLoading: isFollowingLoading }] = useFollowTargetMutation();
  const [unfollowTarget, { isLoading: isUnfollowingLoading }] = useUnfollowTargetMutation();

  const [fallbackFollowing, setFallbackFollowing] = useState(initialFollowing);
  const isFollowing = targetId ? (summary?.following ?? initialFollowing) : fallbackFollowing;

  const isSelf = Boolean(
    type === "USER" &&
    session?.user &&
    targetId &&
    (session.user.id === targetId ||
      (session.user.email && session.user.email.split("@")[0].toLowerCase() === targetId.toLowerCase()))
  );

  if (isSelf) return null;

  const isPending =
    isSessionPending ||
    isLoggingIn ||
    isSummaryLoading ||
    isFollowingLoading ||
    isUnfollowingLoading;

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

    if (!targetId) {
      setFallbackFollowing((current) => !current);
      return;
    }

    try {
      if (isFollowing) {
        await unfollowTarget({ type, targetId }).unwrap();
        toast.success("Unfollowed successfully");
      } else {
        await followTarget({ type, targetId }).unwrap();
        toast.success("Following");
      }
    } catch (err: unknown) {
      const message = (err as { data?: { message?: string } })?.data?.message ?? "Failed to update follow status";
      toast.error(message);
    }
  };

  const isSmall = size === "sm";

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={isPending}
      onClick={handleToggleFollow}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition shadow-2xs cursor-pointer disabled:opacity-70 ${
        isSmall ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${
        isFollowing
          ? "border border-slate-200/80 bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className={`${isSmall ? "size-3.5" : "size-4"} animate-spin`} />
      ) : isFollowing ? (
        <Check className={`${isSmall ? "size-3.5" : "size-4"} text-emerald-500`} />
      ) : (
        <UserPlus className={isSmall ? "size-3.5" : "size-4"} />
      )}
      <span>{isFollowing ? "Following" : "Follow"}</span>
    </motion.button>
  );
}
