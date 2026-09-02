"use client";

import React, { useState } from "react";
import { attachmentUrl } from "@/lib/api/attachment-url";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  ExternalLink,
  FileText,
  Paperclip,
  RotateCcw,
  Tag,
  Wrench,
  XCircle,
  ZoomIn,
} from "lucide-react";

import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ProblemDecisionDialog,
  type ProblemDecision,
} from "@/components/admin/problems/ProblemDecisionDialog";
import { ProblemStatusBadge } from "@/components/admin/problems/ProblemStatusBadge";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { useGetProblemByIdQuery } from "@/lib/redux/services/problemsApi";
import { SDLC_LABELS } from "@/lib/validations/problem";
import { authorNameOf } from "@/lib/discussions/format";

/**
 * One problem under review — read through `GET /api/v1/problems/{id}`, decided
 * with `PATCH /admin/problems/{id}/moderation`.
 *
 * Laid out like the showcase review screen so a moderator moving between the
 * two queues reads the same page in the same places. The admin controller has
 * no detail route of its own, which is why the problem is fetched from the
 * problem endpoint rather than an admin-scoped one.
 */

const CARD =
  "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs";

const BACK_HREF = "/dashboard/content-moderation?tab=problems";

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

export function ProblemReviewDetail({ id }: { id: string }) {
  const {
    data: problem,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProblemByIdQuery(id);

  const [decision, setDecision] = useState<ProblemDecision | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt?: string;
    title?: string;
  } | null>(null);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !problem) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;

    return (
      <DetailError
        title={status === 404 ? "Problem not found" : "Something went wrong"}
        body={
          status === 403
            ? "Your account cannot read this problem. Reviewing it may need an administrator role."
            : status === 404
              ? "It may have been deleted, or the link may be wrong."
              : "This problem could not be loaded right now."
        }
        onRetry={
          status === 404 || status === 403 ? undefined : () => void refetch()
        }
      />
    );
  }

  const isPending = problem.status === "PENDING_APPROVAL";
  const warnings = problem.contentWarnings ?? [];
  const technologies = problem.technologies ?? [];
  const tags = problem.tags ?? [];
  const attachments = problem.attachments ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-6 pb-12"
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
          {problem.title ?? "Untitled problem"}
        </h1>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <ProblemStatusBadge status={problem.status} />
          {problem.category?.name && (
            <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {problem.category.name}
            </span>
          )}
          {problem.sdlcPhase && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {SDLC_LABELS[problem.sdlcPhase]}
            </span>
          )}
        </div>
      </header>

      {/* The backend's own automated flags, ahead of everything else — they are
          the reason a reviewer would read the description closely. */}
      {warnings.length > 0 && (
        <div className="flex flex-wrap items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
              Flagged automatically
            </p>
            <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200">
              {warnings.join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* ── The problem, as a reader would meet it ── */}
        <div className="space-y-6 lg:col-span-2">
          <section className={`${CARD} space-y-3 p-5`}>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              by{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {authorNameOf(problem.author)}
              </span>{" "}
              · submitted {formatDateTime(problem.createdAt)}
            </p>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3 sm:grid-cols-4 dark:border-slate-800">
              <Fact label="Views" value={String(problem.viewCount ?? 0)} />
              <Fact
                label="Reputation"
                value={
                  problem.author?.reputation === undefined
                    ? "—"
                    : String(problem.author.reputation)
                }
              />
              <Fact label="Updated" value={formatDateTime(problem.updatedAt)} />
              <Fact
                label="Published"
                value={formatDateTime(problem.publishedAt)}
              />
            </dl>
          </section>

          <section className={`${CARD} p-5 sm:p-6`}>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Description
            </h2>
            {problem.description ? (
              <MarkdownView source={problem.description} />
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                This problem was submitted without a description — worth asking
                for before it goes live.
              </p>
            )}
          </section>

          {(technologies.length > 0 || tags.length > 0) && (
            <section className={`${CARD} space-y-4 p-5 sm:p-6`}>
              {technologies.length > 0 && (
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                    <Wrench className="size-4 text-blue-600" />
                    Stack
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {technologies.map((tech, index) => (
                      <span
                        key={tech.id ?? `${tech.name}-${index}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        {tech.name}
                        {tech.version ? ` ${tech.version}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                    <Tag className="size-4 text-blue-600" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, index) => (
                      <span
                        key={tag.id ?? `${tag.name}-${index}`}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {attachments.length > 0 && (
            <section className={`${CARD} space-y-4 p-5 sm:p-6`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                  <Paperclip className="size-4 text-blue-600" />
                  Attachments
                </h2>
                <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                  {attachments.length}{" "}
                  {attachments.length === 1 ? "file" : "files"}
                </span>
              </div>

              <div className="space-y-2">
                {attachments.map((file, index) => {
                  const isImg =
                    file.mimeType?.startsWith("image/") ||
                    /\.(png|jpe?g|webp|gif|svg)$/i.test(
                      file.originalFileName || file.downloadUrl || "",
                    );
                  const fileUrl =
                    attachmentUrl(file.downloadUrl) ||
                    (file.id && problem.id
                      ? `/api/problems/${problem.id}/attachments/${file.id}/download`
                      : undefined);

                  return (
                    <div
                      key={file.id ?? `${file.originalFileName}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      {isImg && fileUrl ? (
                        <div
                          onClick={() =>
                            setPreviewImage({
                              src: fileUrl,
                              alt: file.originalFileName ?? "Attachment",
                              title:
                                file.originalFileName ?? "Attachment Preview",
                            })
                          }
                          className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-border bg-muted/50 cursor-pointer group/thumb flex items-center justify-center"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fileUrl}
                            alt={file.originalFileName ?? "Attachment"}
                            className="size-full object-cover transition-transform group-hover/thumb:scale-105"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <FileText
                          aria-hidden="true"
                          className="size-4 shrink-0 text-slate-400"
                        />
                      )}
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
                            <ExternalLink className="size-3.5" />
                            Open
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
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
                  Approving publishes this problem on the public feed, open for
                  solutions.
                </p>

                <div className="space-y-2.5">
                  <Button
                    type="button"
                    onClick={() => setDecision("PUBLISHED")}
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
                    Reject
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Last updated
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDateTime(problem.updatedAt)}
                  </span>
                </p>

                {/* A decision is not final: the same endpoint takes another. */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDecision(
                      problem.status === "PUBLISHED" ? "REJECTED" : "PUBLISHED",
                    )
                  }
                  className="h-11 w-full rounded-xl text-sm font-semibold"
                >
                  {problem.status === "PUBLISHED"
                    ? "Take it back down"
                    : "Publish after all"}
                </Button>
              </div>
            )}

            {problem.status === "PUBLISHED" && (
              <Link
                href="/problems"
                target="_blank"
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Eye className="size-4" />
                View problem feed
              </Link>
            )}
          </section>

          <section className={`${CARD} space-y-3 p-5`}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Author
            </h2>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              {authorNameOf(problem.author)}
            </p>
            <dl className="space-y-2">
              <FactRow
                label="Reputation"
                value={
                  problem.author?.reputation === undefined
                    ? "—"
                    : String(problem.author.reputation)
                }
              />
              <FactRow
                label="Submitted"
                value={formatDateTime(problem.createdAt)}
              />
              <FactRow
                label="Revision"
                value={
                  problem.version === undefined ? "—" : `v${problem.version}`
                }
              />
            </dl>
          </section>
        </aside>
      </div>

      <ProblemDecisionDialog
        problemId={problem.id ?? id}
        title={problem.title ?? "This problem"}
        decision={decision}
        isOpen={decision !== null}
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </dt>
      <dd className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </dd>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}

function formatBytes(bytes?: number) {
  if (bytes === undefined || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading the problem"
      className="animate-pulse space-y-6 pb-12"
    >
      <span className="sr-only">Loading the problem…</span>
      <div className="space-y-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="h-4 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={`${CARD} space-y-3 p-5`}>
            <div className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-12 w-full rounded bg-slate-200 dark:bg-slate-800" />
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
    <Card className={`${CARD} mx-auto max-w-lg space-y-4 p-12 text-center`}>
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
