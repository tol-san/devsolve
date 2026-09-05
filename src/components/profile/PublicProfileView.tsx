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
import { authClient } from "@/lib/auth/auth-client";

export default function PublicProfileView() {
  const { username } = useParams<{ username: string }>();
  const { data: session } = authClient.useSession();
  const { data, isLoading, isError, error, refetch } =
    useGetProfileByUsernameQuery(username);
  const { data: me } = useGetProfileByUsernameQuery("me", { skip: !session });

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

  const sessionEmail = session?.user?.email;
  const sessionUsername = sessionEmail ? sessionEmail.split("@")[0].toLowerCase() : "";

  const isOwnProfile = Boolean(
    rawProfile.isOwnProfile ||
    (me?.profile.id && rawProfile.id && me.profile.id === rawProfile.id) ||
    (me?.profile.username &&
      rawProfile.username &&
      me.profile.username.toLowerCase() === rawProfile.username.toLowerCase()) ||
    (sessionUsername && (
      username?.toLowerCase() === sessionUsername ||
      rawProfile.username?.toLowerCase() === sessionUsername
    ))
  );

  const profile = { ...rawProfile, isOwnProfile };
  const effectiveStats = isOwnProfile && me?.stats ? me.stats : stats;
  const effectiveSeverity = isOwnProfile && me?.severity ? me.severity : severity;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full space-y-6 pb-16"
      >
        <ProfileHeroBanner
          profile={profile}
          baseProfilePath={`/profile/${username}`}
        />

        <StatsCards stats={effectiveStats} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 xl:gap-8">
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            <Suspense fallback={null}>
              <ProfileTabsContainer
                stats={effectiveStats}
                severity={effectiveSeverity}
                badges={badges}
                username={username}
                userId={profile.id}
              />
            </Suspense>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24 xl:col-span-3">
            <ProfileSidebar profile={profile} stats={effectiveStats} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
