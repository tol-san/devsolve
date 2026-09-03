"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  FileQuestion,
  Flame,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  X,
} from "lucide-react";

import {
  DROPDOWN_SIZE,
  MAX_QUERY_LENGTH,
  useSearchQuery,
} from "@/lib/redux/services/searchApi";
import { apiErrorStatus } from "@/lib/api/error-message";
import { hrefForHit, typeLabel } from "@/lib/search/presentation";
import { SearchHitRow } from "@/components/search/SearchHitRow";
import { useLocalePath } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { SearchType } from "@/lib/types/search/types";

/** Long enough that a fast typist fires one request, not eight. */
const DEBOUNCE_MS = 250;

type SearchDropdownProps = {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onDone?: () => void;
};

const GROUP_HEADER_ICONS: Record<SearchType, typeof User> = {
  programs: ShieldCheck,
  showcases: Sparkles,
  problems: FileQuestion,
  organizations: Building2,
  users: User,
};

const DISCOVERY_LINKS = [
  {
    title: "Bug Bounty Programs",
    description: "Explore active scopes, rewards, and disclosure policies",
    href: "/programs",
    icon: ShieldCheck,
  },
  {
    title: "Hacktivity Stream",
    description: "Live feed of resolved vulnerability reports & disclosures",
    href: "/hacktivity",
    icon: Flame,
  },
  {
    title: "Researcher Leaderboard",
    description: "Top security researchers ranked by reputation and impact",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Community Problems",
    description: "Engineering bugs, blockers, and developer questions",
    href: "/community",
    icon: FileQuestion,
  },
  {
    title: "Showcase Projects",
    description: "Discover real-world systems, apps, and architectures",
    href: "/showcases",
    icon: Sparkles,
  },
];

export function SearchDropdown({
  className,
  placeholder,
  autoFocus = true,
  onDone,
}: SearchDropdownProps) {
  const router = useRouter();
  const listboxId = useId();
  const lp = useLocalePath();

  const [input, setInput] = useState("");
  const [term, setTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* The field updates instantly, the query trails it. */
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === term) return;

    const timeout = setTimeout(() => {
      setTerm(trimmed);
      setSelectedIndex(-1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [input, term]);

  const hasTerm = term.length > 0;
  const { data, isFetching, error } = useSearchQuery(
    { q: term, size: DROPDOWN_SIZE },
    { skip: !hasTerm },
  );

  const unavailable = apiErrorStatus(error) === 503;
  const groups = data?.groups ?? [];
  const isEmpty = hasTerm && !isFetching && !error && groups.length === 0;

  // Flattened hits for arrow navigation
  const allHits = groups.flatMap((g) => g.hits);

  const goToResults = () => {
    if (!hasTerm) return;
    onDone?.();
    router.push(lp(`/search?q=${encodeURIComponent(term)}`));
  };

  const dismiss = () => {
    onDone?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dismiss();
      return;
    }

    // Keyboard navigation when query is empty: navigate through discovery links
    if (!hasTerm) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev < DISCOVERY_LINKS.length - 1 ? prev + 1 : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : DISCOVERY_LINKS.length - 1));
      } else if (event.key === "Enter" && selectedIndex >= 0) {
        event.preventDefault();
        const link = DISCOVERY_LINKS[selectedIndex];
        if (link) {
          router.push(lp(link.href));
          dismiss();
        }
      }
      return;
    }

    // Keyboard navigation when search hits are present
    const maxIndex = allHits.length; // 0 to allHits.length - 1 are hits, allHits.length is "See all results"

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (selectedIndex === -1 || selectedIndex === maxIndex) {
        goToResults();
      } else if (selectedIndex >= 0 && selectedIndex < allHits.length) {
        const hit = allHits[selectedIndex];
        router.push(lp(hrefForHit(hit)));
        dismiss();
      }
    }
  };

  let runningHitIndex = 0;

  return (
    <div ref={containerRef} className={cn("flex flex-col w-full select-none", className)}>
      {/* 1. Seamless Command Input Bar (Clean monochrome aesthetic) */}
      <div className="flex items-center px-4 py-3.5 border-b border-border/70 bg-muted/10">
        <Search className="size-4.5 text-muted-foreground shrink-0 mr-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={true}
          aria-controls={listboxId}
          aria-label="Search DevSolve"
          value={input}
          autoFocus={autoFocus}
          maxLength={MAX_QUERY_LENGTH}
          placeholder={placeholder ?? "Search programs, people, write-ups, problems…"}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="h-9 w-full bg-transparent text-base sm:text-lg font-medium text-foreground placeholder:text-muted-foreground/50 border-none outline-none focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        />

        {isFetching ? (
          <Loader2 className="size-4.5 animate-spin text-muted-foreground shrink-0 ml-2" />
        ) : input ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setInput("");
              setTerm("");
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-border/70 bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground select-none shrink-0">
            ESC
          </kbd>
        )}
      </div>

      {/* 2. Results Body / Discovery Panel */}
      <div
        id={listboxId}
        className="max-h-[60vh] overflow-y-auto p-3 space-y-4 scrollbar-thin divide-y divide-border/40"
      >
        {/* Initial Empty Input State: Discover Links */}
        {!hasTerm && (
          <div className="space-y-1.5 pt-1 pb-1">
            <span className="flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Explore DevSolve</span>
            </span>
            <div className="space-y-1 pt-1">
              {DISCOVERY_LINKS.map((link, idx) => {
                const Icon = link.icon;
                const isSelected = selectedIndex === idx;

                return (
                  <Link
                    key={link.href}
                    href={lp(link.href)}
                    onClick={dismiss}
                    className={cn(
                      "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer",
                      isSelected
                        ? "bg-muted text-foreground ring-1 ring-border shadow-2xs"
                        : "hover:bg-muted/60 text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/60 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                        <Icon className="size-4.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {link.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {link.description}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground/40 group-hover:text-foreground transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Unavailable or error states */}
        {hasTerm && unavailable && (
          <div className="py-12 text-center text-sm text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Search service temporarily offline</p>
            <p className="text-xs">Search is momentarily resting. You can browse via menu links.</p>
          </div>
        )}

        {hasTerm && error && !unavailable && (
          <div className="py-12 text-center text-sm text-muted-foreground space-y-1">
            <p className="font-semibold text-destructive">Query failed</p>
            <p className="text-xs">Unable to load search results. Please try again.</p>
          </div>
        )}

        {/* Empty matching result */}
        {isEmpty && (
          <div className="py-12 text-center text-sm text-muted-foreground space-y-2">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/70 text-muted-foreground mx-auto border border-border">
              <Search className="size-5 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">
              No results found for &ldquo;{term}&rdquo;
            </p>
            <p className="text-xs max-w-xs mx-auto text-muted-foreground">
              Try searching with broader terms or check for typing errors.
            </p>
          </div>
        )}

        {/* Populated Search Groups */}
        {hasTerm &&
          groups.map((group) => {
            const GroupIcon = GROUP_HEADER_ICONS[group.type] || User;

            return (
              <section key={group.type} className="pt-3 first:pt-0">
                <div className="flex items-center justify-between gap-2 px-2 pb-2">
                  <div className="flex items-center gap-2">
                    <GroupIcon className="size-3.5 text-muted-foreground/80" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {typeLabel(group.type, group.totalHits)}
                    </h3>
                    <span className="text-[11px] font-normal text-muted-foreground/60">
                      ({group.totalHits})
                    </span>
                  </div>

                  {group.totalHits > group.hits.length && (
                    <Link
                      href={lp(
                        `/search?q=${encodeURIComponent(term)}&type=${group.type}`,
                      )}
                      onClick={dismiss}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                    >
                      <span>See all {group.totalHits}</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>

                <div className="space-y-1">
                  {group.hits.map((hit) => {
                    const currentIdx = runningHitIndex++;
                    const isSelected = selectedIndex === currentIdx;

                    return (
                      <SearchHitRow
                        key={`${hit.type}-${hit.id}`}
                        hit={hit}
                        compact
                        isSelected={isSelected}
                        onNavigate={dismiss}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

        {/* Bottom "See all results" CTA */}
        {hasTerm && groups.length > 0 && (
          <div className="pt-3">
            <button
              type="button"
              onClick={goToResults}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 cursor-pointer",
                selectedIndex === allHits.length
                  ? "bg-muted text-foreground ring-1 ring-border shadow-2xs"
                  : "bg-muted/40 border border-border/70 text-foreground hover:bg-muted/70",
              )}
            >
              <span className="flex items-center gap-2">
                <Search className="size-4 text-muted-foreground" />
                <span>
                  See all {data?.totalHits ? `${data.totalHits} ` : ""}results for &ldquo;{term}&rdquo;
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Jump to page</span>
                <kbd className="font-mono bg-background border border-border px-1.5 py-0.5 rounded text-foreground text-[10px] shadow-2xs">
                  ↵
                </kbd>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Integrated Command Palette Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground select-none">
        <div className="flex items-center gap-2 min-w-0">
          {hasTerm && data?.totalHits !== undefined ? (
            <span className="font-medium text-foreground truncate">
              {data.totalHits} {data.totalHits === 1 ? "result" : "results"} found
            </span>
          ) : (
            <span className="text-muted-foreground truncate">
              DevSolve Universal Quick Search
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/80 bg-card px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
              ↑
            </kbd>
            <kbd className="rounded border border-border/80 bg-card px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
              ↓
            </kbd>
            <span className="text-muted-foreground/80">navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/80 bg-card px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
              ↵
            </kbd>
            <span className="text-muted-foreground/80">select</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/80 bg-card px-1.5 py-0.5 font-mono text-[10px] shadow-2xs">
              ESC
            </kbd>
            <span className="text-muted-foreground/80">close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
