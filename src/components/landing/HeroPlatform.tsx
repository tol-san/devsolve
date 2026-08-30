"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Shield } from "lucide-react";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { ACCENT, PRIMARY, SECONDARY, useInk } from "./SectionBackdrop";
import { HeroHubDiagram } from "./HeroHubDiagram";

const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

function useHydrated() {
  return useSyncExternalStore(neverChanges, onClient, onServer);
}

export function HeroPlatform() {
  const t = useT();
  const lp = useLocalePath();
  const ink = useInk();
  const hydrated = useHydrated();

  return (
    <section className="relative -mt-(--navbar-height) flex flex-col justify-between overflow-hidden pt-(--navbar-height) pb-8 sm:pb-12">
      {/* ── Ambient Radial Accent Glow (Primary Blue & Emerald Accent) ── */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-[480px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-600/20 via-sky-500/15 to-emerald-500/15 blur-[140px] dark:from-blue-500/25 dark:via-sky-600/20 dark:to-emerald-400/20" />

      {/* ── Top Headline, Subheadline & CTAs ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-6 sm:pt-10 text-center">
        
        {/* Kicker with Primary Accent Line */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={hydrated ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.4 }}
          className="mb-3.5 flex items-center justify-center gap-2.5"
        >
          <span className="h-px w-8" style={{ backgroundColor: PRIMARY }} />
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#2563EB] dark:text-blue-400">
            {t("hero.kicker") || "One Unified Platform"}
          </span>
        </motion.div>

        {/* Main Title without MagicUI */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={hydrated ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl font-extrabold tracking-[-0.04em] text-[#1E293B] dark:text-white"
          style={{ fontSize: "clamp(32px, min(5.2vw, 7vh), 64px)", lineHeight: 1.12 }}
        >
          <span>A Single Platform Built for </span>
          <br className="hidden sm:inline" />
          <span className="text-[#2563EB] dark:text-blue-400">
            Developers and Security
          </span>
          <span className="text-[#2563EB] dark:text-blue-400">.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={hydrated ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-neutral-300"
        >
          DevSolve helps security researchers find and report vulnerabilities with guaranteed bounty escrow, while helping engineering teams remediate threats with verified code solutions.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={hydrated ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Link
            href={lp("/account-type")}
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_-10px_rgba(37,99,235,0.8)] transition-[filter] hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: PRIMARY }}
          >
            <span>{t("hero.getStarted") || "Get started free"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href={lp("/programs")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-xs backdrop-blur-md transition-colors hover:bg-slate-100 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Shield className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
            <span>{t("hero.exploreBounties") || "Explore Programs"}</span>
          </Link>
        </motion.div>
      </div>

      {/* ── Main Convergence Diagram Centerpiece ── */}
      <div className="relative z-10 mt-8 sm:mt-10">
        <HeroHubDiagram />
      </div>

      {/* ── Bottom Metric Ticker (Primary & Accent) ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-6 sm:pt-8">
        <div className="grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-5 sm:grid-cols-4 sm:gap-6 text-center dark:border-neutral-800">
          <div>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#2563EB] dark:text-blue-400">
              $120k+
            </span>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-0.5">
              Active Bounty Pool
            </p>
          </div>

          <div>
            <span className="font-mono text-xl sm:text-2xl font-bold" style={{ color: ink }}>
              &lt; 2h
            </span>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-0.5">
              Average Triage SLA
            </p>
          </div>

          <div>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#10B981] dark:text-emerald-400">
              500+
            </span>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-0.5">
              Protected Scopes
            </p>
          </div>

          <div>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#2563EB] dark:text-blue-400">
              12,000+
            </span>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-0.5">
              Engineers & Researchers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroPlatform;
