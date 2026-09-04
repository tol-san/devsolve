"use client";

import React, { useState } from "react";
import { attachmentUrl } from "@/lib/api/attachment-url";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileCode2,
  Flag,
  FolderGit2,
  Link2,
  ListChecks,
  MonitorPlay,
  Network,
  Pencil,
  Scale,
  Video,
  X,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { MarkdownView } from "@/components/showcases/detail/MarkdownView";
import { ReportContentDialog } from "@/components/comments/ReportCommentDialog";
import { Button } from "@/components/ui/button";
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
  FIX: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
  WORKAROUND:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25",
  EXPLANATION:
    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25",
  ALTERNATIVE:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25",
};

const RESOURCE_ICONS: Record<ResourceType, LucideIcon> = {
  DOCUMENTATION: BookOpen,
  REPOSITORY: FolderGit2,
  VIDEO: Video,
  DIAGRAM: Network,
  DEMO: MonitorPlay,
  ARTICLE: FileCode2,
};

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

  return (
    <>
      <motion.article
        id={`solution-${solution.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.05 }}
        className={cn(
          "scroll-mt-28 overflow-hidden rounded-2xl border bg-card shadow-xs transition-colors",
          isAccepted
            ? "border-emerald-500/40 dark:border-emerald-500/40 ring-1 ring-emerald-500/15"
            : "border-border"
        )}
      >
        {isAccepted && (
          <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/5 px-5 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
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

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:gap-6">
          {/* Vote rail — clean vertical column */}
          <VoteControl
            voteCount={voteScore}
            upvotes={upvoteCount}
            downvotes={downvoteCount}
            currentVote={votes?.currentUserVote ?? 0}
            onVote={castVote}
            isLoading={isVoting}
            upvoteLabel="Upvote this answer"
            downvoteLabel="Downvote this answer"
            orientation="vertical"
            className="shrink-0 self-start"
          />

          <div className="min-w-0 flex-1 space-y-4">
            {/* ── Who, and what kind of answer ── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {author?.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={author.avatarUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-full border border-border bg-muted object-cover shadow-2xs"
                  />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-xs font-bold text-muted-foreground shadow-2xs">
                    {initialsOf(name)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm sm:text-base font-bold text-foreground">
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {author?.reputation !== undefined
                      ? `${author.reputation.toLocaleString()} reputation · `
                      : ""}
                    {formatDate(solution.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {solution.approachType && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
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
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-50 dark:border-emerald-500/40 dark:text-emerald-300 transition-colors shadow-2xs"
                  >
                    <Check aria-hidden="true" className="size-3.5" />
                    <span>Accept Solution</span>
                  </button>
                )}

                {canAccept && isAccepted && onUnaccept && (
                  <button
                    type="button"
                    onClick={() => onUnaccept(solution.id)}
                    disabled={isAccepting}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors shadow-2xs"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                    <span>Unaccept</span>
                  </button>
                )}

                {isMine && solution.problemId && (
                  <Link
                    href={`/community/${solution.problemId}/solutions/${solution.id}/edit`}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
                  >
                    <Pencil aria-hidden="true" className="size-3.5" />
                    <span>Edit</span>
                  </Link>
                )}

                {canReport && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
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
                    className="h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Flag className="size-3.5 mr-1" />
                    <span>Report</span>
                  </Button>
                )}
              </div>
            </div>

            {/* ── The one-liner ── */}
            {solution.summary && (
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {solution.summary}
              </h3>
            )}

            {/* ── The answer itself ── */}
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
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp aria-hidden="true" className="size-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown aria-hidden="true" className="size-4" />
                        Read the full answer
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

            {/* ── How to check it worked ── */}
            {verificationSteps.length > 0 && (
              <Panel
                icon={<ListChecks aria-hidden="true" className="size-4 text-primary" />}
                title="How to verify"
              >
                <ol className="space-y-3">
                  {verificationSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-bold tabular-nums text-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {step.instruction}
                        </p>
                        {step.expectedResult && (
                          <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Expected: </span>
                            <span>{step.expectedResult}</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}

            {/* ── What it was proven against ── */}
            {testedWith.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tested with
                </span>
                {testedWith.map((entry, i) => (
                  <span
                    key={`${entry.technology}-${i}`}
                    className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 font-mono text-xs font-semibold text-foreground"
                  >
                    {entry.technology}
                    {entry.version ? ` ${entry.version}` : ""}
                  </span>
                ))}
              </div>
            )}

            {/* ── What it costs ── */}
            {solution.tradeoffs && (
              <Panel
                icon={<Scale aria-hidden="true" className="size-4 text-primary" />}
                title="Trade-offs"
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {solution.tradeoffs}
                </p>
              </Panel>
            )}

            {/* ── Links and files ── */}
            {(resources.length > 0 || attachments.length > 0) && (
              <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3.5">
                {resources.map((resource, i) => (
                  <ResourceLink key={resource.id ?? i} resource={resource} />
                ))}
                {attachments.map((file, i) => {
                  const fileUrl =
                    attachmentUrl(file.downloadUrl) ||
                    (file.id && solution.id
                      ? `/api/solutions/${solution.id}/attachments/${file.id}/download`
                      : undefined);

                  return fileUrl ? (
                    <div
                      key={file.id ?? i}
                      className="inline-flex items-center rounded-lg border border-border bg-background shadow-2xs overflow-hidden"
                    >
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
                        className="inline-flex h-8 max-w-full items-center gap-1.5 px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="Click to preview"
                      >
                        <Eye aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">
                          {file.fileName ?? "Attachment"}
                        </span>
                        {file.fileSize !== undefined && (
                          <span className="shrink-0 font-medium text-muted-foreground">
                            {formatBytes(file.fileSize)}
                          </span>
                        )}
                      </button>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        download={file.fileName ?? "attachment"}
                        className="inline-flex h-8 w-8 items-center justify-center border-l border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Download attachment"
                      >
                        <Download aria-hidden="true" className="size-3.5 shrink-0" />
                        <span className="sr-only">Download</span>
                      </a>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
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

function Panel({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-muted/25 p-4 sm:p-5 space-y-2.5">
      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{title}</span>
      </h4>
      {children}
    </section>
  );
}

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
      className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs"
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </a>
  );
}
