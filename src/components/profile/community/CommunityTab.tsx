"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CommunityPost, CommunityPostTag } from "@/lib/types/profile/types";
import CommunityPostCard from "./CommunityPostCard";

type Filter = "All" | CommunityPostTag;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Problem", label: "Problems" },
  { value: "Solutions", label: "Solutions" },
  { value: "Showcase", label: "Showcases" },
];

interface CommunityTabProps {
  posts: CommunityPost[];
}

export default function CommunityTab({ posts }: CommunityTabProps) {
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(
    () => ({
      All: posts.length,
      Problem: posts.filter((post) => post.tag === "Problem").length,
      Solutions: posts.filter((post) => post.tag === "Solutions").length,
      Showcase: posts.filter((post) => post.tag === "Showcase").length,
    }),
    [posts],
  );

  const visible = useMemo(
    () => (filter === "All" ? posts : posts.filter((post) => post.tag === filter)),
    [filter, posts],
  );

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm font-medium text-muted-foreground">
        No problems, solutions, or showcases posted yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Filter posts"
        className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-2xs"
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
              className={`relative cursor-pointer rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="community-filter-pill"
                  className="absolute inset-0 rounded-xl bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative inline-flex items-center gap-1.5">
                {option.label}
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm font-medium text-muted-foreground">
          Nothing under this filter yet.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((post) => (
            <CommunityPostCard key={`${post.tag}-${post.id}`} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
