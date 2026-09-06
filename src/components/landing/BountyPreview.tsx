"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { motion, useInView } from "motion/react";
import { ArrowUpRight, Bug, Clock3, RotateCcw, Shield } from "lucide-react";
import {
  useGetPublicProgramsQuery,
  type ProgramSummary,
} from "@/lib/redux/services/publicApi";
import { ACCENT, PRIMARY, SECONDARY, useInk } from "./SectionBackdrop";

const SCOPE_LABELS: Record<string, string> = {
  API: "API",
  URL: "Web / URL",
  WILDCARD: "Wildcard",
  MOBILE_APP: "Mobile",
  IP_RANGE: "Network / IP",
  SOURCE_CODE: "Source Code",
  HARDWARE: "Hardware",
  OTHER: "Other",
};

const SEVERITY_CHIP: Record<string, string> = {
  CRITICAL: "bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900",
  HIGH: "bg-blue-500/15 text-[#2563EB] dark:text-blue-300 border border-blue-500/25",
  MEDIUM: "bg-emerald-500/15 text-[#10B981] dark:text-emerald-300 border border-emerald-500/25",
  LOW: "bg-amber-500/15 text-[#D97706] dark:text-amber-300 border border-amber-500/25",
};

const money = (n: number | null | undefined): string => {
  if (n == null) return "—";
  return `$${Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

function RewardBar({
  max,
  ceiling,
  delay = 0,
}: {
  max: number | null;
  ceiling: number;
  delay?: number;
}) {
  const widthPct = max && ceiling > 0 ? Math.min(100, (max / ceiling) * 100) : 0;
  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-neutral-800"
      aria-hidden
    >
      <motion.div
        className="h-full"
        style={{ backgroundColor: PRIMARY, borderRadius: "0 4px 4px 0" }}
        initial={{ width: 0 }}
        whileInView={{ width: `${widthPct}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function LivePill() {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-neutral-400 whitespace-nowrap">
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
          style={{ backgroundColor: ACCENT }}
        />
        <span
          className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: ACCENT }}
        />
      </span>
      {t("sections.bounty.accepting")}
    </span>
  );
}

function ProgramLogo({
  logoUrl,
  name,
  className = "h-11 w-11",
}: {
  logoUrl: string | null | undefined;
  name: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <span className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-neutral-800 shrink-0 ${className}`}>
        <Image
          src={logoUrl}
          alt={name}
          fill
          sizes="48px"
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span className={`flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 shrink-0 ${className}`}>
      <Shield className="h-5 w-5" />
    </span>
  );
}

export function BountyPreview() {
  const t = useT();
  const lp = useLocalePath();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const ink = useInk();

  const { data, isLoading, isError, refetch } = useGetPublicProgramsQuery({
    page: 0,
    size: 5,
    sort: "maximumBounty,desc",
  });

  const programs: ProgramSummary[] = data?.items ?? [];
  const featured = programs[0];
  const others = programs.slice(1);

  const ceiling = Math.max(
    ...programs.map((p) => p.maximumBounty ?? 0),
    1000
  );

  return (
    <section ref={ref} className="relative overflow-hidden py-10 sm:py-14">
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end dark:border-neutral-800"
        >
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="h-px w-8" style={{ backgroundColor: PRIMARY }} />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#2563EB] dark:text-blue-400">
                {t("sections.bounty.kicker")}
              </span>
            </div>
            <h2
              className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl"
              style={{ color: ink }}
            >
              {t("sections.bounty.title")}
              <span className="text-[#2563EB] dark:text-blue-400">.</span>
            </h2>
          </div>

          <Link
            href={lp("/programs")}
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-slate-200/90 bg-white/90 px-5 py-2.5 text-sm font-semibold shadow-xs backdrop-blur-md transition-all hover:bg-blue-50 hover:text-[#2563EB] hover:border-blue-200 sm:self-auto dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
            style={{ color: ink }}
          >
            {t("sections.bounty.allPrograms")}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 animate-pulse">
            <div className="h-96 rounded-2xl bg-card border border-border/60 p-7 lg:col-span-5" />
            <div className="space-y-4 lg:col-span-7">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-24 rounded-xl bg-card border border-border/50" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card p-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {t("sections.bounty.loadError") || "Unable to load bounty programs at this time."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : programs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">
            {t("sections.bounty.empty") || "No bounty programs available at this time."}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {featured && (
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col rounded-2xl bg-white p-7 shadow-[0_0_0_1px_rgba(30,41,59,0.08),0_2px_10px_rgba(30,41,59,0.05)] lg:col-span-5 dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_2px_10px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProgramLogo
                      logoUrl={featured.organization?.logoUrl}
                      name={featured.name}
                      className="h-11 w-11"
                    />
                    <div className="min-w-0">
                      <h3
                        className="truncate text-lg font-bold tracking-tight"
                        style={{ color: ink }}
                      >
                        {featured.name}
                      </h3>
                      <p className="truncate text-sm text-slate-400 dark:text-neutral-500">
                        {featured.organization?.industry?.replace(/_/g, " ") ||
                          featured.organization?.name ||
                          "Security"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#2563EB] dark:bg-blue-500/15 dark:text-blue-300">
                    {t("sections.bounty.featured")}
                  </span>
                </div>

                {featured.scope && featured.scope.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {featured.scope.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-neutral-700 dark:text-neutral-400"
                      >
                        {SCOPE_LABELS[s] || s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-7">
                  <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">
                    {t("sections.bounty.maxPayout")}
                  </p>
                  <p
                    className="mt-1 text-5xl font-bold leading-none tracking-tighter sm:text-6xl"
                    style={{ color: ink }}
                  >
                    {money(featured.maximumBounty)}
                  </p>
                  <p className="mt-2 text-sm text-slate-400 dark:text-neutral-500">
                    {t("sections.bounty.range") || "Range"}{" "}
                    {money(featured.minimumBounty)} – {money(featured.maximumBounty)}
                  </p>
                  <div className="mt-4">
                    <RewardBar
                      max={featured.maximumBounty}
                      ceiling={ceiling}
                      delay={0.35}
                    />
                  </div>
                </div>

                <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6 dark:border-neutral-800">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500">
                      {t("sections.bounty.reports")}
                    </dt>
                    <dd
                      className="mt-1.5 flex items-center gap-1.5 text-lg font-bold"
                      style={{ color: ink }}
                    >
                      <Bug
                        className="h-4 w-4 text-slate-300 dark:text-neutral-600"
                        aria-hidden
                      />
                      {featured.resolvedReports ?? featured.totalSubmissions ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500">
                      {t("sections.bounty.triage") || "Triage"}
                    </dt>
                    <dd
                      className="mt-1.5 flex items-center gap-1.5 text-lg font-bold"
                      style={{ color: ink }}
                    >
                      <Clock3
                        className="h-4 w-4 text-slate-300 dark:text-neutral-600"
                        aria-hidden
                      />
                      {featured.avgTriageDays != null
                        ? `${featured.avgTriageDays}d`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-500">
                      {t("sections.bounty.topTier")}
                    </dt>
                    <dd className="mt-1.5">
                      {featured.topSeverity && featured.topSeverity !== "NONE" ? (
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold ${
                            SEVERITY_CHIP[featured.topSeverity] ||
                            SEVERITY_CHIP.HIGH
                          }`}
                        >
                          {featured.topSeverity}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-neutral-500">—</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-neutral-800">
                  <LivePill />
                  <Link
                    href={lp(`/programs/${featured.handle || featured.id}`)}
                    className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {t("sections.bounty.viewProgram")}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </motion.article>
            )}

            <div className="lg:col-span-7">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-3 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-500">
                  {t("sections.bounty.alsoAccepting")}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-neutral-500">
                  {t("sections.bounty.rewardReach") || "Reward reach vs."}{" "}
                  {money(ceiling)}
                </span>
              </div>

              {others.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="border-b border-slate-200 dark:border-neutral-800"
                >
                  <Link
                    href={lp(`/programs/${p.handle || p.id}`)}
                    className="group -mx-4 block rounded-xl px-4 py-6 transition-colors hover:bg-white dark:hover:bg-neutral-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <ProgramLogo
                          logoUrl={p.organization?.logoUrl}
                          name={p.name}
                          className="h-10 w-10"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className="truncate text-base font-bold tracking-tight"
                              style={{ color: ink }}
                            >
                              {p.name}
                            </h3>
                            {p.organization?.industry && (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-neutral-800 dark:text-neutral-300">
                                {p.organization.industry.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                          {p.scope && p.scope.length > 0 && (
                            <p className="mt-1 truncate text-sm text-slate-400 dark:text-neutral-500">
                              {p.scope.map((s) => SCOPE_LABELS[s] || s).join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
                        {p.topSeverity && p.topSeverity !== "NONE" && (
                          <span
                            className={`hidden rounded-lg px-2.5 py-1 text-xs font-bold sm:inline-block ${
                              SEVERITY_CHIP[p.topSeverity] || SEVERITY_CHIP.HIGH
                            }`}
                          >
                            {p.topSeverity}
                          </span>
                        )}
                        <span className="hidden items-center gap-1.5 text-sm font-semibold text-slate-500 sm:inline-flex dark:text-neutral-400">
                          <Bug
                            className="h-3.5 w-3.5 text-slate-300 dark:text-neutral-600"
                            aria-hidden
                          />
                          {p.resolvedReports ?? p.totalSubmissions ?? 0}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-600 dark:text-neutral-600 dark:group-hover:text-neutral-300" />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 pl-13">
                      <span
                        className="w-40 shrink-0 text-sm font-semibold"
                        style={{ color: ink }}
                      >
                        {money(p.minimumBounty)} – {money(p.maximumBounty)}
                      </span>
                      <RewardBar
                        max={p.maximumBounty}
                        ceiling={ceiling}
                        delay={0.3 + i * 0.1}
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl p-7 sm:flex-row sm:items-center"
          style={{ backgroundColor: SECONDARY }}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <Bug className="h-5 w-5 text-emerald-400" aria-hidden />
            </span>
            <div>
              <p className="text-base font-bold text-white">
                {t("sections.bounty.inHouse")}
              </p>
              <p className="mt-0.5 text-sm text-slate-400">
                {t("sections.bounty.inHouseBody")}
              </p>
            </div>
          </div>

          <Link
            href={lp("/account-type")}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.45)] transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: PRIMARY }}
          >
            {t("sections.bounty.launch")}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default BountyPreview;
