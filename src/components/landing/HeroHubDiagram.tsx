"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  Zap,
  Radio,
  GitPullRequest,
  Terminal,
  Target,
  SlidersHorizontal,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Shield,
  Code2,
} from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

interface HeroHubDiagramProps {
  className?: string;
}

export function HeroHubDiagram({ className = "" }: HeroHubDiagramProps) {
  const t = useT();
  const reduce = useReducedMotion();
  const [hoveredCard, setHoveredCard] = useState<{ side: "left" | "right"; index: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"researchers" | "organizations">("researchers");

  const researcherFeatures = [
    {
      num: "01",
      icon: Zap,
      label: t("hero.diagram.researchers.payoutsLabel") || "Guaranteed Payouts & Fast SLAs",
      sub: t("hero.diagram.researchers.payoutsSub") || "Instant bounty escrow on triage",
      chip: "Escrow SLA",
    },
    {
      num: "02",
      icon: Radio,
      label: t("hero.diagram.researchers.triageLabel") || "Real-Time Vulnerability Triage",
      sub: t("hero.diagram.researchers.triageSub") || "Direct sync with core maintainers",
      chip: "Live Maintainers",
    },
    {
      num: "03",
      icon: GitPullRequest,
      label: t("hero.diagram.researchers.communityLabel") || "Community Solution Engine",
      sub: t("hero.diagram.researchers.communitySub") || "Collaborative patch development",
      chip: "Patch Co-op",
    },
    {
      num: "04",
      icon: Terminal,
      label: t("hero.diagram.researchers.cliLabel") || "CLI & GitHub Integrations",
      sub: t("hero.diagram.researchers.cliSub") || "Submit reports right from your terminal",
      chip: "Native CLI",
    },
  ];

  const organizationFeatures = [
    {
      num: "01",
      icon: Target,
      label: t("hero.diagram.organizations.scopeLabel") || "Centralized Scope & Asset Control",
      sub: t("hero.diagram.organizations.scopeSub") || "Define precise public & private boundaries",
      chip: "Scope Perimeter",
    },
    {
      num: "02",
      icon: SlidersHorizontal,
      label: t("hero.diagram.organizations.slaLabel") || "Automated SLA & Policy Rules",
      sub: t("hero.diagram.organizations.slaSub") || "Enforce strict resolution timelines",
      chip: "Auto Policies",
    },
    {
      num: "03",
      icon: ShieldCheck,
      label: t("hero.diagram.organizations.patchLabel") || "Verified Patch Verification",
      sub: t("hero.diagram.organizations.patchSub") || "Zero regression with live proof-of-concept",
      chip: "Zero Regression",
    },
    {
      num: "04",
      icon: KeyRound,
      label: t("hero.diagram.organizations.teamLabel") || "Team Permissions & Audit Logs",
      sub: t("hero.diagram.organizations.teamSub") || "Role-based access & compliance tracking",
      chip: "Enterprise RBAC",
    },
  ];

  // Coordinates calibrated for 4 cards (centers at 12.5%, 37.5%, 62.5%, 87.5%)
  const leftBridges = [
    { d: "M 0, 12.5 C 50, 12.5, 65, 30, 100, 30", hubY: 30 },
    { d: "M 0, 37.5 C 50, 37.5, 65, 43.5, 100, 43.5", hubY: 43.5 },
    { d: "M 0, 62.5 C 50, 62.5, 65, 56.5, 100, 56.5", hubY: 56.5 },
    { d: "M 0, 87.5 C 50, 87.5, 65, 70, 100, 70", hubY: 70 },
  ];

  const rightBridges = [
    { d: "M 0, 30 C 35, 30, 50, 12.5, 100, 12.5", hubY: 30 },
    { d: "M 0, 43.5 C 35, 43.5, 50, 37.5, 100, 37.5", hubY: 43.5 },
    { d: "M 0, 56.5 C 35, 56.5, 50, 62.5, 100, 62.5", hubY: 56.5 },
    { d: "M 0, 70 C 35, 70, 50, 87.5, 100, 87.5", hubY: 70 },
  ];

  return (
    <div className={`relative mx-auto w-full max-w-7xl px-3 sm:px-6 select-none ${className}`}>
      {/* Dynamic ambient backglow */}
      <div
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[780px] max-w-full rounded-full blur-[100px] transition-colors duration-700 ${
          hoveredCard?.side === "left"
            ? "bg-blue-500/15 dark:bg-blue-500/20"
            : hoveredCard?.side === "right"
            ? "bg-emerald-500/15 dark:bg-emerald-500/20"
            : "bg-radial from-blue-500/10 via-emerald-500/8 to-transparent dark:from-blue-500/15 dark:via-emerald-500/10"
        }`}
      />

      {/* Mobile Perspective Toggle */}
      <div className="flex lg:hidden items-center justify-center mb-6">
        <div className="inline-flex p-1 rounded-full bg-card/80 border border-border/80 backdrop-blur-md shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("researchers")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "researchers"
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-300" />
            <span>{t("hero.diagram.devHuntersTitle") || "Developers & Hunters"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("organizations")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === "organizations"
                ? "bg-[#10B981] text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-200" />
            <span>{t("hero.diagram.secDevOpsTitle") || "Security & DevOps"}</span>
          </button>
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0 z-10">
        
        {/* ========================================================
            LEFT COLUMN: DEVELOPERS & HUNTERS
           ======================================================== */}
        <div
          className={`w-full lg:w-[330px] xl:w-[360px] shrink-0 flex flex-col ${
            activeTab === "researchers" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Header */}
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB] shadow-[0_0_10px_#2563EB]" />
                <span>{t("hero.diagram.devHuntersTitle") || "Developers & Hunters"}</span>
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5 tracking-wide">
                {t("hero.diagram.devHuntersSubtitle") || "[ Bounty Researchers ]"}
              </p>
            </div>
            <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Code2 className="h-3 w-3" />
              BUILD & EARN
            </span>
          </div>

          {/* Cards Stack */}
          <div className="flex flex-col justify-between h-auto lg:h-[350px] space-y-3">
            {researcherFeatures.map((item, idx) => {
              const Icon = item.icon;
              const isHovered = hoveredCard?.side === "left" && hoveredCard?.index === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCard({ side: "left", index: idx })}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative flex items-center gap-3.5 rounded-2xl border px-3.5 py-3 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
                    isHovered
                      ? "border-blue-500/60 bg-card shadow-[0_8px_24px_-4px_rgba(37,99,235,0.25)] -translate-y-0.5 ring-1 ring-blue-500/30 dark:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.4)]"
                      : "border-border/80 bg-card/85 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:border-blue-500/40 hover:shadow-md dark:bg-card/70 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  }`}
                >
                  {/* Top-Edge Hairline Beam */}
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Sculpted Cyber Icon Vessel */}
                  <div
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isHovered
                        ? "border-blue-400 bg-blue-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.5)] scale-105"
                        : "border-blue-500/20 bg-blue-500/[0.08] text-blue-600 dark:text-blue-400 dark:bg-blue-500/15 group-hover:border-blue-400/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Card Content */}
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <h4 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.label}
                      </h4>
                      <span className="font-mono text-[10px] font-bold text-muted-foreground/60 shrink-0">
                        {item.num}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {item.sub}
                    </p>
                  </div>

                  {/* Magnetic Docking Socket on Right Edge */}
                  <div className="hidden lg:flex absolute -right-1.5 top-1/2 -translate-y-1/2 items-center justify-center">
                    <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full bg-blue-400 transition-opacity duration-300 ${
                          isHovered ? "opacity-75 animate-ping" : "opacity-0"
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-background transition-all duration-300 ${
                          isHovered
                            ? "bg-[#2563EB] ring-2 ring-blue-500/50 scale-125 shadow-[0_0_8px_#2563EB]"
                            : "bg-muted-foreground/40 dark:bg-muted-foreground/60"
                        }`}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            LEFT SVG LASER BRIDGES
           ======================================================== */}
        <div className="hidden lg:block flex-1 h-[350px] self-end relative px-1 pointer-events-none">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="laserGradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="1" />
              </linearGradient>
            </defs>

            {leftBridges.map((b, i) => {
              const isHovered = hoveredCard?.side === "left" && hoveredCard?.index === i;

              return (
                <g key={`left-bridge-${i}`}>
                  {/* Subtle Base Line */}
                  <path
                    d={b.d}
                    stroke="currentColor"
                    className={`transition-colors duration-300 ${
                      isHovered
                        ? "text-[#2563EB]"
                        : "text-border/80 dark:text-border/60"
                    }`}
                    strokeWidth={isHovered ? "2.25" : "1.25"}
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Flowing Laser Dash on Hover */}
                  {!reduce && isHovered && (
                    <path
                      d={b.d}
                      stroke="url(#laserGradBlue)"
                      strokeWidth="2.5"
                      strokeDasharray="8 14"
                      vectorEffect="non-scaling-stroke"
                      className="animate-flow-dash"
                    />
                  )}

                  {/* Hub Terminal Port Node */}
                  <circle
                    cx="100"
                    cy={b.hubY}
                    r={isHovered ? "3.5" : "2"}
                    className={`transition-all duration-200 ${
                      isHovered
                        ? "fill-[#38BDF8] stroke-2 stroke-[#2563EB]"
                        : "fill-border/90 dark:fill-border"
                    }`}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ========================================================
            CENTER CONVERGENCE HUB
           ======================================================== */}
        <div className="relative flex items-center justify-center shrink-0 self-center lg:self-end mx-auto my-3 lg:my-0">
          <div className="relative flex items-center justify-center h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80">
            
            {/* Outer Precision Ring */}
            <div className="absolute inset-0 rounded-full border border-border/60 dark:border-border/40 pointer-events-none" />

            {/* Middle Rotating Chamber */}
            <div
              className={`relative flex items-center justify-center h-52 w-52 sm:h-58 sm:w-58 md:h-66 md:w-66 rounded-full border backdrop-blur-xl transition-all duration-500 ${
                hoveredCard?.side === "left"
                  ? "border-blue-400/50 bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-card shadow-[0_0_35px_rgba(37,99,235,0.25)]"
                  : hoveredCard?.side === "right"
                  ? "border-emerald-400/50 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-card shadow-[0_0_35px_rgba(16,185,129,0.25)]"
                  : "border-border/80 bg-card/70 shadow-xs"
              }`}
            >
              {/* Rotating Circular Text */}
              <motion.div
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 200 200"
                  className="h-full w-full overflow-visible"
                >
                  <defs>
                    <path
                      id="heroHubCirclePathV3"
                      d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                    />
                  </defs>
                  <text className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] fill-muted-foreground">
                    <textPath
                      href="#heroHubCirclePathV3"
                      startOffset="0%"
                      textLength="470"
                      lengthAdjust="spacing"
                    >
                      • DISCOVER • TRIAGE • REMEDIATE • VERIFY
                    </textPath>
                  </text>
                </svg>
              </motion.div>

              {/* Inner Core Housing DevSolve Emblem */}
              <div
                className={`relative flex items-center justify-center h-30 w-30 sm:h-34 sm:w-34 md:h-40 md:w-40 rounded-full border-2 bg-background/95 p-4 shadow-sm transition-all duration-300 ${
                  hoveredCard?.side === "left"
                    ? "border-blue-500/50 ring-4 ring-blue-500/10 shadow-[0_0_24px_rgba(37,99,235,0.25)]"
                    : hoveredCard?.side === "right"
                    ? "border-emerald-500/50 ring-4 ring-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                    : "border-border/80"
                }`}
              >
                <div className="relative h-15 w-15 sm:h-18 sm:w-18 md:h-22 md:w-22">
                  <Image
                    src="/devsolve-icon.png"
                    alt="DevSolve"
                    fill
                    priority
                    sizes="120px"
                    className="object-contain drop-shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT SVG LASER BRIDGES
           ======================================================== */}
        <div className="hidden lg:block flex-1 h-[350px] self-end relative px-1 pointer-events-none">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="laserGradEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="1" />
              </linearGradient>
            </defs>

            {rightBridges.map((b, i) => {
              const isHovered = hoveredCard?.side === "right" && hoveredCard?.index === i;

              return (
                <g key={`right-bridge-${i}`}>
                  {/* Subtle Base Line */}
                  <path
                    d={b.d}
                    stroke="currentColor"
                    className={`transition-colors duration-300 ${
                      isHovered
                        ? "text-[#10B981]"
                        : "text-border/80 dark:text-border/60"
                    }`}
                    strokeWidth={isHovered ? "2.25" : "1.25"}
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Flowing Laser Dash on Hover */}
                  {!reduce && isHovered && (
                    <path
                      d={b.d}
                      stroke="url(#laserGradEmerald)"
                      strokeWidth="2.5"
                      strokeDasharray="8 14"
                      vectorEffect="non-scaling-stroke"
                      className="animate-flow-dash"
                    />
                  )}

                  {/* Hub Terminal Port Node */}
                  <circle
                    cx="0"
                    cy={b.hubY}
                    r={isHovered ? "3.5" : "2"}
                    className={`transition-all duration-200 ${
                      isHovered
                        ? "fill-[#34D399] stroke-2 stroke-[#10B981]"
                        : "fill-border/90 dark:fill-border"
                    }`}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* ========================================================
            RIGHT COLUMN: SECURITY & DEVOPS
           ======================================================== */}
        <div
          className={`w-full lg:w-[330px] xl:w-[360px] shrink-0 flex flex-col text-left ${
            activeTab === "organizations" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Header */}
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
                <span>{t("hero.diagram.secDevOpsTitle") || "Security & DevOps"}</span>
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5 tracking-wide">
                {t("hero.diagram.secDevOpsSubtitle") || "[ Engineering Teams ]"}
              </p>
            </div>
            <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Shield className="h-3 w-3" />
              DEFEND & SECURE
            </span>
          </div>

          {/* Cards Stack */}
          <div className="flex flex-col justify-between h-auto lg:h-[350px] space-y-3">
            {organizationFeatures.map((item, idx) => {
              const Icon = item.icon;
              const isHovered = hoveredCard?.side === "right" && hoveredCard?.index === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCard({ side: "right", index: idx })}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative flex items-center gap-3.5 rounded-2xl border px-3.5 py-3 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl ${
                    isHovered
                      ? "border-emerald-500/60 bg-card shadow-[0_8px_24px_-4px_rgba(16,185,129,0.25)] -translate-y-0.5 ring-1 ring-emerald-500/30 dark:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.4)]"
                      : "border-border/80 bg-card/85 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.7)] hover:border-emerald-500/40 hover:shadow-md dark:bg-card/70 dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  }`}
                >
                  {/* Top-Edge Hairline Beam */}
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Sculpted Cyber Icon Vessel */}
                  <div
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isHovered
                        ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.5)] scale-105"
                        : "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/15 group-hover:border-emerald-400/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Card Content */}
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <h4 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.label}
                      </h4>
                      <span className="font-mono text-[10px] font-bold text-muted-foreground/60 shrink-0">
                        {item.num}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {item.sub}
                    </p>
                  </div>

                  {/* Magnetic Docking Socket on Left Edge */}
                  <div className="hidden lg:flex absolute -left-1.5 top-1/2 -translate-y-1/2 items-center justify-center">
                    <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 transition-opacity duration-300 ${
                          isHovered ? "opacity-75 animate-ping" : "opacity-0"
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-background transition-all duration-300 ${
                          isHovered
                            ? "bg-[#10B981] ring-2 ring-emerald-500/50 scale-125 shadow-[0_0_8px_#10B981]"
                            : "bg-muted-foreground/40 dark:bg-muted-foreground/60"
                        }`}
                      />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default HeroHubDiagram;
