"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Info,
  MessageSquare,
  Share2,
} from "lucide-react";
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
import { formatDate } from "@/lib/discussions/format";
import { cn } from "@/lib/utils";

import { ShowcaseDetailSkeleton } from "./ShowcaseDetailSkeleton";
import { ShowcaseHero } from "./ShowcaseHero";
import { ShowcaseActionBar } from "./ShowcaseActionBar";
import { ShowcaseAuthorCard } from "./ShowcaseAuthorCard";
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
  const [showFloatingDock, setShowFloatingDock] = useState(false);

  // Monitor scroll position to show dynamic floating dock when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingDock(window.scrollY > 550);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSignedIn = Boolean(session?.user);

  // Mutations
  const [setVote] = useSetVoteMutation();
  const [removeVote] = useRemoveVoteMutation();
  const [addBookmark] = useAddBookmarkMutation();
  const [removeBookmark] = useRemoveBookmarkMutation();
  const [followTarget] = useFollowTargetMutation();
  const [unfollowTarget] = useUnfollowTargetMutation();
  const [incrementViews] = useIncrementShowcaseViewsMutation();

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

    try {
      if (isClearing) {
        await removeVote({ type: "SHOWCASE", targetId: id }).unwrap();
      } else {
        const val = direction === "UP" ? 1 : -1;
        await setVote({ type: "SHOWCASE", targetId: id, value: val }).unwrap();
      }
    } catch {
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

    try {
      if (isBookmarked) {
        await removeBookmark({ type: "SHOWCASE", targetId: id }).unwrap();
        toast.success("Bookmark removed.");
      } else {
        await addBookmark({ type: "SHOWCASE", targetId: id }).unwrap();
        toast.success("Showcase bookmarked.");
      }
    } catch {
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

  const isOwner = Boolean(showcase?.viewer?.owner);
  const isPending = showcase?.reviewStatus === "PENDING";

  const outline = useMemo(() => {
    const items = [{ id: "overview", label: "Overview" }];
    if (showcase?.steps && showcase.steps.length > 0) {
      items.push({ id: "walkthrough", label: "Walkthrough" });
    }
    items.push({ id: "comments-section", label: "Discussion" });
    if (showcase?.related && showcase.related.length > 0) {
      items.push({ id: "related-showcases", label: "More Like This" });
    }
    return items;
  }, [showcase?.steps, showcase?.related]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full pb-20"
    >
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground"
        >
          <Link
            href="/showcases"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span>Showcases</span>
          </Link>
          {showcase.categoryName && (
            <>
              <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="shrink-0">{showcase.categoryName}</span>
            </>
          )}
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate text-foreground font-semibold">
            {showcase.title ?? "Untitled Showcase"}
          </span>
        </nav>

        {/* Hold Notice for Pending Showcases */}
        <AutoApprovalHoldNotice
          notifiableId={id}
          notifiableType="SHOWCASE"
          isAuthor={isOwner}
          isPending={isPending}
          editHref={`/dashboard/showcases/${id}/edit`}
        />

        {/* Revision Under Review Notice for Owners */}
        {showcase.viewer?.editUnderReview && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold block">Revision Under Review</span>
              <span className="text-xs text-amber-700/90 dark:text-amber-300/90">
                Your updates have been submitted and are waiting on moderator review. The live showcase will update once approved.
              </span>
            </div>
          </div>
        )}

        {/* Hero: Cover Image (16:9), Title, Chips, Action Buttons, Overview, Author Line + Integrated Action Bar */}
        <ShowcaseHero
          showcase={showcase}
          viewer={showcase.viewer}
          onOpenReport={() => setReportingOpen(true)}
          actionBar={
            <ShowcaseActionBar
              showcase={showcase}
              isSignedIn={isSignedIn}
              onRequireAuth={requireAuth}
              onVote={handleVote}
              onToggleBookmark={handleToggleBookmark}
              onToggleFollowShowcase={handleToggleFollowShowcase}
              onOpenReport={() => setReportingOpen(true)}
            />
          }
        />

        {/* Main Content Layout: Walkthrough & Discussion (col-span-8) + Sidebar (col-span-4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Walkthrough Timeline + Comments Section */}
          <div className="lg:col-span-8 space-y-10 min-w-0">
            {/* Numbered vertical walkthrough steps */}
            <ShowcaseWalkthrough steps={showcase.steps} />

            {/* Comments Section */}
            <section id="comments-section" className="scroll-mt-24">
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-border/80">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <MessageSquare className="size-4.5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Discussion & Feedback
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Share your thoughts, ask questions, or connect with the creator
                    </p>
                  </div>
                </div>

                <CommentsSection
                  commentableType="SHOWCASE"
                  commentableId={id}
                />
              </div>
            </section>
          </div>

          {/* Right Sidebar: Creator, Outline & Details */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-36 lg:self-start">
            <ShowcaseAuthorCard
              author={showcase.author}
              isOwner={isOwner}
              isSignedIn={isSignedIn}
              onRequireAuth={requireAuth}
              onToggleFollowAuthor={handleToggleFollowAuthor}
            />

            {/* On this page outline navigation */}
            {outline.length > 1 && (
              <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hidden lg:block">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  On this page
                </h2>
                <nav className="space-y-0.5">
                  {outline.map((entry) => (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-muted-foreground/40"
                      />
                      {entry.label}
                    </a>
                  ))}
                </nav>
              </section>
            )}

            {/* Project Details Card */}
            <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
              <h2 className="flex items-center gap-1.5 border-b border-border/80 pb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Info aria-hidden="true" className="size-3.5" />
                Project Details
              </h2>
              {showcase.categoryName && (
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold text-foreground">{showcase.categoryName}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm py-1">
                <span className="text-muted-foreground">Published</span>
                <span className="font-semibold text-foreground">
                  {formatDate(showcase.createdAt)}
                </span>
              </div>
              {showcase.updatedAt && showcase.createdAt && new Date(showcase.updatedAt) > new Date(showcase.createdAt) && (
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(showcase.updatedAt)}
                  </span>
                </div>
              )}
              {showcase.steps && showcase.steps.length > 0 && (
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground">Walkthrough</span>
                  <span className="font-semibold text-foreground">
                    {showcase.steps.length} {showcase.steps.length === 1 ? "step" : "steps"}
                  </span>
                </div>
              )}
              {showcase.tags && showcase.tags.length > 0 && (
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-muted-foreground">Tags</span>
                  <span className="font-semibold text-foreground">
                    {showcase.tags.length}
                  </span>
                </div>
              )}
            </section>
          </aside>
        </div>

        {/* More Like This (Related Showcases Grid - omitted if empty) */}
        <ShowcaseRelatedGrid related={showcase.related} />
      </main>

      {/* Floating Dynamic Action Capsule when scrolled past Hero */}
      <AnimatePresence>
        {showFloatingDock && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/80 bg-card/90 px-3 py-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-foreground/10">
              {/* Compact Up/Down Vote */}
              <div className="inline-flex items-center rounded-full bg-background/90 p-0.5 border border-border/60">
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  type="button"
                  onClick={() => handleVote("UP")}
                  aria-label="Upvote showcase"
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-colors cursor-pointer",
                    showcase?.viewer?.vote === "UP"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <ChevronUp className="size-4 stroke-[2.5]" />
                </motion.button>
                <span
                  className={cn(
                    "min-w-6 text-center text-xs font-extrabold tabular-nums px-0.5",
                    showcase?.viewer?.vote === "UP"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : showcase?.viewer?.vote === "DOWN"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-foreground",
                  )}
                >
                  {showcase?.engagement?.voteScore ?? 0}
                </span>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  type="button"
                  onClick={() => handleVote("DOWN")}
                  aria-label="Downvote showcase"
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-colors cursor-pointer",
                    showcase?.viewer?.vote === "DOWN"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <ChevronDown className="size-4 stroke-[2.5]" />
                </motion.button>
              </div>

              {/* Bookmark */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={handleToggleBookmark}
                aria-label="Bookmark showcase"
                className={cn(
                  "inline-flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition-all cursor-pointer",
                  showcase?.viewer?.bookmarked
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Bookmark
                  className={cn(
                    "size-3.5",
                    showcase?.viewer?.bookmarked && "fill-current",
                  )}
                />
                <span className="tabular-nums font-bold">
                  {showcase?.engagement?.bookmarkCount ?? 0}
                </span>
              </motion.button>

              {/* Comments jump */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => {
                  const el = document.getElementById("comments-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                aria-label="Jump to discussion"
                className="inline-flex h-8 items-center gap-1 rounded-full border border-border/80 bg-background/80 px-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <MessageSquare className="size-3.5" />
                <span className="tabular-nums font-bold text-foreground">
                  {showcase?.commentCount ?? 0}
                </span>
              </motion.button>

              {/* Share */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  } catch {
                    toast.error("Failed to copy link");
                  }
                }}
                aria-label="Copy link"
                className="flex size-8 items-center justify-center rounded-full border border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
              >
                <Share2 className="size-3.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
