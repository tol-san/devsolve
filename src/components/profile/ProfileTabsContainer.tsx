"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfileTabs, { ProfileTabId } from "./ProfileTabs";
import OverviewTab from "./overview/OverviewTab";
import HacktivityTab from "./hacktivity/HacktivityTab";
import CommunityTab from "./community/CommunityTab";
import HallOfThanksTab from "./hall-of-thanks/HallOfThanksTab";
import { ProfileStats, SeverityStats, ProfileBadge } from "@/lib/types/profile/types";
import { useGetCommunityPostsQuery, useGetThanksQuery } from "@/lib/redux/services/profileApi";
import { useGetUserHacktivityQuery } from "@/lib/redux/services/hacktivityApi";

interface ProfileTabsContainerProps {
  stats: ProfileStats;
  severity: SeverityStats;
  badges: ProfileBadge[];
  username: string;
  /** The profile's real user id — the portfolio endpoints are keyed by id. */
  userId: string;
}

const VALID_TABS: ProfileTabId[] = ["overview", "hacktivity", "community", "hall-of-thanks"];

export default function ProfileTabsContainer({ stats, severity, badges, username, userId }: ProfileTabsContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<ProfileTabId>(() => {
    const param = searchParams.get("tab") as ProfileTabId | null;
    return param && VALID_TABS.includes(param) ? param : "overview";
  }, [searchParams]);

  const handleTabChange = useCallback(
    (tab: ProfileTabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // skip: RTK Query only fetches when skip is false, so each query only fires once its tab is active
  /* Keyed on the profile's id, not the handle: `/user-profiles/{id}/hacktivity`
     is the only endpoint that answers for somebody other than the viewer. */
  const { data: hacktivity, isLoading: hacktivityLoading } = useGetUserHacktivityQuery(
    { userId, size: 20 },
    { skip: activeTab !== "hacktivity" || !userId },
  );
  const { data: communityPosts, isLoading: communityLoading } = useGetCommunityPostsQuery(userId, {
    skip: activeTab !== "community" || !userId,
  });
  const { data: thanks, isLoading: thanksLoading } = useGetThanksQuery(username, {
    skip: activeTab !== "hall-of-thanks",
  });

  return (
    <div>
      <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="mt-5">
        {activeTab === "overview" && <OverviewTab stats={stats} severity={severity} badges={badges} />}

        {activeTab === "hacktivity" &&
          (hacktivityLoading ? (
            <div className="p-6 text-sm text-slate-400 dark:text-neutral-500">Loading hacktivity...</div>
          ) : (
            <HacktivityTab activities={hacktivity?.activities ?? []} />
          ))}

        {activeTab === "community" &&
          (communityLoading ? (
            <div className="p-6 text-sm text-slate-400 dark:text-neutral-500">Loading community posts...</div>
          ) : (
            <CommunityTab posts={communityPosts ?? []} />
          ))}

        {activeTab === "hall-of-thanks" &&
          (thanksLoading ? (
            <div className="p-6 text-sm text-slate-400 dark:text-neutral-500">Loading thanks...</div>
          ) : (
            <HallOfThanksTab entries={thanks ?? []} />
          ))}
      </div>
    </div>
  );
}
