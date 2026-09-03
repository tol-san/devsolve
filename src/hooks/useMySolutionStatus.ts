"use client";

import { useMemo } from "react";

import { useGetMySolutionsQuery } from "@/lib/redux/services/solutionsApi";

/**
 * What the reader has already posted against each problem, and where it stands.
 *
 * A posted answer is held for review, so between posting and approval it is
 * invisible everywhere the public list is served — its own author included.
 * Someone who cannot see their answer assumes it was lost and writes it twice.
 * This reads `/solutions/mine`, which does return the pending ones, and keys
 * them by the problem they answer so any surface can ask "have I answered
 * this, and what happened to it".
 *
 * One request serves the whole page: RTK Query dedupes it across every card
 * that calls this, and a signed-out reader gets a 401 that resolves to an
 * empty map rather than an error.
 */

export type MySolutionReview = "PENDING" | "APPROVED" | "REJECTED";

export interface MySolutionStatus {
  solutionId: string;
  problemId: string;
  summary?: string;
  review: MySolutionReview;
  rejectionReason?: string;
  isAccepted: boolean;
  createdAt: string;
}

/** Where an author manages everything they have posted. */
export const MY_COMMUNITY_HREF = "/dashboard/my-community";

/** How many of the caller's answers to consider. Well past a normal account. */
const PAGE_SIZE = 100;

export function useMySolutionStatus(options?: { skip?: boolean }) {
  const { data, isLoading } = useGetMySolutionsQuery(
    { pageSize: PAGE_SIZE },
    { skip: options?.skip },
  );

  /* Keyed by problem, newest first within each. A problem can hold several of
     the same author's answers, and the most recent is the one they are
     wondering about. */
  const byProblem = useMemo(() => {
    const map = new Map<string, MySolutionStatus[]>();

    for (const solution of data?.content ?? []) {
      if (!solution.problemId) continue;

      const entry: MySolutionStatus = {
        solutionId: solution.id,
        problemId: solution.problemId,
        summary: solution.summary,
        review: solution.moderation?.status ?? "APPROVED",
        rejectionReason: solution.moderation?.rejectionReason,
        isAccepted: Boolean(solution.isAccepted),
        createdAt: solution.createdAt,
      };

      const existing = map.get(solution.problemId);
      if (existing) existing.push(entry);
      else map.set(solution.problemId, [entry]);
    }

    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return map;
  }, [data]);

  return {
    isLoading,
    /** Every answer the reader has posted on one problem, newest first. */
    forProblem: (problemId?: string) =>
      problemId ? (byProblem.get(problemId) ?? []) : [],
    /** The one worth announcing on a card: turned away and needs author revision. */
    unresolvedFor: (problemId?: string) => {
      const list = problemId ? (byProblem.get(problemId) ?? []) : [];
      return list.find((entry) => entry.review === "REJECTED");
    },
  };
}
