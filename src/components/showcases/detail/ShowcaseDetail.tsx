"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Bookmark,
  Code2,
  ExternalLink,
  Eye,
  Flag,
  Image as ImageIcon,
  LayoutTemplate,
  Network,
  Share2,
  Terminal,
  ZoomIn,
} from "lucide-react";

import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { ReportContentDialog } from "@/components/comments/ReportCommentDialog";
import { Button } from "@/components/ui/button";
import { VoteControl } from "@/components/ui/vote-control";
import { CommentsSection } from "@/components/comments/CommentsSection";
import {
  useGetShowcaseByIdQuery,
  useGetShowcaseStepsQuery,
  useIncrementShowcaseViewsMutation,
  type ShowcaseStepResponse,
} from "@/lib/redux/services/showcasesApi";
import {
  useGetVoteSummaryQuery,
  useRemoveVoteMutation,
  useSetVoteMutation,
} from "@/lib/redux/services/votesApi";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import { cn } from "@/lib/utils";

/**
 * A showcase in full, laid out the way `ProblemDetailPage` lays out its
 * showcase view: the title card with the vote box, the three showcase tabs,
 * the comment thread, and the metadata / links / posted-by sidebar.
 *
 * The difference is the data. Everything here is the real record —
 * `GET /showcases/{id}` and its steps, `/votes/SHOWCASE/{id}` for the score,
 * `/comments` for the thread — where the problem page reads a mock store.
 */

interface ShowcaseDetailProps {
  id: string;
}

const CARD =
  "rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs";

const SIDEBAR_HEADING =
  "font-bold uppercase tracking-wider text-xs text-slate-400 dark:text-neutral-500";

function formatDate(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function ShowcaseDetail({ id }: ShowcaseDetailProps) {
  const { data: showcase, isLoading } = useGetShowcaseByIdQuery(id);
  const [reporting, setReporting] = useState(false);
  const { data: session } = authClient.useSession();
  const { handleLogin } = useKeycloakLogin();

  /* The showcase response carries its steps; the dedicated endpoint is the
     fallback for when it comes back without them. */
  const embeddedSteps = showcase?.steps;
  const { data: fetchedSteps } = useGetShowcaseStepsQuery(id, {
    skip: !showcase || (embeddedSteps?.length ?? 0) > 0,
  });

  const steps: ShowcaseStepResponse[] = [
    ...(embeddedSteps?.length ? embeddedSteps : (fetchedSteps ?? [])),
  ].sort((a, b) => a.stepNumber - b.stepNumber);

  /* ── Votes ── */
  const { data: votes } = useGetVoteSummaryQuery({
    type: "SHOWCASE",
    targetId: id,
  });
  const [setVote] = useSetVoteMutation();
  const [removeVote] = useRemoveVoteMutation();
  const [isVoting, setIsVoting] = useState(false);

  const upvoteCount = votes?.upvotes ?? 0;
  const myVote = votes?.currentUserVote ?? 0;

  const vote = async (value: 1 | -1) => {
    if (!session?.user) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : `/showcases/${id}`,
      );
      return;
    }
    if (isVoting) return;

    try {
      setIsVoting(true);
      if (myVote === value) {
        await removeVote({ type: "SHOWCASE", targetId: id }).unwrap();
      } else {
        await setVote({ type: "SHOWCASE", targetId: id, value }).unwrap();
      }
    } catch {
      /* Signed out, or the vote was rejected. The count stays as the server
         last reported it rather than drifting to an optimistic value. */
    } finally {
      setIsVoting(false);
    }
  };

  /* Comments live in `CommentsSection`, which owns their fetching, threading,
     composer and per-comment actions. */

  /* Counted once per mount, not per render. */
  const [incrementViews] = useIncrementShowcaseViewsMutation();
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    void incrementViews(id);
  }, [id, incrementViews]);

  if (isLoading) return <DetailSkeleton />;

  if (!showcase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-800 dark:text-neutral-100">
        <h1 className="text-2xl font-bold mb-2">Showcase Not Found</h1>
        <p className="text-slate-500 dark:text-neutral-400 mb-4">
          It may have been removed, or it is still waiting on review.
        </p>
        <Link
          href="/showcases"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Showcases</span>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen text-slate-800 dark:text-neutral-100 font-sans pb-16"
    >
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/showcases"
          className="inline-flex items-center space-x-2 text-base font-semibold text-slate-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Showcases</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Main Title Header Card */}
            <div className={`${CARD} p-6`}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-100 dark:bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                  <LayoutTemplate className="h-3.5 w-3.5" />
                  <span>Showcase</span>
                </span>

                {showcase.categoryName && (
                  <span className="rounded-md bg-slate-100 dark:bg-neutral-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-neutral-300">
                    {showcase.categoryName}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight leading-snug break-words [word-break:break-word] min-w-0">
                  {showcase.title}
                </h1>

                <VoteControl
                  voteCount={upvoteCount}
                  currentVote={myVote}
                  onVote={vote}
                  isLoading={isVoting}
                  upvoteLabel="Upvote this showcase"
                  downvoteLabel="Downvote this showcase"
                  className="shrink-0"
                />
              </div>

              {showcase.coverImageUrl && (
                <div className="mt-5">
                  {/* Ambient backdrop and increased frame height so portrait & landscape uploads look full and professional */}
                  <ShowcaseImage
                    url={showcase.coverImageUrl}
                    alt={`${showcase.title} cover`}
                    heightClassName="h-64 sm:h-80 md:h-[420px]"
                  />
                </div>
              )}

              <div className="mt-6 border-t border-slate-100 dark:border-neutral-800 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-2">
                  Project Overview
                </h3>
                <MarkdownView source={showcase.overview} />
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-neutral-800 pt-4 text-sm">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="flex items-center space-x-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 px-3.5 py-1.5 text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 font-medium"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Bookmark</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center space-x-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 px-3.5 py-1.5 text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 font-medium"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      if (!session?.user) {
                        void handleLogin(
                          typeof window !== "undefined"
                            ? `${window.location.pathname}${window.location.search}`
                            : `/showcases/${id}`,
                        );
                        return;
                      }
                      setReporting(true);
                    }}
                    className="rounded-xl text-muted-foreground"
                  >
                    <Flag data-icon="inline-start" />
                    Report
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Build guide ──────────────────────────────────────────────
                One pass through the steps, each carrying its own code,
                screenshot and diagram. They were three tabs over the same
                steps, which made a reader hop between views to assemble what
                one step was actually saying. */}
            <div className={`${CARD} p-6 space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100 flex items-center space-x-2">
                  <Terminal className="h-4 w-4 text-blue-600" />
                  <span>Build guide</span>
                </h3>
                {steps.length > 0 && (
                  <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-neutral-400">
                    {steps.length} {steps.length === 1 ? "step" : "steps"}
                  </span>
                )}
              </div>

              {steps.length === 0 ? (
                <EmptyTab>This showcase has no build steps yet.</EmptyTab>
              ) : (
                <ol className="space-y-3">
                  {steps.map((step, index) => (
                    <li
                      key={step.id}
                      className="flex gap-3 items-start bg-slate-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-slate-100 dark:border-neutral-800 text-sm"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1 space-y-3">
                        <p className="text-base font-bold text-slate-900 dark:text-neutral-100">
                          {step.title}
                        </p>

                        <MarkdownView source={step.description} />

                        {step.codeSnippet && (
                          <figure className="space-y-1.5">
                            <figcaption className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                              <Code2 aria-hidden="true" className="size-3.5" />
                              Code
                            </figcaption>
                            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-blue-300">
                              {step.codeSnippet}
                            </pre>
                          </figure>
                        )}

                        {step.imageUrl && (
                          <figure className="space-y-1.5">
                            <figcaption className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                              <ImageIcon aria-hidden="true" className="size-3.5" />
                              Screenshot
                            </figcaption>
                            <ShowcaseImage
                              url={step.imageUrl}
                              alt={`${step.title} screenshot`}
                              heightClassName="h-48 sm:h-56"
                              sizes="(max-width: 1024px) 90vw, 720px"
                            />
                          </figure>
                        )}

                        {step.diagramUrl && (
                          <figure className="space-y-1.5">
                            <figcaption className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                              <Network aria-hidden="true" className="size-3.5" />
                              Diagram
                            </figcaption>
                            {/* Taller than a screenshot: a diagram is the thing
                                being read, and its labels have to stay legible. */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-500/20 dark:bg-blue-500/5">
                              <ShowcaseImage
                                url={step.diagramUrl}
                                alt={`${step.title} diagram`}
                                heightClassName="h-64 sm:h-80"
                                framed={false}
                              />
                            </div>
                          </figure>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <CommentsSection
              commentableType="SHOWCASE"
              commentableId={id}
              className={`${CARD} p-6`}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className={`${CARD} p-5 space-y-3.5 text-sm`}>
              <h3
                className={`${SIDEBAR_HEADING} border-b border-slate-100 dark:border-neutral-800 pb-2`}
              >
                Showcase Metadata
              </h3>
              <SidebarRow
                label="Category"
                value={showcase.categoryName ?? "—"}
              />
              <SidebarRow
                label="Views"
                value={showcase.viewCount.toLocaleString()}
              />
              <SidebarRow label="Steps" value={String(steps.length)} />
              <SidebarRow
                label="Posted"
                value={formatDate(showcase.createdAt)}
              />
            </div>

            {(showcase.repoUrl || showcase.liveUrl || showcase.videoUrl) && (
              <div className={`${CARD} p-5 text-sm space-y-3`}>
                <h3 className={SIDEBAR_HEADING}>Project Links</h3>
                {showcase.repoUrl && (
                  <ProjectLink href={showcase.repoUrl} label="Repository" />
                )}
                {showcase.liveUrl && (
                  <ProjectLink href={showcase.liveUrl} label="Live Demo" />
                )}
                {showcase.videoUrl && (
                  <ProjectLink href={showcase.videoUrl} label="Walkthrough" />
                )}
              </div>
            )}

            <div className={`${CARD} p-5 text-sm`}>
              <h3 className={`${SIDEBAR_HEADING} mb-3`}>Posted By</h3>
              <PostedBy
                authorId={showcase.authorId}
                authorName={showcase.authorName}
                viewCount={showcase.viewCount}
              />
            </div>
          </div>
        </div>
      </main>

      <ReportContentDialog
        contentId={id}
        contentType="SHOWCASE"
        authorName={showcase.authorName}
        open={reporting}
        onOpenChange={setReporting}
      />
    </motion.div>
  );
}

/**
 * The author of the showcase, linked to their public profile.
 *
 * `/profile/[username]` takes a user id rather than a name — the backend has
 * no lookup by name — which is exactly what a showcase carries. A record
 * without an `authorId` still renders, just not as a link, so a malformed row
 * degrades to plain text instead of a dead route.
 */
function PostedBy({
  authorId,
  authorName,
  viewCount,
}: {
  authorId?: string;
  authorName: string;
  viewCount: number;
}) {
  const lp = useLocalePath();

  const identity = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
        {initialsOf(authorName)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
          {authorName}
        </p>
        <p className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-neutral-400">
          <Eye className="h-3 w-3" />
          {viewCount.toLocaleString()} views on this project
        </p>
      </div>
    </>
  );

  if (!authorId) {
    return <div className="flex items-center space-x-3">{identity}</div>;
  }

  return (
    <Link
      href={lp(`/profile/${authorId}`)}
      className="group flex items-center space-x-3 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      {identity}
      <span className="sr-only">View profile</span>
    </Link>
  );
}

function EmptyTab({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500 dark:border-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-400">
      {children}
    </p>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="truncate text-sm font-semibold text-slate-800 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );
}

function ProjectLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-800/60 dark:hover:bg-neutral-800"
    >
      <span className="text-sm font-semibold text-slate-700 dark:text-neutral-200">
        {label}
      </span>
      <ExternalLink className="h-4 w-4 text-slate-400" />
    </a>
  );
}

/**
 * `next/image` only accepts hosts allowed in `next.config.ts`, which covers
 * every `https` host. An author who pasted an `http` or `data:` URL would make
 * the component throw during render, so those keep the plain tag.
 */
function isOptimizable(url: string) {
  return url.startsWith("https://") || url.startsWith("/");
}

/**
 * One bounded, uncropped image.
 *
 * `object-contain` inside a fixed-height box rather than `object-cover`: a
 * screenshot or a diagram is read, and cropping one to fill a frame cuts off
 * the part being explained. The height cap keeps a tall portrait screenshot
 * from running the page, and `sizes` tells the optimizer to serve roughly what
 * is on screen — twice that on a retina display — so nothing looks soft.
 */
function ShowcaseImage({
  url,
  alt,
  /** Tailwind height classes for the frame. */
  heightClassName = "h-64 sm:h-72",
  sizes = "(max-width: 1024px) 100vw, 860px",
  framed = true,
}: {
  url: string;
  alt: string;
  heightClassName?: string;
  sizes?: string;
  framed?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  if (failed) return null;

  const frame = cn(
    "relative w-full overflow-hidden flex items-center justify-center cursor-pointer",
    heightClassName,
    framed &&
      "rounded-2xl border border-slate-200/80 bg-slate-950 dark:border-neutral-800 dark:bg-neutral-950 shadow-md",
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        title="Click to view full image"
        aria-label={`View full image: ${alt}`}
        className={cn(
          frame,
          "group block w-full text-left transition-all hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        )}
      >
        {isOptimizable(url) ? (
          <>
            {/* Ambient Blurred Background Fill (eliminates empty letterbox spaces for portrait/custom images) */}
            <Image
              src={url}
              alt=""
              fill
              aria-hidden="true"
              sizes="100px"
              quality={30}
              className="object-cover blur-2xl opacity-40 dark:opacity-50 scale-110 pointer-events-none select-none"
            />
            {/* Main Crisp Image */}
            <Image
              src={url}
              alt={alt}
              fill
              sizes={sizes}
              quality={90}
              onError={() => setFailed(true)}
              className="relative z-10 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </>
        ) : (
          <>
            {/* Ambient Blurred Background Fill */}
            <img
              src={url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-40 dark:opacity-50 scale-110 pointer-events-none select-none"
            />
            {/* Main Crisp Image */}
            <img
              src={url}
              alt={alt}
              loading="lazy"
              onError={() => setFailed(true)}
              className="relative z-10 h-full w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </>
        )}

        {/* Hover zoom overlay badge */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/60 px-2.5 py-1 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 shadow-md">
          <ZoomIn className="size-3.5" />
          <span>Preview</span>
        </div>
      </button>

      <ImagePreviewModal
        src={url}
        alt={alt}
        title={alt}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen pb-16">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          role="status"
          aria-label="Loading showcase"
          className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-4"
        >
          <span className="sr-only">Loading showcase…</span>
          <div className="space-y-6 lg:col-span-3">
            <div className={`${CARD} space-y-4 p-6`}>
              <div className="h-6 w-28 rounded-full bg-slate-200 dark:bg-neutral-800" />
              <div className="h-8 w-3/4 rounded-lg bg-slate-200 dark:bg-neutral-800" />
              <div className="aspect-[16/7] w-full rounded-xl bg-slate-200 dark:bg-neutral-800" />
              <div className="h-4 w-full rounded-lg bg-slate-200 dark:bg-neutral-800" />
              <div className="h-4 w-4/5 rounded-lg bg-slate-200 dark:bg-neutral-800" />
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="h-10 w-44 rounded-xl bg-slate-200 dark:bg-neutral-800"
                />
              ))}
            </div>
            <div className={`${CARD} space-y-3 p-6`}>
              <div className="h-16 rounded-xl bg-slate-200 dark:bg-neutral-800" />
              <div className="h-16 rounded-xl bg-slate-200 dark:bg-neutral-800" />
            </div>
          </div>
          <div className="space-y-6">
            {[0, 1].map((index) => (
              <div key={index} className={`${CARD} space-y-3 p-5`}>
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-neutral-800" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-neutral-800" />
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Pulls something readable out of an RTK Query error. */
