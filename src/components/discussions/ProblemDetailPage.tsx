"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { attachmentUrl } from "@/lib/api/attachment-url";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  CircleDot,
  Clock,
  Download,
  Eye,
  FileText,
  Flag,
  FolderGit2,
  ListOrdered,
  Pencil,
  Plus,
  RotateCcw,
  Server,
  Target,
  TerminalSquare,
  Wrench,
  XCircle,
} from "lucide-react";

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

/**
 * One problem, read from the API — `GET /api/v1/problems/{id}` for the post,
 * `/problems/{id}/solutions` for the answers, `/comments` for the thread, and
 * the vote and bookmark endpoints for the two buttons.
 *
 * A problem carries far more than a title and a description: what was expected
 * against what happened, the steps to reproduce it, the environment it broke
 * in, what the author already tried. Each is rendered only when present, so a
 * one-line question stays one line and a fully filled report reads as a report.
 *
 * Only problems reach this route: a showcase card links to `/showcases/{id}`,
 * which has its own page. That is why nothing here branches on the two.
 */

const CARD =
  "rounded-2xl border border-border bg-card shadow-xs";

const SOLUTION_PAGE_SIZE = 50;

const SEVERITY_STYLES: Record<ProblemSeverity, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300",
  MEDIUM:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300",
  CRITICAL: "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300",
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
      refetchProblem={refetch}
    />
  );
}

/** Split out so the hooks below only run once a problem is actually loaded. */
function Loaded({
  id,
  problem,
  sortOrder,
  onSortChange,
  refetchProblem,
}: {
  id: string;
  problem: ProblemResponse;
  sortOrder: "votes" | "newest";
  onSortChange: (order: "votes" | "newest") => void;
  refetchProblem: () => void;
}) {
  const [incrementViews] = useIncrementProblemViewsMutation();
  const countedProblemId = useRef<string | null>(null);

  /* Record a view only after the problem has loaded successfully. Tracking the
     id (rather than a boolean) also handles client navigation between problem
     detail routes without double-counting effect replays in development. */
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

  /* Who is reading. A signed-out visitor gets a 401 here, which is the answer
     rather than an error: they cannot post either way. */
  const { data: me } = useGetMyProfileQuery();
  const isSignedIn = Boolean(me?.id);
  const isOwnProblem = Boolean(me?.id && problem.author?.id === me.id);
  const isPending = problem.status === "PENDING_APPROVAL";
  const canAnswer = isSignedIn && !isOwnProblem && !isPending;
  const [reportingProblem, setReportingProblem] = useState(false);
  /* The backend decides who may accept; `canAcceptSolution` is that decision.
     Ownership is the fallback for a response that predates the field. */
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

  /* The problem owns the list of accepted answers, so it is the authority when
     it and a solution's own `isAccepted` disagree — which they do between a
     click and the refetch that follows it. */
  const acceptedIds = useMemo(
    () => new Set(problem.acceptedSolutionIds ?? []),
    [problem.acceptedSolutionIds],
  );

  const isAcceptedSolution = (solutionId: string, flag?: boolean) =>
    acceptedIds.size > 0 ? acceptedIds.has(solutionId) : Boolean(flag);

  /* What the reader has already posted here. Only worth asking once they are
     signed in — a visitor has nothing of their own to be told about. */
  const { forProblem } = useMySolutionStatus({ skip: !isSignedIn });
  const myAnswers = forProblem(id);
  /* Solutions publish immediately now; only rejected answers needing revision are shown here. */
  const unpublished = myAnswers.filter((mine) => mine.review === "REJECTED");

  const solutions = useMemo(() => {
    const list = [...(solutionPage?.content ?? [])];
    const newest = (a: (typeof list)[number], b: (typeof list)[number]) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    if (sortOrder === "newest") return list.sort(newest);

    /* Accepted first, then by score — the order someone scanning for the
       answer wants. Several may be accepted, so this groups rather than
       lifting a single winner. */
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
  const tags = problem.tags ?? [];
  const technologies = problem.technologies ?? [];
  const environment = (problem.environment ?? []).filter(
    (entry) => entry.technology,
  );
  const reproductionSteps = (problem.reproductionSteps ?? []).filter(Boolean);
  const isResolved = problem.status === "RESOLVED";
  const answerCount = solutionPage?.totalElements ?? problem.solutionCount ?? 0;

  const { handleLogin } = useKeycloakLogin();

  const onVote = async (value: 1 | -1) => {
    if (!isSignedIn) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : `/problems/${id}`,
      );
      return;
    }
    if (isVoting) return;
    const target = { type: "PROBLEM" as const, targetId: id };
    if (votes?.currentUserVote === value) await removeVote(target);
    else await setVote({ ...target, value });
  };

  const onBookmark = async () => {
    if (!isSignedIn) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : `/problems/${id}`,
      );
      return;
    }
    if (isBookmarking) return;
    if (isBookmarked) {
      await removeBookmark({ type: "PROBLEM", targetId: id });
    } else {
      await addBookmark({ type: "PROBLEM", targetId: id });
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
      className="min-h-screen pb-16 font-sans text-slate-800 dark:text-neutral-100"
    >
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/community"
          className="mb-5 inline-flex items-center gap-2 text-base font-semibold text-slate-500 transition-colors hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Community
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
          <div className="min-w-0 space-y-6 lg:col-span-2 xl:col-span-3">
            {/* ── The problem ── */}
            <section className={`${CARD} p-4 sm:p-6`}>
              {/* Inline AI auto-approval hold explanation (author-only when pending) */}
              <AutoApprovalHoldNotice
                notifiableId={id}
                notifiableType="PROBLEM"
                isAuthor={isOwnProblem}
                isPending={isPending}
                editHref={`/community/${id}/edit`}
                className="mb-4"
              />

              <div className="mb-3 flex flex-wrap items-center gap-2">
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                    <Clock aria-hidden="true" className="size-3.5" />
                    Pending Review
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      isResolved
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                    }`}
                  >
                    {isResolved ? (
                      <CheckCircle2 aria-hidden="true" className="size-3.5" />
                    ) : (
                      <CircleDot aria-hidden="true" className="size-3.5" />
                    )}
                    {isResolved ? "Solved" : "Open"}
                  </span>
                )}

                {problem.problemType && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {PROBLEM_TYPE_LABELS[problem.problemType]}
                  </span>
                )}
                {problem.severity && (
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold ${SEVERITY_STYLES[problem.severity]}`}
                  >
                    {SEVERITY_LABELS[problem.severity]}
                  </span>
                )}
                {problem.sdlcPhase && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {SDLC_LABELS[problem.sdlcPhase]}
                  </span>
                )}
                {problem.category?.name && (
                  <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-neutral-700 dark:text-neutral-300">
                    {problem.category.name}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-2xl lg:text-3xl dark:text-neutral-100">
                  {problem.title ?? "Untitled problem"}
                </h1>

                <VoteControl
                  voteCount={voteScore}
                  upvotes={upvoteCount}
                  downvotes={downvoteCount}
                  currentVote={votes?.currentUserVote ?? 0}
                  onVote={onVote}
                  isLoading={isVoting}
                  upvoteLabel="Upvote this problem"
                  downvoteLabel="Downvote this problem"
                  orientation="horizontal"
                  className="shrink-0"
                />
              </div>

              {(tags.length > 0 || technologies.length > 0) && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {technologies.map((tech, i) => (
                    <span
                      key={tech.id ?? `${tech.name}-${i}`}
                      className="rounded-lg border border-slate-200/60 bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      {tech.name}
                      {tech.version ? ` ${tech.version}` : ""}
                    </span>
                  ))}
                  {tags.map((tag, i) => (
                    <span
                      key={tag.id ?? `${tag.name}-${i}`}
                      className="rounded-lg border border-blue-200/60 bg-blue-50 px-2.5 py-1 font-mono text-xs font-medium text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              <Section title="Description">
                {problem.description ? (
                  <MarkdownView source={problem.description} />
                ) : (
                  <p className="text-sm text-slate-500 dark:text-neutral-400">
                    This problem was posted without a description.
                  </p>
                )}
              </Section>

              {/* ── Expected against actual, side by side where there is room ── */}
              {(problem.expectedBehavior || problem.actualBehavior) && (
                <Section
                  title="Expected vs actual"
                  icon={<Target aria-hidden="true" className="size-3.5" />}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {problem.expectedBehavior && (
                      <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/5">
                        <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          Expected
                        </h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
                          {problem.expectedBehavior}
                        </p>
                      </div>
                    )}
                    {problem.actualBehavior && (
                      <div className="rounded-xl border border-rose-200/70 bg-rose-50/60 p-4 dark:border-rose-500/25 dark:bg-rose-500/5">
                        <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                          Actual
                        </h3>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
                          {problem.actualBehavior}
                        </p>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {reproductionSteps.length > 0 && (
                <Section
                  title="Steps to reproduce"
                  icon={<ListOrdered aria-hidden="true" className="size-3.5" />}
                >
                  <ol className="space-y-2">
                    {reproductionSteps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold tabular-nums text-slate-700 dark:bg-neutral-700 dark:text-neutral-200">
                          {i + 1}
                        </span>
                        <p className="min-w-0 text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}

              {problem.errorMessage && (
                <Section
                  title="Error output"
                  icon={
                    <TerminalSquare aria-hidden="true" className="size-3.5" />
                  }
                >
                  {/* The one place a horizontal scrollbar is right: wrapping a
                      stack trace destroys the thing being read. */}
                  <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs leading-relaxed text-slate-100 dark:border-neutral-700 dark:bg-neutral-950">
                    <code>{problem.errorMessage}</code>
                  </pre>
                </Section>
              )}

              {problem.attemptsTried && (
                <Section
                  title="Already tried"
                  icon={<Wrench aria-hidden="true" className="size-3.5" />}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
                    {problem.attemptsTried}
                  </p>
                </Section>
              )}

              {environment.length > 0 && (
                <Section
                  title="Environment"
                  icon={<Server aria-hidden="true" className="size-3.5" />}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {environment.map((entry, i) => (
                      <span
                        key={`${entry.technology}-${i}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                      >
                        {entry.technology}
                        {entry.version ? ` ${entry.version}` : ""}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {attachments.length > 0 && (
                <Section title="Attachments">
                  <div className="space-y-3">
                    {attachments.map((file, i) => {
                      const isImg =
                        file.mimeType?.startsWith("image/") ||
                        /\.(png|jpe?g|webp|gif|svg)$/i.test(
                          file.originalFileName || file.downloadUrl || "",
                        );
                      const isPdf =
                        file.mimeType === "application/pdf" ||
                        /\.pdf$/i.test(file.originalFileName || file.downloadUrl || "");

                      const fileUrl =
                        attachmentUrl(file.downloadUrl) ||
                        (file.id && id
                          ? `/api/problems/${id}/attachments/${file.id}/download`
                          : undefined);

                      return (
                        <div
                          key={file.id ?? `${file.originalFileName}-${i}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 transition-all hover:border-border/80 shadow-2xs"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Visual Thumbnail or File Icon */}
                            {fileUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage({
                                    src: fileUrl,
                                    alt: file.originalFileName ?? "Attachment",
                                    title:
                                      file.originalFileName ??
                                      "Attachment Preview",
                                    mimeType: file.mimeType,
                                  })
                                }
                                className="relative size-14 shrink-0 rounded-xl overflow-hidden border border-border bg-muted/40 cursor-pointer group/thumb hover:ring-2 hover:ring-primary/50 transition-all flex items-center justify-center shadow-2xs"
                                title="Click to preview attachment"
                              >
                                {isImg ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={fileUrl}
                                    alt={file.originalFileName ?? "Attachment"}
                                    className="size-full object-cover transition-transform group-hover/thumb:scale-105"
                                    loading="lazy"
                                  />
                                ) : isPdf ? (
                                  <FileText className="size-6 text-rose-500" />
                                ) : (
                                  <FileText className="size-6 text-primary" />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/25 flex items-center justify-center transition-colors">
                                  <Eye className="size-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow-md" />
                                </div>
                              </button>
                            ) : (
                              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-foreground shadow-2xs">
                                <FileText className="size-6 text-muted-foreground" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-foreground">
                                {file.originalFileName ?? "Unnamed file"}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono">{file.mimeType || (isImg ? "image" : "file")}</span>
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
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setPreviewImage({
                                    src: fileUrl,
                                    alt: file.originalFileName ?? "Attachment",
                                    title:
                                      file.originalFileName ??
                                      "Attachment Preview",
                                    mimeType: file.mimeType,
                                  })
                                }
                                className="h-8 rounded-xl border-border bg-background text-foreground hover:bg-muted font-semibold text-xs gap-1.5 px-3 cursor-pointer shadow-2xs"
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
                                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-muted shadow-2xs"
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
                </Section>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-sm dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => void onBookmark()}
                  disabled={isBookmarking}
                  aria-pressed={isBookmarked}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-1.5 font-medium transition disabled:opacity-50 ${
                    isBookmarked
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Bookmark
                    className={`size-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </button>

                {/* Whether this problem may be edited is the backend's call,
                    carried on the response — a published problem with answers
                    under it is not the same as an untouched draft. */}
                {problem.canEdit && (
                  <Link
                    href={`/community/${id}/edit`}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Link>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (!isSignedIn) {
                      void handleLogin(
                        typeof window !== "undefined"
                          ? `${window.location.pathname}${window.location.search}`
                          : `/problems/${id}`,
                      );
                      return;
                    }
                    setReportingProblem(true);
                  }}
                  className="rounded-xl text-muted-foreground cursor-pointer"
                >
                  <Flag data-icon="inline-start" />
                  Report
                </Button>

                {problem.repositoryUrl?.startsWith("https://") && (
                  <a
                    href={problem.repositoryUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <FolderGit2 aria-hidden="true" className="size-4" />
                    Repository
                  </a>
                )}
              </div>
            </section>

            {/* ── Answers ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {answerCount} {answerCount === 1 ? "Solution" : "Solutions"}
                </h2>
                <div className="inline-flex items-center rounded-xl bg-muted/60 border border-border p-1 text-xs font-semibold">
                  {(["votes", "newest"] as const).map((order) => (
                    <button
                      key={order}
                      type="button"
                      onClick={() => onSortChange(order)}
                      aria-pressed={sortOrder === order}
                      className={`cursor-pointer rounded-lg px-3 py-1 transition-all ${
                        sortOrder === order
                          ? "bg-background text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {order === "votes" ? "Top" : "Newest"}
                    </button>
                  ))}
                </div>
              </div>

              {canAnswer ? (
                <Link
                  href={`/community/${id}/solutions/create`}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  {myAnswers.length > 0 ? "Post another solution" : "Post your solution"}
                </Link>
              ) : !isSignedIn ? (
                <Button
                  type="button"
                  onClick={() =>
                    void handleLogin(
                      typeof window !== "undefined"
                        ? `${window.location.pathname}${window.location.search}`
                        : `/problems/${id}`,
                    )
                  }
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-primary px-4.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 cursor-pointer"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Post your solution
                </Button>
              ) : null}
            </div>

            {/* ── The reader's own answers on this problem ──
                A posted answer is held for review, so it is absent from the
                list below until a moderator approves it. Without this the
                author sees no trace of what they just wrote and assumes it
                failed to send. */}
            {unpublished.map((mine) => (
              <MyAnswerNotice key={mine.solutionId} answer={mine} problemId={id} />
            ))}

            {/* Why the composer is absent, when it is. Silence would read as a
                bug to whoever came here to answer. */}
            {isOwnProblem && (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                This is your problem, so you cannot answer it yourself. You can
                accept an answer once someone posts one.
              </p>
            )}
            {!isSignedIn && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                <span>Sign in to post a solution to this problem.</span>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    void handleLogin(
                      typeof window !== "undefined"
                        ? `${window.location.pathname}${window.location.search}`
                        : `/problems/${id}`,
                    )
                  }
                  className="rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 cursor-pointer"
                >
                  Sign in
                </Button>
              </div>
            )}

            {isLoadingSolutions ? (
              <div className="animate-pulse space-y-4">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl bg-slate-200 dark:bg-neutral-800"
                  />
                ))}
              </div>
            ) : solutions.length === 0 ? (
              <p
                className={`${CARD} p-8 text-center text-sm text-slate-500 dark:text-neutral-400`}
              >
                {canAnswer
                  ? "No answers yet. Be the first to post one."
                  : "No answers yet."}
              </p>
            ) : (
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    index={index}
                    canAccept={canAccept}
                    isMine={Boolean(me?.id && solution.author?.id === me.id)}
                    canReport={Boolean(
                      me?.id && solution.author?.id !== me.id,
                    )}
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

            <CommentsSection
              commentableType="PROBLEM"
              commentableId={id}
              className={`${CARD} p-4 sm:p-6`}
            />
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* The figures, as tiles — quicker to read than a list of rows. */}
            <section className={`${CARD} p-4 sm:p-5`}>
              <div className="grid grid-cols-2 gap-2 text-center">
                <Stat label="Answers" value={answerCount.toLocaleString()} />
                <Stat
                  label="Views"
                  value={(problem.viewCount ?? 0).toLocaleString()}
                  icon={<Eye aria-hidden="true" className="size-3" />}
                />
              </div>
            </section>

            <section className={`${CARD} space-y-3.5 p-4 text-sm sm:p-5`}>
              <h2 className="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-neutral-800 dark:text-neutral-500">
                Problem details
              </h2>
              {problem.problemType && (
                <Row
                  label="Type"
                  value={PROBLEM_TYPE_LABELS[problem.problemType]}
                />
              )}
              {problem.severity && (
                <Row
                  label="Severity"
                  value={SEVERITY_LABELS[problem.severity]}
                />
              )}
              {problem.sdlcPhase && (
                <Row
                  label="SDLC phase"
                  value={SDLC_LABELS[problem.sdlcPhase]}
                />
              )}
              <Row label="Category" value={problem.category?.name ?? "—"} />
              <Row label="Posted" value={formatDate(problem.createdAt)} />
              <Row label="Published" value={formatDate(problem.publishedAt)} />
            </section>

            <section className={`${CARD} p-4 text-sm sm:p-5`}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Posted by
              </h2>
              <PostedBy author={problem.author} />
            </section>

            {problem.contentWarnings && problem.contentWarnings.length > 0 && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-500/10 sm:p-5">
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

/**
 * One of the reader's own answers that is not on the page yet — waiting on a
 * moderator, or turned away by one.
 *
 * It links to their dashboard rather than offering an action here: this page
 * shows a problem, and everything they can do about the answer itself (read
 * the rejection, delete it, post a replacement) lives under My Community.
 */
function MyAnswerNotice({
  answer,
  problemId,
}: {
  answer: MySolutionStatus;
  problemId: string;
}) {
  if (answer.review !== "REJECTED") return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10">
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
          className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold text-white transition bg-rose-600 hover:bg-rose-700"
        >
          <Pencil aria-hidden="true" className="size-4" />
          Edit answer
        </Link>

        <Link
          href={MY_COMMUNITY_HREF}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-bold transition border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/20"
        >
          My Community
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </div>
  );
}

/** A titled block inside the problem card, with its own rule above it. */
/**
 * The author card in the sidebar.
 *
 * It leads to the poster's profile, which is where a reader decides how much
 * weight to give an answer — who they are, what else they have solved, what
 * their reputation was earned on. The card falls back to plain markup when the
 * response carries no author id: `/profile` is keyed by user id, so a link
 * without one would land on a page that cannot resolve.
 */
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
          className="size-10 shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover dark:border-neutral-700 dark:bg-neutral-800"
        />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-neutral-800 dark:text-neutral-300">
          {initialsOf(authorNameOf(author, "?"))}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
          {name}
        </p>
        <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
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
      className="group flex items-center gap-3 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      {identity}
      <span className="sr-only">View profile</span>
    </Link>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 border-t border-slate-100 pt-4 dark:border-neutral-800">
      <h2 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/35 border border-border/60 px-2 py-3 text-center">
      <p className="text-xl font-bold tabular-nums text-foreground">
        {value}
      </p>
      <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground mt-0.5">
        {icon}
        {label}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="truncate font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading the problem"
      className="min-h-screen animate-pulse pb-16"
    >
      <span className="sr-only">Loading the problem…</span>
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-5 w-44 rounded-lg bg-slate-200 dark:bg-neutral-800" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
          <div className="space-y-6 lg:col-span-2 xl:col-span-3">
            <div className={`${CARD} space-y-4 p-4 sm:p-6`}>
              <div className="h-6 w-32 rounded-full bg-slate-200 dark:bg-neutral-800" />
              <div className="h-8 w-3/4 rounded-lg bg-slate-200 dark:bg-neutral-800" />
              <div className="h-24 w-full rounded-lg bg-slate-200 dark:bg-neutral-800" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-20 rounded-xl bg-slate-200 dark:bg-neutral-800" />
                <div className="h-20 rounded-xl bg-slate-200 dark:bg-neutral-800" />
              </div>
            </div>
            <div className={`${CARD} h-32`} />
          </div>
          <div className="space-y-6">
            <div className={`${CARD} h-24`} />
            <div className={`${CARD} h-48`} />
            <div className={`${CARD} h-28`} />
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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center text-slate-800 dark:text-neutral-100">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
        <AlertCircle aria-hidden="true" className="size-7" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-4 text-slate-500 dark:text-neutral-400">{body}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Try again
          </button>
        )}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Community
        </Link>
      </div>
    </div>
  );
}
