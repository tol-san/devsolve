"use client";

import React, { useState } from "react";
import { attachmentUrl } from "@/lib/api/attachment-url";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  ImageIcon,
  ListChecks,
  Link2,
  Paperclip,
  RotateCcw,
  Scale,
  Video,
  XCircle,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";

import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SolutionDecisionDialog,
  type SolutionDecision,
} from "@/components/admin/solutions/SolutionDecisionDialog";
import { ReviewBadge } from "@/components/admin/solutions/SolutionReviewQueue";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { useGetAdminSolutionDetailQuery } from "@/lib/redux/services/admin/solutionAdminApi";
import { useGetProblemByIdQuery } from "@/lib/redux/services/problemsApi";
import { APPROACH_LABELS, RESOURCE_LABELS } from "@/lib/validations/solution";
import {
  authorNameOf,
  formatBytes,
  initialsOf,
} from "@/lib/discussions/format";
import { excerptOf } from "@/lib/markdown-excerpt";

const CARD =
  "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs";

const BACK_HREF = "/dashboard/content-moderation?tab=solutions";

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

export function SolutionReviewDetail({ id }: { id: string }) {
  const {
    data: solution,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAdminSolutionDetailQuery(id);

  const [decision, setDecision] = useState<SolutionDecision | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt?: string;
    title?: string;
  } | null>(null);

  const { data: problem } = useGetProblemByIdQuery(solution?.problemId ?? "", {
    skip: !solution?.problemId,
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !solution) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;

    return (
      <DetailError
        title={status === 404 ? "Solution not found" : "Something went wrong"}
        body={
          status === 403
            ? "Your account cannot read this solution. Reviewing it may need an administrator role."
            : status === 404
              ? "It may have been deleted, or the link may be wrong."
              : "This solution could not be loaded right now."
        }
        onRetry={
          status === 404 || status === 403 ? undefined : () => void refetch()
        }
      />
    );
  }

  const solutionBody =
    solution.bodyMarkdown?.trim() || solution.description?.trim() || "";
  const title =
    solution.summary?.trim() ||
    excerptOf(solutionBody, 96) ||
    "Solution details";
  const review =
    solution.moderation?.status ?? solution.reviewStatus ?? "PENDING";
  const isPending = review === "PENDING";
  const isAccepted = solution.isAccepted || review === "ACCEPTED";
  const reviewedAt = solution.moderation?.reviewedAt ?? solution.reviewedAt;
  const reviewedBy = solution.moderation?.reviewedBy ?? solution.reviewedBy;
  const rejectionReason =
    solution.moderation?.rejectionReason ?? solution.rejectionReason;
  const verificationSteps = (solution.verificationSteps ?? []).filter(
    (step) => step.instruction || step.expectedResult,
  );
  const testedWith = (solution.testedWith ?? []).filter(
    (entry) => entry.technology,
  );
  const resources = (solution.resources ?? []).filter((item) => item.url);
  const attachments = (solution.attachments ?? []).filter(
    (file) => file.downloadUrl,
  );
  const author = solution.author;
  const authorLabel = authorNameOf(
    author,
    solution.authorId ? "Author account" : "Unknown author",
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 w-full pb-12"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            href={BACK_HREF}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="size-3.5" />
            Content Management
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            {title}
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review the submitted solution and its supporting evidence. Posted{" "}
            {formatDateTime(solution.createdAt)}.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          <ReviewBadge status={review} />
          {solution.approachType && (
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {APPROACH_LABELS[solution.approachType]}
            </span>
          )}
          {isAccepted && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              Accepted by asker
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {solution.problemId && (
            <section
              className={`${CARD} p-4 sm:p-5`}
              aria-labelledby="answering-heading"
            >
              <h2
                id="answering-heading"
                className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                Answers this problem
              </h2>
              <Link
                href={`/community/${solution.problemId}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-start gap-1.5 text-base font-bold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
              >
                {problem?.title ?? "Open the problem"}
                <ExternalLink
                  aria-hidden="true"
                  className="mt-1 size-3.5 shrink-0"
                />
              </Link>
              {problem?.description && (
                <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {problem.description}
                </p>
              )}
            </section>
          )}

          <section className={`${CARD} p-4 sm:p-6`}>
            <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              The answer
            </h2>
            {solutionBody ? (
              <MarkdownView source={solutionBody} />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This answer was posted without a body.
              </p>
            )}

            {(solution.videoUrl || solution.diagramUrl) && (
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="mb-2.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                  Supporting material
                </h3>
                <div className="flex flex-wrap gap-2">
                  {solution.videoUrl && (
                    <SupportingLink
                      href={solution.videoUrl}
                      label="Video walkthrough"
                      icon={Video}
                    />
                  )}
                  {solution.diagramUrl && (
                    <SupportingLink
                      href={solution.diagramUrl}
                      label="Solution diagram"
                      icon={ImageIcon}
                    />
                  )}
                </div>
              </div>
            )}

            {verificationSteps.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <ListChecks aria-hidden="true" className="size-3.5" />
                  How to verify
                </h3>
                <ol className="space-y-2.5">
                  {verificationSteps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold tabular-nums text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {index + 1}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          {step.instruction}
                        </p>
                        {step.expectedResult && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Expect: </span>
                            {step.expectedResult}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {solution.tradeoffs && (
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <Scale aria-hidden="true" className="size-3.5" />
                  Trade-offs
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {solution.tradeoffs}
                </p>
              </div>
            )}

            {resources.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <Link2 aria-hidden="true" className="size-3.5" />
                  Resources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resources.map((resource, index) => (
                    <a
                      key={resource.id ?? index}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <span className="truncate">
                        {resource.label ||
                          (resource.type
                            ? RESOURCE_LABELS[resource.type]
                            : "Resource")}
                      </span>
                      <ExternalLink
                        aria-hidden="true"
                        className="size-3 shrink-0 text-slate-400"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <Paperclip aria-hidden="true" className="size-3.5" />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {attachments.map((file, index) => {
                    const isImg =
                      file.mimeType?.startsWith("image/") ||
                      /\.(png|jpe?g|webp|gif|svg)$/i.test(
                        file.originalFileName || file.downloadUrl || "",
                      );
                    const fileUrl = attachmentUrl(file.downloadUrl);

                    return (
                      <div
                        key={file.id ?? index}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {file.originalFileName ?? "Unnamed file"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {[file.mimeType, formatBytes(file.sizeBytes)]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </p>
                        </div>
                        {fileUrl && (
                          <div className="flex items-center gap-2">
                            {isImg && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage({
                                    src: fileUrl,
                                    alt: file.originalFileName ?? "Attachment",
                                    title:
                                      file.originalFileName ??
                                      "Attachment Preview",
                                  })
                                }
                                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                <ZoomIn
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                                Preview
                              </button>
                            )}
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <Download
                                aria-hidden="true"
                                className="size-3.5"
                              />
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className={`${CARD} p-4 sm:p-5`}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Decision
            </h2>

            {isPending ? (
              <div className="space-y-2.5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Approving publishes this answer on the problem it answers.
                </p>
                <Button
                  type="button"
                  onClick={() => setDecision("APPROVED")}
                  className="h-10 w-full cursor-pointer rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 data-icon="inline-start" aria-hidden="true" />
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDecision("REJECTED")}
                  className="h-10 w-full cursor-pointer rounded-xl border-rose-200 font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  <XCircle data-icon="inline-start" aria-hidden="true" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Outcome
                  </span>
                  <ReviewBadge status={review} />
                </div>
                <Row
                  label="Reviewed"
                  value={formatDateTime(reviewedAt)}
                />
                {rejectionReason && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                    <span className="font-bold">Reason: </span>
                    {rejectionReason}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className={`${CARD} p-4 text-sm sm:p-5`}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Author
            </h2>
            <div className="flex items-center gap-3">
              {author?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={author.avatarUrl}
                  alt=""
                  className="size-10 shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover dark:border-slate-700 dark:bg-slate-800"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {initialsOf(authorLabel)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                  {authorLabel}
                </p>
                {author?.reputation !== undefined ? (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {author.reputation.toLocaleString()} reputation
                  </p>
                ) : solution.authorId ? (
                  <p className="truncate font-mono text-sm text-slate-500 dark:text-slate-400">
                    {solution.authorId}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className={`${CARD} space-y-3 p-4 text-sm sm:p-5`}>
            <h2 className="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500">
              Signals
            </h2>
            <Row
              label="Votes"
              value={(solution.voteScore ?? 0).toLocaleString()}
            />
            <Row
              label="Comments"
              value={(solution.commentCount ?? 0).toLocaleString()}
            />
            <Row
              label="Verification steps"
              value={String(verificationSteps.length)}
            />
            <Row label="Attachments" value={String(attachments.length)} />
            <Row label="Submitted" value={formatDateTime(solution.createdAt)} />
            <Row label="Updated" value={formatDateTime(solution.updatedAt)} />
            {reviewedBy && <Row label="Reviewed by" value={reviewedBy} />}
            <Row label="Solution ID" value={solution.id} />
            {testedWith.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Tested with
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {testedWith.map((entry, index) => (
                    <span
                      key={`${entry.technology}-${index}`}
                      className="rounded-lg border border-slate-200 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {entry.technology}
                      {entry.version ? ` ${entry.version}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>

      <SolutionDecisionDialog
        solutionId={id}
        title={title}
        decision={decision}
        isOpen={Boolean(decision)}
        onClose={() => setDecision(null)}
      />

      <ImagePreviewModal
        src={previewImage?.src ?? null}
        alt={previewImage?.alt ?? "Attachment"}
        title={previewImage?.title}
        isOpen={previewImage !== null}
        onClose={() => setPreviewImage(null)}
      />
    </motion.div>
  );
}

function SupportingLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <Icon aria-hidden="true" className="size-4 text-slate-400" />
      {label}
      <ExternalLink aria-hidden="true" className="size-3.5 text-slate-400" />
    </a>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span
        title={value}
        className="min-w-0 break-words text-right text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {value}
      </span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading the solution"
      className="w-full animate-pulse space-y-6 pb-12"
    >
      <span className="sr-only">Loading the solution…</span>
      <div className="space-y-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="h-4 w-44 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 w-52 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <div className={`${CARD} h-24`} />
          <div className={`${CARD} h-96`} />
        </div>
        <div className="space-y-6">
          <div className={`${CARD} h-44`} />
          <div className={`${CARD} h-28`} />
          <div className={`${CARD} h-48`} />
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
    <div className="w-full pb-12">
      <Card className="mx-auto max-w-lg space-y-4 rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="size-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
            {body}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <Button type="button" onClick={onRetry} className="rounded-xl">
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              Try again
            </Button>
          )}
          <Link
            href={BACK_HREF}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            <ArrowLeft className="size-4" />
            Back to Content Management
          </Link>
        </div>
      </Card>
    </div>
  );
}
