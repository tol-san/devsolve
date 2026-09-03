"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ImageOff,
  RotateCcw,
  Terminal,
  XCircle,
  ZoomIn,
} from "lucide-react";

import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShowcaseDecisionDialog } from "@/components/admin/showcases/ShowcaseDecisionDialog";
import { ShowcaseReviewHistory } from "@/components/admin/showcases/ShowcaseReviewHistory";
import {
  ReviewStatusBadge,
  SubmissionTypeBadge,
} from "@/components/admin/showcases/ShowcaseSubmissionBadges";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { ShowcaseCodeBlock } from "@/components/showcases/detail/ShowcaseCodeBlock";
import { ShowcaseDiagramViewer } from "@/components/showcases/diagram/ShowcaseDiagramViewer";
import { useGetShowcaseReviewDetailQuery } from "@/lib/redux/services/admin/showcaseReviewApi";

/**
 * One submission under review — `GET /api/v1/admin/showcases/{id}`, decided
 * with `PATCH …/review-status`.
 *
 * Laid out like the public showcase page so approving means approving what a
 * visitor will actually see. For a revision this is the pending copy, not what
 * is currently live.
 */

const CARD =
  "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs";

const BACK_HREF = "/dashboard/content-moderation?tab=showcases";

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ShowcaseReviewDetail({ id }: { id: string }) {
  const { data: submission, isLoading, isError, error, refetch } =
    useGetShowcaseReviewDetailQuery(id);

  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(
    null,
  );

  if (isLoading) return <DetailSkeleton />;

  if (isError || !submission) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;

    return (
      <DetailError
        title={status === 404 ? "Submission not found" : "Something went wrong"}
        body={
          status === 403
            ? "This queue is for administrators. Your account cannot review submissions."
            : status === 404
              ? "It may already have been decided, or the link may be wrong."
              : "This submission could not be loaded right now."
        }
        onRetry={
          status === 404 || status === 403 ? undefined : () => void refetch()
        }
      />
    );
  }

  const steps = [...(submission.steps ?? [])].sort(
    (a, b) => a.stepNumber - b.stepNumber,
  );
  const isPending = submission.reviewStatus === "PENDING";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="space-y-1 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <Link
          href={BACK_HREF}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="size-3.5" />
          Content Management
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
          {submission.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <SubmissionTypeBadge type={submission.submissionType} />
          <ReviewStatusBadge status={submission.reviewStatus} />
          {submission.categoryName && (
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {submission.categoryName}
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* ── The submission, as a visitor would read it ── */}
        <div className="space-y-6 lg:col-span-2">
          <section className={`${CARD} overflow-hidden`}>
            <Cover url={submission.coverImageUrl} title={submission.title} />

            <div className="space-y-3 p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                by{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {submission.authorName}
                </span>{" "}
                · submitted {formatDateTime(submission.submittedAt)}
              </p>

              {(submission.liveUrl ||
                submission.repoUrl ||
                submission.videoUrl) && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {submission.liveUrl && (
                    <ReviewLink href={submission.liveUrl} label="Live demo" />
                  )}
                  {submission.repoUrl && (
                    <ReviewLink href={submission.repoUrl} label="Repository" />
                  )}
                  {submission.videoUrl && (
                    <ReviewLink href={submission.videoUrl} label="Walkthrough" />
                  )}
                </div>
              )}
            </div>
          </section>

          <section className={`${CARD} p-5 sm:p-6`}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Project overview
            </h2>
            <MarkdownView source={submission.overview} />
          </section>

          <section className={`${CARD} space-y-4 p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                <Terminal className="size-4 text-blue-600" />
                Build guide
              </h2>
              <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                {steps.length} {steps.length === 1 ? "step" : "steps"}
              </span>
            </div>

            {steps.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                This submission carries no build steps — worth asking for before
                it goes live.
              </p>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {step.title}
                      </p>
                      <MarkdownView source={step.description} />

                      {step.codeSnippet && (
                        <ShowcaseCodeBlock
                          code={step.codeSnippet}
                        />
                      )}

                      {step.imageUrl && (
                        <StepImage url={step.imageUrl} caption="Screenshot" />
                      )}

                      {step.diagramUrl && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Diagram
                          </p>
                          <ShowcaseDiagramViewer
                            diagramUrl={step.diagramUrl}
                            title={`${step.title} diagram`}
                            stepId={step.id}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Decision ── */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className={`${CARD} space-y-4 p-5`}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Decision
            </h2>

            {isPending ? (
              <>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {submission.submissionType === "REVISION"
                    ? "Approving replaces what is currently live with this version."
                    : "Approving publishes this showcase on the public index."}
                </p>

                <div className="space-y-2.5">
                  <Button
                    type="button"
                    onClick={() => setDecision("APPROVED")}
                    className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 data-icon="inline-start" aria-hidden="true" />
                    Approve and publish
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDecision("REJECTED")}
                    className="h-11 w-full rounded-xl border-rose-200 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  >
                    <XCircle data-icon="inline-start" aria-hidden="true" />
                    Request changes
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Decided
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDateTime(submission.reviewedAt)}
                  </span>
                </p>

                <p className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Reviewer
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {submission.reviewedBy
                      ? submission.reviewedBy
                      : submission.reviewStatus === "APPROVED"
                      ? "Auto-approved"
                      : "—"}
                  </span>
                </p>

                {submission.rejectionReason && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/25 dark:bg-rose-500/10">
                    <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                      Sent back with
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-rose-700 dark:text-rose-200">
                      {submission.rejectionReason}
                    </p>
                  </div>
                )}

                {/* A decision is not final: the same endpoint takes another. */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDecision(
                      submission.reviewStatus === "APPROVED"
                        ? "REJECTED"
                        : "APPROVED",
                    )
                  }
                  className="h-11 w-full rounded-xl text-sm font-semibold"
                >
                  {submission.reviewStatus === "APPROVED"
                    ? "Take it back down"
                    : "Approve after all"}
                </Button>
              </div>
            )}

            {submission.reviewStatus === "APPROVED" && (
              <Link
                href={`/showcases/${submission.showcaseId}`}
                target="_blank"
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ExternalLink className="size-4" />
                View public page
              </Link>
            )}
          </section>

          <ShowcaseReviewHistory id={submission.showcaseId} className={CARD} />
        </aside>
      </div>

      <ShowcaseDecisionDialog
        showcaseId={submission.showcaseId}
        title={submission.title}
        decision={decision}
        isOpen={decision !== null}
        onClose={() => setDecision(null)}
      />
    </motion.div>
  );
}

/**
 * `next/image` only accepts hosts allowed in `next.config.ts`, which covers
 * every `https` host. An author who pasted an `http` or `data:` URL would make
 * it throw during render, so those keep the plain tag.
 */
function isOptimizable(url: string) {
  return url.startsWith("https://") || url.startsWith("/");
}

function Cover({ url, title }: { url?: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const shown = failed ? undefined : url;

  return (
    <>
      <div
        onClick={() => shown && setIsPreviewOpen(true)}
        className={`relative h-60 w-full overflow-hidden bg-slate-950 sm:h-72 dark:bg-slate-950 flex items-center justify-center ${
          shown ? "cursor-pointer group" : ""
        }`}
        title={shown ? "Click to view full cover image" : undefined}
      >
        {shown ? (
          isOptimizable(shown) ? (
            <>
              {/* Ambient Blurred Background Fill */}
              <Image
                src={shown}
                alt=""
                fill
                aria-hidden="true"
                sizes="100px"
                quality={30}
                className="object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none"
              />
              {/* Main Crisp Image */}
              <Image
                src={shown}
                alt={`${title} cover`}
                fill
                quality={90}
                sizes="(max-width: 1024px) 100vw, 720px"
                onError={() => setFailed(true)}
                className="relative z-10 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </>
          ) : (
            <>
              {/* Ambient Blurred Background Fill */}
              <img
                src={shown}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none select-none"
              />
              {/* Main Crisp Image */}
              <img
                src={shown}
                alt={`${title} cover`}
                onError={() => setFailed(true)}
                className="relative z-10 size-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </>
          )
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-slate-400">
            <ImageOff aria-hidden="true" className="size-6" />
            <span className="text-xs font-medium">No cover image</span>
          </div>
        )}

        {shown && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/60 px-2.5 py-1 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 shadow-md">
            <ZoomIn className="size-3.5" />
            <span>Preview</span>
          </div>
        )}
      </div>

      {shown && (
        <ImagePreviewModal
          src={shown}
          alt={`${title} cover`}
          title={`${title} - Cover`}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
}

function StepImage({ url, caption }: { url: string; caption: string }) {
  const [failed, setFailed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  if (failed) return null;

  return (
    <>
      <figure className="space-y-1.5">
        <div
          onClick={() => setIsPreviewOpen(true)}
          className="group relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
          title="Click to view full image"
        >
          {isOptimizable(url) ? (
            <Image
              src={url}
              alt={caption}
              fill
              quality={90}
              sizes="(max-width: 640px) 90vw, 320px"
              onError={() => setFailed(true)}
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={url}
              alt={caption}
              onError={() => setFailed(true)}
              className="absolute inset-0 size-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}

          <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-lg border border-white/20 bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 shadow-md">
            <ZoomIn className="size-3" />
            <span>Preview</span>
          </div>
        </div>
        <figcaption className="text-xs text-slate-500 dark:text-slate-400">
          {caption}
        </figcaption>
      </figure>

      <ImagePreviewModal
        src={url}
        alt={caption}
        title={caption}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}

function ReviewLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <ExternalLink className="size-3.5" />
      {label}
    </a>
  );
}

function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading the submission"
      className="animate-pulse space-y-6 pb-12"
    >
      <span className="sr-only">Loading the submission…</span>
      <div className="space-y-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="h-4 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={`${CARD} overflow-hidden`}>
            <div className="h-52 w-full bg-slate-200 sm:h-64 dark:bg-slate-800" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className={`${CARD} space-y-3 p-5`}>
            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className={`${CARD} space-y-3 p-5`}>
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-11 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-11 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

function DetailError({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <Card
      className={`${CARD} mx-auto max-w-lg space-y-4 p-12 text-center`}
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
        <AlertCircle className="size-7" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{body}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button type="button" onClick={onRetry} className="rounded-xl">
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Try again
          </Button>
        )}
        <Link
          href={BACK_HREF}
          className="inline-flex h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back to moderation
        </Link>
      </div>
    </Card>
  );
}
