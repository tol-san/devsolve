"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGetHacktivityFeedQuery } from "@/lib/redux/services/hacktivityApi";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import SearchBar from "@/components/shared/SearchBar";
import { Badge } from "@/components/ui/badge";
import FeaturedDisclosures from "./FeaturedDisclosures";
import {
  ShieldAlert,
  Award,
  Heart,
  MessageSquare,
  Activity,
  Trophy,
  CheckCircle2,
} from "lucide-react";

export default function HacktivityFeature({
  heading,
  description,
}: {
  heading: string;
  description: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const searchParams = useMemo(
    () => (query.trim() ? { search: query.trim() } : undefined),
    [query],
  );

  const { data, isLoading, isError } = useGetHacktivityFeedQuery(searchParams);
  const activityStats = data?.stats ?? [];
  const activities = useMemo(() => data?.activities ?? [], [data?.activities]);

  const filteredActivities = useMemo(() => {
    if (!selectedFilter) return activities;

    return activities.filter((activity) => {
      if (selectedFilter === "Bounty") {
        return Boolean(activity.bounty && activity.bounty !== "None");
      }
      return activity.severity === selectedFilter;
    });
  }, [activities, selectedFilter]);

  const { data: session } = authClient.useSession();
  const { handleLogin } = useKeycloakLogin();

  const toggleLike = (id: string) => {
    if (!session?.user) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/hacktivity",
      );
      return;
    }
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const topHackers = [
    { handle: "darkp4tch", name: "Amara Diallo", bounty: "$12,400", rank: 1 },
    { handle: "n1ghtw0lf", name: "Ivan Petrov", bounty: "$9,800", rank: 2 },
    { handle: "cipherqueen", name: "Lin Xiaoyu", bounty: "$8,200", rank: 3 },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:py-12 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {activityStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-card px-3.5 py-2 ring-1 ring-foreground/5 dark:ring-foreground/10"
              >
                <div className="text-sm font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Vulnerability Disclosures */}
        <FeaturedDisclosures />

        {/* Main Stream Controls & Feed Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Left Main Stream */}
          <div className="rounded-2xl bg-card p-5 sm:p-7 ring-1 ring-foreground/5 dark:ring-foreground/10">
            {/* Filter Bar Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                  <span>Public Disclosure Stream</span>
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Search and filter live security activity reports.
                </p>
              </div>

              {/* Severity Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {(["Critical", "High", "Bounty"] as const).map((option) => {
                  const isActive = selectedFilter === option;
                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() =>
                        setSelectedFilter(isActive ? null : option)
                      }
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <div className="mt-5">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search researchers, programs, or vulnerabilities..."
              />
            </div>

            {/* Count */}
            <div className="mt-4 text-xs font-medium text-muted-foreground">
              {filteredActivities.length} disclosures found
            </div>

            {/* Feed List */}
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-full rounded-xl bg-muted/40 p-4 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-40 rounded bg-muted" />
                          <div className="h-3 w-3/4 rounded bg-muted" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                  Failed to load hacktivity feed. Please try again later.
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="rounded-xl bg-muted/40 p-8 text-center text-sm text-muted-foreground">
                  No activity matches your search or filter.
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredActivities.map((activity, i) => {
                    const isLiked = likedPosts[activity.id];
                    return (
                      <motion.article
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{
                          duration: 0.25,
                          delay: Math.min(i, 8) * 0.03,
                        }}
                        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/5 dark:ring-foreground/10 transition-all hover:ring-foreground/10 dark:hover:ring-foreground/20 hover:shadow-xs"
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
                            <Image
                              src={activity.avatarUrl}
                              alt={`${activity.handle} avatar`}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-foreground truncate">
                                @{activity.handle}
                              </span>
                              <Badge
                                variant="secondary"
                                className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 text-xs font-semibold px-2.5 py-0.5"
                              >
                                {activity.label}
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground leading-snug">
                              {activity.action}{" "}
                              <span className="font-semibold text-foreground">
                                {activity.program}
                              </span>
                            </p>

                            {/* Tags & Metadata */}
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                              {activity.severity && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold ${
                                    activity.severity === "Critical"
                                      ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                      : activity.severity === "High"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20"
                                        : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  <ShieldAlert size={12} />
                                  {activity.severity}
                                </span>
                              )}

                              {activity.bounty && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 px-2 py-0.5 font-semibold">
                                  <Award size={12} />
                                  {activity.bounty}
                                </span>
                              )}

                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">
                                {activity.timeAgo}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Interaction Buttons */}
                        <div className="flex items-center gap-2 shrink-0 sm:self-center">
                          <button
                            type="button"
                            onClick={() => toggleLike(activity.id)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                              isLiked
                                ? "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/70"
                            }`}
                          >
                            <Heart
                              size={14}
                              className={
                                isLiked ? "fill-rose-600 text-rose-600" : ""
                              }
                            />
                            <span>{isLiked ? 19 : 18}</span>
                          </button>

                          <button
                            type="button"
                            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <MessageSquare size={13} />
                            <span>Discuss</span>
                          </button>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          {/* Clears the sticky navbar, otherwise the widgets pin underneath it */}
          <div className="space-y-6 sticky top-[calc(var(--navbar-height)+1.5rem)]">
            {/* Top Hackers Widget */}
            <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 dark:ring-foreground/10">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <Trophy size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Top Hackers This Week
                </h3>
              </div>

              <div className="space-y-3">
                {topHackers.map((hacker) => (
                  <div
                    key={hacker.handle}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        #{hacker.rank}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {hacker.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium">
                          @{hacker.handle}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {hacker.bounty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinated Disclosure Notice */}
            <div className="rounded-2xl bg-blue-50/50 p-5 border border-blue-100 text-xs text-blue-900 space-y-2 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-100">
              <div className="flex items-center gap-1.5 font-bold text-blue-950 dark:text-blue-100 text-sm">
                <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />
                <span>Coordinated Disclosure</span>
              </div>
              <p className="text-slate-600 dark:text-blue-100/70 leading-relaxed">
                All activities listed on Hacktivity adhere to coordinated
                vulnerability disclosure policies agreed upon by researchers and
                program teams.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
