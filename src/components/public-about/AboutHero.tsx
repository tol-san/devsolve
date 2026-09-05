"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Sparkles, Users, Award, ShieldCheck } from "lucide-react";
import { useLocalePath } from "@/lib/i18n/I18nProvider";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function AboutHero({
  eyebrow,
  titleLineOne,
  titleLineTwo,
  description,
  actionLabel,
  imageAlt,
}: {
  eyebrow: string;
  titleLineOne: string;
  titleLineTwo: string;
  description: string;
  actionLabel: string;
  imageAlt: string;
}) {
  const lp = useLocalePath();

  return (
    <section className="relative -mt-(--navbar-height) overflow-hidden pt-(--navbar-height)">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* Left Column: Hero Content & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="flex flex-col items-start justify-center lg:col-span-6 xl:col-span-6"
          >
            {/* Eyebrow Pill */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400">
              <Sparkles className="size-3.5" />
              <span>{eyebrow}</span>
            </div>

            {/* Monumental Headline */}
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.1]">
              {titleLineOne}
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400">
                {titleLineTwo}
              </span>
              <span className="text-blue-600 dark:text-blue-400">.</span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
              {description}
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={lp("/programs")}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98] dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <span>{actionLabel}</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <a
                href="#team"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/80 bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur-md shadow-2xs transition-all hover:bg-muted active:scale-[0.98]"
              >
                <Users className="size-4 text-blue-600 dark:text-blue-400" />
                <span>Meet the team</span>
              </a>
            </div>

            {/* Mini Trust Highlights */}
            <div className="mt-8 flex flex-wrap items-center gap-5 text-xs font-medium text-muted-foreground border-t border-border/60 pt-5 w-full">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Zero-Trust Security Core</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="size-4 text-amber-500" />
                <span>ISTAD &amp; MPTC Supervised</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Team Image Showcase Frame */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
            className="relative lg:col-span-6 xl:col-span-6"
          >
            {/* Ambient Glow Halo behind the frame */}
            <div className="absolute -inset-2.5 sm:-inset-3 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-500/15 via-sky-500/10 to-indigo-500/15 blur-xl -z-10 pointer-events-none" />

            {/* Browser / Studio Window Frame */}
            <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card/80 shadow-xl backdrop-blur-xl ring-1 ring-foreground/5">
              {/* Window Top Titlebar — slim, clean & refined */}
              <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-3 py-2 sm:px-4">
                {/* Traffic light dots */}
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-red-500/70 dark:bg-red-400/60" />
                  <span className="size-2 rounded-full bg-amber-500/70 dark:bg-amber-400/60" />
                  <span className="size-2 rounded-full bg-emerald-500/70 dark:bg-emerald-400/60" />
                </div>

                {/* Title & Location */}
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono font-medium text-muted-foreground truncate max-w-[180px] sm:max-w-none">
                  <span>DevSolve Core Engineering Team</span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Cohort</span>
                </div>
              </div>

              {/* Team Photograph Container — compact & focused on team */}
              <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] max-h-[380px] lg:max-h-[420px] w-full overflow-hidden bg-muted">
                <Image
                  src="/teams/team.jpg"
                  alt={imageAlt}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover object-[center_35%] transition-transform duration-700 ease-out hover:scale-[1.015]"
                />
              </div>
            </div>

            {/* Clean Subtle Team Caption underneath */}
            <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">DevSolve Innovators</span>
              <span>•</span>
              <span>11 Members</span>
              <span>•</span>
              <span>Academic foundation at ISTAD &amp; MPTC</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
