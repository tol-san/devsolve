"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
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

/**
 * One answer on a problem, off `SolutionResponse`.
 *
 * The response embeds its author and its own `voteScore`, so neither needs a
 * follow-up request; the vote summary is still read because it is the only
 * thing that says how *this* reader voted.
 *
 * Long answers are collapsed by default. A page with six of them is unreadable
 * otherwise, and the summary line is written to be enough to choose by.
 */

interface SolutionCardProps {
  solution: SolutionResponse;
  index: number;
  /** Shown only to whoever may accept — the problem's author. */
  canAccept?: boolean;
  onAccept?: (solutionId: string) => void;
  /** Withdrawing an acceptance. Several answers may be accepted at once, so
   *  each card offers to undo its own rather than clearing the problem's. */
  onUnaccept?: (solutionId: string) => void;
  isAccepting?: boolean;
  /** The problem's own list wins over the solution's flag when the two
   *  disagree, which they do for a moment after accepting. */
  accepted?: boolean;
  /** Whether the reader wrote this answer, so only they are offered Edit. */
  isMine?: boolean;
  /** Signed-in readers may report another person's answer. */
  canReport?: boolean;
}

/** Roughly a screenful. Past this the body is worth folding away. */
const COLLAPSE_OVER = 900;

const APPROACH_STYLES: Record<ApproachType, string> = {
  FIX: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  WORKAROUND:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  EXPLANATION:
    "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
  ALTERNATIVE:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20",
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
  } | null>(null);
  const isLong = body.length > COLLAPSE_OVER;

  /* The summary is authoritative once loaded; until then the score that came
     with the solution itself is the better guess than zero. */
  const upvoteCount = votes?.upvotes ?? 0;

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
    // Voting the same way twice clears the vote, the way every such rail works.
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
        className={`scroll-mt-28 overflow-hidden rounded-2xl border bg-white shadow-xs transition-colors dark:bg-neutral-900 ${
          isAccepted
            ? "border-emerald-400 ring-1 ring-emerald-400/30 dark:border-emerald-500/50 dark:ring-emerald-500/20"
            : "border-slate-200/80 dark:border-neutral-800"
        }`}
      >
      {isAccepted && (
        <p className="flex items-center gap-1.5 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 aria-hidden="true" className="size-3.5" />
          Accepted answer
        </p>
      )}

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
        {/* Vote rail — a row on a phone, a column from `sm` up. */}
        <VoteControl
          voteCount={upvoteCount}
          currentVote={votes?.currentUserVote ?? 0}
          onVote={castVote}
          isLoading={isVoting}
          upvoteLabel="Upvote this answer"
          downvoteLabel="Downvote this answer"
          className="shrink-0 self-start"
        />

        <div className="min-w-0 flex-1 space-y-4">
          {/* ── Who, and what kind of answer ── */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {author?.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={author.avatarUrl}
                  alt=""
                  className="size-9 shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover dark:border-neutral-700 dark:bg-neutral-800"
                />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-neutral-800 dark:text-neutral-300">
                  {initialsOf(name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-neutral-100">
                  {name}
                </p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
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
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                    APPROACH_STYLES[solution.approachType]
                  }`}
                >
                  {APPROACH_LABELS[solution.approachType]}
                </span>
              )}

              {/* Accepting is additive — more than one answer may be marked —
                  so the button is a toggle on each card rather than a single
                  choice across the page. */}
              {canAccept && !isAccepted && onAccept && (
                <button
                  type="button"
                  onClick={() => onAccept(solution.id)}
                  disabled={isAccepting}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-300 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-500/40 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                >
                  <Check aria-hidden="true" className="size-3.5" />
                  Accept
                </button>
              )}

              {canAccept && isAccepted && onUnaccept && (
                <button
                  type="button"
                  onClick={() => onUnaccept(solution.id)}
                  disabled={isAccepting}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <X aria-hidden="true" className="size-3.5" />
                  Unaccept
                </button>
              )}

              {/* Only the author, and only when the answer knows which problem
                  it belongs to — the edit route is nested under it. */}
              {isMine && solution.problemId && (
                <Link
                  href={`/community/${solution.problemId}/solutions/${solution.id}/edit`}
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                  Edit
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
                  className="rounded-xl text-muted-foreground cursor-pointer"
                >
                  <Flag data-icon="inline-start" />
                  Report
                </Button>
              )}
            </div>
          </div>

          {/* ── The one-liner ── */}
          {solution.summary && (
            <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg dark:text-neutral-100">
              {solution.summary}
            </h3>
          )}

          {/* ── The answer itself ── */}
          {body ? (
            <div className="relative">
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
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
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
            <p className="text-sm text-slate-500 dark:text-neutral-400">
              This answer was posted without a body.
            </p>
          )}

          {/* ── How to check it worked ── */}
          {verificationSteps.length > 0 && (
            <Panel
              icon={<ListChecks aria-hidden="true" className="size-3.5" />}
              title="How to verify"
            >
              <ol className="space-y-2.5">
                {verificationSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold tabular-nums text-slate-700 dark:bg-neutral-700 dark:text-neutral-200">
                      {i + 1}
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm text-slate-700 dark:text-neutral-200">
                        {step.instruction}
                      </p>
                      {step.expectedResult && (
                        <p className="text-sm text-slate-500 dark:text-neutral-400">
                          <span className="font-semibold">Expect: </span>
                          {step.expectedResult}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          {/* ── What it was proven against ── */}
          {testedWith.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                Tested with
              </span>
              {testedWith.map((entry, i) => (
                <span
                  key={`${entry.technology}-${i}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
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
              icon={<Scale aria-hidden="true" className="size-3.5" />}
              title="Trade-offs"
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
                {solution.tradeoffs}
              </p>
            </Panel>
          )}

          {/* ── Links and files ── */}
          {(resources.length > 0 || attachments.length > 0) && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-neutral-800">
              {resources.map((resource, i) => (
                <ResourceLink key={resource.id ?? i} resource={resource} />
              ))}
              {attachments.map((file, i) => {
                const isImg =
                  file.mimeType?.startsWith("image/") ||
                  /\.(png|jpe?g|webp|gif|svg)$/i.test(
                    file.fileName || file.downloadUrl || "",
                  );
                const fileUrl =
                  file.downloadUrl ||
                  (file.id && solution.id
                    ? `/api/solutions/${solution.id}/attachments/${file.id}/download`
                    : undefined);

                return isImg && fileUrl ? (
                  <button
                    key={file.id ?? i}
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        src: fileUrl,
                        alt: file.fileName ?? "Attachment",
                        title: file.fileName ?? "Attachment Preview",
                      })
                    }
                    className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 cursor-pointer shadow-2xs"
                  >
                    <ZoomIn aria-hidden="true" className="size-3.5 shrink-0 text-blue-500" />
                    <span className="truncate">
                      {file.fileName ?? "Attachment"}
                    </span>
                    {file.fileSize !== undefined && (
                      <span className="shrink-0 font-medium text-slate-400">
                        {formatBytes(file.fileSize)}
                      </span>
                    )}
                  </button>
                ) : fileUrl ? (
                  <a
                    key={file.id ?? i}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    download={file.fileName ?? "attachment"}
                    className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 shadow-2xs"
                  >
                    <Download aria-hidden="true" className="size-3.5 shrink-0 text-slate-500" />
                    <span className="truncate">
                      {file.fileName ?? "Attachment"}
                    </span>
                    {file.fileSize !== undefined && (
                      <span className="shrink-0 font-medium text-slate-400">
                        {formatBytes(file.fileSize)}
                      </span>
                    )}
                  </a>
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
        isOpen={previewImage !== null}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
};

/** A labelled block inside a card — used for anything with a heading and body. */
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
    <section className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
      <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
        {icon}
        {title}
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
      className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
}
