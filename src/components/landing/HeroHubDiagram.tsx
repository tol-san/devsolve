"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ACCENT, PRIMARY, SECONDARY } from "./SectionBackdrop";

interface HeroHubDiagramProps {
  className?: string;
}

export function HeroHubDiagram({ className = "" }: HeroHubDiagramProps) {
  const reduce = useReducedMotion();
  const [hoveredCard, setHoveredCard] = useState<{ side: "left" | "right"; index: number } | null>(null);

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

  // Exact vertical centers for each of the 4 card boxes:
  // Card 0: 12.5% | Card 1: 37.5% | Card 2: 62.5% | Card 3: 87.5%
  // Convergence points at Hub perimeter: 30%, 43%, 57%, 70%
  const leftBridges = [
    { d: "M 0, 12.5 C 55, 12.5, 65, 30, 100, 30", cy: 12.5, hubY: 30 },
    { d: "M 0, 37.5 C 50, 37.5, 65, 43, 100, 43", cy: 37.5, hubY: 43 },
    { d: "M 0, 62.5 C 50, 62.5, 65, 57, 100, 57", cy: 62.5, hubY: 57 },
    { d: "M 0, 87.5 C 55, 87.5, 65, 70, 100, 70", cy: 87.5, hubY: 70 },
  ];

  const rightBridges = [
    { d: "M 0, 30 C 35, 30, 45, 12.5, 100, 12.5", cy: 12.5, hubY: 30 },
    { d: "M 0, 43 C 35, 43, 50, 37.5, 100, 37.5", cy: 37.5, hubY: 43 },
    { d: "M 0, 57 C 35, 57, 50, 62.5, 100, 62.5", cy: 62.5, hubY: 57 },
    { d: "M 0, 70 C 35, 70, 45, 87.5, 100, 87.5", cy: 87.5, hubY: 70 },
  ];

  return (
    <div className={`relative mx-auto w-full max-w-6xl px-2 sm:px-4 select-none ${className}`}>
      {/* ── Ambient Radiant Bloom Behind Diagram ── */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[750px] max-w-full rounded-full bg-gradient-to-tr from-blue-500/15 via-sky-400/10 to-emerald-400/15 blur-[60px] sm:blur-[120px] dark:from-blue-500/25 dark:via-sky-600/20 dark:to-emerald-400/20" />

      {/* ── MAIN DIAGRAM CONTAINER ── */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0 z-10">
        
        {/* ── 1. LEFT COLUMN: DEVELOPERS & HUNTERS (4 CARDS) ── */}
        <div className="w-full lg:w-[290px] shrink-0 flex flex-col">
          <div className="mb-3">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB] shadow-[0_0_8px_#2563EB] animate-pulse" />
              <span>Developers & Hunters</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
              [ Bounty Researchers ]
            </p>
          </div>

          {/* 4 Cards Grid - Fixed total height matching the bridge */}
          <div className="flex flex-col justify-between h-[310px] space-y-2.5">
            {researcherFeatures.map((item, idx) => {
              const isHovered = hoveredCard?.side === "left" && hoveredCard?.index === idx;
              return (
                <motion.div
                  key={idx}
                  onMouseEnter={() => setHoveredCard({ side: "left", index: idx })}
                  onMouseLeave={() => setHoveredCard(null)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 + idx * 0.06 }}
                  className={`group relative flex h-[68px] items-center gap-3 rounded-2xl border px-3.5 backdrop-blur-md transition-all cursor-pointer ${
                    isHovered
                      ? "border-[#2563EB] bg-white shadow-[0_8px_24px_-4px_rgba(37,99,235,0.22)] -translate-y-0.5 dark:border-blue-400 dark:bg-neutral-900 dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)]"
                      : "border-slate-200/90 bg-white/90 shadow-[0_2px_10px_-3px_rgba(30,41,59,0.07)] hover:border-[#2563EB]/60 hover:shadow-[0_6px_18px_-4px_rgba(37,99,235,0.15)] dark:border-neutral-800/90 dark:bg-neutral-900/85 dark:hover:border-blue-400/60"
                  }`}
                >
                  {/* Left Indicator Icon */}
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[#2563EB] shadow-2xs dark:border-blue-400/40 dark:bg-blue-950 dark:text-blue-400">
                    <span className="h-2 w-2 rounded-full bg-[#2563EB] dark:bg-blue-400" />
                  </div>
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-neutral-100 truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 leading-tight truncate">
                      {item.sub}
                    </p>
                  </div>

                  {/* Explicit Right Terminal Beacon at Vertical Center (Middle of Card) */}
                  <span
                    className={`hidden lg:block absolute -right-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full transition-all duration-200 ${
                      isHovered
                        ? "bg-[#2563EB] scale-125 shadow-[0_0_8px_#2563EB]"
                        : "bg-blue-400/80 dark:bg-blue-400"
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── 2. LEFT FLUID CONNECTING BRIDGE (ALIGNED TO EXACT VERTICAL CENTERS) ── */}
        <div className="hidden lg:block flex-1 h-[310px] self-end relative px-0.5 pointer-events-none">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="leftBridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            {leftBridges.map((b, i) => {
              const isHovered = hoveredCard?.side === "left" && hoveredCard?.index === i;
              return (
                <g key={`left-bridge-${i}`}>
                  {/* Static Baseline Path */}
                  <path
                    d={b.d}
                    stroke="#2563EB"
                    strokeOpacity={isHovered ? "0.85" : "0.3"}
                    strokeWidth={isHovered ? "2.5" : "1.75"}
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-300"
                  />

                  {/* Flowing animated pulse energy */}
                  {!reduce && (
                    <path
                      d={b.d}
                      stroke="url(#leftBridgeGrad)"
                      strokeWidth={isHovered ? "3" : "2"}
                      strokeDasharray="8 20"
                      vectorEffect="non-scaling-stroke"
                      className="animate-flow-dash"
                    />
                  )}

                  {/* Terminal Hub Anchor Dot */}
                  <circle
                    cx="100"
                    cy={b.hubY}
                    r={isHovered ? "3.5" : "2.5"}
                    fill="#38BDF8"
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── 3. CENTER CORE: CONCENTRIC CONVERGENCE HUB ── */}
        <div className="relative flex items-center justify-center shrink-0 self-center lg:self-end mx-auto my-4 lg:my-0">
          
          {/* Core Outer Orbit Ring Container */}
          <div className="relative flex items-center justify-center h-64 w-64 sm:h-76 sm:w-76 md:h-88 md:w-88">
            
            {/* Outer Orbit Track with Orbiting Particles */}
            <motion.div
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-blue-400/40 dark:border-blue-400/35 pointer-events-none"
            >
              {/* Orbit Particle 1 (Primary Blue) */}
              <div className="absolute top-2 left-1/4 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[#2563EB] shadow-[0_0_14px_#2563EB]" />
              {/* Orbit Particle 2 (Accent Emerald) */}
              <div className="absolute bottom-4 right-1/4 h-3.5 w-3.5 rounded-full bg-[#10B981] shadow-[0_0_12px_#10B981]" />
              {/* Orbit Particle 3 (Sky Blue) */}
              <div className="absolute top-1/2 -right-1.5 h-3 w-3 rounded-full bg-sky-500 shadow-[0_0_12px_#0EA5E9]" />
            </motion.div>

            {/* Middle Concentric Ring Plate */}
            <div className="relative flex items-center justify-center h-52 w-52 sm:h-60 sm:w-60 md:h-70 md:w-70 rounded-full border border-blue-200/90 bg-gradient-to-br from-blue-50/95 via-sky-50/90 to-indigo-50/95 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.2)] backdrop-blur-xl dark:border-blue-500/30 dark:bg-gradient-to-br dark:from-slate-900/95 dark:via-blue-950/85 dark:to-slate-950/95 dark:shadow-[0_0_40px_rgba(37,99,235,0.3)]">
              
              {/* ── SMOOTH ROTATING CIRCULAR TEXT AROUND LOGO ── */}
              <motion.div
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 200 200"
                  className="h-full w-full overflow-visible"
                >
                  <defs>
                    <path
                      id="heroHubCirclePath"
                      d="M 100, 100 m -76, 0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0"
                    />
                  </defs>
                  <text className="font-mono text-[9px] font-bold uppercase fill-[#1D4ED8] dark:fill-blue-300">
                    <textPath
                      href="#heroHubCirclePath"
                      startOffset="0%"
                      textLength="474"
                      lengthAdjust="spacing"
                    >
                      • DISCOVER • TRIAGE • REMEDIATE • VERIFY 
                    </textPath>
                  </text>
                </svg>
              </motion.div>

              {/* ── INNER GLOWING CORE WITH PROMINENT DEVSOLVE LOGO ── */}
              <div className="relative flex items-center justify-center h-32 w-32 sm:h-36 sm:w-36 md:h-42 md:w-42 rounded-full border-2 border-blue-500/25 bg-white p-5 shadow-[0_10px_35px_-4px_rgba(37,99,235,0.25),inset_0_0_20px_rgba(37,99,235,0.08)] dark:border-blue-400/50 dark:bg-neutral-900/95 dark:shadow-[0_0_35px_rgba(37,99,235,0.4),inset_0_0_15px_rgba(37,99,235,0.12)]">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-26 md:w-26">
                  {/* Light Mode No-Text Logo */}
                  <Image
                    src="/devsolvewithouttext-lightmode.png"
                    alt="DevSolve"
                    fill
                    priority
                    sizes="120px"
                    className="object-contain drop-shadow-[0_6px_16px_rgba(37,99,235,0.3)] dark:hidden"
                  />
                  {/* Dark Mode No-Text Logo */}
                  <Image
                    src="/only-devsolve-logo-notext-darkmode.png"
                    alt="DevSolve"
                    fill
                    priority
                    sizes="120px"
                    className="hidden object-contain drop-shadow-[0_6px_18px_rgba(37,99,235,0.5)] dark:block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. RIGHT FLUID CONNECTING BRIDGE (ALIGNED TO EXACT VERTICAL CENTERS) ── */}
        <div className="hidden lg:block flex-1 h-[310px] self-end relative px-0.5 pointer-events-none">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="rightBridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {rightBridges.map((b, i) => {
              const isHovered = hoveredCard?.side === "right" && hoveredCard?.index === i;
              return (
                <g key={`right-bridge-${i}`}>
                  {/* Static Baseline Path */}
                  <path
                    d={b.d}
                    stroke="#10B981"
                    strokeOpacity={isHovered ? "0.85" : "0.3"}
                    strokeWidth={isHovered ? "2.5" : "1.75"}
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-300"
                  />

                  {/* Flowing animated pulse energy */}
                  {!reduce && (
                    <path
                      d={b.d}
                      stroke="url(#rightBridgeGrad)"
                      strokeWidth={isHovered ? "3" : "2"}
                      strokeDasharray="8 20"
                      vectorEffect="non-scaling-stroke"
                      className="animate-flow-dash"
                    />
                  )}

                  {/* Terminal Hub Anchor Dot */}
                  <circle
                    cx="0"
                    cy={b.hubY}
                    r={isHovered ? "3.5" : "2.5"}
                    fill="#10B981"
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── 5. RIGHT COLUMN: SECURITY & DEVOPS (4 CARDS) ── */}
        <div className="w-full lg:w-[290px] shrink-0 flex flex-col text-left lg:text-right">
          <div className="mb-3">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center lg:justify-end gap-2">
              <span>Security & DevOps</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
              [ Engineering Teams ]
            </p>
          </div>

          {/* 4 Cards Grid - Fixed total height matching the bridge */}
          <div className="flex flex-col justify-between h-[310px] space-y-2.5">
            {organizationFeatures.map((item, idx) => {
              const isHovered = hoveredCard?.side === "right" && hoveredCard?.index === idx;
              return (
                <motion.div
                  key={idx}
                  onMouseEnter={() => setHoveredCard({ side: "right", index: idx })}
                  onMouseLeave={() => setHoveredCard(null)}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 + idx * 0.06 }}
                  className={`group relative flex h-[68px] items-center gap-3 rounded-2xl border px-3.5 backdrop-blur-md transition-all flex-row lg:flex-row-reverse cursor-pointer ${
                    isHovered
                      ? "border-[#10B981] bg-white shadow-[0_8px_24px_-4px_rgba(16,185,129,0.22)] -translate-y-0.5 dark:border-emerald-400 dark:bg-neutral-900 dark:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)]"
                      : "border-slate-200/90 bg-white/90 shadow-[0_2px_10px_-3px_rgba(30,41,59,0.07)] hover:border-[#10B981]/60 hover:shadow-[0_6px_18px_-4px_rgba(16,185,129,0.15)] dark:border-neutral-800/90 dark:bg-neutral-900/85 dark:hover:border-emerald-400/60"
                  }`}
                >
                  {/* Right Indicator Icon */}
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[#10B981] shadow-2xs dark:border-emerald-400/40 dark:bg-emerald-950 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-[#10B981] dark:bg-emerald-400" />
                  </div>
                  <div className="min-w-0 pl-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-neutral-100 truncate">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 leading-tight truncate">
                      {item.sub}
                    </p>
                  </div>

                  {/* Explicit Left Terminal Beacon at Vertical Center (Middle of Card) */}
                  <span
                    className={`hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full transition-all duration-200 ${
                      isHovered
                        ? "bg-[#10B981] scale-125 shadow-[0_0_8px_#10B981]"
                        : "bg-emerald-400/80 dark:bg-emerald-400"
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroHubDiagram;
