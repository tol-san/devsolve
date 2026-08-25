"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CreateProblemForm } from "@/components/discussions/create/CreateProblemForm";
import { useInk } from "@/components/landing/SectionBackdrop";

export default function PublicCreateProblemPage() {
  const ink = useInk();

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
              className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-neutral-400"
            >
              <Link
                href="/community"
                className="transition-colors hover:text-slate-900 dark:hover:text-neutral-200"
              >
                Community
              </Link>
              <ChevronRight className="size-3.5 text-slate-300 dark:text-neutral-600" />
              <Link
                href="/community/create"
                className="transition-colors hover:text-slate-900 dark:hover:text-neutral-200"
              >
                New post
              </Link>
              <ChevronRight className="size-3.5 text-slate-300 dark:text-neutral-600" />
              <span
                aria-current="page"
                className="text-slate-900 dark:text-neutral-200"
              >
                Problem
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
                    New problem
                  </span>
                </div>

                <h1
                  className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl"
                  style={{ color: ink }}
                >
                  Show what went wrong
                  <span className="text-[#2563EB] dark:text-blue-400">.</span>
                </h1>
              </div>

              <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
                Describe what failed, where it happens, and what you already
                tried. Clear context helps the right people reproduce it and
                respond.
              </p>
            </div>
          </motion.header>

          <div className="mt-8">
            {/* Covers the routes into this page that skip the gated link — a
                pasted URL, a bookmark, back/forward. */}
            <RequireAuth
              title="Sign in to post a problem"
              description="Posting a problem needs an account, so answers reach you and the thread stays attached to your profile. It only takes a moment."
            >
              <CreateProblemForm
                successHref="/dashboard/my-community"
                cancelHref="/community/create"
                stickyTop="calc(var(--navbar-height) + 1.5rem)"
              />
            </RequireAuth>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
