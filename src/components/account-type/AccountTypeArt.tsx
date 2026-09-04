"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  BarChart3,
  Bug,
  Building2,
  Inbox,
  Lightbulb,
  MessagesSquare,
  Trophy,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PILLARS: { icon: LucideIcon; label: string }[] = [
  { icon: Bug, label: "Bounty" },
  { icon: MessagesSquare, label: "Problems" },
  { icon: Lightbulb, label: "Solutions" },
  { icon: Trophy, label: "Showcase" },
];

const CYCLE = 4.4;
const BEAT = 1.1;

export function ResearcherArt() {
  const reduce = useReducedMotion();

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex items-center gap-2">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-neutral-800 text-blue-700 dark:text-blue-400 shadow-[0_0_0_1px_rgba(37,99,235,0.35)]">
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
              animate={{ opacity: [0, 1, 0], scale: [0.92, 1.12, 0.92] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <UserRound className="h-4.5 w-4.5" aria-hidden />
        </span>

        <span className="rounded-md bg-blue-50 dark:bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          You
        </span>
      </div>

      <span aria-hidden className="h-3 w-px bg-slate-200 dark:bg-neutral-700" />

      <div className="relative w-full max-w-62">
        <span
          aria-hidden
          className="absolute left-6 right-6 top-4.5 h-px bg-slate-200 dark:bg-neutral-700"
        />
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute left-6 right-6 top-4.5 h-px origin-left bg-blue-600 dark:bg-blue-500"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 0.9, 0] }}
            transition={{
              duration: CYCLE,
              times: [0, 0.55, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <ul className="relative flex items-start justify-between">
          {PILLARS.map((pillar, i) => (
            <li key={pillar.label} className="flex w-14 flex-col items-center gap-1.5">
              <motion.span
                animate={reduce ? undefined : { y: [0, -3, 0] }}
                transition={{
                  duration: BEAT,
                  repeat: Infinity,
                  repeatDelay: CYCLE - BEAT,
                  delay: i * 0.6,
                  ease: "easeInOut",
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-neutral-800 shadow-[0_0_0_1px_rgba(30,41,59,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
              >
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-xl shadow-[0_0_0_1px_rgba(37,99,235,0.55)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                      duration: BEAT,
                      repeat: Infinity,
                      repeatDelay: CYCLE - BEAT,
                      delay: i * 0.6,
                      ease: "easeInOut",
                    }}
                  />
                )}

                <motion.span
                  className="text-slate-500 dark:text-neutral-400"
                >
                  <pillar.icon className="h-4 w-4" aria-hidden />
                </motion.span>
              </motion.span>

              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-400">
                {pillar.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const QUEUE = [
  { label: "Critical", dot: "bg-rose-500", width: "w-16" },
  { label: "High", dot: "bg-orange-500", width: "w-12" },
  { label: "Medium", dot: "bg-amber-500", width: "w-20" },
];

const TEAM = ["A", "M", "K"];

export function OrganizationArt() {
  const reduce = useReducedMotion();

  return (
    <div className="flex w-full items-center justify-center px-3">
      <div className="w-full max-w-62 rounded-xl bg-white dark:bg-neutral-850 dark:bg-neutral-900 p-3 shadow-[0_0_0_1px_rgba(30,41,59,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-neutral-800 pb-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-lg shadow-[0_0_0_3px_rgba(5,150,105,0.14)]"
                animate={{ opacity: [0, 1, 0], scale: [0.92, 1.1, 0.92] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <Building2 className="h-4 w-4" aria-hidden />
          </span>

          <span className="flex flex-col gap-1">
            <span className="h-1.5 w-16 rounded-full bg-slate-300 dark:bg-neutral-600" />
            <span className="h-1 w-10 rounded-full bg-slate-200 dark:bg-neutral-700" />
          </span>

          <span className="ml-auto flex items-center gap-1">
            <motion.span
              animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Live
            </span>
          </span>
        </div>

        <ul className="mt-2.5 space-y-2">
          {QUEUE.map((row, i) => (
            <motion.li
              key={row.label}
              initial={reduce ? undefined : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.25 + i * 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-center gap-2"
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${row.dot}`} />
              <span className={`h-1.5 rounded-full bg-slate-200 dark:bg-neutral-700 ${row.width}`} />
              <span className="ml-auto text-[10px] font-semibold text-slate-400 dark:text-neutral-400">
                {row.label}
              </span>
            </motion.li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 dark:border-neutral-800 pt-2.5">
          <span className="flex -space-x-1.5">
            {TEAM.map((initial) => (
              <span
                key={initial}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-800 text-[9px] font-bold text-slate-600 dark:text-neutral-300 ring-2 ring-white dark:ring-neutral-900"
              >
                {initial}
              </span>
            ))}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-2 ring-white dark:ring-neutral-900">
              <Inbox className="h-2.5 w-2.5" aria-hidden />
            </span>
          </span>

          <BarChart3 className="h-3 w-3 shrink-0 text-slate-400 dark:text-neutral-500" aria-hidden />

          <span className="ml-auto h-1.5 w-14 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
            <motion.span
              className="block h-full w-full origin-left rounded-full bg-emerald-500/70"
              initial={{ scaleX: 0.2 }}
              animate={reduce ? undefined : { scaleX: [0.2, 0.85, 0.85] }}
              transition={{
                duration: 3.2,
                times: [0, 0.5, 1],
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
