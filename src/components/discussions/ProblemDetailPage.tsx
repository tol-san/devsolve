"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { attachmentUrl } from "@/lib/api/attachment-url";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDot,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Flag,
  FolderGit2,
  ImageIcon,
  Info,
  ListOrdered,
  Maximize2,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Server,
  Share2,
  Target,
  TerminalSquare,
  TrendingUp,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { SolutionCard } from "@/components/discussions/SolutionCard";
import { ReportContentDialog } from "@/components/comments/ReportCommentDialog";
import { Button } from "@/components/ui/button";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { VoteControl } from "@/components/ui/vote-control";
import { AutoApprovalHoldNotice } from "@/components/notifications/AutoApprovalHoldNotice";
import {
  useGetProblemByIdQuery,
  useIncrementProblemViewsMutation,
  useRemoveAcceptedSolutionMutation,
  useSetAcceptedSolutionMutation,
  type AuthorSummary,
  type ProblemResponse,
  type ProblemSeverity,
} from "@/lib/redux/services/problemsApi";
import {
  useGetMyProfileQuery,
  useGetSolutionsByProblemQuery,
} from "@/lib/redux/services/solutionsApi";
import {
  useGetVoteSummaryQuery,
  useRemoveVoteMutation,
  useSetVoteMutation,
} from "@/lib/redux/services/votesApi";
import {
  useGetBookmarkStatusQuery,
  useAddBookmarkMutation,
  useRemoveBookmarkMutation,
} from "@/lib/redux/services/bookmarksApi";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import {
  PROBLEM_TYPE_LABELS,
  SDLC_LABELS,
  SEVERITY_LABELS,
} from "@/lib/validations/problem";
import {
  authorNameOf,
  formatBytes,
  formatDate,
  initialsOf,
  messageOf,
} from "@/lib/discussions/format";
import {
  MY_COMMUNITY_HREF,
  useMySolutionStatus,
  type MySolutionStatus,
} from "@/hooks/useMySolutionStatus";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";

const CARD = "rounded-2xl border border-border bg-card shadow-xs";

const SOLUTION_PAGE_SIZE = 50;

/** Severity drives the accent rail at the top of the header card. */
const SEVERITY_META: Record<
  ProblemSeverity,
  { chip: string; rail: string; dot: string }
> = {
  LOW: {
    chip: "bg-muted text-muted-foreground border-border",
    rail: "bg-muted-foreground/40",
    dot: "bg-muted-foreground/60",
  },
  MEDIUM: {
    chip: "bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300",
    rail: "bg-amber-500",
    dot: "bg-amber-500",
  },
  HIGH: {
    chip: "bg-orange-500/10 text-orange-700 border-orange-500/25 dark:text-orange-300",
    rail: "bg-orange-500",
    dot: "bg-orange-500",
  },
  CRITICAL: {
    chip: "bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-300",
    rail: "bg-rose-500",
    dot: "bg-rose-500",
  },
};

export default function ProblemDetailPage() {
  const params = useParams();
  const problemId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = problemId ?? "";

  const {
    data: problem,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProblemByIdQuery(id, { skip: !id });

  const [sortOrder, setSortOrder] = useState<"votes" | "newest">("votes");

  if (isLoading) return <DetailSkeleton />;

  if (isError || !problem) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;

    return (
      <NotFound
        title={status === 404 ? "Problem not found" : "Something went wrong"}
        body={
          status === 404
            ? "It may have been removed, or the link may be wrong."
            : "This problem could not be loaded right now."
        }
        onRetry={status === 404 ? undefined : () => void refetch()}
      />
    );
  }

  return (
    <Loaded
      id={id}
      problem={problem}
      sortOrder={sortOrder}
      onSortChange={setSortOrder}
    />
  );
}

function Loaded({
  id,
  problem,
  sortOrder,
  onSortChange,
}: {
  id: string;
  problem: ProblemResponse;
  sortOrder: "votes" | "newest";
  onSortChange: (order: "votes" | "newest") => void;
}) {
  const [incrementViews] = useIncrementProblemViewsMutation();
  const countedProblemId = useRef<string | null>(null);

  useEffect(() => {
    if (countedProblemId.current === id) return;
    countedProblemId.current = id;
    void incrementViews(id);
  }, [id, incrementViews]);

  const { data: solutionPage, isLoading: isLoadingSolutions } =
    useGetSolutionsByProblemQuery({
      problemId: id,
      pageSize: SOLUTION_PAGE_SIZE,
    });

  const { data: me } = useGetMyProfileQuery();
  const isSignedIn = Boolean(me?.id);
  const isOwnProblem = Boolean(me?.id && problem.author?.id === me.id);
  const isPending = problem.status === "PENDING_APPROVAL";
  const canAnswer = isSignedIn && !isOwnProblem && !isPending;
  const [reportingProblem, setReportingProblem] = useState(false);
  const canAccept = problem.canAcceptSolution ?? isOwnProblem;

  const { data: votes } = useGetVoteSummaryQuery({
    type: "PROBLEM",
    targetId: id,
  });
  const [setVote, { isLoading: isSettingVote }] = useSetVoteMutation();
  const [removeVote, { isLoading: isRemovingVote }] = useRemoveVoteMutation();
  const isVoting = isSettingVote || isRemovingVote;
  const upvoteCount = votes?.upvotes ?? 0;
  const downvoteCount = votes?.downvotes ?? 0;
  const voteScore = votes?.score ?? upvoteCount - downvoteCount;

  const { data: bookmarkStatus } = useGetBookmarkStatusQuery({
    type: "PROBLEM",
    targetId: id,
  });
  const [addBookmark, { isLoading: isAddingBookmark }] =
    useAddBookmarkMutation();
  const [removeBookmark, { isLoading: isRemovingBookmark }] =
    useRemoveBookmarkMutation();
  const isBookmarked = bookmarkStatus ?? problem.isBookmarkedByViewer ?? false;

  const [acceptSolution, { isLoading: isSettingAccepted }] =
    useSetAcceptedSolutionMutation();
  const [unacceptSolution, { isLoading: isRemovingAccepted }] =
    useRemoveAcceptedSolutionMutation();
  const isAccepting = isSettingAccepted || isRemovingAccepted;
  const isBookmarking = isAddingBookmark || isRemovingBookmark;
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt?: string;
    title?: string;
    mimeType?: string;
  } | null>(null);

  const acceptedIds = useMemo(
    () => new Set(problem.acceptedSolutionIds ?? []),
    [problem.acceptedSolutionIds],
  );

  const isAcceptedSolution = (solutionId: string, flag?: boolean) =>
    acceptedIds.size > 0 ? acceptedIds.has(solutionId) : Boolean(flag);

  const { forProblem } = useMySolutionStatus({ skip: !isSignedIn });
  const myAnswers = forProblem(id);
  const unpublished = myAnswers.filter((mine) => mine.review === "REJECTED");

  const solutions = useMemo(() => {
    const list = [...(solutionPage?.content ?? [])];
    const newest = (a: (typeof list)[number], b: (typeof list)[number]) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    if (sortOrder === "newest") return list.sort(newest);

    const accepted = (solution: (typeof list)[number]) =>
      Number(
        acceptedIds.size > 0
          ? acceptedIds.has(solution.id)
          : Boolean(solution.isAccepted),
      );

    return list.sort(
      (a, b) =>
        accepted(b) - accepted(a) ||
        (b.voteScore ?? 0) - (a.voteScore ?? 0) ||
        newest(a, b),
    );
  }, [solutionPage, sortOrder, acceptedIds]);

  useEffect(() => {
    if (isLoadingSolutions || solutions.length === 0) return;

    const targetId = decodeURIComponent(window.location.hash.slice(1));
    if (!targetId.startsWith("solution-")) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [isLoadingSolutions, solutions]);

  const attachments = problem.attachments ?? [];
  const { imageAttachments, documentAttachments } = useMemo(() => {
    const images: typeof attachments = [];
    const documents: typeof attachments = [];
    for (const file of attachments) {
      const isImg =
        file.mimeType?.startsWith("image/") ||
        /\.(png|jpe?g|webp|gif|svg|bmp|ico|avif)$/i.test(
          file.originalFileName || file.downloadUrl || "",
        );
      if (isImg) {
        images.push(file);
      } else {
        documents.push(file);
      }
    }
    return { imageAttachments: images, documentAttachments: documents };
  }, [attachments]);
  const tags = problem.tags ?? [];
  const technologies = problem.technologies ?? [];
  const environment = (problem.environment ?? []).filter(
    (entry) => entry.technology,
  );
  const reproductionSteps = (problem.reproductionSteps ?? []).filter(Boolean);
  const isResolved = problem.status === "RESOLVED";
  const answerCount = solutionPage?.totalElements ?? problem.solutionCount ?? 0;
  const severity = problem.severity ? SEVERITY_META[problem.severity] : null;

  const hasBehaviour = Boolean(
    problem.expectedBehavior || problem.actualBehavior,
  );

  /** Drives the sidebar jump list — only sections that actually rendered. */
  const outline = useMemo(
    () =>
      [
        { id: "description", label: "Description", show: true },
        { id: "behaviour", label: "Expected vs actual", show: hasBehaviour },
        {
          id: "steps",
          label: "Steps to reproduce",
          show: reproductionSteps.length > 0,
        },
        {
          id: "error-output",
          label: "Error output",
          show: Boolean(problem.errorMessage),
        },
        {
          id: "attempts",
          label: "Already tried",
          show: Boolean(problem.attemptsTried),
        },
        {
          id: "environment",
          label: "Environment",
          show: environment.length > 0,
        },
        {
          id: "attachments",
          label: "Attachments",
          show: attachments.length > 0,
        },
        { id: "solutions", label: "Solutions", show: true },
        { id: "comments", label: "Comments", show: true },
      ].filter((entry) => entry.show),
    [
      hasBehaviour,
      reproductionSteps.length,
      problem.errorMessage,
      problem.attemptsTried,
      environment.length,
      attachments.length,
    ],
  );

  const { handleLogin } = useKeycloakLogin();

  const requireSignIn = () =>
    void handleLogin(
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : `/problems/${id}`,
    );

  const onVote = async (value: 1 | -1) => {
    if (!isSignedIn) return requireSignIn();
    if (isVoting) return;
    const target = { type: "PROBLEM" as const, targetId: id };
    if (votes?.currentUserVote === value) await removeVote(target);
    else await setVote({ ...target, value });
  };

  const onBookmark = async () => {
    if (!isSignedIn) return requireSignIn();
    if (isBookmarking) return;
    if (isBookmarked) {
      await removeBookmark({ type: "PROBLEM", targetId: id });
    } else {
      await addBookmark({ type: "PROBLEM", targetId: id });
    }
  };

  const onShare = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied", {
        description: "Share it wherever the answer might be.",
      });
    } catch {
      toast.error("Your browser blocked the clipboard.");
    }
  };

  const onAccept = async (solutionId: string) => {
    try {
      await acceptSolution({ problemId: id, solutionId }).unwrap();
      toast.success("Answer accepted", {
        description: "It now sits at the top of this problem.",
      });
    } catch (caught) {
      toast.error(messageOf(caught, "That answer could not be accepted."));
    }
  };

  const onUnaccept = async (solutionId: string) => {
    try {
      await unacceptSolution({ problemId: id, solutionId }).unwrap();
      toast.success("Acceptance withdrawn");
    } catch (caught) {
      toast.error(messageOf(caught, "That answer could not be unaccepted."));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-[100dvh] pb-20 font-sans text-foreground"
    >
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground"
        >
          <Link
            href="/community"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Community
          </Link>
          {problem.category?.name && (
            <>
              <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="shrink-0">{problem.category.name}</span>
            </>
          )}
          <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate text-foreground">
            {problem.title ?? "Untitled problem"}
          </span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 space-y-5 lg:col-span-8 xl:col-span-9">
            <AutoApprovalHoldNotice
              notifiableId={id}
              notifiableType="PROBLEM"
              isAuthor={isOwnProblem}
              isPending={isPending}
              editHref={`/community/${id}/edit`}
            />

            {/* ── Header ─────────────────────────────────────────────── */}
            <section className={`${CARD} relative overflow-hidden`}>
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-1.5 ${
                  severity?.rail ?? "bg-primary/50"
                }`}
              />

              <div className="p-5 sm:p-7 space-y-4">
                {/* Top Row: Status pills, classification badges, and top-right quick actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isPending ? (
                      <Pill tone="pending" icon={Clock}>
                        Pending review
                      </Pill>
                    ) : isResolved ? (
                      <Pill tone="solved" icon={CheckCircle2}>
                        Solved
                      </Pill>
                    ) : (
                      <Pill tone="open" icon={CircleDot}>
                        Open
                      </Pill>
                    )}

                    {problem.severity && severity && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${severity.chip}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`size-1.5 rounded-full ${severity.dot}`}
                        />
                        {SEVERITY_LABELS[problem.severity]}
                      </span>
                    )}

                    {problem.problemType && (
                      <span className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {PROBLEM_TYPE_LABELS[problem.problemType]}
                      </span>
                    )}

                    {problem.sdlcPhase && (
                      <span className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {SDLC_LABELS[problem.sdlcPhase]}
                      </span>
                    )}
                  </div>

                  {/* Top-Right Contextual Actions */}
                  <div className="flex items-center gap-1.5">
                    {(problem.canEdit || (isOwnProblem && isPending)) && (
                      <Link
                        href={`/community/${id}/edit`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                      >
                        <Pencil className="size-3.5 text-primary" />
                        <span>Edit</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (!isSignedIn) return requireSignIn();
                        setReportingProblem(true);
                      }}
                      aria-label="Report problem"
                      className="inline-flex size-8 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-rose-500 transition-colors shadow-2xs cursor-pointer"
                      title="Report problem"
                    >
                      <Flag className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Full-width Problem Title */}
                <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.25rem] break-words">
                  {problem.title ?? "Untitled problem"}
                </h1>

                {/* Author & Timestamp Line */}
                <AuthorLine
                  author={problem.author}
                  createdAt={problem.createdAt}
                  updatedAt={problem.updatedAt}
                />

                {/* Technologies & Tags */}
                {(technologies.length > 0 || tags.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {technologies.map((tech, i) => (
                      <span
                        key={tech.id ?? `${tech.name}-${i}`}
                        className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 font-mono text-xs font-medium text-foreground/80"
                      >
                        {tech.name}
                        {tech.version ? ` ${tech.version}` : ""}
                      </span>
                    ))}
                    {tags.map((tag, i) => (
                      <span
                        key={tag.id ?? `${tag.name}-${i}`}
                        className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs font-medium text-primary"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Integrated Action & Engagement Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-muted/20 px-5 sm:px-7 py-3">
                {/* Left Side: Voting Pill + Bookmark + Share + Repo */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Vote Control Pill */}
                  <div className="inline-flex items-center rounded-xl border border-border/80 bg-background/80 p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => void onVote(1)}
                      disabled={isVoting}
                      aria-pressed={votes?.currentUserVote === 1}
                      aria-label="Upvote this problem"
                      className={cn(
                        "flex size-8 sm:size-8.5 items-center justify-center rounded-lg transition-all active:scale-95 cursor-pointer",
                        votes?.currentUserVote === 1
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      <ChevronUp className="size-4.5 stroke-[2.5]" />
                    </button>

                    <span
                      className={cn(
                        "min-w-8 text-center text-xs sm:text-sm font-bold tabular-nums px-1.5",
                        votes?.currentUserVote === 1
                          ? "text-emerald-600 dark:text-emerald-400"
                          : votes?.currentUserVote === -1
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-foreground",
                      )}
                    >
                      {voteScore}
                    </span>

                    <button
                      type="button"
                      onClick={() => void onVote(-1)}
                      disabled={isVoting}
                      aria-pressed={votes?.currentUserVote === -1}
                      aria-label="Downvote this problem"
                      className={cn(
                        "flex size-8 sm:size-8.5 items-center justify-center rounded-lg transition-all active:scale-95 cursor-pointer",
                        votes?.currentUserVote === -1
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      <ChevronDown className="size-4.5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => void onBookmark()}
                    disabled={isBookmarking}
                    aria-pressed={isBookmarked}
                    className={cn(
                      "inline-flex h-9 sm:h-9.5 items-center gap-1.5 rounded-xl border px-3 text-xs sm:text-sm font-semibold transition-all active:scale-98 cursor-pointer shadow-2xs",
                      isBookmarked
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Bookmark
                      className={cn("size-4", isBookmarked && "fill-current")}
                    />
                    <span>{isBookmarked ? "Saved" : "Save"}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={() => void onShare()}
                    className="inline-flex h-9 sm:h-9.5 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-98 cursor-pointer shadow-2xs"
                    title="Copy link"
                  >
                    <Share2 className="size-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  {/* Repository Link (if present) */}
                  {problem.repositoryUrl?.startsWith("https://") && (
                    <a
                      href={problem.repositoryUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex h-9 sm:h-9.5 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-2xs"
                    >
                      <FolderGit2 className="size-4 text-primary" />
                      <span className="hidden sm:inline">Repo</span>
                    </a>
                  )}
                </div>

                {/* Right Side: Quick Stats & Anchor Navigation */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Solutions anchor */}
                  <a
                    href="#solutions"
                    className="inline-flex h-9 sm:h-9.5 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-2xs"
                  >
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span className="font-bold text-foreground tabular-nums">
                      {answerCount}
                    </span>
                    <span className="hidden sm:inline">
                      {answerCount === 1 ? "Solution" : "Solutions"}
                    </span>
                  </a>

                  {/* Views count */}
                  <div
                    title={`${problem.viewCount ?? 0} views`}
                    className="inline-flex h-9 sm:h-9.5 items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 px-3 text-xs sm:text-sm font-semibold text-muted-foreground shadow-2xs select-none"
                  >
                    <Eye className="size-4 text-muted-foreground/70" />
                    <span className="tabular-nums">
                      {problem.viewCount ?? 0}
                    </span>
                    <span className="hidden md:inline">views</span>
                  </div>

                  {/* Comments anchor */}
                  <a
                    href="#comments"
                    className="inline-flex h-9 sm:h-9.5 items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-3 text-xs sm:text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-2xs"
                  >
                    <MessageSquare className="size-4 text-primary" />
                    <span className="font-bold text-foreground tabular-nums">
                      {problem.commentCount ?? 0}
                    </span>
                    <span className="hidden sm:inline">Comments</span>
                  </a>
                </div>
              </div>
            </section>

            {/* ── Body ───────────────────────────────────────────────── */}
            <SectionCard
              id="description"
              title="Description"
              icon={AlignLeft}
              order={0}
            >
              {problem.description ? (
                <MarkdownView source={problem.description} />
              ) : (
                <p className="text-base text-muted-foreground">
                  This problem was posted without a description.
                </p>
              )}
            </SectionCard>

            {hasBehaviour && (
              <SectionCard
                id="behaviour"
                title="Expected vs actual"
                icon={Target}
                order={1}
              >
                <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-2">
                  <BehaviourPanel
                    tone="expected"
                    label="Expected"
                    text={problem.expectedBehavior}
                  />
                  <div
                    aria-hidden="true"
                    className="hidden items-center justify-center px-1 text-muted-foreground sm:flex"
                  >
                    <ArrowRight className="size-4" />
                  </div>
                  <BehaviourPanel
                    tone="actual"
                    label="Actual"
                    text={problem.actualBehavior}
                  />
                </div>
              </SectionCard>
            )}

            {reproductionSteps.length > 0 && (
              <SectionCard
                id="steps"
                title="Steps to reproduce"
                icon={ListOrdered}
                meta={`${reproductionSteps.length} ${
                  reproductionSteps.length === 1 ? "step" : "steps"
                }`}
                order={2}
              >
                <ol className="relative space-y-4">
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 left-3.5 top-3 w-px bg-border"
                  />
                  {reproductionSteps.map((step, i) => (
                    <li key={i} className="relative flex gap-4">
                      <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-bold tabular-nums text-foreground shadow-2xs">
                        {i + 1}
                      </span>
                      <p className="min-w-0 flex-1 pt-0.5 text-base leading-relaxed text-foreground/90">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </SectionCard>
            )}

            {problem.errorMessage && (
              <SectionCard
                id="error-output"
                title="Error output"
                icon={TerminalSquare}
                tone="danger"
                order={3}
              >
                <CodeBlock text={problem.errorMessage} />
              </SectionCard>
            )}

            {problem.attemptsTried && (
              <SectionCard
                id="attempts"
                title="Already tried"
                icon={Wrench}
                order={4}
              >
                <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
                  {problem.attemptsTried}
                </p>
              </SectionCard>
            )}

            {environment.length > 0 && (
              <SectionCard
                id="environment"
                title="Environment"
                icon={Server}
                order={5}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {environment.map((entry, i) => (
                    <div
                      key={`${entry.technology}-${i}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3.5 py-2.5"
                    >
                      <span className="truncate font-mono text-sm font-medium text-foreground">
                        {entry.technology}
                      </span>
                      {entry.version && (
                        <span className="shrink-0 rounded-md bg-background px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground ring-1 ring-border">
                          {entry.version}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {attachments.length > 0 && (
              <SectionCard
                id="attachments"
                title="Attachments"
                icon={
                  imageAttachments.length > 0 && documentAttachments.length === 0
                    ? ImageIcon
                    : Paperclip
                }
                meta={
                  imageAttachments.length > 0 && documentAttachments.length === 0
                    ? `${imageAttachments.length} ${
                        imageAttachments.length === 1 ? "photo" : "photos"
                      }`
                    : documentAttachments.length > 0 && imageAttachments.length === 0
                    ? `${documentAttachments.length} ${
                        documentAttachments.length === 1 ? "file" : "files"
                      }`
                    : `${attachments.length} files (${imageAttachments.length} ${
                        imageAttachments.length === 1 ? "photo" : "photos"
                      })`
                }
                order={6}
              >
                <div className="space-y-4">
                  {/* Photo / Screenshot Showcase */}
                  {imageAttachments.length > 0 && (
                    <div
                      className={cn(
                        "grid gap-3.5",
                        imageAttachments.length === 1
                          ? "grid-cols-1"
                          : imageAttachments.length === 2
                          ? "grid-cols-1 sm:grid-cols-2"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                      )}
                    >
                      {imageAttachments.map((file, i) => {
                        const fileUrl =
                          attachmentUrl(file.downloadUrl) ||
                          (file.id && id
                            ? `/api/problems/${id}/attachments/${file.id}/download`
                            : undefined);

                        const preview = () =>
                          fileUrl &&
                          setPreviewImage({
                            src: fileUrl,
                            alt: file.originalFileName ?? "Attachment",
                            title: file.originalFileName ?? "Attachment Preview",
                            mimeType: file.mimeType,
                          });

                        return (
                          <div
                            key={file.id ?? `${file.originalFileName}-${i}`}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs shadow-2xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                          >
                            {/* Visual photo presentation area with ambient blurred background */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={preview}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  preview();
                                }
                              }}
                              className="relative flex w-full aspect-[16/10] sm:aspect-[16/9] min-h-[220px] max-h-[420px] cursor-zoom-in items-center justify-center overflow-hidden bg-blue-950/20 dark:bg-blue-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group/photo"
                              title="Click to preview full screen"
                            >
                              {fileUrl ? (
                                <>
                                  {/* Ambient blurred backdrop so any aspect ratio fills seamlessly */}
                                  <Image
                                    src={fileUrl}
                                    alt=""
                                    fill
                                    aria-hidden="true"
                                    sizes="120px"
                                    quality={70}
                                    className="object-cover blur-2xl opacity-60 dark:opacity-45 scale-120 pointer-events-none select-none transition-transform duration-500 group-hover/photo:scale-130"
                                    unoptimized={fileUrl.startsWith("/api/")}
                                  />

                                  {/* Soft ambient overlay */}
                                  <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-600/15 mix-blend-overlay pointer-events-none" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />

                                  {/* Full uncropped photo */}
                                  <Image
                                    src={fileUrl}
                                    alt={file.originalFileName ?? "Attachment photo"}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 650px"
                                    quality={90}
                                    className="object-contain p-2.5 sm:p-3.5 drop-shadow-md transition-transform duration-300 group-hover/photo:scale-[1.02]"
                                    unoptimized={fileUrl.startsWith("/api/")}
                                  />
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                                  <ImageIcon className="size-8 stroke-[1.5]" />
                                  <span className="text-xs">No preview</span>
                                </div>
                              )}

                              {/* Floating preview badge */}
                              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 rounded-full border border-border/70 bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-md shadow-xs opacity-0 transition-all duration-200 group-hover/photo:opacity-100 group-hover/photo:translate-y-0 translate-y-1">
                                <Maximize2 className="size-3 text-primary" />
                                <span>Preview</span>
                              </div>
                            </div>

                            {/* Photo details & quick actions */}
                            <div className="relative z-20 flex items-center justify-between gap-3 border-t border-border/60 bg-card/95 px-3.5 py-2.5 backdrop-blur-xs">
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-xs font-semibold text-foreground"
                                  title={file.originalFileName ?? "Image attachment"}
                                >
                                  {file.originalFileName ?? "Image attachment"}
                                </p>
                                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <span className="font-mono">
                                    {file.mimeType || "image"}
                                  </span>
                                  {file.sizeBytes ? (
                                    <>
                                      <span>·</span>
                                      <span>{formatBytes(file.sizeBytes)}</span>
                                    </>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    preview();
                                  }}
                                  className="h-7 cursor-pointer gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                  <Eye className="size-3.5 text-primary" />
                                  <span className="hidden sm:inline">Preview</span>
                                </Button>

                                {fileUrl && (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    download={file.originalFileName ?? "attachment"}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex h-7 items-center gap-1 rounded-lg border border-border/80 bg-background px-2 text-xs font-medium text-foreground shadow-2xs transition-colors hover:bg-muted"
                                    title="Download"
                                  >
                                    <Download className="size-3.5 text-muted-foreground" />
                                    <span className="hidden sm:inline">Download</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Documents & other non-image attachments */}
                  {documentAttachments.length > 0 && (
                    <div
                      className={cn(
                        "space-y-2.5",
                        imageAttachments.length > 0 && "pt-3 border-t border-border/60",
                      )}
                    >
                      {imageAttachments.length > 0 && (
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <FileText className="size-3.5" />
                          <span>
                            Other Documents & Files ({documentAttachments.length})
                          </span>
                        </p>
                      )}

                      {documentAttachments.map((file, i) => {
                        const isPdf =
                          file.mimeType === "application/pdf" ||
                          /\.pdf$/i.test(
                            file.originalFileName || file.downloadUrl || "",
                          );

                        const fileUrl =
                          attachmentUrl(file.downloadUrl) ||
                          (file.id && id
                            ? `/api/problems/${id}/attachments/${file.id}/download`
                            : undefined);

                        const preview = () =>
                          fileUrl &&
                          setPreviewImage({
                            src: fileUrl,
                            alt: file.originalFileName ?? "Attachment",
                            title: file.originalFileName ?? "Attachment Preview",
                            mimeType: file.mimeType,
                          });

                        return (
                          <div
                            key={file.id ?? `${file.originalFileName}-${i}`}
                            className="group flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3.5">
                              {fileUrl ? (
                                <button
                                  type="button"
                                  onClick={preview}
                                  className="group/thumb relative flex size-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-2xs transition-all hover:ring-2 hover:ring-primary/50"
                                  title="Click to preview file"
                                >
                                  {isPdf ? (
                                    <FileText className="size-6 text-rose-500" />
                                  ) : (
                                    <FileText className="size-6 text-primary" />
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover/thumb:bg-foreground/25">
                                    <Eye className="size-4 text-background opacity-0 drop-shadow-md transition-opacity group-hover/thumb:opacity-100" />
                                  </div>
                                </button>
                              ) : (
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-2xs">
                                  <FileText className="size-6 text-muted-foreground" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {file.originalFileName ?? "Unnamed file"}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <span className="font-mono">
                                    {file.mimeType || "file"}
                                  </span>
                                  {file.sizeBytes ? (
                                    <>
                                      <span>·</span>
                                      <span>{formatBytes(file.sizeBytes)}</span>
                                    </>
                                  ) : null}
                                </p>
                              </div>
                            </div>

                            {fileUrl && (
                              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={preview}
                                  className="h-8 cursor-pointer gap-1.5 rounded-xl border-border bg-background px-3 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted"
                                >
                                  <Eye
                                    aria-hidden="true"
                                    className="size-3.5 text-primary"
                                  />
                                  <span>Preview</span>
                                </Button>

                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer noopener"
                                  download={file.originalFileName ?? "attachment"}
                                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground shadow-2xs transition hover:bg-muted"
                                >
                                  <Download
                                    aria-hidden="true"
                                    className="size-3.5 text-muted-foreground"
                                  />
                                  <span>Download</span>
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SectionCard>
            )}

            {/* ── Post-level actions ─────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 px-1">
              {(problem.canEdit || (isOwnProblem && isPending)) && (
                <QuietAction href={`/community/${id}/edit`} icon={Pencil}>
                  Edit
                </QuietAction>
              )}

              {problem.repositoryUrl?.startsWith("https://") && (
                <QuietAction
                  href={problem.repositoryUrl}
                  icon={FolderGit2}
                  external
                >
                  Repository
                </QuietAction>
              )}

              <QuietAction
                icon={Flag}
                onClick={() => {
                  if (!isSignedIn) return requireSignIn();
                  setReportingProblem(true);
                }}
              >
                Report
              </QuietAction>
            </div>

            {/* ── Solutions ──────────────────────────────────────────── */}
            <div
              id="solutions"
              className="flex flex-wrap items-center justify-between gap-3 scroll-mt-24 pt-3"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  {answerCount} {answerCount === 1 ? "Solution" : "Solutions"}
                </h2>
                <div className="inline-flex items-center rounded-xl border border-border bg-muted/60 p-1 text-xs font-semibold">
                  {(["votes", "newest"] as const).map((order) => (
                    <button
                      key={order}
                      type="button"
                      onClick={() => onSortChange(order)}
                      aria-pressed={sortOrder === order}
                      className={`relative cursor-pointer rounded-lg px-3 py-1 transition-colors ${
                        sortOrder === order
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sortOrder === order && (
                        <motion.span
                          layoutId="problem-sort-indicator"
                          aria-hidden="true"
                          className="absolute inset-0 rounded-lg bg-background shadow-xs"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                          }}
                        />
                      )}
                      <span className="relative">
                        {order === "votes" ? "Top" : "Newest"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {canAnswer ? (
                <Link
                  href={`/community/${id}/solutions/create`}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:translate-y-px"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  {myAnswers.length > 0
                    ? "Post another solution"
                    : "Post your solution"}
                </Link>
              ) : !isSignedIn ? (
                <Button
                  type="button"
                  onClick={requireSignIn}
                  className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Post your solution
                </Button>
              ) : null}
            </div>

            {unpublished.map((mine) => (
              <MyAnswerNotice
                key={mine.solutionId}
                answer={mine}
                problemId={id}
              />
            ))}

            {isOwnProblem && (
              <p className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                This is your problem, so you cannot answer it yourself. You can
                accept an answer once someone posts one.
              </p>
            )}

            {!isSignedIn && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <span>Sign in to post a solution to this problem.</span>
                <Button
                  type="button"
                  size="sm"
                  onClick={requireSignIn}
                  className="cursor-pointer rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Sign in
                </Button>
              </div>
            )}

            {isLoadingSolutions ? (
              <div className="animate-pulse space-y-4">
                {[0, 1].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-muted" />
                ))}
              </div>
            ) : solutions.length === 0 ? (
              <div className={`${CARD} p-10 text-center`}>
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <MessageSquare aria-hidden="true" className="size-5" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  No solutions yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {canAnswer
                    ? "Be the first to post one."
                    : "Check back once someone answers."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    index={index}
                    canAccept={canAccept}
                    isMine={Boolean(me?.id && solution.author?.id === me.id)}
                    canReport={Boolean(me?.id && solution.author?.id !== me.id)}
                    accepted={isAcceptedSolution(
                      solution.id,
                      solution.isAccepted,
                    )}
                    onAccept={(solutionId) => void onAccept(solutionId)}
                    onUnaccept={(solutionId) => void onUnaccept(solutionId)}
                    isAccepting={isAccepting}
                  />
                ))}
              </div>
            )}

            <div id="comments" className="scroll-mt-24">
              <CommentsSection
                commentableType="PROBLEM"
                commentableId={id}
                className={`${CARD} p-4 sm:p-6`}
              />
            </div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="space-y-5 lg:col-span-4 lg:sticky lg:top-6 lg:self-start xl:col-span-3">
            <section className={`${CARD} p-5`}>
              <h2 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Asked by
              </h2>
              <PostedBy author={problem.author} />
            </section>

            {outline.length > 4 && (
              <section className={`${CARD} hidden p-5 lg:block`}>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  On this page
                </h2>
                <nav className="space-y-0.5">
                  {outline.map((entry) => (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1 rounded-full bg-muted-foreground/40"
                      />
                      {entry.label}
                    </a>
                  ))}
                </nav>
              </section>
            )}

            <section className={`${CARD} space-y-3 p-5`}>
              <h2 className="flex items-center gap-1.5 border-b border-border pb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Info aria-hidden="true" className="size-3.5" />
                Details
              </h2>
              {problem.problemType && (
                <Row
                  label="Type"
                  value={PROBLEM_TYPE_LABELS[problem.problemType]}
                />
              )}
              {problem.severity && (
                <Row label="Severity" value={SEVERITY_LABELS[problem.severity]} />
              )}
              {problem.sdlcPhase && (
                <Row label="SDLC phase" value={SDLC_LABELS[problem.sdlcPhase]} />
              )}
              <Row label="Category" value={problem.category?.name ?? "—"} />
              <Row label="Posted" value={formatDate(problem.createdAt)} />
              <Row label="Published" value={formatDate(problem.publishedAt)} />
            </section>

            {problem.contentWarnings && problem.contentWarnings.length > 0 && (
              <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm">
                <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  <AlertTriangle aria-hidden="true" className="size-3.5" />
                  Content warnings
                </h2>
                <ul className="space-y-1 text-amber-800 dark:text-amber-200">
                  {problem.contentWarnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </main>

      <ReportContentDialog
        contentId={id}
        contentType="PROBLEM"
        authorName={authorNameOf(problem.author)}
        open={reportingProblem}
        onOpenChange={setReportingProblem}
      />

      <ImagePreviewModal
        src={previewImage?.src ?? null}
        alt={previewImage?.alt ?? "Attachment"}
        title={previewImage?.title}
        mimeType={previewImage?.mimeType}
        isOpen={previewImage !== null}
        onClose={() => setPreviewImage(null)}
      />
    </motion.div>
  );
}

/* ── Building blocks ─────────────────────────────────────────────────── */

const SECTION_TONES = {
  default: "bg-muted text-muted-foreground",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
} as const;

function SectionCard({
  id,
  title,
  icon: Icon,
  meta,
  tone = "default",
  order = 0,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  meta?: string;
  tone?: keyof typeof SECTION_TONES;
  order?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: Math.min(order * 0.05, 0.3),
        ease: "easeOut",
      }}
      className={`${CARD} scroll-mt-24 overflow-hidden`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="flex items-center gap-2.5 text-base font-bold tracking-tight text-foreground">
          <span
            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${SECTION_TONES[tone]}`}
          >
            <Icon aria-hidden="true" className="size-4" />
          </span>
          {title}
        </h2>
        {meta && (
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            {meta}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

function BehaviourPanel({
  tone,
  label,
  text,
}: {
  tone: "expected" | "actual";
  label: string;
  text?: string;
}) {
  const styles =
    tone === "expected"
      ? "border-emerald-500/25 bg-emerald-500/5"
      : "border-rose-500/25 bg-rose-500/5";
  const heading =
    tone === "expected"
      ? "text-emerald-700 dark:text-emerald-300"
      : "text-rose-700 dark:text-rose-300";

  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <h3
        className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${heading}`}
      >
        {tone === "expected" ? (
          <CheckCircle2 aria-hidden="true" className="size-3.5" />
        ) : (
          <XCircle aria-hidden="true" className="size-3.5" />
        )}
        {label}
      </h3>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
        {text || <span className="text-muted-foreground">Not provided</span>}
      </p>
    </div>
  );
}

function CodeBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Your browser blocked the clipboard.");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/60 px-3 py-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-rose-500/50" />
          <span className="size-2.5 rounded-full bg-amber-500/50" />
          <span className="size-2.5 rounded-full bg-emerald-500/50" />
          <span className="ml-2 font-mono text-xs font-medium text-muted-foreground">
            stderr
          </span>
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          {copied ? (
            <Check aria-hidden="true" className="size-3.5 text-emerald-500" />
          ) : (
            <Copy aria-hidden="true" className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-foreground">
        <code className="font-mono">{text}</code>
      </pre>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="px-4 py-3.5 text-center">
      <dt className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon aria-hidden="true" className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

const PILL_TONES = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  solved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  open: "bg-primary/10 text-primary",
} as const;

function Pill({
  tone,
  icon: Icon,
  children,
}: {
  tone: keyof typeof PILL_TONES;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${PILL_TONES[tone]}`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {children}
    </span>
  );
}

function RailButton({
  label,
  onClick,
  disabled,
  pressed,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={`flex size-9 cursor-pointer items-center justify-center rounded-xl border transition-colors disabled:opacity-50 ${
        pressed
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function QuietAction({
  href,
  icon: Icon,
  onClick,
  external,
  children,
}: {
  href?: string;
  icon: LucideIcon;
  onClick?: () => void;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  const body = (
    <>
      <Icon aria-hidden="true" className="size-4" />
      {children}
    </>
  );

  if (href) {
    return external ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        {body}
      </a>
    ) : (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

function AuthorLine({
  author,
  createdAt,
  updatedAt,
}: {
  author?: AuthorSummary;
  createdAt?: string;
  updatedAt?: string;
}) {
  const lp = useLocalePath();
  const name = authorNameOf(author);
  const edited =
    updatedAt && createdAt && new Date(updatedAt) > new Date(createdAt);

  const avatar = author?.avatarUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={author.avatarUrl}
      alt=""
      className="size-7 shrink-0 rounded-full border border-border bg-muted object-cover"
    />
  ) : (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
      {initialsOf(authorNameOf(author, "?"))}
    </span>
  );

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      {author?.id ? (
        <Link
          href={lp(`/profile/${author.id}`)}
          className="group flex items-center gap-2 rounded-lg transition-colors"
        >
          {avatar}
          <span className="font-semibold text-foreground group-hover:text-primary">
            {name}
          </span>
        </Link>
      ) : (
        <span className="flex items-center gap-2">
          {avatar}
          <span className="font-semibold text-foreground">{name}</span>
        </span>
      )}
      <span aria-hidden="true">·</span>
      <span>asked {formatDate(createdAt)}</span>
      {edited && (
        <>
          <span aria-hidden="true">·</span>
          <span>edited {formatDate(updatedAt)}</span>
        </>
      )}
    </div>
  );
}

function MyAnswerNotice({
  answer,
  problemId,
}: {
  answer: MySolutionStatus;
  problemId: string;
}) {
  if (answer.review !== "REJECTED") return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <XCircle
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400"
        />

        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold text-rose-800 dark:text-rose-200">
            Your solution was not approved
          </p>

          {answer.summary && (
            <p className="truncate text-sm font-medium text-rose-700 dark:text-rose-300">
              “{answer.summary}”
            </p>
          )}

          <p className="text-sm text-rose-700 dark:text-rose-300">
            {answer.rejectionReason ??
              "No reason was given. You can edit it and post again."}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
        <Link
          href={`/community/${problemId}/solutions/${answer.solutionId}/edit`}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 text-sm font-bold text-white transition hover:bg-rose-700"
        >
          <Pencil aria-hidden="true" className="size-4" />
          Edit answer
        </Link>

        <Link
          href={MY_COMMUNITY_HREF}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-500/40 px-3.5 text-sm font-bold text-rose-700 transition hover:bg-rose-500/10 dark:text-rose-300"
        >
          My Community
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function PostedBy({ author }: { author?: AuthorSummary }) {
  const lp = useLocalePath();
  const name = authorNameOf(author);
  const reputation = (author?.reputation ?? 0).toLocaleString();

  const identity = (
    <>
      {author?.avatarUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={author.avatarUrl}
          alt=""
          className="size-11 shrink-0 rounded-full border border-border bg-muted object-cover"
        />
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
          {initialsOf(authorNameOf(author, "?"))}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-foreground group-hover:text-primary">
          {name}
        </p>
        <p className="text-xs font-medium text-muted-foreground">
          {reputation} reputation
        </p>
      </div>
    </>
  );

  if (!author?.id) {
    return <div className="flex items-center gap-3">{identity}</div>;
  }

  return (
    <Link
      href={lp(`/profile/${author.id}`)}
      className="group flex items-center gap-3 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {identity}
      <span className="sr-only">View profile</span>
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="truncate font-semibold text-foreground">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading the problem"
      className="min-h-[100dvh] animate-pulse pb-20"
    >
      <span className="sr-only">Loading the problem…</span>
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-5 w-64 rounded-lg bg-muted" />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-5 lg:col-span-8 xl:col-span-9">
            <div className={`${CARD} overflow-hidden`}>
              <div className="flex gap-5 p-5 sm:p-7">
                <div className="hidden h-24 w-11 shrink-0 rounded-xl bg-muted sm:block" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="h-6 w-24 rounded-full bg-muted" />
                    <div className="h-6 w-20 rounded-full bg-muted" />
                  </div>
                  <div className="h-8 w-3/4 rounded-lg bg-muted" />
                  <div className="h-5 w-52 rounded-lg bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-card" />
                ))}
              </div>
            </div>
            <div className={`${CARD} h-56`} />
            <div className={`${CARD} h-40`} />
          </div>
          <div className="space-y-5 lg:col-span-4 xl:col-span-3">
            <div className={`${CARD} h-28`} />
            <div className={`${CARD} h-44`} />
            <div className={`${CARD} h-52`} />
          </div>
        </div>
      </main>
    </div>
  );
}

function NotFound({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center text-foreground">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
        <AlertCircle aria-hidden="true" className="size-7" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-4 text-muted-foreground">{body}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Try again
          </button>
        )}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Community
        </Link>
      </div>
    </div>
  );
}
