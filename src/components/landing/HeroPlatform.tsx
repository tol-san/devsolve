"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Bug,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  DollarSign,
  FileCode,
  Globe,
  Lock,
  MessageSquare,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import SectionBackdrop, {
  ACCENT,
  PRIMARY,
  SECONDARY,
  useInk,
} from "./SectionBackdrop";

/* ════════════════════════════════════════════════════════════════════
   SCENARIOS FOR HERO INTERACTIVE CONSOLE
   ════════════════════════════════════════════════════════════════════ */

type ScenarioKey = "bounty" | "problem" | "showcase";

interface Scenario {
  id: ScenarioKey;
  tabLabel: string;
  badge: string;
  icon: LucideIcon;
  targetOrg: string;
  scope: string;
  severity: "Critical" | "High" | "Solved";
  severityChip: string;
  title: string;
  filePath: string;
  diffOld: string;
  diffNew: string;
  payoutOrPoints: string;
  author: string;
  authorRole: string;
  triageTime: string;
  statusText: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "bounty",
    tabLabel: "Vulnerability Triage",
    badge: "Live Bounty",
    icon: ShieldAlert,
    targetOrg: "Acme Cloud Infrastructure",
    scope: "api.acme-cloud.io/v2/auth",
    severity: "Critical",
    severityChip: "bg-[#1E293B] text-white dark:bg-neutral-100 dark:text-neutral-900",
    title: "Authentication Bypass via JWT Algorithm Confusion (CVE-2026-4402)",
    filePath: "src/auth/jwt-verifier.ts",
    diffOld: `- const decoded = jwt.verify(token, pubKey, { algorithms: ["RS256", "HS256"] });`,
    diffNew: `+ const decoded = jwt.verify(token, pubKey, { algorithms: ["RS256"] }); // Enforce asymmetric only`,
    payoutOrPoints: "+$5,000 Bounty Paid",
    author: "@alex_sec",
    authorRole: "Security Researcher",
    triageTime: "Triaged in 34 mins",
    statusText: "Verified & Rewarded",
  },
  {
    id: "problem",
    tabLabel: "Production Code Fix",
    badge: "Community Fix",
    icon: Code2,
    targetOrg: "Next.js App Router Stack",
    scope: "github.com/org/saas-core",
    severity: "Solved",
    severityChip: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950",
    title: "Hydration Mismatch & Session Stalling in Server Action Middleware",
    filePath: "src/middleware/session.ts",
    diffOld: `- const session = cookies().get("auth_token")?.value; // Sync read causes hydration error`,
    diffNew: `+ const cookieStore = await cookies();\n+ const session = cookieStore.get("auth_token")?.value;`,
    payoutOrPoints: "+250 Reputation Pts",
    author: "@sarah_dev",
    authorRole: "Fullstack Engineer",
    triageTime: "Solved in 18 mins",
    statusText: "Marked Solution",
  },
  {
    id: "showcase",
    tabLabel: "Security Showcase",
    badge: "Verified Proof",
    icon: Trophy,
    targetOrg: "Supabase Realtime Engine",
    scope: "realtime.supabase.co/socket",
    severity: "High",
    severityChip: "bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-neutral-100",
    title: "WebSocket Connection State Race Condition in Broadcast Channel",
    filePath: "packages/realtime/broadcast.ts",
    diffOld: `- channel.subscribe((status) => dispatch(status)); // Unlocked state mutation`,
    diffNew: `+ const mutex = await acquireLock(channelId);\n+ channel.subscribeWithLock(mutex, (status) => dispatch(status));`,
    payoutOrPoints: "+$3,200 Bounty + Badge",
    author: "@marcus_k",
    authorRole: "AppSec Lead",
    triageTime: "Triaged in 52 mins",
    statusText: "Public Disclosure",
  },
];

/* ── Live Disclosures Feed Data for Left Console ── */
const LIVE_FEED = [
  {
    severity: "Critical",
    severityChip: "bg-[#1E293B] text-white dark:bg-neutral-100 dark:text-neutral-900",
    name: "Acme Cloud",
    type: "Auth Bypass",
    bounty: "$5,000",
    time: "2m",
  },
  {
    severity: "High",
    severityChip: "bg-slate-200 text-slate-700 dark:bg-neutral-700 dark:text-neutral-100",
    name: "Supabase Engine",
    type: "Race Condition",
    bounty: "$3,200",
    time: "14m",
  },
  {
    severity: "Medium",
    severityChip: "border border-slate-200 text-slate-500 dark:border-neutral-700 dark:text-neutral-400",
    name: "Vercel Functions",
    type: "SSRF Endpoint",
    bounty: "$1,200",
    time: "48m",
  },
  {
    severity: "Low",
    severityChip: "border border-slate-200 text-slate-400 dark:border-neutral-800 dark:text-neutral-500",
    name: "DevSolve Hub",
    type: "CORS Misconfig",
    bounty: "$400",
    time: "1h",
  },
];

/* ════════════════════════════════════════════════════════════════════
   MAIN HERO PLATFORM COMPONENT
   ════════════════════════════════════════════════════════════════════ */

export function HeroPlatform() {
  const t = useT();
  const lp = useLocalePath();
  const ink = useInk();
  const reduce = useReducedMotion();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>("bounty");

  const currentScenario =
    SCENARIOS.find((s) => s.id === selectedScenario) || SCENARIOS[0];

  return (
    <section className="relative overflow-hidden pt-8 pb-20 sm:pb-28 lg:pt-14">
      {/* Dynamic page backdrop */}
      <SectionBackdrop seed={42} gridSize={88} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── 1. HEADER, HEADLINE & CALL TO ACTION ── */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Kicker with accent line matching other sections */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 flex items-center justify-center gap-2.5"
          >
            <span className="h-px w-8" style={{ backgroundColor: PRIMARY }} />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#2563EB] dark:text-blue-400">
              {t("hero.kicker") || "One Platform"}
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-[-0.04em] sm:text-6xl lg:text-7xl leading-[1.08]"
            style={{ color: ink }}
          >
            {t("hero.titleLine1") || "Turn Found Vulnerabilities"}{" "}
            <br className="hidden sm:inline" />
            <span className="text-[#2563EB] dark:text-blue-400">
              {t("hero.titleLine2") || "into Verified Solutions"}
            </span>
            <span className="text-[#2563EB] dark:text-blue-400">.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base text-slate-500 sm:text-lg dark:text-neutral-400 leading-relaxed"
          >
            {t("hero.subheadline") ||
              "The open security platform where engineering teams launch bug bounties with transparent SLAs, triage disclosures in real-time, and developers resolve complex technical challenges."}
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href={lp("/account-type")}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(37,99,235,0.85)] transition-[filter] hover:brightness-110"
              style={{ backgroundColor: PRIMARY }}
            >
              <span>{t("hero.getStarted") || "Get started free"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={lp("/programs")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-slate-700 shadow-[0_0_0_1px_rgba(30,41,59,0.12)] transition-colors hover:bg-slate-100 dark:bg-neutral-900 dark:text-neutral-200 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] dark:hover:bg-neutral-800"
              style={{ color: ink }}
            >
              <Shield className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
              <span>{t("hero.exploreBounties") || "Browse live programs"}</span>
            </Link>
          </motion.div>

          {/* ── METRICS & TRUST TICKER ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 gap-4 border-y border-slate-200 py-6 sm:grid-cols-4 sm:gap-6 text-left sm:text-center dark:border-neutral-800"
          >
            <div className="flex flex-col sm:items-center">
              <span
                className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-mono"
              >
                $120k+
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-amber-500 shrink-0" />
                {t("hero.activeBountyPool") || "Active Bounty Pool"}
              </span>
            </div>

            <div className="flex flex-col sm:items-center">
              <span
                className="text-2xl sm:text-3xl font-bold tracking-tight font-mono"
                style={{ color: ink }}
              >
                &lt; 2h
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500 shrink-0" />
                {t("hero.avgTriageSla") || "Average Triage SLA"}
              </span>
            </div>

            <div className="flex flex-col sm:items-center">
              <span
                className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-emerald-600 dark:text-emerald-400"
              >
                500+
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                {t("hero.protectedScopes") || "Protected Scopes"}
              </span>
            </div>

            <div className="flex flex-col sm:items-center">
              <span
                className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-indigo-600 dark:text-indigo-400"
              >
                12,000+
              </span>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                <Users className="h-3 w-3 text-indigo-500 shrink-0" />
                {t("hero.researchersAndDevs") || "Researchers & Devs"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── 2. INTERACTIVE DEVELOPER & SECURITY STUDIO CONSOLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="relative mx-auto mt-12 max-w-5xl"
        >
          {/* Subtle Ambient Accent Glow Behind Card */}
          <div className="pointer-events-none absolute -top-8 left-1/2 -z-10 h-40 w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/20 via-emerald-500/15 to-indigo-500/20 blur-3xl" />

          {/* Main Card Frame using the exact landing section card shadow and border */}
          <div className="relative rounded-2xl bg-white p-6 sm:p-8 shadow-[0_0_0_1px_rgba(30,41,59,0.08),0_2px_10px_rgba(30,41,59,0.05)] ring-1 ring-blue-500/10 dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_2px_10px_rgba(0,0,0,0.5)] dark:ring-blue-400/20">
            {/* Top Bar Header & Scenario Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-neutral-800">
              {/* Window Dots & Identifier */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-neutral-700 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-neutral-700 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-neutral-700 inline-block" />
                </div>
                <span className="hidden sm:inline-block text-xs font-mono text-slate-400 dark:text-neutral-500">
                  devsolve://triage-engine/v2
                </span>
              </div>

              {/* Interactive Scenario Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {SCENARIOS.map((sc) => {
                  const Icon = sc.icon;
                  const isActive = sc.id === selectedScenario;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setSelectedScenario(sc.id)}
                      className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#2563EB] text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)]"
                          : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{sc.tabLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-neutral-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t("hero.realtime") || "Live"}</span>
              </div>
            </div>

            {/* Studio Workspace Split Grid */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Column: Live Hacktivity Stream (4 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500">
                    {t("hero.liveTriageStream") || "Live Triage Stream"}
                  </span>
                  <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-300">
                    {t("hero.realtime") || "Live"}
                  </span>
                </div>

                {/* Stream Item List */}
                <div className="space-y-2.5">
                  {LIVE_FEED.map((item, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs transition-colors hover:border-slate-300 dark:border-neutral-800 dark:bg-neutral-950/50 dark:hover:border-neutral-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`rounded-md px-2 py-0.5 font-bold uppercase text-[10px] tracking-wider ${item.severityChip}`}
                        >
                          {item.severity}
                        </span>
                        <div className="truncate">
                          <p
                            className="font-bold truncate"
                            style={{ color: ink }}
                          >
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-neutral-500 truncate">
                            {item.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {item.bounty}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-neutral-500">
                          {item.time} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Triage SLA Note */}
                <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-500 dark:border-neutral-800 dark:text-neutral-400 flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
                  <span>
                    Average triage speed &lt; 42 mins with public severity verification.
                  </span>
                </div>
              </div>

              {/* Right Column: Active Remediation Console & Code Diff (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentScenario.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {/* Header Details */}
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 font-bold uppercase text-[10px] tracking-wider ${currentScenario.severityChip}`}
                          >
                            {currentScenario.severity}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono">
                            {currentScenario.targetOrg}
                          </span>
                        </div>
                        <h4
                          className="mt-2 text-base font-bold tracking-tight"
                          style={{ color: ink }}
                        >
                          {currentScenario.title}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block rounded-full bg-[#EFF6FF] px-3 py-1 font-bold font-mono text-xs text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-300">
                          {currentScenario.payoutOrPoints}
                        </span>
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
                          {currentScenario.triageTime}
                        </p>
                      </div>
                    </div>

                    {/* Syntax Highlighted Code Diff Box */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 overflow-x-auto">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80 text-[11px] text-slate-400 dark:border-neutral-800 dark:text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <FileCode className="h-3.5 w-3.5 text-[#2563EB] dark:text-blue-400" />
                          <span>{currentScenario.filePath}</span>
                        </div>
                        <span className="rounded bg-white px-2 py-0.5 text-[10px] shadow-[0_0_0_1px_rgba(30,41,59,0.08)] dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
                          {t("hero.patchApplied") || "Patch Applied"}
                        </span>
                      </div>

                      {/* Vulnerable vs Remediation Lines */}
                      <div className="space-y-1.5 leading-relaxed">
                        <p className="text-rose-600 dark:text-rose-400 whitespace-pre-wrap">
                          {currentScenario.diffOld}
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-semibold whitespace-pre-wrap">
                          {currentScenario.diffNew}
                        </p>
                      </div>
                    </div>

                    {/* Author & Verification Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs shadow-[0_0_0_1px_rgba(37,99,235,0.2)] dark:bg-blue-500/15 dark:text-blue-400">
                          {currentScenario.author.slice(1, 3).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold" style={{ color: ink }}>
                            {currentScenario.author}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                            {currentScenario.authorRole}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          {currentScenario.statusText}
                        </span>
                        <Link
                          href={lp("/programs")}
                          className="group inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_0_0_1px_rgba(30,41,59,0.12)] hover:bg-slate-100 dark:bg-neutral-800 dark:text-neutral-200 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)] dark:hover:bg-neutral-700 transition-colors"
                          style={{ color: ink }}
                        >
                          <span>{t("hero.inspectReport") || "Inspect Report"}</span>
                          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroPlatform;



