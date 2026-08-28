"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight, Bug, Lightbulb, MessagesSquare, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import SectionBackdrop, {
  ACCENT,
  PRIMARY,
  SECONDARY,
  useIsDark,
} from "./SectionBackdrop";

/* ════════════════════════════════════════════════════════════════════
   HERO — the platform, stated four ways

   Built in the same language as the lifecycle section below it: an editorial
   split with the type on the left and a technical dial on the right, thin
   line art, monospace micro-labels, one accent, and a rail whose active item
   drives the drawing. The two sections should read as one publication rather
   than two templates stacked.

   Colour carries the argument. The pillars where work *arrives* — a bounty
   programme, a problem someone is stuck on — are the brand primary; the ones
   where it *resolves* are the accent. The dial cycles them so the page is
   never showing a static diagram.
   ════════════════════════════════════════════════════════════════════ */

type Pillar = {
  n: string;
  /** Catalogue branch under `hero.pillars`. */
  key: string;
  label: string;
  blurb: string;
  href: string;
  linkLabel: string;
  icon: LucideIcon;
  /** Who the pillar belongs to — the badge beside its title. */
  role: string;
  /** Degrees, 0 = east, clockwise because y runs down. */
  deg: number;
  /** Arriving work takes the primary; resolving work takes the accent. */
  inbound: boolean;
};

const PILLARS: Pillar[] = [
  {
    n: "01",
    key: "bounty",
    label: "Bug Bounty",
    role: "Company",
    blurb:
      "Companies publish scope, severity tiers and reward bands up front, then triage against them in the open. No private rubric, no argument after the fact.",
    href: "/programs",
    linkLabel: "Browse live programs",
    icon: Bug,
    deg: -128,
    inbound: true,
  },
  {
    n: "02",
    key: "problems",
    label: "Problems",
    role: "Author",
    blurb:
      "Post the problem as it actually is — the error, the stack, the versions, what you already ruled out. Tagged threads reach people who have shipped in it.",
    href: "/problems",
    linkLabel: "Open the problems feed",
    icon: MessagesSquare,
    deg: -52,
    inbound: true,
  },
  {
    n: "03",
    key: "solutions",
    label: "Solutions",
    role: "Community",
    blurb:
      "Answers carry the code, the config and the reasoning. The author marks what worked, and the thread becomes something the next person can search for.",
    href: "/community",
    linkLabel: "See the community",
    icon: Lightbulb,
    deg: 52,
    inbound: false,
  },
  {
    n: "04",
    key: "showcases",
    label: "Showcases",
    role: "Profile",
    blurb:
      "Every accepted report and marked solution lands on your profile with the severity, the programme and the date attached. One link, nothing to explain.",
    href: "/showcases",
    linkLabel: "See the showcases",
    icon: Trophy,
    deg: 128,
    inbound: false,
  },
];

/** How long the dial rests on each pillar before moving on. */
const DWELL_MS = 4200;

/* ─── Dial geometry ─────────────────────────────────────────────────── */
const BOX = 400;
const MID = BOX / 2;
const RIM = 176;
const RINGS = [0.3, 0.54, 0.78, 1];
/** Markers sit inside the rim; labels live in the padding beyond it. */
const NODE_R = 132;

/* Rounded, because `Math.sin`/`Math.cos` are implementation-defined in their
   last digit: Node and the browser disagree by an ULP, React compares the
   serialised attribute, and an unrounded coordinate is a hydration mismatch. */
const round = (v: number) => Math.round(v * 1000) / 1000;
const polar = (deg: number, r: number) => ({
  x: round(MID + r * Math.cos((deg * Math.PI) / 180)),
  y: round(MID + r * Math.sin((deg * Math.PI) / 180)),
});

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const deg = i * 5;
  const major = i % 6 === 0;
  const outer = polar(deg, RIM);
  const inner = polar(deg, RIM - (major ? 13 : 6));
  return { major, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
});

/** Points along the ring from the first node round to `deg`, clockwise. */
function arcTo(deg: number) {
  const from = PILLARS[0].deg;
  const span = deg - from;
  const steps = Math.max(2, Math.round(span / 4));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const p = polar(from + (span * i) / steps, NODE_R);
    return `${p.x},${p.y}`;
  }).join(" ");
}

/* ─── Component ─────────────────────────────────────────────────────── */
export function HeroPlatform() {
  const t = useT();
  const lp = useLocalePath();
  const reduce = useReducedMotion();
  const isDark = useIsDark();
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const dwellRef = useRef<HTMLSpanElement>(null);
  /** Milliseconds spent on the current pillar; also drives the dwell bar. */
  const elapsedRef = useRef(0);
  const activeRef = useRef(0);
  /* Off-screen the clock idles rather than advancing behind the fold. */
  const inView = useInView(sectionRef, { margin: "-15% 0px -15% 0px" });

  const pillar = PILLARS[active];
  const tint = pillar.inbound ? PRIMARY : ACCENT;
  const line = isDark ? "#FFFFFF" : SECONDARY;
  const muted = isDark ? "#A3A3A3" : "#94A3B8";

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    elapsedRef.current += delta;
    if (dwellRef.current) {
      const t = Math.min(1, elapsedRef.current / DWELL_MS);
      dwellRef.current.style.transform = `scaleX(${t.toFixed(3)})`;
    }
    if (elapsedRef.current >= DWELL_MS) {
      elapsedRef.current = 0;
      activeRef.current = (activeRef.current + 1) % PILLARS.length;
      setActive(activeRef.current);
    }
  });

  /* Picking a pillar restarts its dwell rather than stopping the cycle — the
     drawing keeps moving, which is what the lifecycle section does too. */
  const pick = useCallback((i: number) => {
    elapsedRef.current = 0;
    activeRef.current = i;
    setActive(i);
  }, []);

  return (
    <section ref={sectionRef} className="relative -mt-(--navbar-height) overflow-hidden bg-white pb-16 pt-(--navbar-height) sm:pb-24 dark:bg-neutral-950">
      <SectionBackdrop seed={0} gridSize={88} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-12">
        <div className="grid grid-cols-1 items-center gap-10 pt-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pt-12">
          {/* ── LEFT — the claim ── */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-px w-8" style={{ backgroundColor: tint }} />
              <span
                className="text-xs font-bold uppercase tracking-[0.22em]"
                style={{ color: tint }}
              >
                {t("hero.kicker")}
              </span>
            </div>

            <h1
              className="font-bold leading-[1.02] tracking-[-0.045em] text-[#1E293B] dark:text-neutral-100"
              style={{ fontSize: "clamp(34px, 4.2vw, 60px)" }}
            >
              <span className="block">{t("hero.titleLine1")}</span>
              <span className="block">
                {t("hero.titleLine2")}
                <span style={{ color: tint }}>.</span>
              </span>
            </h1>

            {/* The pillar the dial is resting on, laid out the way the
                lifecycle section lays out a step: numeral, title, role. */}
            <div className="relative mt-8 min-h-52 sm:min-h-44">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pillar.n}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-7"
                >
                  <span
                    className="block pt-1 text-right font-bold tabular-nums leading-none tracking-[-0.06em] text-slate-300 dark:text-neutral-700"
                    style={{
                      fontSize: "clamp(44px, 5.5vw, 78px)",
                      width: "clamp(62px, 7.5vw, 108px)",
                    }}
                  >
                    {pillar.n}
                  </span>

                  <div className="pt-1">
                    <div className="mb-2 flex flex-wrap items-baseline gap-3">
                      <h2 className="text-2xl font-bold tracking-tight text-[#1E293B] sm:text-3xl dark:text-neutral-100">
                        {t(`hero.pillars.${pillar.key}.label`) || pillar.label}
                        <span style={{ color: tint }}>.</span>
                      </h2>
                      <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:border-neutral-700 dark:text-neutral-500">
                        {t(`hero.pillars.${pillar.key}.role`) || pillar.role}
                      </span>
                    </div>
                    <p className="max-w-xl text-sm leading-[1.8] text-slate-500 sm:text-[15px] dark:text-neutral-400">
                      {t(`hero.pillars.${pillar.key}.blurb`) || pillar.blurb}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Rail — the same pattern the lifecycle section uses for steps. */}
            <div className="mt-7 flex flex-wrap gap-2">
              {PILLARS.map((p, i) => {
                const on = i === active;
                const chip = p.inbound ? PRIMARY : ACCENT;
                return (
                  <button
                    key={p.n}
                    type="button"
                    onClick={() => pick(i)}
                    aria-current={on ? "true" : undefined}
                    className={`relative flex items-center gap-2 overflow-hidden rounded-lg border px-3 py-2 transition-colors duration-200 ${
                      on
                        ? "border-slate-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                        : "border-slate-200 bg-transparent hover:bg-white dark:border-neutral-800 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <span
                      className="font-mono text-[11px] font-semibold tabular-nums"
                      style={{ color: on ? chip : muted }}
                    >
                      {p.n}
                    </span>
                    <span
                      className={`text-sm font-semibold tracking-tight ${
                        on
                          ? "text-[#1E293B] dark:text-neutral-100"
                          : "text-slate-400 dark:text-neutral-500"
                      }`}
                    >
                      {t(`hero.pillars.${p.key}.label`) || p.label}
                    </span>
                    {on && (
                      <span
                        ref={dwellRef}
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left"
                        style={{ backgroundColor: chip, transform: "scaleX(0)" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0, scale: 0.98 }}>
                <Link
                  href={lp("/account-type")}
                  className="inline-flex items-center rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
                  style={{
                    backgroundColor: PRIMARY,
                    boxShadow: "0 14px 30px -14px rgba(37,99,235,0.85)",
                  }}
                >
                  {t("hero.getStarted")}
                </Link>
              </motion.div>

              <Link
                href={lp(pillar.href)}
                className="group inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: tint }}
              >
                {t(`hero.pillars.${pillar.key}.link`) || pillar.linkLabel}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* ── RIGHT — the dial ── */}
          <div className="relative mx-auto w-full max-w-136">
            <div className="pointer-events-none absolute inset-x-0 -top-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-600">
              <span>[ {t("hero.platform")} ]</span>
              <span>
                {pillar.n} / {String(PILLARS.length).padStart(2, "0")}
              </span>
            </div>

            <svg
              viewBox={`-34 -34 ${BOX + 68} ${BOX + 68}`}
              className="mt-6 h-auto w-full"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx={MID}
                cy={MID}
                r={RIM * 0.3}
                fill={tint}
                fillOpacity="0.05"
                className="transition-all duration-500"
              />

              {RINGS.map((f, i) => (
                <circle
                  key={f}
                  cx={MID}
                  cy={MID}
                  r={RIM * f}
                  fill="none"
                  stroke={line}
                  strokeOpacity="0.13"
                  strokeWidth="1"
                  strokeDasharray={i === RINGS.length - 1 ? "3 7" : undefined}
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {[0, 45, 90, 135].map((deg) => {
                const a = polar(deg, RIM);
                const b = polar(deg + 180, RIM);
                return (
                  <line
                    key={deg}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={line}
                    strokeOpacity="0.08"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}

              {TICKS.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={line}
                  strokeOpacity={t.major ? 0.28 : 0.14}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {/* the walked arc, redrawn each time the dial moves on */}
              <motion.polyline
                key={`arc-${pillar.n}`}
                points={arcTo(pillar.deg)}
                fill="none"
                stroke={tint}
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />

              {PILLARS.map((p, i) => {
                const at = polar(p.deg, NODE_R);
                const on = i === active;
                const chip = p.inbound ? PRIMARY : ACCENT;
                const right = Math.cos((p.deg * Math.PI) / 180) >= 0;
                const lx = at.x + (right ? 20 : -20);
                const size = on ? 7 : 5;
                return (
                  <g
                    key={p.n}
                    className="cursor-pointer"
                    onClick={() => pick(i)}
                  >
                    <line
                      x1={MID}
                      y1={MID}
                      x2={at.x}
                      y2={at.y}
                      stroke={chip}
                      strokeOpacity={on ? 0.5 : 0.2}
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle cx={at.x} cy={at.y} r="20" fill="transparent" />
                    {on && (
                      <circle
                        cx={at.x}
                        cy={at.y}
                        r="14"
                        fill="none"
                        stroke={chip}
                        strokeOpacity="0.4"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    <rect
                      x={at.x - size}
                      y={at.y - size}
                      width={size * 2}
                      height={size * 2}
                      transform={`rotate(45 ${at.x} ${at.y})`}
                      fill={on ? chip : "none"}
                      stroke={on ? chip : muted}
                      strokeOpacity={on ? 1 : 0.75}
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      className="transition-all duration-300"
                    />
                    <text
                      x={lx}
                      y={at.y - 3}
                      textAnchor={right ? "start" : "end"}
                      fill={on ? chip : muted}
                      fontSize="11"
                      fontWeight="700"
                      letterSpacing="1"
                      className="font-mono"
                    >
                      {p.n}
                    </text>
                    <text
                      x={lx}
                      y={at.y + 11}
                      textAnchor={right ? "start" : "end"}
                      fill={on ? chip : muted}
                      fillOpacity={on ? 1 : 0.6}
                      fontSize="10.5"
                      fontWeight="600"
                      letterSpacing="1.4"
                      className="uppercase"
                    >
                      {t(`hero.pillars.${p.key}.label`) || p.label}
                    </text>
                  </g>
                );
              })}

              {/* Contact ping — remounts whenever the dial moves on. */}
              {!reduce && (
                <motion.circle
                  key={pillar.n}
                  cx={polar(pillar.deg, NODE_R).x}
                  cy={polar(pillar.deg, NODE_R).y}
                  fill="none"
                  stroke={tint}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  initial={{ r: 7, opacity: 0.8 }}
                  animate={{ r: 32, opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              )}
            </svg>

            {/* The mark sits at the hub the four pillars are anchored to. */}
            <span className="pointer-events-none absolute left-1/2 top-1/2 mt-3 block h-11 w-40 -translate-x-1/2 -translate-y-1/2 sm:h-13 sm:w-48">
              <Image
                src="/devsolve-logo.png"
                alt="DevSolve"
                fill
                priority
                sizes="192px"
                className="object-contain"
              />
            </span>
          </div>
        </div>

        {/* ── Footline — the same readout the lifecycle section signs off with ── */}
        <footer className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-neutral-800">
          <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: tint }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: tint }}
              />
            </span>
            {t("hero.live")} · {t(`hero.pillars.${pillar.key}.label`) || pillar.label}
          </span>
          <span className="font-mono text-xs font-medium tracking-[0.2em] text-slate-300 dark:text-neutral-600">
            01 — {String(PILLARS.length).padStart(2, "0")}
          </span>
        </footer>
      </div>
    </section>
  );
}

export default HeroPlatform;
