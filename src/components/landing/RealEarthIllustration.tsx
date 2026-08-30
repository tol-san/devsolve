"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Realistic Vector Earth Illustration with continents, atmospheric glow,
 * orbital cyber security rings, and live node coordinates.
 *
 * Lightweight, GPU-accelerated SVG with 0 external network requests.
 */
export function RealEarthIllustration() {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center">
      {/* ── 1. ATMOSPHERIC OUTER AURA ── */}
      <div className="absolute -inset-10 rounded-full bg-gradient-to-tr from-blue-600/25 via-sky-400/20 to-emerald-400/15 blur-3xl" />
      <div className="absolute -inset-4 rounded-full bg-blue-500/15 blur-xl" />

      {/* ── 2. ROTATING ORBITAL DEFENSE TRACKS ── */}
      <motion.div
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-12 sm:-inset-16 rounded-full border border-dashed border-blue-500/20 dark:border-blue-400/30 pointer-events-none"
      >
        {/* Orbital Satellite Node A */}
        <div className="absolute top-1/4 -left-3 flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-white/95 px-2.5 py-1 text-xs font-mono font-bold text-blue-600 shadow-md backdrop-blur-md dark:border-blue-400/40 dark:bg-neutral-900/95 dark:text-blue-400">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
          <span>CVE-2026-4402 [PAT]</span>
        </div>

        {/* Orbital Satellite Node B */}
        <div className="absolute bottom-1/4 -right-3 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-white/95 px-2.5 py-1 text-xs font-mono font-bold text-emerald-600 shadow-md backdrop-blur-md dark:border-emerald-400/40 dark:bg-neutral-900/95 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>SLA &lt; 34m</span>
        </div>
      </motion.div>

      {/* Secondary Counter-rotating Orbit */}
      <motion.div
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-6 sm:-inset-8 rounded-full border border-indigo-500/15 dark:border-indigo-400/20 pointer-events-none"
      >
        <div className="absolute -top-3 left-1/3 flex items-center gap-1 rounded-full border border-indigo-500/40 bg-white/95 px-2.5 py-0.5 text-xs font-mono font-bold text-indigo-600 shadow-md backdrop-blur-md dark:border-indigo-400/40 dark:bg-neutral-900/95 dark:text-indigo-400">
          <span>500+ Scopes Active</span>
        </div>
      </motion.div>

      {/* ── 3. MAIN PLANET SPHERE ── */}
      <div className="relative h-64 w-64 sm:h-80 sm:w-80 md:h-96 md:w-96 rounded-full overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.25)] border border-sky-400/30 dark:border-sky-400/40 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950">
        {/* Ocean Background Gradient & Deep Atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,#1e3a8a_0%,#0f172a_70%,#020617_100%)] opacity-90" />

        {/* Realistic Continents Layer (Dual SVG for seamless 360 degree rotation) */}
        <motion.div
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex h-full w-[200%] opacity-80"
        >
          {/* Continent Tile 1 */}
          <svg
            className="h-full w-1/2 shrink-0 text-emerald-500/60 dark:text-emerald-400/70"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            {/* North America */}
            <path d="M40,30 Q60,20 85,25 Q110,35 115,55 Q120,75 105,85 Q95,95 80,90 Q70,75 55,70 Q45,60 40,45 Z" />
            <path d="M70,40 Q80,30 90,38 Q85,50 75,45 Z" />
            {/* Greenland */}
            <path d="M110,15 Q130,10 135,22 Q125,32 110,25 Z" />
            {/* South America */}
            <path d="M95,100 Q120,105 125,125 Q130,155 110,180 Q100,185 95,160 Q85,130 95,100 Z" />
            {/* Europe */}
            <path d="M180,35 Q205,25 215,40 Q225,55 205,65 Q190,60 180,50 Z" />
            <path d="M175,25 Q185,20 190,28 Q180,35 175,25 Z" />
            {/* Africa */}
            <path d="M175,70 Q215,65 230,95 Q240,135 210,170 Q190,175 180,140 Q170,100 175,70 Z" />
            <path d="M235,140 Q242,135 240,155 Q235,160 235,140 Z" />
            {/* Asia */}
            <path d="M220,30 Q270,18 330,30 Q360,55 350,90 Q320,100 295,85 Q265,95 245,65 Q230,50 220,30 Z" />
            <path d="M280,75 Q305,70 310,95 Q295,110 280,95 Z" />
            {/* Japan */}
            <path d="M355,50 Q362,45 365,60 Q358,70 355,50 Z" />
            {/* Australia */}
            <path d="M310,130 Q350,125 360,150 Q350,175 320,170 Q305,150 310,130 Z" />
            {/* Southeast Asia Islands */}
            <path d="M300,105 Q315,100 320,115 Q305,120 300,105 Z" />
          </svg>

          {/* Continent Tile 2 (Identical for seamless loop) */}
          <svg
            className="h-full w-1/2 shrink-0 text-emerald-500/60 dark:text-emerald-400/70"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            {/* North America */}
            <path d="M40,30 Q60,20 85,25 Q110,35 115,55 Q120,75 105,85 Q95,95 80,90 Q70,75 55,70 Q45,60 40,45 Z" />
            <path d="M70,40 Q80,30 90,38 Q85,50 75,45 Z" />
            {/* Greenland */}
            <path d="M110,15 Q130,10 135,22 Q125,32 110,25 Z" />
            {/* South America */}
            <path d="M95,100 Q120,105 125,125 Q130,155 110,180 Q100,185 95,160 Q85,130 95,100 Z" />
            {/* Europe */}
            <path d="M180,35 Q205,25 215,40 Q225,55 205,65 Q190,60 180,50 Z" />
            <path d="M175,25 Q185,20 190,28 Q180,35 175,25 Z" />
            {/* Africa */}
            <path d="M175,70 Q215,65 230,95 Q240,135 210,170 Q190,175 180,140 Q170,100 175,70 Z" />
            <path d="M235,140 Q242,135 240,155 Q235,160 235,140 Z" />
            {/* Asia */}
            <path d="M220,30 Q270,18 330,30 Q360,55 350,90 Q320,100 295,85 Q265,95 245,65 Q230,50 220,30 Z" />
            <path d="M280,75 Q305,70 310,95 Q295,110 280,95 Z" />
            {/* Japan */}
            <path d="M355,50 Q362,45 365,60 Q358,70 355,50 Z" />
            {/* Australia */}
            <path d="M310,130 Q350,125 360,150 Q350,175 320,170 Q305,150 310,130 Z" />
            {/* Southeast Asia Islands */}
            <path d="M300,105 Q315,100 320,115 Q305,120 300,105 Z" />
          </svg>
        </motion.div>

        {/* Global Latitude/Longitude Grid Lines */}
        <svg
          className="absolute inset-0 h-full w-full opacity-30 text-sky-300"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
        >
          <ellipse cx="100" cy="100" rx="98" ry="68" strokeDasharray="3 3" />
          <ellipse cx="100" cy="100" rx="98" ry="34" strokeDasharray="3 3" />
          <line x1="2" y1="100" x2="198" y2="100" strokeDasharray="3 3" />
          <ellipse cx="100" cy="100" rx="68" ry="98" strokeDasharray="3 3" />
          <ellipse cx="100" cy="100" rx="34" ry="98" strokeDasharray="3 3" />
          <line x1="100" y1="2" x2="100" y2="198" strokeDasharray="3 3" />
        </svg>

        {/* Sweeping Radar Scanner Line */}
        {!reduce && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 310deg, rgba(56,189,248,0.15) 340deg, rgba(16,185,129,0.35) 360deg)",
            }}
          />
        )}

        {/* 3D Sphere Terminator Shading (Lighting Highlight & Shadow Rim) */}
        <div className="absolute inset-0 pointer-events-none rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.4)_0%,transparent_50%,rgba(2,6,23,0.85)_95%)]" />

        {/* Atmosphere Glowing Rim */}
        <div className="absolute inset-0 pointer-events-none rounded-full ring-1 ring-inset ring-sky-300/40 shadow-[inset_0_0_24px_rgba(56,189,248,0.4)]" />
      </div>
    </div>
  );
}

export default RealEarthIllustration;
