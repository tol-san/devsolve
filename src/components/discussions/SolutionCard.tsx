"use client";

import React, { useState } from "react";
import { attachmentUrl } from "@/lib/api/attachment-url";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  File,
  FileCode2,
  FileText,
  Flag,
  FolderGit2,
  ImageIcon,
  Link2,
  ListChecks,
  MonitorPlay,
  Network,
  Paperclip,
  Pencil,
  Scale,
  Share2,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { ReportContentDialog } from "@/components/comments/ReportCommentDialog";
import { VoteControl } from "@/components/ui/vote-control";
import type {
  ResourceSummary,
  SolutionResponse,
} from "@/lib/redux/services/solutionsApi";
import {
  useGetVoteSummaryQuery,
  useRemoveVoteMutation,
  useSetVoteMutation,
} from "@/lib/redux/services/votesApi";
import { authClient } from "@/lib/auth/auth-client";
import { useKeycloakLogin } from "@/hooks/useKeycloakLogin";
import {
  APPROACH_LABELS,
  RESOURCE_LABELS,
  type ApproachType,
  type ResourceType,
} from "@/lib/validations/solution";
import {
  authorNameOf,
  formatBytes,
  formatDate,
  initialsOf,
} from "@/lib/discussions/format";

interface SolutionCardProps {
  solution: SolutionResponse;
  index: number;
  canAccept?: boolean;
  onAccept?: (solutionId: string) => void;
  onUnaccept?: (solutionId: string) => void;
  isAccepting?: boolean;
  accepted?: boolean;
  isMine?: boolean;
  canReport?: boolean;
}

const COLLAPSE_OVER = 900;

const APPROACH_STYLES: Record<ApproachType, string> = {
  FIX: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold",
  WORKAROUND:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold",
  EXPLANATION:
    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-bold",
  ALTERNATIVE:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold",
};

const RESOURCE_ICONS: Record<ResourceType, LucideIcon> = {
  DOCUMENTATION: BookOpen,
  REPOSITORY: FolderGit2,
  VIDEO: Video,
  DIAGRAM: Network,
  DEMO: MonitorPlay,
  ARTICLE: FileCode2,
};

// ── File type classifier ──────────────────────────────────────────────────────

interface FileTypeInfo {
  label: string;
  Icon: LucideIcon;
  /** Tailwind colour classes for icon bg + text */
  color: string;
  /** true when we can render an <img> thumbnail */
  isImage: boolean;
  isPdf: boolean;
  isCode: boolean;
}

function getFileTypeInfo(mimeType?: string, fileName?: string): FileTypeInfo {
  const name = fileName ?? "";
  const mime = mimeType ?? "";

  const isImage =
    mime.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg|bmp|ico)$/i.test(name);
  const isPdf =
    mime === "application/pdf" || /\.pdf$/i.test(name);
  const isCode =
    mime.startsWith("text/") ||
    /\.(txt|json|js|ts|tsx|jsx|py|java|c|cpp|cs|go|rs|rb|php|html|css|sql|sh|yaml|yml|xml|log|md)$/i.test(
      name
    );
  const isVideo =
    mime.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv)$/i.test(name);

  if (isImage)
    return { label: "Image", Icon: ImageIcon, color: "bg-sky-500/10 text-sky-600 dark:text-sky-400", isImage: true, isPdf: false, isCode: false };
  if (isPdf)
    return { label: "PDF", Icon: FileText, color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", isImage: false, isPdf: true, isCode: false };
  if (isCode)
    return { label: "Code", Icon: FileCode2, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", isImage: false, isPdf: false, isCode: true };
  if (isVideo)
    return { label: "Video", Icon: Video, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", isImage: false, isPdf: false, isCode: false };

  return { label: "File", Icon: File, color: "bg-muted text-muted-foreground", isImage: false, isPdf: false, isCode: false };
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  index,
  canAccept = false,
  onAccept,
  onUnaccept,
  isAccepting = false,
  accepted,
  isMine = false,
  canReport = false,
}) => {
  const { data: votes } = useGetVoteSummaryQuery({
    type: "SOLUTION",
    targetId: solution.id,
  });

  const [setVote, { isLoading: isSettingVote }] = useSetVoteMutation();
  const [removeVote, { isLoading: isRemovingVote }] = useRemoveVoteMutation();
  const isVoting = isSettingVote || isRemovingVote;

  const body = solution.bodyMarkdown ?? "";
  const [expanded, setExpanded] = useState(body.length <= COLLAPSE_OVER);
  const [reporting, setReporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt?: string;
    title?: string;
    mimeType?: string;
  } | null>(null);
  const isLong = body.length > COLLAPSE_OVER;

  const upvoteCount = votes?.upvotes;
  const downvoteCount = votes?.downvotes;
  const voteScore = votes?.score ?? solution.voteScore ?? 0;
  const isAccepted = accepted ?? Boolean(solution.isAccepted);
  const author = solution.author;
  const name = authorNameOf(author);

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

  const { data: session } = authClient.useSession();
  const { handleLogin } = useKeycloakLogin();

  const castVote = async (value: 1 | -1) => {
    if (!session?.user) {
      void handleLogin(
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : `/problems/${solution.problemId || ""}`,
      );
      return;
    }
    if (isVoting) return;
    const target = { type: "SOLUTION" as const, targetId: solution.id };
    const current = votes?.currentUserVote;
    if (current === value) await removeVote(target);
    else await setVote({ ...target, value });
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      url.hash = `solution-${solution.id}`;
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <motion.article
        id={`solution-${solution.id}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.06 }}
        className={cn(
          "scroll-mt-28 overflow-hidden rounded-2xl border bg-card shadow-sm transition-all",
          isAccepted
            ? "border-emerald-500/40 ring-1 ring-emerald-500/15 shadow-emerald-500/5"
            : "border-border/80 hover:border-border hover:shadow-md"
        )}
      >
        {/* Accepted Solution Top Banner */}
        {isAccepted && (
          <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/5 px-5 sm:px-6 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Check className="size-3 stroke-[3]" />
              </div>
              <span className="font-bold uppercase tracking-wider">Accepted Solution</span>
            </div>
            <span className="hidden sm:inline text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              Verified by problem author
            </span>
          </div>
        )}

        {/* Main Solution Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Top Header Row: Author + Status Badges + Action Buttons */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {author?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={author.avatarUrl}
                  alt=""
                  className="size-10 shrink-0 rounded-full border border-border bg-muted object-cover shadow-sm"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-sm font-bold text-muted-foreground shadow-sm">
                  {initialsOf(name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {author?.reputation !== undefined
                    ? `${author.reputation.toLocaleString()} rep · `
                    : ""}
                  {formatDate(solution.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {solution.approachType && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-lg px-2.5 py-1 text-xs uppercase tracking-wider shadow-sm",
                    APPROACH_STYLES[solution.approachType]
                  )}
                >
                  {APPROACH_LABELS[solution.approachType]}
                </span>
              )}

              {canAccept && !isAccepted && onAccept && (
                <button
                  type="button"
                  onClick={() => onAccept(solution.id)}
                  disabled={isAccepting}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-50 dark:border-emerald-500/40 dark:text-emerald-300 transition-all active:scale-95 shadow-sm"
                >
                  <Check aria-hidden="true" className="size-3.5 stroke-[2.5]" />
                  <span>Accept Solution</span>
                </button>
              )}

              {canAccept && isAccepted && onUnaccept && (
                <button
                  type="button"
                  onClick={() => onUnaccept(solution.id)}
                  disabled={isAccepting}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                >
                  <X aria-hidden="true" className="size-3.5" />
                  <span>Unaccept</span>
                </button>
              )}

              {isMine && solution.problemId && (
                <Link
                  href={`/community/${solution.problemId}/solutions/${solution.id}/edit`}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 text-xs font-semibold text-foreground hover:bg-muted transition-all active:scale-95 shadow-sm"
                >
                  <Pencil aria-hidden="true" className="size-3.5 text-primary" />
                  <span>Edit</span>
                </Link>
              )}

              {canReport && (
                <button
                  type="button"
                  onClick={() => {
                    if (!session?.user) {
                      void handleLogin(
                        typeof window !== "undefined"
                          ? `${window.location.pathname}${window.location.search}`
                          : `/problems/${solution.problemId || ""}`,
                      );
                      return;
                    }
                    setReporting(true);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-border/80 bg-background/80 text-muted-foreground hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/30 transition-all active:scale-95 shadow-sm cursor-pointer"
                  title="Report solution"
                >
                  <Flag className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Solution Summary / Title */}
          {solution.summary && (
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-snug -mt-1">
              {solution.summary}
            </h3>
          )}

          {/* Divider */}
          <div className="h-px bg-border/60" />

          {/* Body Markdown Content */}
          {body ? (
            <div className="relative text-foreground leading-relaxed">
              <div
                id={`solution-body-${solution.id}`}
                className={
                  expanded
                    ? undefined
                    : "max-h-72 overflow-hidden mask-[linear-gradient(to_bottom,black_60%,transparent)]"
                }
              >
                <MarkdownView source={body} />
              </div>

              {isLong && (
                <button
                  type="button"
                  onClick={() => setExpanded((open) => !open)}
                  aria-expanded={expanded}
                  aria-controls={`solution-body-${solution.id}`}
                  className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all shadow-sm"
                >
                  {expanded ? (
                    <>
                      <ChevronUp aria-hidden="true" className="size-3.5" />
                      <span>Show less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown aria-hidden="true" className="size-3.5" />
                      <span>Read full answer</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This answer was posted without a body.
            </p>
          )}

          {/* Verification Steps ("How to Verify") */}
          {verificationSteps.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground">
                  <div className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <ListChecks className="size-3.5" />
                  </div>
                  <span>How to verify</span>
                </div>
                <span className="rounded-full border border-border/80 bg-background px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground tabular-nums">
                  {verificationSteps.length} {verificationSteps.length === 1 ? "step" : "steps"}
                </span>
              </div>

              {/* Steps */}
              <ol className="divide-y divide-border/40">
                {verificationSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-4 px-4 py-3.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-black tabular-nums text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="font-mono text-sm font-semibold text-foreground break-all">
                        {step.instruction}
                      </div>
                      {step.expectedResult && (
                        <div className="flex items-start gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            Expected:
                          </span>
                          <span className="text-foreground/80 font-medium">{step.expectedResult}</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tested With Technologies */}
          {testedWith.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Tested with</span>
              </div>
              {testedWith.map((entry, i) => (
                <span
                  key={`${entry.technology}-${i}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-muted/50 px-2.5 py-1 font-mono text-xs font-semibold text-foreground shadow-sm"
                >
                  <span>{entry.technology}</span>
                  {entry.version && (
                    <span className="text-muted-foreground">{entry.version}</span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Trade-offs Panel */}
          {solution.tradeoffs && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                <Scale className="size-3.5" />
                <span>Trade-offs & Considerations</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {solution.tradeoffs}
              </p>
            </div>
          )}

          {/* Resources & Attachments */}
          {(resources.length > 0 || attachments.length > 0) && (
            <div className="space-y-3 pt-1 border-t border-border/60">
              {/* Resources row – unchanged pill style */}
              {resources.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {resources.map((resource, i) => (
                    <ResourceLink key={resource.id ?? i} resource={resource} />
                  ))}
                </div>
              )}

              {/* Attachments as rich cards */}
              {attachments.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Paperclip className="size-3.5" />
                    {attachments.length === 1 ? "1 attachment" : `${attachments.length} attachments`}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((file, i) => {
                      const fileUrl =
                        attachmentUrl(file.downloadUrl) ||
                        (file.id && solution.id
                          ? `/api/solutions/${solution.id}/attachments/${file.id}/download`
                          : undefined);

                      if (!fileUrl) return null;

                      const typeInfo = getFileTypeInfo(file.mimeType, file.fileName ?? undefined);
                      const { Icon, color, isImage } = typeInfo;

                      return (
                        <div
                          key={file.id ?? i}
                          className="group flex items-stretch rounded-xl border border-border/80 bg-background/80 overflow-hidden shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                        >
                          {/* Thumbnail / icon panel */}
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                src: fileUrl,
                                alt: file.fileName ?? "Attachment",
                                title: file.fileName ?? "Attachment Preview",
                                mimeType: file.mimeType,
                              })
                            }
                            className="relative flex w-14 shrink-0 items-center justify-center bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer border-r border-border/60"
                            title="Click to preview"
                            aria-label={`Preview ${file.fileName ?? "attachment"}`}
                          >
                            {isImage ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={fileUrl}
                                  alt=""
                                  className="h-14 w-14 object-cover"
                                  loading="lazy"
                                />
                                {/* hover overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                                  <Eye className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                                </div>
                              </>
                            ) : (
                              <div className={cn("flex size-9 items-center justify-center rounded-lg", color)}>
                                <Icon className="size-4.5" />
                              </div>
                            )}
                          </button>

                          {/* File info */}
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                src: fileUrl,
                                alt: file.fileName ?? "Attachment",
                                title: file.fileName ?? "Attachment Preview",
                                mimeType: file.mimeType,
                              })
                            }
                            className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2 text-left hover:bg-muted/30 transition-colors cursor-pointer"
                            title="Click to preview"
                          >
                            <span className="truncate text-sm font-semibold text-foreground leading-snug">
                              {file.fileName ?? "Attachment"}
                            </span>
                            <span className="mt-0.5 text-xs text-muted-foreground">
                              {typeInfo.label}
                              {file.fileSize !== undefined && (
                                <> · {formatBytes(file.fileSize)}</>
                              )}
                            </span>
                          </button>

                          {/* Download action */}
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            download={file.fileName ?? "attachment"}
                            onClick={(e) => e.stopPropagation()}
                            className="flex shrink-0 items-center justify-center w-10 border-l border-border/60 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                            title="Download attachment"
                            aria-label={`Download ${file.fileName ?? "attachment"}`}
                          >
                            <Download aria-hidden="true" className="size-3.5" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-5 sm:px-6 py-3">
          {/* Left: Voting */}
          <VoteControl
            voteCount={voteScore}
            upvotes={upvoteCount}
            downvotes={downvoteCount}
            currentVote={votes?.currentUserVote ?? 0}
            onVote={castVote}
            isLoading={isVoting}
            orientation="horizontal"
            upvoteLabel="Upvote this solution"
            downvoteLabel="Downvote this solution"
          />

          {/* Right: Share with animated feedback */}
          <button
            type="button"
            onClick={handleShare}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-sm",
              copied
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border/80 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title="Copy link to this solution"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="size-3.5" />
                  <span className="hidden sm:inline">Copied!</span>
                </motion.span>
              ) : (
                <motion.span
                  key="share"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Share2 className="size-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.article>

      <ReportContentDialog
        contentId={solution.id}
        contentType="SOLUTION"
        authorName={name}
        open={reporting}
        onOpenChange={setReporting}
      />

      <ImagePreviewModal
        src={previewImage?.src ?? null}
        alt={previewImage?.alt ?? "Attachment"}
        title={previewImage?.title}
        mimeType={previewImage?.mimeType}
        isOpen={previewImage !== null}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
};

function ResourceLink({ resource }: { resource: ResourceSummary }) {
  const Icon = resource.type ? RESOURCE_ICONS[resource.type] : Link2;
  const label =
    resource.label ||
    (resource.type ? RESOURCE_LABELS[resource.type] : "Resource");

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 px-3 text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 transition-all active:scale-95 shadow-sm"
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </a>
  );
}
