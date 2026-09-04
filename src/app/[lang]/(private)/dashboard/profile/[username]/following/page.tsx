"use client";

import { useParams, notFound } from "next/navigation";
import { motion } from "motion/react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import FollowingList from "@/components/profile/following/FollowingList";
import {
  useGetProfileByUsernameQuery,
  useGetFollowingUsersQuery,
} from "@/lib/redux/services/profileApi";

export default function FollowingPage() {
  const { username } = useParams<{ username: string }>();
  const { data: overview, isLoading: isLoadingProfile, isError } = useGetProfileByUsernameQuery(username);

  const userId = overview?.profile.id ?? "";
  const {
    data: followingUsers,
    isLoading: isLoadingFollows,
  } = useGetFollowingUsersQuery(
    { userId, pageNumber: 0, pageSize: 20 },
    { skip: !userId },
  );

  if (isLoadingProfile || isLoadingFollows) {
    return (
      <div className="space-y-6 w-full pb-12 animate-pulse">
        <div className="h-28 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    );
  }
  if (isError || !overview) return notFound();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12 text-foreground"
    >
      <ProfileHeader
        profile={overview.profile}
        backHref={`/dashboard/profile/${username}`}
      />

      <div>
        <FollowingList
          totalUsers={followingUsers?.totalElements ?? 0}
          items={followingUsers?.content ?? []}
        />
      </div>
    </motion.div>
  );
}
