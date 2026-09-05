"use client";

export const dynamic = "force-dynamic";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, MessagesSquare, Pencil, Plus, RotateCcw, Sparkles } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MyPostCard } from "@/components/my-community/MyPostCard";
import {
  useGetMyPostsQuery,
  type MyPost,
  type MyPostKind,
} from "@/lib/redux/services/myCommunityApi";
import { useGetMyAutoReviewsQuery } from "@/lib/redux/services/autoReviewsApi";
import { cn } from "@/lib/utils";

type Filter = "All" | MyPostKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Problem", label: "Problems" },
  { value: "Solution", label: "Solutions" },
  { value: "Showcase", label: "Showcases" },
];

export default function MyCommunityPage() {
  const { data: posts = [], isLoading, isError, error, refetch } =
    useGetMyPostsQuery();
  const { data: autoReviewsData } = useGetMyAutoReviewsQuery({
    approved: false,
  });
  const heldVerdicts = useMemo(
    () => (autoReviewsData?.content ?? []).filter((v) => v.status === "HELD"),
    [autoReviewsData],
  );
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(
    () => ({
      All: posts.length,
      Problem: posts.filter((post) => post.kind === "Problem").length,
      Solution: posts.filter((post) => post.kind === "Solution").length,
      Showcase: posts.filter((post) => post.kind === "Showcase").length,
    }),
    [posts],
  );

  const visible = useMemo(
    () =>
      filter === "All" ? posts : posts.filter((post) => post.kind === filter),
    [filter, posts],
  );

  const needsAttention = posts.filter(
    (post) => post.state.tone === "blocked",
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <span className="text-border">/</span>
            <span className="text-foreground">
              My Community
            </span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            My Community
          </h1>
          <p className="text-base text-muted-foreground">
            Every problem, solution and showcase you have posted — and where
            each one stands.
          </p>
        </div>

        <Link
          href="/community/create"
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
          )}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          New post
        </Link>
      </header>

      {heldVerdicts.length > 0 && (
        <section
          aria-label="Posts needing your attention"
          className="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-xs space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <h2 className="text-base font-bold text-foreground">
              Needs your attention ({heldVerdicts.length})
            </h2>
          </div>

          <div className="divide-y divide-border/60">
            {heldVerdicts.map((item) => {
              const editUrl =
                item.target === "PROBLEM"
                  ? `/community/${item.contentId}/edit`
                  : `/dashboard/showcases/${item.contentId}/edit`;
              const detailUrl =
                item.target === "PROBLEM"
                  ? `/community/${item.contentId}`
                  : `/showcases/${item.contentId}`;

              return (
                <div
                  key={`${item.target}_${item.contentId}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 first:pt-1 last:pb-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {item.target}
                      </span>
                      <Link
                        href={detailUrl}
                        className="text-sm font-semibold text-foreground hover:underline truncate"
                      >
                        {item.title || "Untitled"}
                      </Link>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  <Link
                    href={editUrl}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "shrink-0 rounded-xl border-amber-500/30 text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer shadow-2xs self-start sm:self-center",
                    )}
                  >
                    <Pencil className="size-3 mr-1.5" aria-hidden="true" />
                    <span>Edit and resubmit</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {needsAttention > 0 && heldVerdicts.length === 0 && (
        <div className="flex gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            {needsAttention === 1
              ? "One post was sent back with changes to make before it can go live."
              : `${needsAttention} posts were sent back with changes to make before they can go live.`}
          </span>
        </div>
      )}

      {isError ? (
        <StateCard
          tone="error"
          title="Something went wrong"
          body={messageOf(error, "Your posts could not be loaded right now.")}
          action={
            <Button type="button" onClick={() => void refetch()} className="rounded-xl">
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : isLoading ? (
        <ListSkeleton />
      ) : posts.length === 0 ? (
        <StateCard
          tone="empty"
          title="You haven't posted anything yet"
          body="Ask a question, answer one, or show what you built — anything you post shows up here with its review status."
          action={
            <Link
              href="/community/create"
              className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              Create your first post
            </Link>
          }
        />
      ) : (
        <>
          <div
            role="group"
            aria-label="Filter posts"
            className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-card ring-1 ring-foreground/5 dark:ring-foreground/10 p-1.5 shadow-xs"
          >
            {FILTERS.map((option) => {
              const isActive = filter === option.value;
              const count = counts[option.value];

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={isActive}
                  disabled={count === 0}
                  className={cn(
                    "relative cursor-pointer rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="my-community-filter-pill"
                      className="absolute inset-0 rounded-xl bg-blue-600 dark:bg-blue-600"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative inline-flex items-center gap-1.5">
                    {option.label}
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {visible.map((post: MyPost) => (
                <MyPostCard key={`${post.kind}-${post.id}`} post={post} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
}

function StateCard({
  tone,
  title,
  body,
  action,
}: {
  tone: "empty" | "error";
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <Card className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div
        className={cn(
          "mx-auto flex size-14 items-center justify-center rounded-2xl",
          tone === "error"
            ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800",
        )}
      >
        {tone === "error" ? (
          <AlertCircle className="size-7" />
        ) : (
          <MessagesSquare className="size-7" />
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p className="mx-auto max-w-md text-base text-slate-500 dark:text-slate-400">
          {body}
        </p>
      </div>
      <div className="flex justify-center">{action}</div>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your posts"
      className="animate-pulse space-y-4"
    >
      <span className="sr-only">Loading your posts…</span>
      <div className="h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:flex-row dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-video w-full shrink-0 rounded-xl bg-slate-200 sm:w-40 dark:bg-slate-800" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-5 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function messageOf(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "string" && data) return data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  return fallback;
}
