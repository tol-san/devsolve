"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfileTabs, { ProfileTabId } from "./ProfileTabs";
import OverviewTab from "./overview/OverviewTab";
import HacktivityTab from "./hacktivity/HacktivityTab";
import CommunityTab from "./community/CommunityTab";
import HallOfThanksTab from "./hall-of-thanks/HallOfThanksTab";
import { ProfileStats, SeverityStats, ProfileBadge } from "@/lib/types/profile/types";
import { useGetCommunityPostsQuery } from "@/lib/redux/services/profileApi";
import { useGetUserHacktivityQuery } from "@/lib/redux/services/hacktivityApi";
import { useGetUserRecognitionsQuery } from "@/lib/redux/services/thanksApi";

interface ProfileTabsContainerProps {
  stats: ProfileStats;
  severity: SeverityStats;
  badges: ProfileBadge[];
  username: string;
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

  const {
    data: hacktivity,
    isLoading: hacktivityLoading,
    isError: hacktivityError,
    refetch: refetchHacktivity,
  } = useGetUserHacktivityQuery(
    { userId, size: 20 },
    { skip: activeTab !== "hacktivity" || !userId },
  );
  const { data: communityPosts, isLoading: communityLoading } = useGetCommunityPostsQuery(userId, {
    skip: activeTab !== "community" || !userId,
  });
  const { data: recognitionsData, isLoading: thanksLoading } = useGetUserRecognitionsQuery(
    { userId, page: 0, size: 50, sort: "awardedAt,desc" },
    {
      skip: activeTab !== "hall-of-thanks" || !userId,
    }
  );

  return (
    <div>
      <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="mt-5">
        {activeTab === "overview" && <OverviewTab stats={stats} severity={severity} badges={badges} />}

        {activeTab === "hacktivity" &&
          (hacktivityLoading ? (
            <TabSkeleton label="Loading hacktivity" />
          ) : (
            <HacktivityTab
              activities={hacktivity?.activities ?? []}
              isError={hacktivityError}
              onRetry={() => void refetchHacktivity()}
            />
          ))}

        {activeTab === "community" &&
          (communityLoading ? (
            <TabSkeleton label="Loading community posts" />
          ) : (
            <CommunityTab posts={communityPosts ?? []} />
          ))}

        {activeTab === "hall-of-thanks" &&
          (thanksLoading ? (
            <TabSkeleton label="Loading recognitions" />
          ) : (
            <HallOfThanksTab recognitions={recognitionsData?.content ?? []} />
          ))}
      </div>
    </div>
  );
}

function TabSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="animate-pulse space-y-4"
    >
      <span className="sr-only">{label}…</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 rounded-xl bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/5 rounded bg-muted" />
              <div className="h-3 w-1/4 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-4/5 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
