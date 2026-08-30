"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { useGetProfileByUsernameQuery } from "@/lib/redux/services/profileApi";
import ProfileHeroBanner from "@/components/profile/ProfileHeroBanner";
import StatsCards from "@/components/profile/StatsCards";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTabsContainer from "@/components/profile/ProfileTabsContainer";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import { isNotFoundError } from "@/lib/api/query-error";

/**
 * A member's public profile view.
 */
export default function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const { data, isLoading, isError, error, refetch } =
    useGetProfileByUsernameQuery(username);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !data) {
    return (
      <ProfileNotFound
        identifier={username}
        notFound={isNotFoundError(error)}
        onRetry={refetch}
      />
    );
  }

  const { profile: rawProfile, stats, severity, badges } = data;
  const profile = { ...rawProfile, isOwnProfile: false };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full space-y-6 pb-16"
      >
        {/* ── Top Hero Card / Banner ────────────────────────────────── */}
        <ProfileHeroBanner profile={profile} />

        {/* ── Key Metrics Stat Strip ────────────────────────────────── */}
        <StatsCards stats={stats} />

        {/* ── Two-Column Main Content Layout ────────────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start xl:gap-8">
          {/* Left Column: About & Network (sticky on desktop) */}
          <div className="w-full shrink-0 lg:sticky lg:top-24 lg:w-80">
            <ProfileSidebar
              profile={profile}
              stats={stats}
              baseProfilePath={`/profile/${username}`}
            />
          </div>

          {/* Right Column: Tabbed Content (Overview, Hacktivity, Community, Thanks) */}
          <div className="min-w-0 flex-1">
            <Suspense fallback={null}>
              <ProfileTabsContainer
                stats={stats}
                severity={severity}
                badges={badges}
                username={username}
                userId={profile.id}
              />
            </Suspense>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
