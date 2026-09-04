"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/I18nProvider";
import { motion, useInView } from "motion/react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import SectionBackdrop, { ACCENT, PRIMARY, useInk } from "./SectionBackdrop";

const PROBLEM = {
  title: "SSRF filter keeps getting bypassed on the IMDSv2 redirect chain",
  tags: ["AWS", "SSRF", "Go"],
  author: "0xShadow",
  timeAgo: "2h ago",
  replies: 34,
  body: "Our allowlist resolves the hostname before the request, but a 302 to 169.254.169.254 still slips through on the second hop. Re-resolving on every redirect kills throughput.",
};

const SOLUTION = {
  author: "kmartens",
  timeAgo: "51m ago",
  upvotes: 127,
  body: "Stop validating hostnames and pin the socket instead. Resolve once, check the resulting IP against the deny ranges, then dial that exact IP with a custom DialContext — the redirect can point anywhere it likes, because the transport never re-resolves.",
  snippet: "transport.DialContext = pinnedDialer(allowedIPs)",
};

type Thread = {
  title: string;
  tags: string[];
  answers: number;
  solved: boolean;
  timeAgo: string;
};

const THREADS: Thread[] = [
  {
    title: "Stripe webhook retries are double-crediting payouts under load",
    tags: ["Payments", "Idempotency"],
    answers: 12,
    solved: true,
    timeAgo: "6h ago",
  },
  {
    title: "CSP nonce breaks the Next.js inline hydration script",
    tags: ["Next.js", "CSP"],
    answers: 8,
    solved: true,
    timeAgo: "1d ago",
  },
  {
    title: "Scoping a mobile pentest when the API is shared with the web app",
    tags: ["Mobile", "Pentest"],
    answers: 5,
    solved: false,
    timeAgo: "3h ago",
  },
];

const MINI_STATS = [
  { value: "1,340", label: "Problems posted" },
  { value: "91%", label: "Reach an accepted answer" },
  { value: "3.4h", label: "Median time to first answer" },
  { value: "128", label: "Regular contributors" },
];

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
  return solved ? (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      Solved
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 dark:border-neutral-700 dark:text-neutral-400">
      <CircleDot className="h-3.5 w-3.5" aria-hidden />
      Open
    </span>
  );
}

export function ProblemsSolutions() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ink = useInk();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-10 sm:py-14"
    >
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
                Problems &amp; solutions
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
              Post the problem with the error, the stack and what you already
              ruled out. Anyone can answer; the author marks what actually
              worked, and that answer becomes the thread&apos;s permanent
              record.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-slate-200 pt-8 dark:border-neutral-800">
              {MINI_STATS.map((s) => (
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
              href="/problems"
              className="group mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
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
                {TOPICS.map((t, i) => (
                  <motion.li
                    key={t.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={inView ? { opacity: 1, y: 0 } : undefined}
                    transition={{
                      duration: 0.45,
                      delay: 0.5 + i * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link href="/problems" className="group block">
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          className="text-sm font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                          style={{ color: ink }}
                        >
                          {t.label}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-slate-400 dark:text-neutral-500">
                          {t.count}
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
                              ? { width: `${(t.count / TOPIC_MAX) * 100}%` }
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
            <div className="relative">
              <motion.span
                className="absolute left-6 top-[7.5rem] w-px origin-top"
                style={{ backgroundColor: ACCENT }}
                initial={{ height: 0, opacity: 0 }}
                animate={inView ? { height: 88, opacity: 0.45 } : undefined}
                transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
                aria-hidden
              />

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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:bg-neutral-800 dark:text-neutral-300">
                    Problem
                  </span>
                  {PROBLEM.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500 dark:border-neutral-700 dark:text-neutral-400"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="ml-auto text-xs text-slate-400 dark:text-neutral-500">
                    {PROBLEM.timeAgo}
                  </span>
                </div>

                <h3
                  className="mt-4 text-lg font-bold leading-snug tracking-tight sm:text-xl"
                  style={{ color: ink }}
                >
                  {PROBLEM.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
                  {PROBLEM.body}
                </p>

                <div className="mt-5 flex items-center gap-4 text-xs text-slate-400 dark:text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E293B] text-xs font-bold text-white dark:bg-neutral-700">
                      {PROBLEM.author.slice(2, 3).toUpperCase()}
                    </span>
                    {PROBLEM.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                    {PROBLEM.replies} replies
                  </span>
                </div>
              </motion.article>

              <motion.article
                initial={{ opacity: 0, y: 22 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  duration: 0.55,
                  delay: 0.75,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="ml-0 mt-6 rounded-2xl bg-white p-6 shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_2px_10px_rgba(30,41,59,0.05)] sm:ml-12 dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_2px_10px_rgba(0,0,0,0.5)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatePill solved />
                  <span className="text-xs font-medium text-slate-400 dark:text-neutral-500">
                    accepted by {PROBLEM.author}
                  </span>
                  <span className="ml-auto text-xs text-slate-400 dark:text-neutral-500">
                    {SOLUTION.timeAgo}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
                  {SOLUTION.body}
                </p>

                <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 dark:bg-neutral-950 dark:text-neutral-300">
                  <code>{SOLUTION.snippet}</code>
                </pre>

                <div className="mt-5 flex items-center gap-4 text-xs text-slate-400 dark:text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {SOLUTION.author.slice(0, 1).toUpperCase()}
                    </span>
                    {SOLUTION.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                    {SOLUTION.upvotes}
                  </span>
                </div>
              </motion.article>
            </div>
            <div className="mt-10">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-3 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">
                  {t("sections.problems.recentlyPosted")}
                </span>
                <Link
                  href="/problems"
                  className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-700 dark:text-neutral-500 dark:hover:text-neutral-200"
                >
                  {t("sections.problems.seeAll")}
                </Link>
              </div>

              {THREADS.map((t, i) => (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    duration: 0.45,
                    delay: 0.9 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="border-b border-slate-200 dark:border-neutral-800"
                >
                  <Link
                    href="/problems"
                    className="group -mx-4 flex items-start justify-between gap-4 rounded-xl px-4 py-5 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900"
                  >
                    <div className="min-w-0">
                      <p
                        className="text-base font-semibold leading-snug tracking-tight"
                        style={{ color: ink }}
                      >
                        {t.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-neutral-500">
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-500 dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            {tag}
                          </span>
                        ))}
                        <span>·</span>
                        <span>{t.answers} answers</span>
                        <span>·</span>
                        <span>{t.timeAgo}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <StatePill solved={t.solved} />
                      <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-600 dark:text-neutral-600 dark:group-hover:text-neutral-300" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemsSolutions;
