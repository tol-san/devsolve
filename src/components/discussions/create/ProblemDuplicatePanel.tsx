"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  useCheckDuplicateProblemsMutation,
  useGetRelatedProblemsQuery,
  type DuplicateCheckResponse,
  type DuplicateSuggestion,
  type RelatedProblem,
} from "@/lib/redux/services/problemsApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProblemDuplicatePanelProps {
  /** Current draft title from the composer */
  title: string;
  /** Current draft description from the composer */
  description?: string;
  /** Draft error message / stack trace (high-signal field for duplicate detection) */
  errorMessage?: string;
  /** Excluded UUID when editing an existing problem so it cannot suggest itself */
  excludeId?: string;
  /** Optional container class name */
  className?: string;
}

/** Candidate item for rendering (can be from /related or /duplicate-check) */
type CandidateItem = RelatedProblem | DuplicateSuggestion;

/**
 * Maps the AI verdict enum to human-friendly advisory labels.
 * The raw enum is never printed directly.
 */
function verdictLabel(verdict: DuplicateSuggestion["verdict"]): string {
  switch (verdict) {
    case "DUPLICATE":
      return "Same problem";
    case "NEAR_DUPLICATE":
      return "Same cause, different setup";
    case "RELATED":
      return "Related";
    default:
      return "Related";
  }
}

/**
 * Returns subtle verdict badge styling.
 * Never uses red — this panel guides and helps rather than alarming the user.
 */
function verdictBadgeClass(verdict: DuplicateSuggestion["verdict"]): string {
  switch (verdict) {
    case "DUPLICATE":
      return "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium";
    case "NEAR_DUPLICATE":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium";
    case "RELATED":
      return "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-medium";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

/**
 * "Has someone already asked this?" panel on the problem composer.
 *
 * Professional, compact, non-intrusive design:
 * - Clean divided list (replaces nested box cards)
 * - Clear hierarchy: badge + title + subtle meta
 * - Live keystroke lookup via `/problems/related` (debounced 275ms)
 * - On-demand AI deep check via `/problems/duplicate-check` with cooldown handling
 */
export function ProblemDuplicatePanel({
  title,
  description,
  errorMessage,
  excludeId,
  className,
}: ProblemDuplicatePanelProps) {
  // ── 1. Live keystroke debouncing for /related ─────────────────────────────
  const [debouncedTitle, setDebouncedTitle] = useState(title);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitle(title.trim());
    }, 275);
    return () => clearTimeout(timer);
  }, [title]);

  const shouldQueryRelated = debouncedTitle.length >= 4;

  const {
    data: relatedProblems = [],
    isFetching: isFetchingRelated,
  } = useGetRelatedProblemsQuery(
    { q: debouncedTitle, excludeId, limit: 5 },
    { skip: !shouldQueryRelated },
  );

  // ── 2. On-demand AI duplicate check ──────────────────────────────────────
  const [checkDuplicateProblems, { isLoading: isCheckingAi }] =
    useCheckDuplicateProblemsMutation();

  const [aiResult, setAiResult] = useState<DuplicateCheckResponse | null>(null);
  const [lastCheckedSignature, setLastCheckedSignature] = useState<string>("");
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Cooldown countdown timer for 429 rate limit
  useEffect(() => {
    if (!rateLimitedUntil) return;
    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((rateLimitedUntil - Date.now()) / 1000),
      );
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        setRateLimitedUntil(null);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [rateLimitedUntil]);

  // Track draft content signature (title + description + errorMessage)
  const currentSignature = useMemo(
    () => `${title.trim()}:::${(description ?? "").trim()}:::${(errorMessage ?? "").trim()}`,
    [title, description, errorMessage],
  );

  const isCurrentDraftChecked =
    lastCheckedSignature.length > 0 &&
    lastCheckedSignature === currentSignature;

  const canTriggerAiCheck =
    title.trim().length >= 10 &&
    !isCheckingAi &&
    !rateLimitedUntil &&
    !isCurrentDraftChecked;

  const handleRunAiCheck = async () => {
    if (!canTriggerAiCheck) return;

    try {
      const result = await checkDuplicateProblems({
        title: title.trim(),
        description: description?.trim() || undefined,
        errorMessage: errorMessage?.trim() || undefined,
        excludeId,
      }).unwrap();

      setAiResult(result);
      setLastCheckedSignature(currentSignature);
    } catch (err: unknown) {
      const errorObj = err as { status?: number };
      if (errorObj?.status === 429) {
        setRateLimitedUntil(Date.now() + 60_000);
      }
    }
  };

  // ── 3. Candidate Resolution ──────────────────────────────────────────────
  const activeCandidates: CandidateItem[] = useMemo(() => {
    if (aiResult && aiResult.suggestions.length > 0) {
      return aiResult.suggestions;
    }
    return relatedProblems;
  }, [aiResult, relatedProblems]);

  const isAiActive = Boolean(aiResult?.aiReviewed);

  // Top 3 items displayed by default, or all if expanded
  const visibleCandidates = useMemo(() => {
    if (isExpanded || activeCandidates.length <= 3) {
      return activeCandidates;
    }
    return activeCandidates.slice(0, 3);
  }, [activeCandidates, isExpanded]);

  const hiddenCount = activeCandidates.length - visibleCandidates.length;

  // Don't display anything if title is too short and no items to show
  if (
    debouncedTitle.length < 4 &&
    activeCandidates.length === 0 &&
    !isCheckingAi
  ) {
    return null;
  }

  // If search finished and found nothing, collapse cleanly
  if (activeCandidates.length === 0 && !isFetchingRelated && !isCheckingAi) {
    return null;
  }

  const matchCount = activeCandidates.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative mt-2.5 overflow-hidden rounded-xl border border-border/80 bg-card/70 p-3 sm:p-3.5 shadow-2xs",
        className,
      )}
      aria-label="Similar questions panel"
    >
      {/* ── Compact Header ── */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <Lightbulb className="size-4 text-amber-500 shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {matchCount > 0
              ? `Similar existing problems (${matchCount})`
              : "Similar problems"}
          </h3>
          {isFetchingRelated && !isCheckingAi && (
            <Loader2 className="size-3 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* AI Action Area */}
        <div className="flex items-center gap-2 shrink-0">
          {rateLimitedUntil ? (
            <span className="text-[11px] text-muted-foreground font-medium px-2 py-0.5 rounded bg-muted/60">
              Checked recently ({secondsRemaining}s)
            </span>
          ) : isCurrentDraftChecked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3 text-emerald-500" />
              Up to date
            </span>
          ) : canTriggerAiCheck ? (
            <button
              type="button"
              onClick={handleRunAiCheck}
              disabled={isCheckingAi}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer bg-primary/10 hover:bg-primary/15 px-2 py-0.5 rounded-md"
            >
              {isCheckingAi ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Checking…</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3" />
                  <span>Check for duplicates</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* ── Loading Skeleton ── */}
      {isCheckingAi && activeCandidates.length === 0 && (
        <div className="mt-2.5 space-y-2 animate-pulse" aria-hidden="true">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border/50 bg-muted/20 p-2.5 space-y-1.5"
            >
              <div className="h-3.5 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-1/3 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      )}

      {/* ── Unified Divided Candidate List (Professional standard, no nested boxes) ── */}
      <div className="mt-2.5 divide-y divide-border/60 rounded-lg border border-border/70 bg-background/50 overflow-hidden">
        <AnimatePresence initial={false}>
          {visibleCandidates.map((candidate) => {
            const suggestion = isAiActive
              ? (candidate as DuplicateSuggestion)
              : null;

            const acceptedCount =
              "acceptedSolutionCount" in candidate
                ? candidate.acceptedSolutionCount
                : 0;

            const excerpt =
              "excerpt" in candidate && candidate.excerpt
                ? candidate.excerpt
                : null;

            return (
              <motion.div
                key={candidate.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={`/community/${candidate.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/item block p-3 sm:px-3.5 text-foreground visited:text-foreground no-underline hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1">
                    {/* Badges line: Solved status & AI verdict */}
                    {(acceptedCount > 0 || candidate.solved || (isAiActive && suggestion?.verdict)) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {acceptedCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-2.5 text-emerald-500" />
                            Accepted answer
                          </span>
                        ) : candidate.solved ? (
                          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <CheckCircle2 className="size-2.5 text-sky-500" />
                            Answered
                          </span>
                        ) : null}

                        {isAiActive && suggestion?.verdict && (
                          <span
                            className={cn(
                              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px]",
                              verdictBadgeClass(suggestion.verdict),
                            )}
                          >
                            {verdictLabel(suggestion.verdict)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title & external icon */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-medium text-foreground group-hover/item:text-primary transition-colors line-clamp-1 leading-snug">
                        {candidate.title}
                      </h4>
                      <ArrowUpRight className="size-3.5 text-muted-foreground opacity-30 group-hover/item:opacity-100 group-hover/item:text-primary transition-all shrink-0 mt-0.5" />
                    </div>

                    {/* Plain text excerpt (if present) */}
                    {excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {excerpt}
                      </p>
                    )}

                    {/* AI Reason (Model's voice) */}
                    {isAiActive && suggestion?.reason && (
                      <div className="mt-1 flex items-start gap-1.5 rounded border-l-2 border-primary/60 bg-muted/40 px-2 py-1 text-xs text-foreground/85 leading-relaxed">
                        <Sparkles className="size-3 text-primary shrink-0 mt-0.5" />
                        <span>{suggestion.reason}</span>
                      </div>
                    )}

                    {/* Compact Meta */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                      {candidate.solutionCount > 0 && (
                        <>
                          <span>
                            {candidate.solutionCount}{" "}
                            {candidate.solutionCount === 1 ? "reply" : "replies"}
                          </span>
                          <span aria-hidden="true" className="opacity-40">
                            ·
                          </span>
                        </>
                      )}
                      <span>
                        {candidate.viewCount.toLocaleString()}{" "}
                        {candidate.viewCount === 1 ? "view" : "views"}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Expand / Collapse Toggle (if more than 3 matches) ── */}
      {activeCandidates.length > 3 && (
        <div className="mt-2 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3" />
                <span>Show fewer</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3" />
                <span>
                  Show {hiddenCount} more {hiddenCount === 1 ? "match" : "matches"}
                </span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* ── Clean Footer ── */}
      <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
        <span>Advisory only — never blocks posting your question.</span>
        <span>Opens in new tab</span>
      </div>
    </motion.div>
  );
}
