"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ACCENT, PRIMARY, SECONDARY } from "./SectionBackdrop";

interface HeroHubDiagramProps {
  className?: string;
}

export function HeroHubDiagram({ className = "" }: HeroHubDiagramProps) {
  const reduce = useReducedMotion();

  const researcherFeatures = [
    { label: "Guaranteed Payouts & Fast SLAs", sub: "Instant bounty escrow on triage" },
    { label: "Real-Time Vulnerability Triage", sub: "Direct sync with core maintainers" },
    { label: "Community Solution Engine", sub: "Collaborative patch development" },
    { label: "CLI & GitHub Integrations", sub: "Submit reports right from your terminal" },
  ];

  const organizationFeatures = [
    { label: "Centralized Scope & Asset Control", sub: "Define precise public & private boundaries" },
    { label: "Automated SLA & Policy Rules", sub: "Enforce strict resolution timelines" },
    { label: "Verified Patch Verification", sub: "Zero regression with live proof-of-concept" },
    { label: "Team Permissions & Audit Logs", sub: "Role-based access & compliance tracking" },
  ];

  return (
    <div className={`relative mx-auto w-full max-w-6xl px-4 select-none ${className}`}>
      {/* ── Ambient Radial Bloom Behind Diagram (Primary & Accent) ── */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[650px] max-w-full rounded-full bg-gradient-to-tr from-blue-600/20 via-sky-500/15 to-emerald-500/20 blur-[100px] dark:from-blue-500/25 dark:via-blue-600/20 dark:to-emerald-400/20" />

      {/* ── MAIN DIAGRAM GRID ── */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0">
        
        {/* ── LEFT COLUMN: RESEARCHERS / DEVELOPERS (PRIMARY BLUE) ── */}
        <div className="w-full lg:w-72 flex flex-col gap-3.5 text-left z-10">
          <div className="mb-1">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span>Developers & Hunters</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
              [ Bounty Researchers ]
            </p>
          </div>

          <div className="space-y-3">
            {researcherFeatures.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                className="group relative flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 shadow-xs backdrop-blur-md transition-all hover:border-[#2563EB]/50 hover:bg-white dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:hover:border-blue-400/50 dark:hover:bg-neutral-900"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-blue-50 text-[#2563EB] dark:border-blue-400/50 dark:bg-blue-950 dark:text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    {item.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CENTER CORE: CONCENTRIC CONVERGENCE PORTAL (PRIMARY + ACCENT) ── */}
        <div className="relative flex items-center justify-center shrink-0 my-4 lg:my-0">
          
          {/* Connecting SVG Stream Wave Lines (Visible on desktop) */}
          <svg
            className="absolute hidden lg:block pointer-events-none w-[780px] h-[340px]"
            viewBox="0 0 780 340"
            fill="none"
          >
            {/* Left Stream Beams to Center (Primary Blue) */}
            <path
              d="M 120 70 C 240 70, 310 170, 390 170"
              stroke="#2563EB"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 120 135 C 240 135, 310 170, 390 170"
              stroke="#2563EB"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
            <path
              d="M 120 205 C 240 205, 310 170, 390 170"
              stroke="#2563EB"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
            <path
              d="M 120 270 C 240 270, 310 170, 390 170"
              stroke="#2563EB"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Right Stream Beams to Center (Accent Emerald) */}
            <path
              d="M 660 70 C 540 70, 470 170, 390 170"
              stroke="#10B981"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 660 135 C 540 135, 470 170, 390 170"
              stroke="#10B981"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
            <path
              d="M 660 205 C 540 205, 470 170, 390 170"
              stroke="#10B981"
              strokeOpacity="0.3"
              strokeWidth="1.5"
            />
            <path
              d="M 660 270 C 540 270, 470 170, 390 170"
              stroke="#10B981"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Core Outer Rotating Orbit Ring */}
          <div className="relative flex items-center justify-center h-72 w-72 sm:h-80 sm:w-80">
            
            {/* Outer Track Ring with Glowing Particles */}
            <motion.div
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-blue-500/25 dark:border-blue-400/35"
            >
              {/* Particle 1 (Primary Blue) */}
              <div className="absolute top-2 left-1/4 h-3 w-3 -translate-x-1/2 rounded-full bg-[#2563EB] shadow-[0_0_12px_#2563EB]" />
              {/* Particle 2 (Accent Emerald) */}
              <div className="absolute bottom-4 right-1/4 h-3 w-3 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
              {/* Particle 3 (Sky Blue) */}
              <div className="absolute top-1/2 -right-1.5 h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38BDF8]" />
            </motion.div>

            {/* Middle Concentric Ring (Navy / Blue Glass Plate) */}
            <div className="relative flex items-center justify-center h-56 w-56 sm:h-64 sm:w-64 rounded-full border border-blue-500/30 bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-950/95 shadow-[0_0_40px_rgba(37,99,235,0.2)] backdrop-blur-xl">
              
              {/* Circular Labels along the Ring */}
              <div className="absolute top-3.5 text-[10px] font-mono font-bold tracking-widest text-blue-300 uppercase">
                Triage
              </div>
              <div className="absolute bottom-3.5 text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                Remediate
              </div>
              <div className="absolute left-3.5 text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase -rotate-90">
                Discover
              </div>
              <div className="absolute right-3.5 text-[10px] font-mono font-bold tracking-widest text-emerald-300 uppercase rotate-90">
                Verify
              </div>

              {/* Inner Glowing Core with REAL DEVSOLVE LOGO */}
              <div className="relative flex items-center justify-center h-32 w-32 sm:h-36 sm:w-36 rounded-full border border-blue-400/40 bg-white/95 dark:bg-neutral-900/95 p-4 shadow-[0_0_30px_rgba(37,99,235,0.35),inset_0_0_15px_rgba(37,99,235,0.1)]">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                  <Image
                    src="/icon.png"
                    alt="DevSolve"
                    fill
                    priority
                    sizes="80px"
                    className="object-contain drop-shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: ORGANIZATIONS / SECURITY TEAMS (ACCENT EMERALD) ── */}
        <div className="w-full lg:w-72 flex flex-col gap-3.5 text-left lg:text-right z-10">
          <div className="mb-1">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center lg:justify-end gap-2">
              <span>Security & DevOps</span>
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
              [ Engineering Teams ]
            </p>
          </div>

          <div className="space-y-3">
            {organizationFeatures.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                className="group relative flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 shadow-xs backdrop-blur-md transition-all hover:border-[#10B981]/50 hover:bg-white dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:hover:border-emerald-400/50 dark:hover:bg-neutral-900 flex-row lg:flex-row-reverse"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-50 text-[#10B981] dark:border-emerald-400/50 dark:bg-emerald-950 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] dark:bg-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-neutral-200">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    {item.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroHubDiagram;
