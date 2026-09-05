"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";

import { useAppDispatch } from "@/lib/redux/hooks";
import {
  showcasesApi,
  useGetShowcaseByIdQuery,
  useIncrementShowcaseViewsMutation,
} from "@/lib/redux/services/showcasesApi";
import {
  useSetVoteMutation,
  useRemoveVoteMutation,
} from "@/lib/redux/services/votesApi";
import {
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} from "@/lib/redux/services/bookmarksApi";
import {
  useFollowTargetMutation,
  useUnfollowTargetMutation,
} from "@/lib/redux/services/profileApi";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import { AutoApprovalHoldNotice } from "@/components/notifications/AutoApprovalHoldNotice";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ReportContentDialog } from "@/components/comments/ReportCommentDialog";

import { ShowcaseDetailSkeleton } from "./ShowcaseDetailSkeleton";
import { ShowcaseHero } from "./ShowcaseHero";
import { ShowcaseActionBar } from "./ShowcaseActionBar";
import { ShowcaseAuthorCard } from "./ShowcaseAuthorCard";
import { ShowcaseOwnerStrip } from "./ShowcaseOwnerStrip";
import { ShowcaseWalkthrough } from "./ShowcaseWalkthrough";
import { ShowcaseRelatedGrid } from "./ShowcaseRelatedGrid";

interface ShowcaseDetailProps {
  id: string;
}

export function ShowcaseDetail({ id }: ShowcaseDetailProps) {
  const dispatch = useAppDispatch();
  const { data: showcase, isLoading, isError } = useGetShowcaseByIdQuery(id);
  const { data: session } = authClient.useSession();
  const { handleLogin } = useKeycloakLogin();

  const [reportingOpen, setReportingOpen] = useState(false);

  // Mutations
  const [setVote] = useSetVoteMutation();
  const [removeVote] = useRemoveVoteMutation();
  const [addBookmark] = useAddBookmarkMutation();
  const [removeBookmark] = useRemoveBookmarkMutation();
  const [followTarget] = useFollowTargetMutation();
  const [unfollowTarget] = useUnfollowTargetMutation();
  const [incrementViews] = useIncrementShowcaseViewsMutation();

  const isSignedIn = Boolean(session?.user);

  const requireAuth = () => {
    void handleLogin(
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : `/showcases/${id}`,
    );
  };

  // 1. Fire view count once on mount
  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    incrementViews(id)
      .unwrap()
      .then((res) => {
        if (res?.viewCount !== undefined) {
          dispatch(
            showcasesApi.util.updateQueryData("getShowcaseById", id, (draft) => {
              draft.viewCount = res.viewCount;
            }),
          );
        }
      })
      .catch(() => {
        // Quietly catch view count error
      });
  }, [id, incrementViews, dispatch]);

  // 2. Optimistic voting handler
  const handleVote = async (direction: "UP" | "DOWN") => {
    if (!isSignedIn) {
      requireAuth();
      return;
    }

    const currentVote = showcase?.viewer?.vote ?? null;
    const isClearing = currentVote === direction;

    // Optimistic cache patch
    const patch = dispatch(
      showcasesApi.util.updateQueryData("getShowcaseById", id, (draft) => {
        if (!draft.engagement) {
          draft.engagement = {
            voteScore: 0,
            upvoteCount: 0,
            downvoteCount: 0,
            bookmarkCount: 0,
            followerCount: 0,
          };
        }
        if (!draft.viewer) {
          draft.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }

        const prevVote = draft.viewer.vote;

        if (isClearing) {
          // Double-click same direction: clear vote (DELETE)
          if (prevVote === "UP") {
            draft.engagement.voteScore -= 1;
            draft.engagement.upvoteCount = Math.max(0, draft.engagement.upvoteCount - 1);
          } else if (prevVote === "DOWN") {
            draft.engagement.voteScore += 1;
            draft.engagement.downvoteCount = Math.max(0, draft.engagement.downvoteCount - 1);
          }
          draft.viewer.vote = null;
        } else {
          // New vote or flipped vote
          if (prevVote === "UP") {
            draft.engagement.upvoteCount = Math.max(0, draft.engagement.upvoteCount - 1);
          } else if (prevVote === "DOWN") {
            draft.engagement.downvoteCount = Math.max(0, draft.engagement.downvoteCount - 1);
          }

          if (direction === "UP") {
            draft.engagement.upvoteCount += 1;
            draft.engagement.voteScore += prevVote === "DOWN" ? 2 : 1;
            draft.viewer.vote = "UP";
          } else {
            draft.engagement.downvoteCount += 1;
            draft.engagement.voteScore -= prevVote === "UP" ? 2 : 1;
            draft.viewer.vote = "DOWN";
          }
        }
      }),
    );

    try {
      if (isClearing) {
        await removeVote({ type: "SHOWCASE", targetId: id }).unwrap();
      } else {
        const val = direction === "UP" ? 1 : -1;
        await setVote({ type: "SHOWCASE", targetId: id, value: val }).unwrap();
      }
    } catch {
      patch.undo();
      toast.error("Failed to record your vote. Please try again.");
    }
  };

  // 3. Optimistic bookmarking handler
  const handleToggleBookmark = async () => {
    if (!isSignedIn) {
      requireAuth();
      return;
    }

    const isBookmarked = Boolean(showcase?.viewer?.bookmarked);

    const patch = dispatch(
      showcasesApi.util.updateQueryData("getShowcaseById", id, (draft) => {
        if (!draft.engagement) {
          draft.engagement = {
            voteScore: 0,
            upvoteCount: 0,
            downvoteCount: 0,
            bookmarkCount: 0,
            followerCount: 0,
          };
        }
        if (!draft.viewer) {
          draft.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }

        if (isBookmarked) {
          draft.viewer.bookmarked = false;
          draft.engagement.bookmarkCount = Math.max(0, draft.engagement.bookmarkCount - 1);
        } else {
          draft.viewer.bookmarked = true;
          draft.engagement.bookmarkCount += 1;
        }
      }),
    );

    try {
      if (isBookmarked) {
        await removeBookmark({ type: "SHOWCASE", targetId: id }).unwrap();
        toast.success("Bookmark removed.");
      } else {
        await addBookmark({ type: "SHOWCASE", targetId: id }).unwrap();
        toast.success("Showcase bookmarked.");
      }
    } catch {
      patch.undo();
      toast.error("Failed to update bookmark.");
    }
  };

  // 4. Optimistic Showcase follow handler
  const handleToggleFollowShowcase = async () => {
    if (!isSignedIn) {
      requireAuth();
      return;
    }

    const isFollowing = Boolean(showcase?.viewer?.following);

    const patch = dispatch(
      showcasesApi.util.updateQueryData("getShowcaseById", id, (draft) => {
        if (!draft.engagement) {
          draft.engagement = {
            voteScore: 0,
            upvoteCount: 0,
            downvoteCount: 0,
            bookmarkCount: 0,
            followerCount: 0,
          };
        }
        if (!draft.viewer) {
          draft.viewer = {
            vote: null,
            bookmarked: false,
            following: false,
            followingAuthor: false,
            owner: false,
            canEdit: false,
            canDelete: false,
            editUnderReview: false,
          };
        }

        if (isFollowing) {
          draft.viewer.following = false;
          draft.engagement.followerCount = Math.max(0, draft.engagement.followerCount - 1);
        } else {
          draft.viewer.following = true;
          draft.engagement.followerCount += 1;
        }
      }),
    );

    try {
      if (isFollowing) {
        await unfollowTarget({ type: "SHOWCASE", targetId: id }).unwrap();
        toast.success("Unfollowed showcase.");
      } else {
        await followTarget({ type: "SHOWCASE", targetId: id }).unwrap();
        toast.success("Following showcase updates.");
      }
    } catch {
      patch.undo();
      toast.error("Failed to update follow status.");
    }
  };

  // 5. Optimistic Author follow handler
  const handleToggleFollowAuthor = async () => {
    if (!isSignedIn) {
      requireAuth();
      return;
    }

    const authorId = showcase?.author?.id || showcase?.authorId;
    if (!authorId) return;

    const isFollowingAuthor = Boolean(
      showcase?.author?.followedByViewer ?? showcase?.viewer?.followingAuthor,
    );

    const patch = dispatch(
      showcasesApi.util.updateQueryData("getShowcaseById", id, (draft) => {
        if (draft.author) {
          if (isFollowingAuthor) {
            draft.author.followedByViewer = false;
            draft.author.followerCount = Math.max(
              0,
              (draft.author.followerCount ?? 1) - 1,
            );
          } else {
            draft.author.followedByViewer = true;
            draft.author.followerCount = (draft.author.followerCount ?? 0) + 1;
          }
        }
        if (draft.viewer) {
          draft.viewer.followingAuthor = !isFollowingAuthor;
        }
      }),
    );

    try {
      if (isFollowingAuthor) {
        await unfollowTarget({ type: "USER", targetId: authorId }).unwrap();
        toast.success("Unfollowed author.");
      } else {
        await followTarget({ type: "USER", targetId: authorId }).unwrap();
        toast.success("Following author.");
      }
    } catch {
      patch.undo();
      toast.error("Failed to update author follow status.");
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <ShowcaseDetailSkeleton />
      </main>
    );
  }

  if (isError || !showcase) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Showcase Not Found
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          This project may have been removed or is currently waiting on editorial review.
        </p>
        <div className="pt-2">
          <Link
            href="/showcases"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            <span>Back to all Showcases</span>
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = Boolean(showcase.viewer?.owner);
  const isPending = showcase.reviewStatus === "PENDING";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full pb-20"
    >
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Navigation & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/showcases"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Showcases</span>
          </Link>

          {isPending && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 text-xs font-bold shadow-2xs">
              <Clock className="size-3.5" />
              <span>Pending Review</span>
            </span>
          )}
        </div>

        {/* Hold Notice for Pending Showcases */}
        <AutoApprovalHoldNotice
          notifiableId={id}
          notifiableType="SHOWCASE"
          isAuthor={isOwner}
          isPending={isPending}
          editHref={`/dashboard/showcases/${id}/edit`}
        />

        {/* Owner Action Strip (Edit/Delete/Revision Notice) */}
        <ShowcaseOwnerStrip showcaseId={id} viewer={showcase.viewer} />

        {/* Hero: Cover Image (16:9), Title, Chips, Link Row, Overview */}
        <ShowcaseHero showcase={showcase} />

        {/* Action Bar (Sticky Desktop, Vote, Bookmark, Follow, Comments, Views) */}
        <ShowcaseActionBar
          showcase={showcase}
          isSignedIn={isSignedIn}
          onRequireAuth={requireAuth}
          onVote={handleVote}
          onToggleBookmark={handleToggleBookmark}
          onToggleFollowShowcase={handleToggleFollowShowcase}
          onOpenReport={() => setReportingOpen(true)}
        />

        {/* Main Content Layout: Walkthrough (col-span-8) + Author Card (col-span-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Walkthrough Timeline + Comments Section */}
          <div className="lg:col-span-8 space-y-10 min-w-0">
            {/* Numbered vertical walkthrough steps */}
            <ShowcaseWalkthrough steps={showcase.steps} />

            {/* Comments Section */}
            <section id="comments-section" className="pt-8 border-t border-border/80">
              <CommentsSection
                commentableType="SHOWCASE"
                commentableId={id}
              />
            </section>
          </div>

          {/* Right Column: Author Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
            <ShowcaseAuthorCard
              author={showcase.author}
              isOwner={isOwner}
              isSignedIn={isSignedIn}
              onRequireAuth={requireAuth}
              onToggleFollowAuthor={handleToggleFollowAuthor}
            />
          </div>
        </div>

        {/* More Like This (Related Showcases Grid - omitted if empty) */}
        <ShowcaseRelatedGrid related={showcase.related} />
      </main>

      {/* Report dialog */}
      <ReportContentDialog
        open={reportingOpen}
        onOpenChange={setReportingOpen}
        contentType="SHOWCASE"
        contentId={id}
        authorName={showcase.author?.fullName || showcase.authorName}
      />
    </motion.div>
  );
}
