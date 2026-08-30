"use client";

import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
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
  const { username } = useParams<{ username: string }>();
  const { data: session } = authClient.useSession();
  const { data, isLoading, isError, error, refetch } =
    useGetProfileByUsernameQuery(username);
  /* Cached and shared with every other screen that asks, so this costs one
     request per session rather than one per profile viewed. */
  const { data: me } = useGetProfileByUsernameQuery("me", { skip: !session });
  /* `?edit=1` so the control can be reached from anywhere — the sidebar's
     "Add your research bio", the banner on the public profile — and land in
     the form rather than on a page the reader then has to find it on. */
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

  /* Whose profile this is, decided on ids from the same source.
     `session.user.id` is better-auth's, which is not the id the profile API
     keys on, and the email-derived name is a guess that stopped agreeing with
     anything the day the backend began publishing real handles — someone whose
     handle is not their email's local part failed every check here and lost
     the edit controls on their own profile. `/user-profiles/me` answers with
     the same id space as the profile being viewed, so the two can simply be
     compared. The older guesses stay as a fallback for records with no id. */
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

  /* Edit mode — full-page settings form */
  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full space-y-6 pb-16"
      >
        {/* Breadcrumb left, cancel right */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="cursor-pointer transition-colors hover:text-foreground"
            >
              @{profile.username}
            </button>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">
              Edit profile
            </span>
          </nav>

          <p className="text-sm text-muted-foreground">
            Changes are saved section by section.
          </p>
        </div>

        <ProfileEditPanel onDone={() => setIsEditing(false)} />
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
      {/* ── Top Hero Card / Banner ──────────────────────────────────── */}
      <ProfileHeroBanner
        profile={profile}
        onEdit={() => setIsEditing(true)}
      />

      {/* ── Key Metrics Stat Strip ──────────────────────────────────── */}
      <StatsCards stats={stats} />

      {/* ── Two-Column Main Content Layout ──────────────────────────── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start xl:gap-8">
        {/* Left Column: About & Network (sticky on desktop) */}
        <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
          <ProfileSidebar
            profile={profile}
            stats={stats}
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
  );
}

function profileMatchesRoute(
  returnedUsername: string,
  routeUsername: string,
): boolean {
  return returnedUsername.toLowerCase() === routeUsername.toLowerCase();
}
