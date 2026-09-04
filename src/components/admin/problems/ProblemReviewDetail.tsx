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
  ExternalLink,
  Eye,
  FileText,
  GitBranch,
  Layers,
  ListOrdered,
  Paperclip,
  RotateCcw,
  Tag,
  Terminal,
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
import { cn } from "@/lib/utils";

const CARD =
  "rounded-2xl border border-border bg-card text-card-foreground shadow-xs";

const BACK_HREF = "/dashboard/content-moderation?tab=problems";

function formatDateTime(iso?: string | null) {
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
  const environments = problem.environment ?? [];
  const reproductionSteps = problem.reproductionSteps ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-6 pb-12 font-sans"
    >
      <header className="space-y-2 border-b border-border pb-4">
        <Link
          href={BACK_HREF}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Content Management
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {problem.title ?? "Untitled problem"}
        </h1>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <ProblemStatusBadge status={problem.status} />

          {problem.severity && (
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide border",
                problem.severity === "CRITICAL"
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                  : problem.severity === "HIGH"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  : problem.severity === "MEDIUM"
                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"
                  : "bg-muted text-muted-foreground border-border"
              )}
            >
              {problem.severity}
            </span>
          )}

          {problem.problemType && (
            <span className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground">
              {problem.problemType.replace(/_/g, " ")}
            </span>
          )}

          {problem.category?.name && (
            <span className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground">
              {problem.category.name}
            </span>
          )}

          {problem.sdlcPhase && (
            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {SDLC_LABELS[problem.sdlcPhase] ?? problem.sdlcPhase}
            </span>
          )}
        </div>
      </header>

      {warnings.length > 0 && (
        <div className="flex flex-wrap items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
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
        <div className="space-y-6 lg:col-span-2">
          <section className={`${CARD} space-y-3 p-5`}>
            <p className="text-sm text-muted-foreground">
              by{" "}
              <span className="font-semibold text-foreground">
                {authorNameOf(problem.author)}
              </span>{" "}
              · submitted {formatDateTime(problem.createdAt)}
            </p>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3 sm:grid-cols-4">
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

          {problem.repositoryUrl && (
            <section className={`${CARD} flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <GitBranch className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-foreground">Code Repository</h3>
                  <p className="text-xs text-muted-foreground truncate font-mono">
                    {problem.repositoryUrl}
                  </p>
                </div>
              </div>
              <a
                href={problem.repositoryUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors shrink-0"
              >
                <span>View Repository</span>
                <ExternalLink className="size-3.5" />
              </a>
            </section>
          )}

          {problem.errorMessage && (
            <section className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 space-y-2.5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400">
                <Terminal className="size-4" />
                <span>Reported Error / Stack Trace</span>
              </h2>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                <code>{problem.errorMessage}</code>
              </pre>
            </section>
          )}

          <section className={`${CARD} p-5 sm:p-6 space-y-2`}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </h2>
            {problem.description ? (
              <MarkdownView source={problem.description} />
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                This problem was submitted without a description.
              </p>
            )}
          </section>

          {(problem.expectedBehavior || problem.actualBehavior) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problem.expectedBehavior && (
                <section className={`${CARD} p-5 space-y-2 border-emerald-500/20 bg-emerald-500/5`}>
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    Expected Behavior
                  </h3>
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {problem.expectedBehavior}
                  </div>
                </section>
              )}
              {problem.actualBehavior && (
                <section className={`${CARD} p-5 space-y-2 border-amber-500/20 bg-amber-500/5`}>
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-4" />
                    Actual Behavior
                  </h3>
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {problem.actualBehavior}
                  </div>
                </section>
              )}
            </div>
          )}

          {reproductionSteps.length > 0 && (
            <section className={`${CARD} p-5 sm:p-6 space-y-3`}>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <ListOrdered className="size-4 text-primary" />
                <span>Steps to Reproduce</span>
              </h2>
              <ol className="space-y-2.5">
                {reproductionSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-foreground leading-relaxed pt-0.5">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {problem.attemptsTried && (
            <section className={`${CARD} p-5 sm:p-6 space-y-2`}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Attempts Tried
              </h2>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {problem.attemptsTried}
              </div>
            </section>
          )}

          {environments.length > 0 && (
            <section className={`${CARD} space-y-3 p-5 sm:p-6`}>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Layers className="size-4 text-primary" />
                <span>Environment Specifications</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {environments.map((env, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40 text-sm"
                  >
                    <span className="font-semibold text-foreground">{env.technology}</span>
                    <span className="text-xs font-mono text-muted-foreground">v{env.version}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(technologies.length > 0 || tags.length > 0) && (
            <section className={`${CARD} space-y-4 p-5 sm:p-6`}>
              {technologies.length > 0 && (
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Wrench className="size-4 text-primary" />
                    Stack
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {technologies.map((tech, index) => (
                      <span
                        key={tech.id ?? `${tech.name}-${index}`}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-foreground"
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
                  <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Tag className="size-4 text-primary" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag, index) => (
                      <span
                        key={tag.id ?? `${tag.name}-${index}`}
                        className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
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
                <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Paperclip className="size-4 text-primary" />
                  Attachments
                </h2>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {attachments.length}{" "}
                  {attachments.length === 1 ? "file" : "files"}
                </span>
              </div>

              <div className="space-y-2">
                {attachments.map((file, index) => {
                  const isImg =
                    file.mimeType?.startsWith("image/") ||
                    /\.(png|jpe?g|webp|gif|svg)$/i.test(
                      file.originalFileName || file.downloadUrl || ""
                    );
                  const fileUrl =
                    attachmentUrl(file.downloadUrl) ||
                    (file.id && problem.id
                      ? `/api/problems/${problem.id}/attachments/${file.id}/download`
                      : undefined);

                  return (
                    <div
                      key={file.id ?? `${file.originalFileName}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3"
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
                          className="relative size-12 shrink-0 rounded-lg overflow-hidden border border-border bg-muted cursor-pointer group/thumb flex items-center justify-center"
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
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {file.originalFileName ?? "Unnamed file"}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
                              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-foreground transition hover:bg-muted cursor-pointer"
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
                            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-foreground transition hover:bg-muted"
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

        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className={`${CARD} space-y-4 p-5`}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Decision
            </h2>

            {isPending ? (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Approving publishes this problem on the public feed, open for
                  solutions.
                </p>

                <div className="space-y-2.5">
                  <Button
                    type="button"
                    onClick={() => setDecision("PUBLISHED")}
                    className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <CheckCircle2 data-icon="inline-start" aria-hidden="true" />
                    Approve and publish
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDecision("REJECTED")}
                    className="h-11 w-full rounded-xl border-rose-500/30 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <XCircle data-icon="inline-start" aria-hidden="true" />
                    Reject
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    Last updated
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatDateTime(problem.updatedAt)}
                  </span>
                </p>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setDecision(
                      problem.status === "PUBLISHED" ? "REJECTED" : "PUBLISHED"
                    )
                  }
                  className="h-11 w-full rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {problem.status === "PUBLISHED"
                    ? "Take it back down"
                    : "Publish after all"}
                </Button>
              </div>
            )}

            {problem.status === "PUBLISHED" && (
              <Link
                href="/community"
                target="_blank"
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-muted-foreground transition hover:bg-muted"
              >
                <Eye className="size-4" />
                View in community
              </Link>
            )}
          </section>

          <section className={`${CARD} space-y-3 p-5`}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Author
            </h2>
            <div className="flex items-center gap-3">
              {problem.author?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={problem.author.avatarUrl}
                  alt={authorNameOf(problem.author)}
                  className="size-10 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {authorNameOf(problem.author).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {authorNameOf(problem.author)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {(problem.author as any)?.username ? `@${(problem.author as any).username}` : "Community Member"}
                </p>
              </div>
            </div>
            <dl className="space-y-2 border-t border-border pt-3">
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
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate text-sm font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">
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
      <div className="space-y-2 border-b border-border pb-4">
        <div className="h-4 w-56 rounded-lg bg-muted" />
        <div className="h-8 w-2/3 rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={`${CARD} space-y-3 p-5`}>
            <div className="h-4 w-64 rounded bg-muted" />
            <div className="h-12 w-full rounded bg-muted" />
          </div>
          <div className={`${CARD} space-y-3 p-5`}>
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </div>
        </div>
        <div className={`${CARD} space-y-3 p-5`}>
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-11 w-full rounded-xl bg-muted" />
          <div className="h-11 w-full rounded-xl bg-muted" />
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
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
        <AlertCircle className="size-7" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button type="button" onClick={onRetry} className="rounded-xl cursor-pointer">
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Try again
          </Button>
        )}
        <Link
          href={BACK_HREF}
          className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Back to moderation
        </Link>
      </div>
    </Card>
  );
}
