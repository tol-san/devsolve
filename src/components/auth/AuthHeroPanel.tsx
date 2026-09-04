"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { useLocalePath } from "@/lib/i18n/I18nProvider";

export interface HeroBadge {
  icon: LucideIcon;
  label: string;
  borderColorClass: string;
  iconColorClass: string;
}

interface AuthHeroPanelProps {
  imageSrcDark?: string;
  imageSrcLight?: string;
  imageSrc?: string;
  lottieSrc?: string;
  badges?: HeroBadge[];
  headline: string;
  description: string;
  glowColor1?: string;
  glowColor2?: string;
  backHref?: string;
  backLabel?: string;
}

export function AuthHeroPanel({
  imageSrcDark,
  imageSrcLight,
  imageSrc,
  lottieSrc,
  badges,
  headline,
  description,
  glowColor1 = "bg-blue-500/20",
  glowColor2 = "bg-cyan-500/20",
  backHref = "/account-type",
  backLabel = "Back to choose account type",
}: AuthHeroPanelProps) {
  const localePath = useLocalePath();

  const darkImg = imageSrcDark || imageSrc;
  const lightImg = imageSrcLight || imageSrcDark || imageSrc;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative hidden lg:flex h-screen max-h-screen w-full flex-col justify-between items-start overflow-hidden border-r border-slate-200/80 dark:border-border bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/60 dark:bg-[#070b14] p-8 sm:p-10 lg:p-12 xl:p-16 text-left shrink-0"
    >
      {darkImg && (
        <div className="absolute inset-0 size-full pointer-events-none overflow-hidden z-0 hidden dark:block">
          <Image
            src={darkImg}
            alt={headline}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center size-full select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/90 via-[#070b14]/20 to-[#070b14]/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/40 via-transparent to-transparent" />
        </div>
      )}

      {lightImg && (
        <div className="absolute inset-0 size-full pointer-events-none overflow-hidden z-0 block dark:hidden">
          <Image
            src={lightImg}
            alt={headline}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center size-full select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/95 via-slate-50/25 to-slate-50/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/30 via-transparent to-transparent" />
        </div>
      )}

      {!darkImg && !lightImg && (
        <>
          <div
            className={`pointer-events-none absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 size-[500px] ${glowColor1} rounded-full blur-[120px] opacity-60`}
          />
          <div
            className={`pointer-events-none absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 size-[450px] ${glowColor2} rounded-full blur-[120px] opacity-50`}
          />
          {lottieSrc && (
            <div className="relative my-auto flex size-full items-center justify-center py-4">
              <div className="size-80 flex items-center justify-center">
                <DotLottieReact src={lottieSrc} loop autoplay />
              </div>
            </div>
          )}
        </>
      )}

      <div className="relative z-10 w-full flex items-center justify-start">
        <Link
          href={localePath(backHref)}
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4 text-blue-600 dark:text-blue-400 transition-transform group-hover:-translate-x-1" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {badges && badges.length > 0 && !darkImg && !lightImg && (
        <div className="relative z-10 my-auto flex flex-wrap justify-center gap-2.5">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 bg-white/95 dark:bg-[#0b1220]/90 backdrop-blur-md border ${badge.borderColorClass} px-3.5 py-1.5 rounded-full shadow-xs text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200`}
              >
                <Icon className={`size-3.5 ${badge.iconColorClass}`} />
                <span>{badge.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative z-10 w-full max-w-lg mt-auto pt-6 text-left">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-2 text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-xs"
        >
          {headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-normal drop-shadow-xs"
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
}
