"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ChevronRight, Eye } from "lucide-react";
import { useGetProfileByUsernameQuery } from "@/lib/redux/services/profileApi";
import ProfileHeroBanner from "@/components/profile/ProfileHeroBanner";
import StatsCards from "@/components/profile/StatsCards";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTabsContainer from "@/components/profile/ProfileTabsContainer";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileEditPanel from "@/components/profile/edit/ProfileEditPanel";
import { isNotFoundError } from "@/lib/api/query-error";
import { authClient } from "@/lib/auth/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = useParams<{ username: string }>();
  const { data: session } = authClient.useSession();
  const { data, isLoading, isError, error, refetch } =
    useGetProfileByUsernameQuery(username);
  const { data: me } = useGetProfileByUsernameQuery("me", { skip: !session });
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(
    () => searchParams.get("edit") === "1",
  );

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !data) {
    return (
      <ProfileNotFound
        identifier={username}
        notFound={isNotFoundError(error)}
        onRetry={refetch}
        scope="dashboard"
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

  const handleExitEdit = () => {
    setIsEditing(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      window.history.replaceState({}, "", url.toString());
    }
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full space-y-6 pb-20"
      >
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
            >
              <button
                type="button"
                onClick={handleExitEdit}
                className="cursor-pointer transition-colors hover:text-foreground"
              >
                @{profile.username}
              </button>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">
                Edit profile
              </span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Edit Researcher Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal branding, research biography, contact info, and social connections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExitEdit}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-2xs transition hover:bg-muted cursor-pointer"
            >
              <Eye className="size-4 text-muted-foreground" />
              <span>View Profile</span>
            </button>
          </div>
        </header>

        <ProfileEditPanel onDone={handleExitEdit} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-6 pb-12"
    >
      <ProfileHeroBanner
        profile={profile}
        onEdit={() => setIsEditing(true)}
      />

      <StatsCards stats={effectiveStats} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start xl:gap-8">
        <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
          <ProfileSidebar
            profile={profile}
            stats={effectiveStats}
          />
        </div>

        <div className="min-w-0 flex-1">
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
      </div>
    </motion.div>
  );
}

function profileMatchesRoute(
  returnedUsername: string,
  routeUsername: string,
): boolean {
  return returnedUsername.toLowerCase() === routeUsername.toLowerCase();
}
