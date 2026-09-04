"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { ArrowLeft, ChevronRight, ShieldAlert } from "lucide-react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { CreateSolutionForm } from "@/components/discussions/create/CreateSolutionForm";
import { useInk } from "@/components/landing/SectionBackdrop";
import { useGetProblemByIdQuery } from "@/lib/redux/services/problemsApi";
import {
  useGetMyProfileQuery,
  useGetSolutionByIdQuery,
} from "@/lib/redux/services/solutionsApi";

export function SolutionEditScreen({ solutionId }: { solutionId: string }) {
  const ink = useInk();

  const {
    data: solution,
    isLoading,
    isError,
    error,
  } = useGetSolutionByIdQuery(solutionId, { skip: !solutionId });

  const { data: problem } = useGetProblemByIdQuery(solution?.problemId ?? "", {
    skip: !solution?.problemId,
  });

  const { data: me } = useGetMyProfileQuery();
  const isMine = solution?.viewerOwnsSolution
    ? true
    : me?.id
      ? solution?.author?.id === me.id
      : undefined;

  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined;

  const backHref = solution?.problemId
    ? `/community/${solution.problemId}`
    : "/dashboard/my-community";

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative min-h-[calc(100dvh-var(--navbar-height))] py-10 sm:py-14">
        <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="border-b border-slate-200 pb-8 dark:border-neutral-800"
          >
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-neutral-400"
            >
              <Link
                href="/community"
                className="transition-colors hover:text-slate-900 dark:hover:text-neutral-200"
              >
                Community
              </Link>
              <ChevronRight className="size-3.5 text-slate-300 dark:text-neutral-600" />
              <Link
                href={backHref}
                className="max-w-[16rem] truncate transition-colors hover:text-slate-900 dark:hover:text-neutral-200"
              >
                {problem?.title ?? "Problem"}
              </Link>
              <ChevronRight className="size-3.5 text-slate-300 dark:text-neutral-600" />
              <span
                aria-current="page"
                className="text-slate-900 dark:text-neutral-200"
              >
                Edit solution
              </span>
            </nav>

            <div className="mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="h-px w-8" style={{ backgroundColor: ink }} />
                  <span
                    className="text-xs font-bold uppercase tracking-[0.22em]"
                    style={{ color: ink }}
                  >
                    Edit solution
                  </span>
                </div>

                <h1
                  className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl"
                  style={{ color: ink }}
                >
                  Sharpen the answer
                  <span className="text-[#2563EB] dark:text-blue-400">.</span>
                </h1>
              </div>

              <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
                Saving sends this back for review, so it leaves the problem
                until a moderator approves the new version.
              </p>
            </div>
          </motion.header>

          <div className="mt-8">
            {isLoading || isMine === undefined ? (
              <FormSkeleton />
            ) : isError || !solution ? (
              <Notice
                title={
                  status === 404 ? "Solution not found" : "Something went wrong"
                }
                body={
                  status === 404
                    ? "It may have been removed, or the link may be wrong."
                    : "This solution could not be loaded, so there is nothing to edit yet."
                }
                href={backHref}
              />
            ) : !isMine ? (
              <Notice
                title="This answer is not yours to edit"
                body="Only the person who wrote an answer can change it. You can post your own answer to the same problem instead."
                href={backHref}
              />
            ) : (
              <RequireAuth
                title="Sign in to edit this solution"
                description="Editing needs the account that posted it, so changes stay attached to the right author."
              >
                <CreateSolutionForm
                  problemId={solution.problemId ?? ""}
                  problem={problem}
                  solution={solution}
                  successHref={backHref}
                  cancelHref={backHref}
                  stickyTop="calc(var(--navbar-height) + 1.5rem)"
                />
              </RequireAuth>
            )}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function Notice({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-neutral-800">
        <ShieldAlert className="size-7" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
        {title}
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-neutral-400">
        {body}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <ArrowLeft className="size-4" />
        Back to the problem
      </Link>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading the solution"
      className="grid animate-pulse grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8"
    >
      <span className="sr-only">Loading the solution…</span>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="h-[32rem] rounded-2xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
        <div className="h-56 rounded-2xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
      </div>
      <div className="flex flex-col gap-5">
        <div className="h-56 rounded-2xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
        <div className="h-64 rounded-2xl border border-slate-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
      </div>
    </div>
  );
}
