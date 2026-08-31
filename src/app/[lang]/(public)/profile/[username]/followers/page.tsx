"use client";

import { useParams, notFound } from "next/navigation";
import { motion } from "motion/react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import FollowersList from "@/components/profile/followers/FollowersList";
import {
  useGetProfileByUsernameQuery,
  useGetFollowersQuery,
} from "@/lib/redux/services/profileApi";

export default function PublicFollowersPage() {
  const { username } = useParams<{ username: string }>();
  const { data: overview, isLoading: isLoadingProfile, isError } = useGetProfileByUsernameQuery(username);
  const { data: followers, isLoading: isLoadingFollowers } = useGetFollowersQuery(overview?.profile.id ?? "", {
    skip: !overview,
  });

  if (isLoadingProfile || isLoadingFollowers) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full pb-12 animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }
  /* As on the following page: the roster failing is not the profile missing. */
  if (isError || !overview) return notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-6 w-full pb-12"
      >
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs">
          <ProfileHeader
            profile={overview.profile}
            backHref={`/profile/${username}`}
            isPublicView
          />
        </div>

        <div>
          <FollowersList total={followers?.total ?? 0} items={followers?.items ?? []} baseProfilePath="/profile" />
        </div>
      </motion.div>
    </div>
  );
}
