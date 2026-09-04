"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Shield } from "lucide-react";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { PRIMARY, useInk } from "./SectionBackdrop";
import { HeroHubDiagram } from "./HeroHubDiagram";

const neverChanges = () => () => { };
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
      {/* ── Ambient Radial Accent Glow ── */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-[300px] w-[420px] sm:h-[480px] sm:w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-500/15 via-sky-400/10 to-emerald-400/15 blur-[70px] sm:blur-[140px] dark:from-blue-500/25 dark:via-sky-600/20 dark:to-emerald-400/20" />

      {/* ── Top Headline, Subheadline & CTAs ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 pt-6 sm:pt-10 text-center">


        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={hydrated ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl font-extrabold tracking-[-0.03em] text-slate-900 dark:text-white"
          style={{ fontSize: "clamp(32px, min(4.8vw, 6.5vh), 58px)", lineHeight: 1.25 }}
        >
          <span className="inline-block" style={{ fontSize: "clamp(29px, min(4.3vw, 5.8vh), 52px)" }}>
            {t("hero.platformTitleLine1") || "A Single Platform Built for"}
          </span>{" "}
          <span className="inline-block text-[#2563EB] dark:text-blue-400">
            {t("hero.platformTitleLine2") || "Developers and Security."}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={hydrated ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-neutral-300 font-normal text-balance"
        >
          {t("hero.platformSubtitle") || "DevSolve helps security researchers find and report vulnerabilities with guaranteed bounty escrow, while helping engineering teams remediate threats with verified code solutions."}
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
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_25px_-8px_rgba(37,99,235,0.75)] transition-all hover:brightness-110 hover:shadow-[0_14px_30px_-8px_rgba(37,99,235,0.9)] active:scale-[0.98]"
            style={{ backgroundColor: PRIMARY }}
          >
            <span>{t("hero.getStarted") || "Get started free"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href={lp("/programs")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Shield className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
            <span>{t("hero.exploreBounties") || "Explore Programs"}</span>
          </Link>

          <a
            href="https://docs.devsolve.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <BookOpen className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
            <span>{t("hero.readDocs") || "Documentation"}</span>
          </a>
        </motion.div>
      </div>

      {/* ── Main Convergence Diagram Centerpiece ── */}
      <div className="relative z-10 mt-8 sm:mt-10">
        <HeroHubDiagram />
      </div>

      {/* ── Bottom Metric Ticker ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="grid grid-cols-2 gap-4 border-t border-slate-200/90 pt-5 sm:grid-cols-4 sm:gap-6 text-center dark:border-neutral-800">
          <div>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#2563EB] dark:text-blue-400">
              $120k+
            </span>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-0.5">
              {t("hero.activeBountyPool") || "Active Bounty Pool"}
            </p>
          </div>

          <div>
            <span className="font-mono text-xl sm:text-2xl font-bold text-slate-800 dark:text-neutral-200">
              &lt; 2h
            </span>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-0.5">
              {t("hero.avgTriageSla") || "Average Triage SLA"}
            </p>
          </div>

          <div>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#10B981] dark:text-emerald-400">
              500+
            </span>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-0.5">
              {t("hero.protectedScopes") || "Protected Scopes"}
            </p>
          </div>

          <div>
            <span className="font-mono text-xl sm:text-2xl font-bold text-[#2563EB] dark:text-blue-400">
              12,000+
            </span>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-0.5">
              {t("hero.researchersAndDevs") || "Engineers & Researchers"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroPlatform;
