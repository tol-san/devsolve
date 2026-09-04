"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { BRAND_INK } from "@/components/public-about/SectionHeading";

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
  return (
    <section className="relative -mt-(--navbar-height) overflow-hidden pt-(--navbar-height)">
      <div className="relative mx-auto max-w-7xl px-6 pt-12 sm:px-12 sm:pt-16 lg:px-16">
        <div className="grid grid-cols-1 items-start justify-between gap-8 pb-8 sm:pb-12 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="lg:col-span-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.08]">
              {titleLineOne}
              <br />
              {titleLineTwo}
              <span className={BRAND_INK}>.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE_OUT }}
            className="flex flex-col items-start justify-between gap-6 pt-1 lg:col-span-5"
          >
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>

            <Link
              href="/programs"
              className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-xs font-semibold text-background shadow-xs transition-all hover:opacity-90 active:scale-98"
            >
              {actionLabel}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT }}
          className="relative pb-16 sm:pb-24"
        >
          <div className="relative aspect-16/10 sm:aspect-video lg:aspect-21/10 w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-muted shadow-xl ring-1 ring-foreground/10">
            <Image
              src="/teams/team.jpg"
              alt={imageAlt}
              fill
              priority
              quality={90}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-top sm:object-center"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
