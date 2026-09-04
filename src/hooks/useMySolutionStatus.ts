"use client";

import { useMemo } from "react";

import { useGetMySolutionsQuery } from "@/lib/redux/services/solutionsApi";

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

export const MY_COMMUNITY_HREF = "/dashboard/my-community";

const PAGE_SIZE = 100;

export function useMySolutionStatus(options?: { skip?: boolean }) {
  const { data, isLoading } = useGetMySolutionsQuery(
    { pageSize: PAGE_SIZE },
    { skip: options?.skip },
  );

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
    forProblem: (problemId?: string) =>
      problemId ? (byProblem.get(problemId) ?? []) : [],
    unresolvedFor: (problemId?: string) => {
      const list = problemId ? (byProblem.get(problemId) ?? []) : [];
      return list.find((entry) => entry.review === "REJECTED");
    },
  };
}
