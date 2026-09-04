"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  Code2,
  DollarSign,
  Globe2,
  Lock,
  Radio,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { ACCENT, PRIMARY } from "./SectionBackdrop";
import { RealEarthIllustration } from "./RealEarthIllustration";

export function HeroNetworkVisual() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-1 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[800px] max-w-full rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-500/10 to-emerald-500/15 blur-[120px] dark:from-blue-500/20 dark:via-indigo-500/15 dark:to-emerald-400/20" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-35 sm:opacity-50 dark:opacity-45 scale-90 sm:scale-100 lg:scale-110">
        <RealEarthIllustration />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="pointer-events-auto absolute top-24 left-3 hidden xl:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-lg shadow-blue-500/5 backdrop-blur-md transition-all hover:scale-105 hover:border-blue-500/40 dark:border-neutral-800/90 dark:bg-neutral-900/85 dark:shadow-black/40"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
          <Radio className="h-4 w-4 animate-pulse" />
        </div>
        <div className="text-left text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-neutral-100">
            <span>Global Bug Triage</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
            500+ Scopes Monitored
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="pointer-events-auto absolute top-28 right-3 hidden xl:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-3 shadow-lg shadow-emerald-500/5 backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-500/40 dark:border-neutral-800/90 dark:bg-neutral-900/85 dark:shadow-black/40"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <Zap className="h-4 w-4" />
        </div>
        <div className="text-left text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-neutral-100">
            <span>Verified Remediation</span>
            <span className="rounded bg-emerald-500/15 px-1 py-0.2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              SOLVED
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
            Direct GitHub Patch Sync
          </p>
        </div>
      </motion.div>

      <motion.div
        animate={reduce ? undefined : { y: [-6, 6, -6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-[18%] hidden lg:flex items-center gap-1 rounded-md border border-slate-200/60 bg-white/60 px-2 py-1 text-xs font-mono text-slate-500 shadow-2xs backdrop-blur-xs dark:border-neutral-800/60 dark:bg-neutral-900/60 dark:text-neutral-400"
      >
        <span className="text-emerald-600 dark:text-emerald-400">200 OK</span>
        <span>·</span>
        <span>jwt.verify(token)</span>
      </motion.div>

      <motion.div
        animate={reduce ? undefined : { y: [6, -6, 6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-20 right-[16%] hidden lg:flex items-center gap-1 rounded-md border border-slate-200/60 bg-white/60 px-2 py-1 text-xs font-mono text-slate-500 shadow-2xs backdrop-blur-xs dark:border-neutral-800/60 dark:bg-neutral-900/60 dark:text-neutral-400"
      >
        <span className="text-blue-600 dark:text-blue-400">PATCH</span>
        <span>·</span>
        <span>/v2/auth/session</span>
      </motion.div>
    </div>
  );
}

export default HeroNetworkVisual;
