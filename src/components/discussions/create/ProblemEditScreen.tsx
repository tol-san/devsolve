"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { ArrowLeft, ChevronRight, ShieldAlert } from "lucide-react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { CreateProblemForm } from "@/components/discussions/create/CreateProblemForm";
import { useInk } from "@/components/landing/SectionBackdrop";
import { useGetProblemByIdQuery } from "@/lib/redux/services/problemsApi";
import { useGetMyProfileQuery } from "@/lib/redux/services/solutionsApi";

export function ProblemEditScreen({ problemId }: { problemId: string }) {
  const ink = useInk();

  const {
    data: problem,
    isLoading,
    isError,
    error,
  } = useGetProblemByIdQuery(problemId, { skip: !problemId });

  const { data: me } = useGetMyProfileQuery();
  const isOwnProblem = Boolean(me?.id && problem?.author?.id === me.id);
  const isPending = problem?.status === "PENDING_APPROVAL";
  const canEdit = problem?.canEdit !== false || (isOwnProblem && isPending);

  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: number }).status
      : undefined;

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
                href={`/community/${problemId}`}
                className="max-w-[16rem] truncate transition-colors hover:text-slate-900 dark:hover:text-neutral-200"
              >
                {problem?.title ?? "Problem"}
              </Link>
              <ChevronRight className="size-3.5 text-slate-300 dark:text-neutral-600" />
              <span
                aria-current="page"
                className="text-slate-900 dark:text-neutral-200"
              >
                Edit
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
                    Edit problem
                  </span>
                </div>

                <h1
                  className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl"
                  style={{ color: ink }}
                >
                  Make it clearer
                  <span className="text-[#2563EB] dark:text-blue-400">.</span>
                </h1>
              </div>

              <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
                Anyone already reading this problem sees your changes. Adding
                the detail people asked for beats posting the same question
                twice.
              </p>
            </div>
          </motion.header>

          <div className="mt-8">
            {isLoading ? (
              <FormSkeleton />
            ) : isError || !problem ? (
              <Notice
                title={
                  status === 404 ? "Problem not found" : "Something went wrong"
                }
                body={
                  status === 404
                    ? "It may have been removed, or the link may be wrong."
                    : "This problem could not be loaded, so there is nothing to edit yet."
                }
                problemId={problemId}
              />
            ) : !canEdit ? (
              <Notice
                title="This problem cannot be edited"
                body="Either it is not yours, or it has reached a state that is closed to changes. Its answers and comments are still open."
                problemId={problemId}
              />
            ) : (
              <RequireAuth
                title="Sign in to edit this problem"
                description="Editing needs the account that posted it, so changes stay attached to the right author."
              >
                <CreateProblemForm
                  problem={problem}
                  successHref={`/community/${problemId}`}
                  cancelHref={`/community/${problemId}`}
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
  problemId,
}: {
  title: string;
  body: string;
  problemId: string;
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
        href={`/community/${problemId}`}
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
      aria-label="Loading the problem"
      className="grid animate-pulse grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8"
    >
      <span className="sr-only">Loading the problem…</span>
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
