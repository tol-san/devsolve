"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Lightbulb,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useCheckDuplicateProblemsMutation,
  useGetRelatedProblemsQuery,
  type DuplicateCheckResponse,
  type DuplicateSuggestion,
} from "@/lib/redux/services/problemsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProblemDuplicatePanelProps {
  /** Current draft title from the composer */
  title: string;
  /** Current draft description from the composer */
  description?: string;
  /** Excluded UUID when editing an existing problem so it cannot suggest itself */
  excludeId?: string;
  /** Optional container class name */
  className?: string;
}

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
 * Returns badge styling based on AI verdict.
 */
function verdictBadgeClass(verdict: DuplicateSuggestion["verdict"]): string {
  switch (verdict) {
    case "DUPLICATE":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold";
    case "NEAR_DUPLICATE":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold";
    case "RELATED":
      return "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

/**
 * "Has someone already asked this?" panel on the problem composer.
 *
 * Integrates TWO distinct backend endpoints:
 * 1. `GET /api/v1/problems/related` (via proxy `/api/problems/related`):
 *    - Free, anonymous trigram similarity search while typing (debounced 275ms).
 * 2. `POST /api/v1/problems/duplicate-check` (via proxy `/api/problems/duplicate-check`):
 *    - Authenticated, AI-powered deep review with candidate reasons and verdicts on demand.
 *    - Rate-limited (5/min, 40/hr); tracks whether current text was checked to prevent burning quota.
 */
export function ProblemDuplicatePanel({
  title,
  description,
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

  // Cooldown countdown timer for 429 rate limit
  const [secondsRemaining, setSecondsRemaining] = useState(0);

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

  const currentSignature = useMemo(
    () => `${title.trim()}:::${(description ?? "").trim()}`,
    [title, description],
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

  // ── 3. Active Candidate List Resolution ──────────────────────────────────
  const activeCandidates = useMemo(() => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn(
        "relative mt-3.5 overflow-hidden rounded-2xl border border-border/80 bg-linear-to-b from-card via-card/95 to-muted/20 p-4 shadow-sm shadow-black/5 dark:shadow-black/20 ring-1 ring-border/30",
        className,
      )}
      aria-label="Similar and duplicate questions advisory panel"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/15 via-sky-500/10 to-primary/10 text-primary border border-primary/20 shrink-0 shadow-2xs">
            <Lightbulb className="size-4.5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Has someone already asked this?
              </h3>
              {activeCandidates.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {activeCandidates.length}{" "}
                  {activeCandidates.length === 1 ? "match" : "matches"}
                </span>
              )}
              {isFetchingRelated && !isCheckingAi && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAiActive
                ? "AI analyzed your draft against existing problems."
                : "Existing problems that might already provide the answer you need."}
            </p>
          </div>
        </div>

        {/* AI Check Action Button */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {rateLimitedUntil ? (
            <span className="text-xs text-muted-foreground font-medium px-2.5 py-1 rounded-lg bg-muted/60 border border-border/40">
              Checked recently ({secondsRemaining}s)
            </span>
          ) : isCurrentDraftChecked ? (
            <Badge
              variant="outline"
              className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/25 bg-emerald-500/10 font-semibold py-1 px-2.5 rounded-lg"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              Up to date
            </Badge>
          ) : (
            <Button
              type="button"
              size="sm"
              variant={canTriggerAiCheck ? "default" : "outline"}
              onClick={handleRunAiCheck}
              disabled={!canTriggerAiCheck}
              title={
                title.trim().length < 10
                  ? "Enter at least 10 characters to run AI duplicate check"
                  : "Have AI review candidates for duplicates"
              }
              className={cn(
                "h-8 text-xs font-semibold gap-1.5 cursor-pointer rounded-lg transition-all duration-200",
                canTriggerAiCheck
                  ? "bg-linear-to-r from-violet-600 via-indigo-600 to-primary text-white shadow-xs hover:opacity-95 hover:shadow-primary/20"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {isCheckingAi ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>AI reviewing…</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Check with AI</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── AI Loading State Banner (Keeps results visible underneath!) ── */}
      {isCheckingAi && (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-2.5 text-xs text-foreground font-medium shadow-2xs">
          <Loader2 className="size-4 animate-spin text-primary shrink-0" />
          <span>Analyzing existing problems and accepted solutions for duplicates…</span>
        </div>
      )}

      {/* ── Cards List ── */}
      <div className="mt-3 space-y-2.5">
        <AnimatePresence initial={false}>
          {visibleCandidates.map((candidate) => {
            const suggestion = isAiActive
              ? (candidate as DuplicateSuggestion)
              : null;

            return (
              <motion.div
                key={candidate.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="group/card relative rounded-xl border border-border/60 bg-background/60 dark:bg-card/50 hover:bg-card dark:hover:bg-muted/30 hover:border-primary/40 dark:hover:border-primary/40 p-3.5 transition-all duration-150 hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {/* Solved Badge (the core point of this panel) */}
                      {candidate.solved ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                          <span>
                            Answered
                            {candidate.solutionCount > 0 &&
                              ` · ${candidate.solutionCount} ${
                                candidate.solutionCount === 1
                                  ? "solution"
                                  : "solutions"
                              }`}
                          </span>
                        </span>
                      ) : candidate.solutionCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          <MessageSquare className="size-3 shrink-0" />
                          <span>
                            {candidate.solutionCount}{" "}
                            {candidate.solutionCount === 1 ? "answer" : "answers"}
                          </span>
                        </span>
                      ) : null}

                      {/* AI Verdict Badge (shown only when aiReviewed is true) */}
                      {isAiActive && suggestion?.verdict && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px]",
                            verdictBadgeClass(suggestion.verdict),
                          )}
                        >
                          {verdictLabel(suggestion.verdict)}
                        </span>
                      )}
                    </div>

                    {/* Problem Title Link (ensuring no visited blue color styling!) */}
                    <Link
                      href={`/community/${candidate.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground visited:text-foreground hover:text-primary group-hover/card:text-primary transition-colors no-underline leading-snug"
                    >
                      <span className="line-clamp-2">{candidate.title}</span>
                      <ArrowUpRight className="size-3.5 opacity-40 group-hover/card:opacity-100 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-all text-primary shrink-0" />
                    </Link>

                    {/* AI Reason Line (rendered strictly as plain text, no innerHTML) */}
                    {isAiActive && suggestion?.reason && (
                      <div className="mt-2 rounded-lg border-l-2 border-primary/50 bg-muted/50 dark:bg-muted/30 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground/90 mr-1.5">
                          AI note:
                        </span>
                        {suggestion.reason}
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="mt-2 flex items-center gap-3.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="size-3 opacity-70" />
                        {candidate.viewCount.toLocaleString()}{" "}
                        {candidate.viewCount === 1 ? "view" : "views"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Expand / Collapse Toggle (if more than 3 matches) ── */}
      {activeCandidates.length > 3 && (
        <div className="mt-2.5 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3.5" />
                <span>Show fewer</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" />
                <span>Show {hiddenCount} more {hiddenCount === 1 ? "match" : "matches"}</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
          <span>Advisory only — never blocks posting your question.</span>
        </span>
        <span className="text-[11px] font-medium text-muted-foreground/80">
          Opens in new tab
        </span>
      </div>
    </motion.div>
  );
}
