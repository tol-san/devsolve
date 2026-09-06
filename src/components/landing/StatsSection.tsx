"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { ACCENT, PRIMARY, SECONDARY, SURFACE } from "./SectionBackdrop";
import { useGetPublicStatsQuery } from "@/lib/redux/services/publicApi";
import { Button } from "@/components/ui/button";

const TONE = {
  deemphasis: "var(--ds-deemphasis)",
  deltaInk: "var(--ds-delta)",
  trend: "var(--ds-trend)",
  dotRing: SURFACE,
  ink: "var(--ds-ink)",
} as const;

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function quarterDelta(series: number[] | undefined | null): number | null {
  if (!series || series.length < 4) return null;
  const now = series[series.length - 1];
  const then = series[series.length - 4];
  if (then === 0) {
    return now > 0 ? 100 : 0;
  }
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
    if (!inView || reduce) {
      setValue(target);
      return;
    }

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
  color,
}: {
  series: number[];
  label: string;
  width?: number;
  height?: number;
  inView: boolean;
  delay?: number;
  color?: string;
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
  const prev = points[points.length - 2] ?? last;
  const current = `M ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;
  const trendColor = color || tone.trend;

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
        stroke={trendColor}
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
        fill={trendColor}
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

function Delta({ value, color }: { value: number; color?: string }) {
  const t = useT();
  const tone = TONE;
  return (
    <span
      className="inline-flex items-baseline gap-1.5 text-sm font-semibold"
      style={{ color: color || tone.deltaInk }}
    >
      <ArrowUpRight className="h-3.5 w-3.5 self-center" aria-hidden />
      {`+${value.toFixed(1)}%`}
      <span className="text-xs font-medium text-slate-400 dark:text-neutral-500">
        {t("stats.vsQuarter") || "vs. 3 months ago"}
      </span>
    </span>
  );
}

export function StatsSection() {
  const t = useT();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const tone = TONE;

  const { data: stats, isLoading, isError, refetch } = useGetPublicStatsQuery();

  const heroTarget = stats?.totalDisbursedUsd ?? 0;
  const heroSeries = stats?.historicalSeries?.disbursedUsd ?? null;
  const heroDelta = heroSeries ? quarterDelta(heroSeries) : null;

  const subStats = [
    {
      label: "Verified researchers",
      labelKey: "stats.researchers",
      unit: "active accounts",
      unitKey: "stats.researchersUnit",
      value: stats?.activeResearchers ?? 0,
      series: stats?.historicalSeries?.researchers ?? null,
      format: (n: number) => Math.round(n).toLocaleString(),
      color: ACCENT,
    },
    {
      label: "Live programs",
      labelKey: "stats.livePrograms",
      unit: "accepting reports",
      unitKey: "stats.liveUnit",
      value: stats?.livePrograms ?? 0,
      series: stats?.historicalSeries?.livePrograms ?? null,
      format: (n: number) => String(Math.round(n)),
      color: PRIMARY,
    },
    {
      label: "Reports validated",
      labelKey: "stats.reports",
      unit: "triaged and closed",
      unitKey: "stats.reportsUnit",
      value: stats?.validatedReports ?? 0,
      series: stats?.historicalSeries?.validatedReports ?? null,
      format: (n: number) =>
        n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.round(n)),
      color: SECONDARY,
    },
  ];

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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
              {t("stats.lede")}
            </p>
            <Link
              href={lp("/programs")}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: PRIMARY }}
            >
              <span>{t("stats.exploreStats") || "Explore Programs"}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </motion.div>

        {isError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Unable to load live platform statistics.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 rounded-full gap-1.5 cursor-pointer text-xs"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-12">
            {/* Hero Left: Bounties Paid Out */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-center border-b border-slate-200 py-10 lg:col-span-5 lg:border-b-0 lg:border-r lg:pr-12 dark:border-neutral-800"
            >
              <p className="text-base font-medium text-slate-500 dark:text-neutral-400">
                {t("stats.bountiesPaid") || "Bounties paid out"}
              </p>

              <p
                className="mt-3 font-bold leading-none tracking-tighter"
                style={{ color: tone.ink, fontSize: "clamp(48px, 6vw, 76px)" }}
              >
                {isLoading ? (
                  <span className="animate-pulse opacity-40">$0.00</span>
                ) : (
                  <CountUp
                    target={heroTarget}
                    format={formatCurrency}
                    inView={inView}
                  />
                )}
              </p>

              {/* Sparkline & Delta (hidden if historicalSeries is null) */}
              {heroSeries && (
                <>
                  <div className="mt-6 flex items-center gap-4">
                    <Sparkline
                      series={heroSeries}
                      label={`Bounties paid out: 12-month trend, ${formatCurrency(heroSeries[0])} to ${formatCurrency(heroTarget)}`}
                      width={200}
                      height={52}
                      inView={inView}
                      color={PRIMARY}
                    />
                    <span className="text-xs font-medium uppercase leading-relaxed tracking-[0.16em] text-slate-400 dark:text-neutral-500">
                      {t("common.last12")}
                      <br />
                      {t("common.months")}
                    </span>
                  </div>

                  {heroDelta !== null && (
                    <div className="mt-6">
                      <Delta value={heroDelta} color={PRIMARY} />
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Sub Stats Right Column */}
            <div className="lg:col-span-7">
              {subStats.map((stat, i) => {
                const delta = stat.series ? quarterDelta(stat.series) : null;

                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : undefined}
                    transition={{
                      duration: 0.5,
                      delay: 0.2 + i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`flex items-center justify-between gap-6 py-7 ${
                      i < subStats.length - 1
                        ? "border-b border-slate-200 dark:border-neutral-800"
                        : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {stat.color && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: stat.color }}
                            aria-hidden
                          />
                        )}
                        <p className="text-base font-medium text-slate-500 dark:text-neutral-400">
                          {t(stat.labelKey) || stat.label}
                        </p>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-neutral-500">
                        {t(stat.unitKey) || stat.unit}
                      </p>
                      {delta !== null && (
                        <div className="mt-3">
                          <Delta value={delta} color={stat.color} />
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-5 sm:gap-8">
                      {/* Sparkline hidden if series is null */}
                      {stat.series && (
                        <div className="hidden sm:block">
                          <Sparkline
                            series={stat.series}
                            label={`${stat.label}: 12-month trend`}
                            inView={inView}
                            delay={0.15 + i * 0.1}
                            color={stat.color}
                          />
                        </div>
                      )}

                      <p
                        className="text-right text-4xl font-bold leading-none tracking-[-0.04em] sm:text-5xl"
                        style={{ color: tone.ink }}
                      >
                        {isLoading ? (
                          <span className="animate-pulse opacity-40">0</span>
                        ) : (
                          <CountUp
                            target={stat.value}
                            format={stat.format}
                            inView={inView}
                          />
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default StatsSection;
