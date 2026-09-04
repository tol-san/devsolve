"use client";

import React, { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import SectionBackdrop, { SURFACE } from "./SectionBackdrop";

const TONE = {
  deemphasis: "var(--ds-deemphasis)",
  deltaInk: "var(--ds-delta)",
  trend: "var(--ds-trend)",
  dotRing: SURFACE,
  ink: "var(--ds-ink)",
} as const;

type Stat = {
  label: string;
  labelKey: string;
  unit: string;
  unitKey: string;
  series: number[];
  format: (n: number) => string;
};

const HERO: Stat = {
  label: "Bounties paid out",
  labelKey: "stats.bountiesPaid",
  unit: "USD, cumulative",
  unitKey: "stats.bountiesUnit",
  series: [2.1, 2.4, 2.6, 3.0, 3.2, 3.5, 3.9, 4.1, 4.4, 4.7, 4.9, 5.24],
  format: (n) => `$${n.toFixed(2)}M`,
};

const STATS: Stat[] = [
  {
    label: "Verified researchers",
    labelKey: "stats.researchers",
    unit: "active accounts",
    unitKey: "stats.researchersUnit",
    series: [1180, 1290, 1400, 1520, 1660, 1790, 1900, 2020, 2140, 2240, 2330, 2412],
    format: (n) => Math.round(n).toLocaleString(),
  },
  {
    label: "Live programs",
    labelKey: "stats.livePrograms",
    unit: "accepting reports",
    unitKey: "stats.liveUnit",
    series: [72, 80, 86, 95, 101, 108, 114, 122, 131, 138, 145, 152],
    format: (n) => String(Math.round(n)),
  },
  {
    label: "Reports validated",
    labelKey: "stats.reports",
    unit: "triaged and closed",
    unitKey: "stats.reportsUnit",
    series: [14200, 16100, 18000, 19800, 21600, 23400, 25100, 27000, 28600, 30200, 31400, 32400],
    format: (n) => `${(n / 1000).toFixed(1)}K`,
  },
];

function quarterDelta(series: number[]) {
  const now = series[series.length - 1];
  const then = series[series.length - 4];
  return ((now - then) / then) * 100;
}

function CountUp({
  target,
  format,
  inView,
}: {
  target: number;
  format: (n: number) => string;
  inView: boolean;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;

    let frame = 0;
    const start = performance.now();
    const duration = 1500;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, reduce]);

  return (
    <span className="relative inline-block">
      <span className="opacity-0">{format(target)}</span>
      <span aria-hidden className="absolute inset-0">
        {format(reduce ? target : value)}
      </span>
    </span>
  );
}

function Sparkline({
  series,
  label,
  width = 132,
  height = 36,
  inView,
  delay = 0,
}: {
  series: number[];
  label: string;
  width?: number;
  height?: number;
  inView: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const tone = TONE;
  const pad = 5;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;

  const points = series.map((v, i) => ({
    x: pad + (i / (series.length - 1)) * (width - pad * 2),
    y: height - pad - ((v - min) / span) * (height - pad * 2),
  }));

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const current = `M ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="overflow-visible"
    >
      <title>{label}</title>

      <motion.path
        d={d}
        fill="none"
        stroke={tone.deemphasis}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={inView ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
      />

      <motion.path
        d={current}
        fill="none"
        stroke={tone.trend}
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={inView ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.3, delay: delay + 1.0, ease: "easeOut" }}
      />

      <motion.circle
        cx={last.x}
        cy={last.y}
        r={4}
        fill={tone.trend}
        stroke={tone.dotRing}
        strokeWidth={2}
        initial={{ scale: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : undefined}
        transition={{
          duration: 0.35,
          delay: delay + 1.2,
          type: "spring",
          stiffness: 320,
          damping: 18,
        }}
        style={{ transformOrigin: `${last.x}px ${last.y}px` }}
      />
    </svg>
  );
}

function Delta({ value }: { value: number }) {
  const tone = TONE;
  return (
    <span
      className="inline-flex items-baseline gap-1.5 text-sm font-semibold"
      style={{ color: tone.deltaInk }}
    >
      <ArrowUpRight className="h-3.5 w-3.5 self-center" aria-hidden />
      {`+${value.toFixed(1)}%`}
      <span className="text-xs font-medium text-slate-400 dark:text-neutral-500">
        vs. 3 months ago
      </span>
    </span>
  );
}

export function StatsSection() {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const tone = TONE;

  const heroTarget = HERO.series[HERO.series.length - 1];
  const heroDelta = quarterDelta(HERO.series);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-10 sm:py-14"
    >
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end dark:border-neutral-800"
        >
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span
                className="h-px w-8"
                style={{ backgroundColor: tone.trend }}
              />
              <span
                className="text-xs font-bold uppercase tracking-[0.22em]"
                style={{ color: tone.trend }}
              >
                {t("stats.kicker")}
              </span>
            </div>
            <h2
              className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl"
              style={{ color: tone.ink }}
            >
              {t("stats.title")}
              <span style={{ color: tone.trend }}>.</span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
            {t("stats.lede")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center border-b border-slate-200 py-10 lg:col-span-5 lg:border-b-0 lg:border-r lg:pr-12 dark:border-neutral-800"
          >
            <p className="text-base font-medium text-slate-500 dark:text-neutral-400">
              {t(HERO.labelKey) || HERO.label}
            </p>

            <p
              className="mt-3 font-bold leading-none tracking-tighter"
              style={{ color: tone.ink, fontSize: "clamp(56px, 7vw, 92px)" }}
            >
              <CountUp target={heroTarget} format={HERO.format} inView={inView} />
            </p>

            <div className="mt-6 flex items-center gap-4">
              <Sparkline
                series={HERO.series}
                label={`${HERO.label}: 12-month trend, $${HERO.series[0].toFixed(
                  1,
                )}M rising to ${HERO.format(heroTarget)}`}
                width={200}
                height={52}
                inView={inView}
              />
              <span className="text-xs font-medium uppercase leading-relaxed tracking-[0.16em] text-slate-400 dark:text-neutral-500">
                {t("common.last12")}
                <br />
                {t("common.months")}
              </span>
            </div>

            <div className="mt-6">
              <Delta value={heroDelta} />
            </div>
          </motion.div>

          <div className="lg:col-span-7">
            {STATS.map((stat, i) => {
              const target = stat.series[stat.series.length - 1];
              const delta = quarterDelta(stat.series);

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex items-center justify-between gap-6 py-7 ${
                    i < STATS.length - 1
                      ? "border-b border-slate-200 dark:border-neutral-800"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-base font-medium text-slate-500 dark:text-neutral-400">
                      {t(stat.labelKey) || stat.label}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-neutral-500">
                      {t(stat.unitKey) || stat.unit}
                    </p>
                    <div className="mt-3">
                      <Delta value={delta} />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-5 sm:gap-8">
                    <div className="hidden sm:block">
                      <Sparkline
                        series={stat.series}
                        label={`${stat.label}: 12-month trend, ${stat.format(
                          stat.series[0],
                        )} rising to ${stat.format(target)}`}
                        inView={inView}
                        delay={0.15 + i * 0.1}
                      />
                    </div>

                    <p
                      className="text-right text-4xl font-bold leading-none tracking-[-0.04em] sm:text-5xl"
                      style={{ color: tone.ink }}
                    >
                      <CountUp target={target} format={stat.format} inView={inView} />
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
