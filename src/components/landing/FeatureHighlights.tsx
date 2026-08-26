"use client";

import React, { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useInView,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n/I18nProvider";
import { splitTextUnits } from "@/lib/i18n/graphemes";
import { cn } from "@/lib/utils";
import SectionBackdrop, {
  ACCENT,
  PRIMARY,
  SECONDARY,
  useIsDark,
} from "./SectionBackdrop";

/* The Showcase act's accent is the near-black brand secondary, which vanishes
   against a dark surface. It flips to a light neutral there; the blue and
   green accents carry on unchanged, since both read on either surface. */
const accentFor = (act: Act, dark: boolean) =>
  dark && act.accent === SECONDARY ? "#E5E5E5" : act.accent;

/* ─── Content ──────────────────────────────────────────────────────── */
type Step = { n: string; title: string; role: string; body: string };

type Act = {
  id: string;
  tab: string;
  tabSub: string;
  kicker: string;
  title: string[];
  accent: string;
  href: string;
  hrefLabel: string;
  steps: Step[];
};

const ACTS: Act[] = [
  {
    id: "bounty",
    tab: "Bug Bounty",
    tabSub: "[ Program Lifecycle ]",
    kicker: "How it works",
    title: ["The Bounty", "Lifecycle"],
    accent: PRIMARY,
    href: "/programs",
    hrefLabel: "Browse live programs",
    steps: [
      {
        n: "01",
        title: "Publish",
        role: "Company",
        body: "A company defines its scope, severity tiers and reward bands, then publishes the program. Assets in scope, rules of engagement and payout ranges are public from the first day, so nobody argues later about what counted.",
      },
      {
        n: "02",
        title: "Browse",
        role: "Researcher",
        body: "Researchers filter live programs by asset type, stack, severity band and reward size. Each program page carries the full scope, its payout history and average triage time — you know what you are walking into before you start.",
      },
      {
        n: "03",
        title: "Report",
        role: "Researcher",
        body: "Submit the finding with reproduction steps, impact analysis and a working proof of concept. The report is timestamped the moment it lands, which locks your claim to the vulnerability ahead of anyone else.",
      },
      {
        n: "04",
        title: "Triage",
        role: "Company",
        body: "The security team reproduces the issue, confirms severity against the published tiers, and either accepts it, asks for more detail, or rejects it with a stated reason. Every state change is written to the report timeline.",
      },
      {
        n: "05",
        title: "Reward",
        role: "Researcher",
        body: "On acceptance the bounty is released at the tier the finding landed in, and the report converts into reputation on your public profile. Coordinated disclosure opens once the fix has shipped.",
      },
    ],
  },
  {
    id: "community",
    tab: "Community",
    tabSub: "[ Problems & Solutions ]",
    kicker: "How it works",
    title: ["Problems,", "Answered"],
    accent: ACCENT,
    href: "/problems",
    hrefLabel: "Open the problems feed",
    steps: [
      {
        n: "01",
        title: "Ask",
        role: "Author",
        body: "Post the problem as it actually is: the error, the stack, the versions, and what you already ruled out. Tagged threads route to the people who have shipped in that stack before, instead of sitting unread.",
      },
      {
        n: "02",
        title: "Solve",
        role: "Community",
        body: "Anyone can answer with a solution that works — the code, the config, and the reasoning behind it. The author marks what fixed it, and the thread becomes a validated answer the next person can search for.",
      },
    ],
  },
  {
    id: "showcase",
    tab: "Showcase",
    tabSub: "[ Proof of Work ]",
    kicker: "How it works",
    title: ["Proof", "of Work"],
    accent: SECONDARY,
    href: "/leaderboard",
    hrefLabel: "See the leaderboard",
    steps: [
      {
        n: "01",
        title: "Earn",
        role: "Reputation",
        body: "Every accepted report and every marked solution adds to your score, weighted by the severity of the finding and by how often the answer gets reused by other people.",
      },
      {
        n: "02",
        title: "Display",
        role: "Profile",
        body: "Your public profile carries the whole record: severity breakdown, programs contributed to, threads solved, and the badges earned along the way. One link, nothing to explain.",
      },
      {
        n: "03",
        title: "Rank",
        role: "Leaderboard",
        body: "The global leaderboard ranks on contribution rather than volume. Filter it by program, by stack or by time window to see who is actually doing the work right now.",
      },
    ],
  },
];

/* ─── Radar geometry ────────────────────────────────────────────────────
   The dial replaces the old scroll-scrubbed arc: nothing here is driven by
   scroll position. One sweep rotates at a constant rate, and whichever step
   it is passing over is the step the copy shows. */
const DIAL = { cx: 200, cy: 200, r: 176 };
const RINGS = [0.28, 0.52, 0.76, 1];
const SWEEP_SPAN = 104; // degrees of trailing tail behind the leading edge
const SWEEP_SLICES = 14;
/** How long the sweep dwells on each step — the revolution scales with it. */
const SECONDS_PER_STEP = 4.5;
/** Markers start at twelve o'clock, so the first step reads as the start. */
const START_DEG = -90;

/* Rounded, because `Math.sin`/`Math.cos` are implementation-defined in their
   last digit: Node and the browser disagree by an ULP, and React compares the
   serialised attribute, so an unrounded coordinate is a hydration mismatch. */
const round = (v: number) => Math.round(v * 1000) / 1000;

function polar(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: round(DIAL.cx + radius * Math.cos(rad)),
    y: round(DIAL.cy + radius * Math.sin(rad)),
  };
}

/** Markers march outward as the lifecycle advances, evenly spaced by angle. */
function markerAt(index: number, total: number) {
  const deg = START_DEG + (index * 360) / total;
  const radius =
    DIAL.r * (total <= 1 ? 0.6 : 0.44 + (index / (total - 1)) * 0.44);
  return { deg, radius, ...polar(deg, radius) };
}

/* The tail is built from flat slices rather than a gradient: an SVG gradient
   would have to be re-projected every frame as the wedge turns, while stacked
   slices rotate with the group for free. */
const SWEEP_PATHS = Array.from({ length: SWEEP_SLICES }, (_, k) => {
  const a = polar(-(k * SWEEP_SPAN) / SWEEP_SLICES, DIAL.r);
  const b = polar(-((k + 1) * SWEEP_SPAN) / SWEEP_SLICES, DIAL.r);
  return {
    d: `M ${DIAL.cx} ${DIAL.cy} L ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${DIAL.r} ${DIAL.r} 0 0 0 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`,
    opacity: 0.34 * (1 - k / SWEEP_SLICES) ** 1.7,
  };
});

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const deg = i * 5;
  const major = i % 6 === 0;
  const outer = polar(deg, DIAL.r);
  const inner = polar(deg, DIAL.r - (major ? 13 : 6));
  return { major, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
});

const pad2 = (n: number) => String(n).padStart(2, "0");

/* ─── Component ────────────────────────────────────────────────────── */
export function FeatureHighlights() {
  const t = useT();
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const sweepRef = useRef<SVGGElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  /* Current sweep bearing, in degrees. Kept in a ref rather than state — it
     changes every frame, and only the step it lands on is worth a render. */
  const angleRef = useRef(START_DEG);
  const stepRef = useRef(0);

  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion();
  /* Off-screen the loop idles: no attribute writes, no wasted frames. */
  const inView = useInView(sectionRef, { margin: "-10% 0px -10% 0px" });
  const isDark = useIsDark();

  const [actIndex, setActIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  const act = ACTS[actIndex];
  const steps = act.steps;
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const accent = accentFor(act, isDark);
  const line = isDark ? "#FFFFFF" : SECONDARY;
  const muted = isDark ? "#A3A3A3" : "#94A3B8";

  /* Writes a frame straight to the DOM. The sweep is one attribute and the
     dwell bar one transform, so neither needs React inside the loop. */
  const paint = useCallback((deg: number, total: number) => {
    sweepRef.current?.setAttribute(
      "transform",
      `rotate(${deg.toFixed(2)} ${DIAL.cx} ${DIAL.cy})`,
    );
    if (progressRef.current) {
      const span = 360 / total;
      const within = ((((deg - START_DEG) % 360) + 360) % 360) % span;
      progressRef.current.style.transform = `scaleX(${(within / span).toFixed(3)})`;
    }
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    const total = steps.length;
    angleRef.current += (delta / 1000) * (360 / (total * SECONDS_PER_STEP));
    if (angleRef.current > START_DEG + 360) angleRef.current -= 360;

    paint(angleRef.current, total);

    const norm = (((angleRef.current - START_DEG) % 360) + 360) % 360;
    const next = Math.min(total - 1, Math.floor(norm / (360 / total)));
    if (next !== stepRef.current) {
      stepRef.current = next;
      setStepIndex(next);
    }
  });

  /* Clicking a step — in the rail or on the dial — parks the sweep on it. */
  const jumpTo = useCallback(
    (i: number) => {
      angleRef.current = START_DEG + (i * 360) / steps.length + 0.01;
      stepRef.current = i;
      setStepIndex(i);
      paint(angleRef.current, steps.length);
    },
    [paint, steps.length],
  );

  const selectAct = useCallback(
    (i: number) => {
      setActIndex(i);
      stepRef.current = 0;
      setStepIndex(0);
      angleRef.current = START_DEG;
      paint(START_DEG, ACTS[i].steps.length);
    },
    [paint],
  );

  const marker = markerAt(stepIndex, steps.length);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative overflow-hidden bg-white py-20 sm:py-28 dark:bg-neutral-950"
    >
      {/* Editorial grid paper, drifting aurora and rising motes */}
      <SectionBackdrop seed={1} gridSize={88} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-12">
        {/* ── Masthead ── */}
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-neutral-800">
          <div>
            <p className="text-xl font-bold tracking-tight text-[#1E293B] sm:text-2xl dark:text-neutral-100">
              DevSolve
            </p>
            <p className="mt-1.5 text-sm font-medium tracking-[0.28em] text-slate-400 dark:text-neutral-500">
              [ {t("common.platform")} ]
            </p>
          </div>

          {/* Act tabs — the active one fills dark (and inverts in dark mode) */}
          <nav
            role="tablist"
            aria-label="Platform pillars"
            className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 dark:border-neutral-800 dark:bg-neutral-800"
          >
            {ACTS.map((a, ai) => {
              const on = ai === actIndex;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => selectAct(ai)}
                  className={`flex min-w-26 flex-col justify-center px-3 py-2.5 text-center transition-colors duration-200 sm:min-w-37.5 sm:px-4 ${
                    on
                      ? "bg-[#1E293B] text-white dark:bg-neutral-200 dark:text-neutral-900"
                      : "bg-white text-slate-400 hover:text-slate-600 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-300"
                  }`}
                >
                  <span className="text-sm font-semibold tracking-tight">
                    {t(`lifecycle.acts.${a.id}.tab`) || a.tab}
                  </span>
                  <span className="mt-0.5 hidden text-[11px] font-medium opacity-70 sm:block">
                    {t(`lifecycle.acts.${a.id}.tabSub`) || a.tabSub}
                  </span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* ── Stage ── */}
        <div className="mt-12 grid grid-cols-1 items-center gap-12 lg:mt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          {/* LEFT — act title and the step the sweep is currently over */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-px w-8" style={{ backgroundColor: accent }} />
              <span
                className={cn(
                  "text-xs font-bold uppercase",
                  locale === "km" ? "tracking-normal font-medium" : "tracking-[0.22em]"
                )}
                style={{ color: accent }}
              >
                {t("lifecycle.kicker") || act.kicker}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.h2
                key={act.id}
                initial={reduce ? false : "hidden"}
                animate="visible"
                exit="out"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.09 } },
                  out: { opacity: 0, transition: { duration: 0.18 } },
                }}
                className={cn(
                  "font-bold leading-[1.08] text-[#1E293B] dark:text-neutral-100",
                  locale === "km" ? "tracking-normal" : "tracking-[-0.045em]"
                )}
                style={{ fontSize: "clamp(34px, 4.2vw, 60px)" }}
              >
                {[
                  t(`lifecycle.acts.${act.id}.title1`) || act.title[0],
                  t(`lifecycle.acts.${act.id}.title2`) || act.title[1],
                ].map((lineText, li) => (
                  <span key={li} className="block">
                    {splitTextUnits(lineText).map((char, ci) => (
                      <motion.span
                        key={ci}
                        className="inline-block"
                        variants={{
                          hidden: { y: 48, opacity: 0, filter: "blur(10px)" },
                          visible: {
                            y: 0,
                            opacity: 1,
                            filter: "blur(0px)",
                            transition: {
                              duration: 0.5,
                              ease: [0.2, 0.8, 0.3, 1],
                            },
                          },
                        }}
                      >
                        {char === " " ? " " : char}
                      </motion.span>
                    ))}
                    {li === act.title.length - 1 && (
                      <motion.span
                        className="inline-block"
                        style={{ color: accent }}
                        variants={{
                          hidden: { y: 48, opacity: 0 },
                          visible: { y: 0, opacity: 1 },
                        }}
                      >
                        .
                      </motion.span>
                    )}
                  </span>
                ))}
              </motion.h2>
            </AnimatePresence>

            {/* The step under the sweep — swapped in place, never scrolled */}
            <div className="relative mt-8 min-h-70 sm:min-h-56">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${act.id}-${step.n}`}
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="grid grid-cols-[auto_1fr] items-start gap-5 sm:gap-8"
                >
                  <span
                    className="block pt-1 text-right font-bold tabular-nums leading-none tracking-[-0.06em] text-slate-300 dark:text-neutral-700"
                    style={{
                      fontSize: "clamp(52px, 6.5vw, 96px)",
                      width: "clamp(76px, 9vw, 132px)",
                    }}
                  >
                    {step.n}
                  </span>

                  <div className="pt-1">
                    <div className="mb-2 flex flex-wrap items-baseline gap-3">
                      <h3 className="text-2xl font-bold tracking-tight text-[#1E293B] sm:text-3xl dark:text-neutral-100">
                        {t(`lifecycle.acts.${act.id}.steps.${step.n}.title`) || step.title}
                        <span style={{ color: accent }}>.</span>
                      </h3>
                      <span className="rounded-lg border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:border-neutral-700 dark:text-neutral-500">
                        {t(`lifecycle.acts.${act.id}.steps.${step.n}.role`) || step.role}
                      </span>
                    </div>
                    <p className="max-w-xl text-sm leading-[1.8] text-slate-500 sm:text-[15px] dark:text-neutral-400">
                      {t(`lifecycle.acts.${act.id}.steps.${step.n}.body`) || step.body}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step rail — the bar under the active chip tracks the sweep */}
            <div className="mt-8 flex flex-wrap gap-2">
              {steps.map((s, si) => {
                const on = si === stepIndex;
                return (
                  <button
                    key={s.n}
                    type="button"
                    onClick={() => jumpTo(si)}
                    aria-current={on ? "step" : undefined}
                    className={`relative flex items-center gap-2 overflow-hidden rounded-lg border px-3 py-2 transition-colors duration-200 ${
                      on
                        ? "border-slate-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                        : "border-slate-200 bg-transparent hover:bg-white dark:border-neutral-800 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <span
                      className="font-mono text-[11px] font-semibold tabular-nums"
                      style={{ color: on ? accent : muted }}
                    >
                      {s.n}
                    </span>
                    <span
                      className={`text-sm font-semibold tracking-tight ${
                        on
                          ? "text-[#1E293B] dark:text-neutral-100"
                          : "text-slate-400 dark:text-neutral-500"
                      }`}
                    >
                      {t(`lifecycle.acts.${act.id}.steps.${s.n}.title`) || s.title}
                    </span>
                    {on && (
                      <span
                        ref={progressRef}
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left"
                        style={{
                          backgroundColor: accent,
                          transform: "scaleX(0)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-baseline gap-2 font-mono text-sm text-slate-400 dark:text-neutral-500">
                <span className="text-2xl font-bold tabular-nums text-[#1E293B] dark:text-neutral-100">
                  {pad2(stepIndex + 1)}
                </span>
                <span className="text-lg">/</span>
                <span className="text-lg tabular-nums">
                  {pad2(steps.length)}
                </span>
                <span className="ml-1 text-xs uppercase tracking-[0.2em]">
                  {t("lifecycle.steps")}
                </span>
              </div>

              <Link
                href={act.href}
                className="group inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: accent }}
              >
                {t(`lifecycle.acts.${act.id}.hrefLabel`) || act.hrefLabel}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT — the scanning dial */}
          <div className="relative mx-auto w-full max-w-136">
            <div className="pointer-events-none absolute inset-x-0 -top-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-600">
              <span>[ {t("common.scanning")} ]</span>
              <span>{pad2(steps.length)} {t("common.nodes")}</span>
            </div>

            <svg
              viewBox="-24 -24 448 448"
              className="mt-6 h-auto w-full"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <radialGradient id={`${uid}-core`}>
                  <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle
                cx={DIAL.cx}
                cy={DIAL.cy}
                r={DIAL.r}
                fill={`url(#${uid}-core)`}
              />

              {/* Rings and crosshair */}
              {RINGS.map((f) => (
                <circle
                  key={f}
                  cx={DIAL.cx}
                  cy={DIAL.cy}
                  r={DIAL.r * f}
                  fill="none"
                  stroke={line}
                  strokeOpacity="0.13"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {[0, 45, 90, 135].map((deg) => {
                const a = polar(deg, DIAL.r);
                const b = polar(deg + 180, DIAL.r);
                return (
                  <line
                    key={deg}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={line}
                    strokeOpacity="0.09"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}

              {/* Rim ticks */}
              {TICKS.map((t, i) => (
                <line
                  key={i}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={line}
                  strokeOpacity={t.major ? 0.3 : 0.15}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {/* The sweep — one rotate attribute, rewritten each frame */}
              <g
                ref={sweepRef}
                transform={`rotate(${START_DEG} ${DIAL.cx} ${DIAL.cy})`}
              >
                {SWEEP_PATHS.map((s, i) => (
                  <path key={i} d={s.d} fill={accent} opacity={s.opacity} />
                ))}
                <line
                  x1={DIAL.cx}
                  y1={DIAL.cy}
                  x2={DIAL.cx + DIAL.r}
                  y2={DIAL.cy}
                  stroke={accent}
                  strokeWidth="1.5"
                  strokeOpacity="0.9"
                  vectorEffect="non-scaling-stroke"
                />
              </g>

              {/* Step markers */}
              {steps.map((s, si) => {
                const m = markerAt(si, steps.length);
                const on = si === stepIndex;
                const size = on ? 6 : 4;
                const anchorRight = Math.cos((m.deg * Math.PI) / 180) >= -0.1;
                const lx = m.x + (anchorRight ? 14 : -14);
                return (
                  <g
                    key={s.n}
                    className="cursor-pointer"
                    onClick={() => jumpTo(si)}
                  >
                    <circle cx={m.x} cy={m.y} r="18" fill="transparent" />
                    {on && (
                      <circle
                        cx={m.x}
                        cy={m.y}
                        r="13"
                        fill="none"
                        stroke={accent}
                        strokeOpacity="0.45"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    <rect
                      x={m.x - size}
                      y={m.y - size}
                      width={size * 2}
                      height={size * 2}
                      transform={`rotate(45 ${m.x} ${m.y})`}
                      fill={on ? accent : "none"}
                      stroke={on ? accent : muted}
                      strokeOpacity={on ? 1 : 0.7}
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      className="transition-all duration-300"
                    />
                    <text
                      x={lx}
                      y={m.y - 2}
                      textAnchor={anchorRight ? "start" : "end"}
                      fill={on ? accent : muted}
                      fontSize="11"
                      fontWeight="700"
                      letterSpacing="1"
                      className="font-mono"
                    >
                      {s.n}
                    </text>
                    <text
                      x={lx}
                      y={m.y + 11}
                      textAnchor={anchorRight ? "start" : "end"}
                      fill={on ? accent : muted}
                      fillOpacity={on ? 1 : 0.55}
                      fontSize="10.5"
                      fontWeight="600"
                      letterSpacing="1.4"
                      className="hidden uppercase sm:block"
                    >
                      {t(`lifecycle.acts.${act.id}.steps.${s.n}.title`) || s.title}
                    </text>
                  </g>
                );
              })}

              {/* Contact ping — remounts each time the sweep reaches a marker */}
              {!reduce && (
                <motion.circle
                  key={`${act.id}-${stepIndex}`}
                  cx={marker.x}
                  cy={marker.y}
                  fill="none"
                  stroke={accent}
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  initial={{ r: 6, opacity: 0.85 }}
                  animate={{ r: 30, opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              )}

              <circle cx={DIAL.cx} cy={DIAL.cy} r="3" fill={accent} />
            </svg>

            <div className="pointer-events-none absolute inset-x-0 -bottom-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-600">
              <span>{t(`lifecycle.acts.${act.id}.tabSub`) || act.tabSub}</span>
              <span>
                {t("common.step")} {pad2(stepIndex + 1)} / {pad2(steps.length)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer readout ── */}
        <footer className="mt-14 flex items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-neutral-800">
          <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: accent }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
            </span>
            {t("lifecycle.scroll")} · {t(`lifecycle.acts.${act.id}.tab`) || act.tab}
          </span>
          <span className="font-mono text-xs font-medium tracking-[0.2em] text-slate-300 dark:text-neutral-600">
            {pad2(actIndex + 1)} — {pad2(ACTS.length)}
          </span>
        </footer>
      </div>
    </section>
  );
}

export default FeatureHighlights;
