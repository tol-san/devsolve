"use client";

import React from "react";
import Link from "next/link";
import { Award, Check, Plus, ShieldAlert, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ShowcaseAuthorResponse } from "@/lib/redux/services/showcasesApi";
import { initialsOf } from "@/lib/discussions/format";
import { cn } from "@/lib/utils";

interface ShowcaseAuthorCardProps {
  author?: ShowcaseAuthorResponse | null;
  isOwner: boolean;
  isSignedIn: boolean;
  onRequireAuth: () => void;
  onToggleFollowAuthor: () => void;
}

export function ShowcaseAuthorCard({
  author,
  isOwner,
  isSignedIn,
  onRequireAuth,
  onToggleFollowAuthor,
}: ShowcaseAuthorCardProps) {
  if (!author) return null;

  const isFollowed = Boolean(author.followedByViewer);
  const initials = initialsOf(author.fullName || author.username || "");
  const username = author.username || "";

  const handleFollowClick = () => {
    if (!isSignedIn) {
      onRequireAuth();
      return;
    }
    onToggleFollowAuthor();
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-3.5">
        <Link
          href={username ? `/profile/${username}` : "#"}
          className="group block shrink-0"
        >
          <Avatar className="size-14 rounded-2xl border border-border shadow-2xs group-hover:ring-2 group-hover:ring-primary/40 transition-all">
            {author.avatarUrl && (
              <AvatarImage
                src={author.avatarUrl}
                alt={author.fullName || username}
              />
            )}
            <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={username ? `/profile/${username}` : "#"}
            className="text-base font-bold text-foreground hover:underline line-clamp-1 block"
          >
            {author.fullName || author.displayName || "Anonymous Creator"}
          </Link>
          {username && (
            <Link
              href={`/profile/${username}`}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors line-clamp-1 block"
            >
              @{username}
            </Link>
          )}
        </div>
      </div>

      {/* Biography (omitted when null/empty) */}
      {author.biography && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {author.biography}
        </p>
      )}

      {/* Stats row: Reputation, Published Showcases, Followers */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/70 text-center">
        <div className="rounded-xl bg-muted/40 p-2 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
            Rep
          </span>
          <span className="text-sm font-extrabold text-foreground tabular-nums flex items-center justify-center gap-1 mt-0.5">
            <Award className="size-3.5 text-amber-500 shrink-0" />
            <span>{author.reputation ?? 0}</span>
          </span>
        </div>

        <div className="rounded-xl bg-muted/40 p-2 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
            Builds
          </span>
          <span className="text-sm font-extrabold text-foreground tabular-nums mt-0.5 block">
            {author.publishedShowcaseCount ?? 0}
          </span>
        </div>

        <div className="rounded-xl bg-muted/40 p-2 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
            Followers
          </span>
          <span className="text-sm font-extrabold text-foreground tabular-nums mt-0.5 block">
            {author.followerCount ?? 0}
          </span>
        </div>
      </div>

      {/* Follow Button or Creator Owner Badge */}
      {isOwner ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 py-2.5 text-xs font-bold text-primary">
          <ShieldAlert className="size-4" />
          <span>You created this project</span>
        </div>
      ) : (
        <Button
          type="button"
          onClick={handleFollowClick}
          aria-pressed={isFollowed}
          className={cn(
            "w-full h-10 rounded-xl font-semibold text-sm transition-all active:scale-98 shadow-2xs cursor-pointer",
            isFollowed
              ? "border border-border/80 bg-muted/60 text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {isFollowed ? (
            <>
              <Check className="size-4 mr-2 text-emerald-500" />
              <span>Following Creator</span>
            </>
          ) : (
            <>
              <UserPlus className="size-4 mr-2" />
              <span>Follow Creator</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
