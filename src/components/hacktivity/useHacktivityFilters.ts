"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  EVENT_TYPES,
  SEVERITIES,
  SORTS,
  type EventType,
  type Severity,
  type Sort,
} from "@/lib/types/hacktivity/types";

/**
 * The feed's filters, kept in the URL.
 *
 * A filtered feed is something people send each other — "look at this week's
 * criticals" is a link, not a description of which chips to press. Holding the
 * state here also means reload, back and forward all land where the reader
 * was, which component state cannot do.
 */

export const DEFAULT_SORT: Sort = "createdAt,DESC";

export interface HacktivityFilterState {
  q: string;
  severity: Severity[];
  eventType: EventType[];
  sort: Sort;
  /** 1-based, matching what the URL shows. The API pages from zero. */
  page: number;
}

const PARAM = {
  q: "q",
  severity: "severity",
  event: "event",
  sort: "sort",
  page: "page",
} as const;

/** Anything the API would refuse is dropped rather than sent. */
function parse(params: URLSearchParams): HacktivityFilterState {
  const severity = params
    .getAll(PARAM.severity)
    .map((value) => value.toUpperCase() as Severity)
    .filter((value) => SEVERITIES.includes(value));

  const eventType = params
    .getAll(PARAM.event)
    .map((value) => value.toUpperCase() as EventType)
    .filter((value) => EVENT_TYPES.includes(value));

  const rawSort = params.get(PARAM.sort) as Sort | null;
  const rawPage = Number(params.get(PARAM.page));

  return {
    q: params.get(PARAM.q)?.trim() ?? "",
    severity,
    eventType,
    sort: rawSort && SORTS.includes(rawSort) ? rawSort : DEFAULT_SORT,
    page: Number.isFinite(rawPage) && rawPage > 1 ? Math.floor(rawPage) : 1,
  };
}

/** Defaults are left out, so an unfiltered feed keeps a clean URL. */
function serialise(state: HacktivityFilterState): string {
  const params = new URLSearchParams();

  if (state.q) params.set(PARAM.q, state.q);
  for (const value of state.severity) params.append(PARAM.severity, value);
  for (const value of state.eventType) params.append(PARAM.event, value);
  if (state.sort !== DEFAULT_SORT) params.set(PARAM.sort, state.sort);
  if (state.page > 1) params.set(PARAM.page, String(state.page));

  return params.toString();
}

export function useHacktivityFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => parse(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const write = useCallback(
    (next: HacktivityFilterState) => {
      const query = serialise(next);
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  /**
   * Narrowing the feed sends the reader back to the first page — page 4 of the
   * old result set says nothing about the new one.
   */
  const setFilters = useCallback(
    (patch: Partial<HacktivityFilterState>) => {
      const resetsPage = !("page" in patch);
      write({ ...state, ...patch, page: resetsPage ? 1 : (patch.page ?? 1) });
    },
    [state, write],
  );

  const clearAll = useCallback(() => {
    write({ q: "", severity: [], eventType: [], sort: state.sort, page: 1 });
  }, [state.sort, write]);

  /** Sort is a view of the feed, not something hiding rows from it. */
  const isFiltered =
    state.q !== "" || state.severity.length > 0 || state.eventType.length > 0;

  return { state, setFilters, clearAll, isFiltered };
}
