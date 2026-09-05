"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

import { HoleBackground } from "@/components/animate-ui/components/backgrounds/hole";
import KnowledgeConvergence from "@/components/lightswind/knowledge-convergence";
import { Badge } from "@/components/ui/badge";

export function PublicAboutHero() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617_0%,#0b1120_100%)]">
      <div className="absolute inset-0">
        <HoleBackground
          strokeColor={isDark ? "rgba(96,165,250,0.18)" : "rgba(37,99,235,0.14)"}
          particleRGBColor={isDark ? [191, 219, 254] : [59, 130, 246]}
          numberOfLines={44}
          numberOfDiscs={42}
          className="absolute inset-0 bg-transparent dark:bg-transparent opacity-85"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_20%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_20%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(248,250,252,0.94)_0%,rgba(248,250,252,0.90)_38%,rgba(248,250,252,0.76)_100%)] dark:bg-[linear-gradient(90deg,rgba(2,6,23,0.94)_0%,rgba(2,6,23,0.88)_40%,rgba(2,6,23,0.78)_100%)]" />

      <div className="relative mx-auto grid max-w-[1280px] gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 dark:border-blue-400/25 dark:bg-blue-500/12 dark:text-blue-200"
          >
            About DevSolve
          </Badge>

          <h1 className="mt-8 text-5xl font-bold tracking-[-0.06em] text-slate-900 dark:text-white sm:text-6xl lg:text-[4.25rem]">
            Knowledge, security, and builders moving in one direction
          </h1>

          <div className="mt-7 h-1 w-16 rounded-full bg-blue-600" />

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            DevSolve brings organizations, ethical hackers, developers, and
            research evidence into one trusted workflow so ideas can converge into
            real security outcomes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/account-type"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Join DevSolve
            </Link>
            <Link
              href="/program"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-blue-300 bg-white/90 px-5 text-sm font-semibold text-blue-700 transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-400/25 dark:bg-slate-900/90 dark:text-blue-200 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10"
            >
              Explore Programs
            </Link>
          </div>
        </div>

        <KnowledgeConvergence />
      </div>
    </section>
  );
}
