"use client";

import { useParams, notFound } from "next/navigation";
import { motion } from "motion/react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import FollowingList from "@/components/profile/following/FollowingList";
import {
  useGetProfileByUsernameQuery,
  useGetFollowingUsersQuery,
} from "@/lib/redux/services/profileApi";

export default function PublicFollowingPage() {
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full pb-12 animate-pulse">
        <div className="h-28 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    );
  }
  /* Only the profile decides whether this page exists. The following list is
     a separate request against a separate endpoint, and treating its failure
     as a missing profile turned "we could not load the list" into "no such
     person" — with the profile sitting loaded in memory the whole time. */
  if (isError || !overview) return notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <ProfileHeader
          profile={overview.profile}
          backHref={`/profile/${username}`}
          isPublicView
        />

        <div>
          <FollowingList
            totalUsers={followingUsers?.totalElements ?? 0}
            items={followingUsers?.content ?? []}
            baseProfilePath="/profile"
          />
        </div>
      </motion.div>
    </div>
  );
}
