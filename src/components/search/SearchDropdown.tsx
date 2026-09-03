"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";

import {
  DROPDOWN_SIZE,
  MAX_QUERY_LENGTH,
  useSearchQuery,
} from "@/lib/redux/services/searchApi";
import { apiErrorStatus } from "@/lib/api/error-message";
import { typeLabel } from "@/lib/search/presentation";
import { SearchHitRow } from "@/components/search/SearchHitRow";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** Long enough that a fast typist fires one request, not eight. */
const DEBOUNCE_MS = 275;

type SearchDropdownProps = {
  className?: string;
  placeholder?: string;
  /** Focus the field on mount, for the overlay that opens on a tap. */
  autoFocus?: boolean;
  /** Fired once the reader has gone somewhere, so a host can close itself. */
  onDone?: () => void;
};

/**
 * Search-as-you-type over every index.
 *
 * Uses the grouped mode, which is what it is for: one short list per index,
 * and **only the indexes that matched** — an index with no hits is absent from
 * `groups` entirely, so the sections here are whatever came back rather than a
 * fixed five.
 *
 * Typing is debounced and the request is keyed on the settled term, so RTK
 * Query supersedes the in-flight one on each new term rather than racing them.
 * A 503 is expected rather than exceptional — search can be switched off on a
 * deployment — so it is said plainly once and never retried in a loop.
 */
export function SearchDropdown({
  className,
  placeholder,
  autoFocus,
  onDone,
}: SearchDropdownProps) {
  const router = useRouter();
  const listboxId = useId();
  const lp = useLocalePath();

  const [input, setInput] = useState("");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* The field updates instantly, the query trails it. */
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === term) return;

    const timeout = setTimeout(() => setTerm(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [input, term]);

  /* Closed on an outside click and on Escape — a panel that outlives its
     context is the usual complaint about search dropdowns. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hasTerm = term.length > 0;
  const { data, isFetching, error } = useSearchQuery(
    { q: term, size: DROPDOWN_SIZE },
    /* Nothing is asked until there is something to ask about: a blank query
       matches the whole index, which is browsing, not what a dropdown wants. */
    { skip: !open || !hasTerm },
  );

  const unavailable = apiErrorStatus(error) === 503;
  const groups = data?.groups ?? [];
  const isEmpty = hasTerm && !isFetching && !error && groups.length === 0;

  const goToResults = () => {
    if (!hasTerm) return;
    setOpen(false);
    onDone?.();
    router.push(lp(`/search?q=${encodeURIComponent(term)}`));
  };

  const dismiss = () => {
    setOpen(false);
    onDone?.();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label="Search DevSolve"
          value={input}
          autoFocus={autoFocus}
          maxLength={MAX_QUERY_LENGTH}
          placeholder={placeholder ?? "Search programs, people, write-ups…"}
          onChange={(event) => {
            setInput(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              goToResults();
            }
          }}
          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        {isFetching ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : (
          input && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setInput("");
                setTerm("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )
        )}
      </div>

      {open && hasTerm && (
        <div
          id={listboxId}
          className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-lg"
        >
          {unavailable ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Search is temporarily unavailable. Everything else still works.
            </p>
          ) : error ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              That search could not be run. Try again in a moment.
            </p>
          ) : isEmpty ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nothing matches &ldquo;{term}&rdquo;.
            </p>
          ) : (
            <>
              {groups.map((group) => (
                <section key={group.type} className="mb-1 last:mb-0">
                  <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {typeLabel(group.type, group.totalHits)}
                    </h3>
                    {/* The group's own total, not `hits.length` — this is the
                        "there are more" number. */}
                    {group.totalHits > group.hits.length && (
                      <Link
                        href={lp(
                          `/search?q=${encodeURIComponent(term)}&type=${group.type}`,
                        )}
                        onClick={dismiss}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        See all {group.totalHits}
                      </Link>
                    )}
                  </div>

                  {group.hits.map((hit) => (
                    <SearchHitRow
                      key={`${hit.type}-${hit.id}`}
                      hit={hit}
                      compact
                      onNavigate={dismiss}
                    />
                  ))}
                </section>
              ))}

              {groups.length > 0 && (
                <button
                  type="button"
                  onClick={goToResults}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border-t border-border px-3 py-2.5 text-sm font-semibold text-primary hover:bg-muted"
                >
                  See all results for &ldquo;{term}&rdquo;
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
