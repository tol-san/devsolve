"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export interface HeroBadge {
  icon: LucideIcon;
  label: string;
  borderColorClass: string;
  iconColorClass: string;
}

interface AuthHeroPanelProps {
  lottieSrc: string;
  badges: HeroBadge[];
  headline: string;
  description: string;
  glowColor1?: string;
  glowColor2?: string;
  /** Where the top-left link goes. Defaults to the account-type chooser,
   *  which is the step the registration screens come from. */
  backHref?: string;
  backLabel?: string;
}

export function AuthHeroPanel({
  lottieSrc,
  badges,
  headline,
  description,
  glowColor1 = "bg-blue-400/20",
  glowColor2 = "bg-emerald-400/20",
  backHref = "/account-type",
  backLabel = "Back to choose account type",
}: AuthHeroPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-blue-50/60 backdrop-blur-[2px] border-b lg:border-b-0 lg:border-r border-border p-6 sm:p-10 xl:p-14 flex flex-col justify-between items-center relative overflow-hidden min-h-[480px] lg:min-h-[100dvh] text-center dark:bg-blue-950/20"
    >
      {/* Ambient Glows */}
      <div className={`pointer-events-none absolute -top-24 -left-24 w-96 h-96 ${glowColor1} rounded-full blur-3xl -z-0`} />
      <div className={`pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 ${glowColor2} rounded-full blur-3xl -z-0`} />

      <div className="relative z-10 w-full flex flex-col h-full justify-between items-center">
        {/* Back Navigation Link */}
        <div className="w-full flex justify-start items-center mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground/80 hover:text-blue-600 transition-colors group dark:hover:text-blue-400"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-blue-600" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Central Lottie Illustration with Backdrop */}
        <div className="relative w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center justify-center py-4">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/60 via-indigo-100/50 to-emerald-100/40 rounded-full blur-xl" />
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <DotLottieReact src={lottieSrc} loop autoplay />
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-5 relative z-10">
            {badges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 bg-card/90 backdrop-blur-xs border ${badge.borderColorClass} px-3 py-1.5 rounded-full shadow-2xs text-sm font-semibold text-foreground`}
                >
                  <Icon className={`w-3.5 h-3.5 ${badge.iconColorClass}`} />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Headline & Description */}
        <div className="mt-auto pt-4 max-w-md mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight text-blue-600 mb-2 dark:text-blue-400"
          >
            {headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-sm sm:text-base leading-relaxed font-normal"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
