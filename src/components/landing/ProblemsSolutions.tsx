"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { useRelativeTime } from "@/lib/i18n/relative-time";
import { motion, useInView } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  MessageSquare,
  RotateCcw,
  ThumbsUp,
} from "lucide-react";
import {
  useGetPublicProblemsQuery,
  type ProblemCard,
} from "@/lib/redux/services/publicApi";
import { ACCENT, PRIMARY, useInk } from "./SectionBackdrop";

const TOPIC_MARK = "#059669";

const TOPICS = [
  { label: "Web & API security", count: 412 },
  { label: "Cloud & infrastructure", count: 318 },
  { label: "Auth & sessions", count: 246 },
  { label: "Mobile", count: 174 },
  { label: "Payments & webhooks", count: 121 },
  { label: "Build & CI", count: 69 },
];

const TOPIC_MAX = Math.max(...TOPICS.map((t) => t.count));

function StatePill({ solved }: { solved: boolean }) {
  const t = useT();
  return solved ? (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      {t("sections.problems.solved") || "Solved"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 dark:border-neutral-700 dark:text-neutral-400">
      <CircleDot className="h-3.5 w-3.5" aria-hidden />
      {t("sections.problems.open") || "Open"}
    </span>
  );
}

function AuthorAvatar({
  avatarUrl,
  fullName,
}: {
  avatarUrl?: string | null;
  fullName?: string | null;
}) {
  const initial = (fullName || "A").trim().charAt(0).toUpperCase();

  if (avatarUrl) {
    return (
      <span className="relative h-5 w-5 overflow-hidden rounded-full shrink-0">
        <Image
          src={avatarUrl}
          alt={fullName || "Author"}
          fill
          sizes="20px"
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E293B] text-[10px] font-bold text-white dark:bg-neutral-700 shrink-0">
      {initial}
    </span>
  );
}

export function ProblemsSolutions() {
  const t = useT();
  const lp = useLocalePath();
  const formatTime = useRelativeTime();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ink = useInk();

  const { data, isLoading, isError, refetch } = useGetPublicProblemsQuery({
    sort: "TRENDING",
    size: 4,
  });

  const problems: ProblemCard[] = data?.items ?? [];
  const featured = problems[0];
  const others = problems.slice(1);

  const miniStats = [
    { value: "1,340", label: t("sections.problems.miniStats.posted") || "Problems posted" },
    { value: "91%", label: t("sections.problems.miniStats.accepted") || "Reach an accepted answer" },
    { value: "3.4h", label: t("sections.problems.miniStats.medianTime") || "Median time to first answer" },
    { value: "128", label: t("sections.problems.miniStats.contributors") || "Regular contributors" },
  ];

  const topics = [
    { label: t("sections.problems.topics.web") || "Web & API security", count: 412 },
    { label: t("sections.problems.topics.cloud") || "Cloud & infrastructure", count: 318 },
    { label: t("sections.problems.topics.auth") || "Auth & sessions", count: 246 },
    { label: t("sections.problems.topics.mobile") || "Mobile", count: 174 },
    { label: t("sections.problems.topics.payments") || "Payments & webhooks", count: 121 },
    { label: t("sections.problems.topics.build") || "Build & CI", count: 69 },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden py-10 sm:py-14">
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end dark:border-neutral-800"
        >
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-px w-8" style={{ backgroundColor: ACCENT }} />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
                {t("sections.problems.kickerLabel") || "Problems & solutions"}
              </span>
            </div>
            <h2
              className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl"
              style={{ color: ink }}
            >
              {t("sections.problems.title1")}
              <span style={{ color: ACCENT }}>.</span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
            {t("sections.problems.lede")}
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 0.55,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-4"
          >
            <p className="text-base leading-relaxed text-slate-500 dark:text-neutral-400">
              {t("sections.problems.body") ||
                "Post the problem with the error, the stack and what you already ruled out. Anyone can answer; the author marks what actually worked, and that answer becomes the thread's permanent record."}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-slate-200 pt-8 dark:border-neutral-800">
              {miniStats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500">
                    {s.label}
                  </dt>
                  <dd
                    className="mt-1.5 text-2xl font-bold tracking-tight"
                    style={{ color: ink }}
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href={lp("/problems")}
              className="group mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
              style={{ backgroundColor: ACCENT }}
            >
              {t("sections.problems.openFeed")}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <div className="mt-10 border-t border-slate-200 pt-8 dark:border-neutral-800">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-3 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">
                  {t("sections.problems.whereTheyLand")}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-neutral-500">
                  {t("sections.problems.kicker")}
                </span>
              </div>

              <ul className="mt-5 space-y-4">
                {topics.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : undefined}
                    transition={{
                      duration: 0.45,
                      delay: 0.5 + i * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link href={lp("/problems")} className="group block">
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          className="text-sm font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                          style={{ color: ink }}
                        >
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-slate-400 dark:text-neutral-500">
                          {item.count}
                        </span>
                      </div>

                      <div
                        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800"
                        aria-hidden
                      >
                        <motion.div
                          className="h-full"
                          style={{
                            backgroundColor: TOPIC_MARK,
                            borderRadius: "0 4px 4px 0",
                          }}
                          initial={{ width: 0 }}
                          animate={
                            inView
                              ? { width: `${(item.count / TOPIC_MAX) * 100}%` }
                              : undefined
                          }
                          transition={{
                            duration: 0.9,
                            delay: 0.6 + i * 0.07,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <p className="mt-6 text-xs leading-relaxed text-slate-400 dark:text-neutral-500">
                {t("sections.problems.tagged")}
              </p>
            </div>
          </motion.div>

          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-64 rounded-2xl bg-card border border-border/60 p-6" />
                <div className="space-y-3 pt-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-20 rounded-xl bg-card border border-border/50" />
                  ))}
                </div>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card p-10 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("sections.problems.loadError") || "Unable to load discussions at this time."}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : !featured ? (
              <div className="rounded-2xl border border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
                {t("sections.problems.empty") || "No discussions posted yet."}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <motion.article
                    initial={{ opacity: 0, y: 22 }}
                    animate={inView ? { opacity: 1, y: 0 } : undefined}
                    transition={{
                      duration: 0.55,
                      delay: 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="rounded-2xl bg-white p-6 shadow-[0_0_0_1px_rgba(30,41,59,0.08),0_2px_10px_rgba(30,41,59,0.05)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_2px_10px_rgba(0,0,0,0.5)]"
                  >
                    <Link href={lp(`/community/${featured.id}`)} className="group block">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB] border border-blue-200/50 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25">
                          {t("sections.problems.problemBadge") || "Problem"}
                        </span>
                        {featured.tags &&
                          featured.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag.id || tag.name}
                              className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500 dark:border-neutral-700 dark:text-neutral-400"
                            >
                              {tag.name}
                            </span>
                          ))}
                        <span className="ml-auto text-xs text-slate-400 dark:text-neutral-500">
                          {formatTime(featured.createdAt)}
                        </span>
                      </div>

                      <h3
                        className="mt-4 text-lg font-bold leading-snug tracking-tight sm:text-xl group-hover:text-emerald-600 transition-colors"
                        style={{ color: ink }}
                      >
                        {featured.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
                        {featured.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-400 dark:text-neutral-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <AuthorAvatar
                              avatarUrl={featured.author?.avatarUrl}
                              fullName={featured.author?.fullName}
                            />
                            <span>{featured.author?.fullName || "Anonymous"}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                            {featured.solutionCount ?? 0}{" "}
                            {t("sections.problems.replies") || "replies"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                            {featured.voteScore ?? 0}
                          </span>
                        </div>

                        <StatePill solved={featured.status === "RESOLVED"} />
                      </div>
                    </Link>
                  </motion.article>
                </div>

                {others.length > 0 && (
                  <div className="mt-10">
                    <div className="flex items-baseline justify-between border-b border-slate-200 pb-3 dark:border-neutral-800">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">
                        {t("sections.problems.recentlyPosted")}
                      </span>
                      <Link
                        href={lp("/problems")}
                        className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                      >
                        {t("sections.problems.seeAll")}
                      </Link>
                    </div>

                    {others.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={inView ? { opacity: 1, y: 0 } : undefined}
                        transition={{
                          duration: 0.45,
                          delay: 0.3 + i * 0.1,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="border-b border-slate-200 dark:border-neutral-800"
                      >
                        <Link
                          href={lp(`/community/${p.id}`)}
                          className="group -mx-4 flex items-start justify-between gap-4 rounded-xl px-4 py-5 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900"
                        >
                          <div className="min-w-0">
                            <p
                              className="text-base font-semibold leading-snug tracking-tight group-hover:text-emerald-600 transition-colors"
                              style={{ color: ink }}
                            >
                              {p.title}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-neutral-500">
                              {p.tags &&
                                p.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag.id || tag.name}
                                    className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-500 dark:bg-neutral-800 dark:text-neutral-300"
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              <span>·</span>
                              <span>
                                {p.solutionCount ?? 0}{" "}
                                {t("sections.problems.answers") || "answers"}
                              </span>
                              <span>·</span>
                              <span>{formatTime(p.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <StatePill solved={p.status === "RESOLVED"} />
                            <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-600 dark:text-neutral-600 dark:group-hover:text-neutral-300" />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemsSolutions;
