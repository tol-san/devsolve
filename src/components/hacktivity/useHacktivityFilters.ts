"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  EVENT_TYPES,
  SEVERITIES,
  SORTS,
  type EventType,
  type Severity,
  type Sort,
} from "@/lib/types/hacktivity/types";

export const DEFAULT_SORT: Sort = "createdAt,DESC";

export interface HacktivityFilterState {
  q: string;
  severity: Severity[];
  eventType: EventType[];
  sort: Sort;
  page: number;
}

const PARAM = {
  q: "q",
  severity: "severity",
  event: "event",
  sort: "sort",
  page: "page",
} as const;

export const INITIAL_HACKTIVITY_FILTERS: HacktivityFilterState = {
  q: "",
  severity: [],
  eventType: [],
  sort: DEFAULT_SORT,
  page: 1,
};

export function parse(params: URLSearchParams): HacktivityFilterState {
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

export function serialise(state: HacktivityFilterState): string {
  const params = new URLSearchParams();

  if (state.q) params.set(PARAM.q, state.q);
  for (const value of state.severity) params.append(PARAM.severity, value);
  for (const value of state.eventType) params.append(PARAM.event, value);
  if (state.sort !== DEFAULT_SORT) params.set(PARAM.sort, state.sort);
  if (state.page > 1) params.set(PARAM.page, String(state.page));

  return params.toString();
}

export function useHacktivityFilters() {
  const pathname = usePathname();
  const [state, setState] = useState<HacktivityFilterState>(INITIAL_HACKTIVITY_FILTERS);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readUrlState = () => {
      const search = window.location.search;
      if (!search) {
        setState(INITIAL_HACKTIVITY_FILTERS);
        return;
      }
      setState(parse(new URLSearchParams(search)));
    };

    readUrlState();

    window.addEventListener("popstate", readUrlState);
    return () => window.removeEventListener("popstate", readUrlState);
  }, []);

  const write = useCallback(
    (next: HacktivityFilterState) => {
      setState(next);
      if (typeof window === "undefined") return;
      const query = serialise(next);
      const targetUrl = query ? `${pathname}?${query}` : pathname;
      window.history.pushState(null, "", targetUrl);
    },
    [pathname],
  );

  const setFilters = useCallback(
    (patch: Partial<HacktivityFilterState>) => {
      setState((prev) => {
        const resetsPage = !("page" in patch);
        const next = { ...prev, ...patch, page: resetsPage ? 1 : (patch.page ?? 1) };
        if (typeof window !== "undefined") {
          const query = serialise(next);
          const targetUrl = query ? `${pathname}?${query}` : pathname;
          window.history.pushState(null, "", targetUrl);
        }
        return next;
      });
    },
    [pathname],
  );

  const clearAll = useCallback(() => {
    setState(INITIAL_HACKTIVITY_FILTERS);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", pathname);
    }
  }, [pathname]);

  const isFiltered =
    state.q !== "" || state.severity.length > 0 || state.eventType.length > 0;

  return { state, setFilters, clearAll, isFiltered };
}
