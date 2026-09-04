"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Loader2, Search, SearchX } from "lucide-react";

import {
  MAX_QUERY_LENGTH,
  RESULTS_PAGE_SIZE,
  useSearchQuery,
} from "@/lib/redux/services/searchApi";
import {
  SEARCH_TYPES,
  isSearchType,
  type SearchType,
} from "@/lib/types/search/types";
import { apiErrorStatus } from "@/lib/api/error-message";
import { typeLabel } from "@/lib/search/presentation";
import { SearchHitRow } from "@/components/search/SearchHitRow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 275;

export function SearchResultsView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const typeParam = params.get("type");
  const type = isSearchType(typeParam) ? typeParam : undefined;
  const pageParam = Number(params.get("page") ?? "0");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 0;

  const [input, setInput] = useState(q);

  const [pushedQuery, setPushedQuery] = useState(q);
  const [syncedQuery, setSyncedQuery] = useState(q);
  if (q !== syncedQuery) {
    setSyncedQuery(q);
    if (q !== pushedQuery) setInput(q);
  }

  const replaceQuery = (next: {
    q?: string;
    type?: SearchType | null;
    page?: number;
  }) => {
    const search = new URLSearchParams(params.toString());

    if (next.q !== undefined) {
      if (next.q) search.set("q", next.q);
      else search.delete("q");
    }
    if (next.type !== undefined) {
      if (next.type) search.set("type", next.type);
      else search.delete("type");
    }
    if (next.page !== undefined) {
      if (next.page > 0) search.set("page", String(next.page));
      else search.delete("page");
    }

    router.replace(`${pathname}?${search.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === q) return;

    const timeout = setTimeout(() => {
      setPushedQuery(trimmed);
      replaceQuery({ q: trimmed, page: 0 });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, q]);

  const { data, isFetching, error } = useSearchQuery({
    q,
    type,
    page,
    size: type ? RESULTS_PAGE_SIZE : undefined,
  });

  const unavailable = apiErrorStatus(error) === 503;
  const groups = data?.groups ?? [];
  const totalPages = data?.totalPages ?? null;
  const hasResults = groups.some((group) => group.hits.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10 sm:px-8 sm:py-14"
    >
      <header className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Search
        </h1>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            autoFocus
            value={input}
            maxLength={MAX_QUERY_LENGTH}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search programs, organizations, researchers, write-ups…"
            aria-label="Search DevSolve"
            className="h-12 w-full rounded-2xl border border-border bg-background pl-10 pr-10 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          {isFetching && (
            <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Result type">
          <TypeTab
            label="Everything"
            active={!type}
            onClick={() => replaceQuery({ type: null, page: 0 })}
          />
          {SEARCH_TYPES.map((value) => (
            <TypeTab
              key={value}
              label={typeLabel(value)}
              active={type === value}
              onClick={() => replaceQuery({ type: value, page: 0 })}
            />
          ))}
        </nav>
      </header>

      {unavailable ? (
        <EmptyState
          icon={SearchX}
          title="Search is temporarily unavailable"
          body="The search service is switched off or unreachable right now. Everything else on DevSolve still works."
        />
      ) : error ? (
        <EmptyState
          icon={SearchX}
          title="That search could not be run"
          body="Something went wrong on our side. Try again in a moment."
        />
      ) : !hasResults && !isFetching ? (
        q ? (
          <EmptyState
            icon={SearchX}
            title={`Nothing matches “${q}”`}
            body={
              type
                ? `No ${typeLabel(type).toLowerCase()} matched. Try another type, or a shorter query.`
                : "Try fewer words, or a different spelling."
            }
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Search DevSolve"
            body="Find bug bounty programs, organizations, researchers, community problems and write-ups."
          />
        )
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.type} className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {typeLabel(group.type, group.totalHits)}
                </h2>
                <span className="text-sm font-medium text-muted-foreground">
                  {group.totalHits.toLocaleString()}{" "}
                  {group.totalHits === 1 ? "result" : "results"}
                </span>
              </div>

              <div className="space-y-2.5">
                {group.hits.map((hit) => (
                  <SearchHitRow key={`${hit.type}-${hit.id}`} hit={hit} />
                ))}
              </div>

              {!type && group.totalHits > group.hits.length && (
                <Button
                  variant="outline"
                  onClick={() => replaceQuery({ type: group.type, page: 0 })}
                  className="rounded-xl font-semibold"
                >
                  See all {group.totalHits.toLocaleString()}{" "}
                  {typeLabel(group.type, group.totalHits).toLowerCase()}
                </Button>
              )}
            </section>
          ))}

          {type && totalPages !== null && totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-between gap-3 border-t border-border pt-4"
            >
              <Button
                variant="outline"
                disabled={page <= 0}
                onClick={() => replaceQuery({ page: page - 1 })}
                className="rounded-xl font-semibold"
              >
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>

              <span className="text-sm font-medium text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => replaceQuery({ page: page + 1 })}
                className="rounded-xl font-semibold"
              >
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            </nav>
          )}
        </div>
      )}
    </motion.div>
  );
}

function TypeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Search;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <Icon className="size-7 text-muted-foreground" />
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
