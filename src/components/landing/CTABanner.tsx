"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Bug, MessageSquare, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionBackdrop, { ACCENT, PRIMARY, SECONDARY } from "./SectionBackdrop";

const PILLARS: { icon: LucideIcon; title: string; body: string; href: string }[] = [
  {
    icon: Bug,
    title: "Hunt bounties",
    body: "Browse live programs, submit a report, get paid at the tier it lands in.",
    href: "/programs",
  },
  {
    icon: MessageSquare,
    title: "Solve problems",
    body: "Post what is broken, or answer someone else's and make it permanent.",
    href: "/problems",
  },
  {
    icon: Trophy,
    title: "Show the work",
    body: "Every accepted report and answer compounds into a public profile.",
    href: "/leaderboard",
  },
];

export function CTABanner() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ backgroundColor: SECONDARY }}
    >
      <SectionBackdrop tone="dark" seed={9} gridSize={72} />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-px w-8" style={{ backgroundColor: ACCENT }} />
            <span
              className="text-xs font-bold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              One account
            </span>
          </div>

          <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            Find it, fix it, and have
            <br />
            the record to prove it
            <span style={{ color: PRIMARY }}>.</span>
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400">
            Bounty programs, a problem-and-solution archive, and a profile that
            carries the whole record — on one platform, free to join.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={p.href}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-white/4"
                  style={{ backgroundColor: SECONDARY }}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-white" aria-hidden />
                  </span>

                  <h3 className="mt-5 flex items-center gap-2 text-lg font-bold tracking-tight text-white">
                    {p.title}
                    <ArrowUpRight className="h-4 w-4 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.body}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center"
        >
          <p className="text-sm text-slate-400">
            Free to join. No card, no minimum, no exclusivity clause.
          </p>

          <div className="flex flex-wrap gap-3">
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0, scale: 0.98 }}>
              <Link
                href="/account-type"
                className="group inline-flex items-center gap-2.5 rounded-full py-3 pl-6 pr-3 text-base font-semibold text-white shadow-[0_8px_24px_-10px_rgba(37,99,235,0.9)] transition-colors hover:brightness-110"
                style={{ backgroundColor: PRIMARY }}
              >
                Get started free
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: ACCENT }}
                >
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0, scale: 0.98 }}>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse programs
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CTABanner;
