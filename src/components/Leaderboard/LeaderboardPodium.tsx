"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CountryDisplay } from "@/components/shared/CountryDisplay";
import { Crown, Globe } from "lucide-react";
import {
  LeaderboardEntry,
  LeaderboardPeriod,
  RANKED_COUNT_LABEL,
} from "@/lib/types/leaderboard/types";
import ResearcherAvatar from "./ResearcherAvatar";
import {
  PERIOD_LABEL_SHORT,
  formatNumber,
  profileHref,
} from "./leaderboard-ui";

const COLUMNS = [1, 0, 2];

const RISER_HEIGHTS = [
  "h-[250px] sm:h-[335px]", // 1st Place (Center - tallest)
  "h-[210px] sm:h-[285px]", // 2nd Place (Left)
  "h-[210px] sm:h-[285px]", // 3rd Place (Right)
];

const AVATAR_SIZES = [68, 68, 68];
const BUILD_DELAY = [0.34, 0.06, 0.2];

function CountUp({
  target,
  duration = 900,
}: {
  target: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduce) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduce]);

  return (
    <span className="relative inline-block tabular-nums">
      <span className="opacity-0">{formatNumber(target)}</span>
      <span aria-hidden className="absolute inset-0">
        {formatNumber(reduce ? target : value)}
      </span>
    </span>
  );
}

function FloatingConfetti() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  const confettiItems = [
    { top: "12%", left: "12%", color: "bg-amber-400", size: "w-2.5 h-2.5 rotate-12" },
    { top: "18%", left: "26%", color: "bg-blue-400", size: "w-2 h-3 -rotate-45" },
    { top: "28%", left: "8%", color: "bg-purple-400", size: "w-3 h-2 rotate-30" },
    { top: "14%", right: "14%", color: "bg-rose-400", size: "w-2.5 h-2.5 -rotate-12" },
    { top: "22%", right: "26%", color: "bg-emerald-400", size: "w-2 h-3 rotate-45" },
    { top: "30%", right: "10%", color: "bg-amber-300", size: "w-3 h-2 -rotate-30" },
    { top: "8%", left: "48%", color: "bg-blue-500", size: "w-2 h-2 rotate-15" },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {confettiItems.map((item, idx) => (
        <motion.span
          key={idx}
          className={`absolute rounded-xs opacity-75 ${item.color} ${item.size}`}
          style={{ top: item.top, left: item.left, right: item.right }}
          animate={{
            y: [0, -8, 0],
            rotate: [0, 20, -20, 0],
          }}
          transition={{
            duration: 3.5 + (idx % 3),
            repeat: Infinity,
            ease: "easeInOut",
            delay: idx * 0.25,
          }}
        />
      ))}
    </div>
  );
}

function LaurelWreathIcon({ rank }: { rank: number }) {
  const colors = {
    1: "text-amber-400",
    2: "text-indigo-400",
    3: "text-rose-400",
  }[rank] || "text-slate-500";

  return (
    <div className="relative mb-2 flex items-center justify-center select-none">
      <svg
        viewBox="0 0 80 50"
        className={`w-14 h-9 sm:w-16 sm:h-10 ${colors}`}
        fill="currentColor"
      >
        <g>
          <path d="M 24,44 C 18,36 17,20 28,8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 25,12 C 20,10 16,13 18,18 C 22,17 24,14 25,12 Z" />
          <path d="M 21,21 C 15,20 12,24 15,28 C 18,27 20,24 21,21 Z" />
          <path d="M 19,31 C 13,31 11,36 14,39 C 17,38 18,34 19,31 Z" />
          <path d="M 23,39 C 17,41 16,46 20,47 C 22,45 23,42 23,39 Z" />
        </g>

        <g>
          <path d="M 56,44 C 62,36 63,20 52,8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 55,12 C 60,10 64,13 62,18 C 58,17 56,14 55,12 Z" />
          <path d="M 59,21 C 65,20 68,24 65,28 C 62,27 60,24 59,21 Z" />
          <path d="M 61,31 C 67,31 69,36 66,39 C 63,38 62,34 61,31 Z" />
          <path d="M 57,39 C 63,41 64,46 60,47 C 58,45 57,42 57,39 Z" />
        </g>
      </svg>

      <span className={`absolute text-base sm:text-lg font-black tracking-tight ${colors}`}>
        {rank}
      </span>
    </div>
  );
}

function PodiumColumn({
  entry,
  place,
  period,
}: {
  entry: LeaderboardEntry;
  place: number;
  period: LeaderboardPeriod;
}) {
  const reduce = useReducedMotion();
  const isChampion = place === 0;
  const delay = BUILD_DELAY[place];

  const avatarRingStyles = {
    0: "ring-4 ring-amber-400 shadow-lg shadow-amber-400/40",
    1: "ring-4 ring-indigo-400 shadow-lg shadow-indigo-400/40",
    2: "ring-4 ring-rose-400 shadow-lg shadow-rose-400/40",
  }[place];

  const badgePillStyles = {
    0: "bg-white/95 text-amber-950 font-black px-4 py-0.5 rounded-full text-xs tracking-wider shadow-sm",
    1: "bg-white/95 text-indigo-950 font-black px-3.5 py-0.5 rounded-full text-xs tracking-wider shadow-sm",
    2: "bg-white/95 text-rose-950 font-black px-3.5 py-0.5 rounded-full text-xs tracking-wider shadow-sm",
  }[place];

  const pointsTextStyles = {
    0: "text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs",
    1: "text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs",
    2: "text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-xs",
  }[place];

  const ptsUnitStyles = {
    0: "text-white/90 font-bold drop-shadow-xs",
    1: "text-white/90 font-bold drop-shadow-xs",
    2: "text-white/90 font-bold drop-shadow-xs",
  }[place];

  const rankBadgeText = place === 0 ? "1ST" : place === 1 ? "2ND" : "3RD";

  const contentPadding = {
    0: "pt-4 pb-3.5",
    1: "pt-9 sm:pt-11 pb-3",
    2: "pt-9 sm:pt-11 pb-3",
  }[place];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay * 0.5 }}
      className={`group flex flex-1 min-w-0 flex-col items-center justify-end ${
        isChampion ? "z-10" : "z-0"
      }`}
    >
      <Link
        href={profileHref(entry.username)}
        aria-label={`Rank ${entry.rank}: ${entry.displayName}, ${formatNumber(
          entry.reputation,
        )} reputation points. Open profile.`}
        className="flex w-full min-w-0 flex-col items-center outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <div className="flex w-full min-w-0 flex-col items-center transition-transform duration-200 ease-out group-hover:-translate-y-1 pb-3 px-1 sm:px-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.1, type: "spring", stiffness: 300 }}
          >
            <LaurelWreathIcon rank={entry.rank} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: delay + 0.18,
              type: "spring",
              stiffness: 320,
              damping: 20,
            }}
            className="relative mt-0.5"
          >
            <span
              className={`inline-flex shrink-0 items-center justify-center rounded-full bg-background p-1 ${avatarRingStyles}`}
            >
              <ResearcherAvatar
                username={entry.username}
                displayName={entry.displayName}
                avatarUrl={entry.avatarUrl}
                initials={entry.avatarInitials}
                size={AVATAR_SIZES[place]}
              />
            </span>

            {isChampion && (
              <span className="absolute -bottom-1.5 left-1/2 flex h-5 sm:h-6 -translate-x-1/2 items-center gap-0.5 rounded-full bg-amber-400 px-2 text-[11px] sm:text-xs font-black text-amber-950 shadow-md border border-amber-300">
                <Crown className="size-3 fill-amber-950 text-amber-950" aria-hidden />
                <span>1</span>
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: delay + 0.25 }}
            className="mt-3 flex w-full min-w-0 flex-col items-center text-center"
          >
            <p className="w-full truncate text-xs sm:text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {entry.displayName}
            </p>

            <div className="mt-1 hidden sm:flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
              {entry.country ? (
                <CountryDisplay
                  value={entry.country}
                  size={12}
                  textClassName="max-w-[95px] sm:max-w-[140px]"
                />
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="truncate">Unknown country</span>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <div className={`relative w-full ${RISER_HEIGHTS[place]}`}>
          {place === 1 && (
            <svg
              viewBox="0 0 100 200"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full drop-shadow-sm z-0"
            >
              <defs>
                <linearGradient id="podium-2nd-grad-full" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#6366F1" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.60" />
                </linearGradient>
              </defs>
              <path
                d="M 0,55 C 0,35 15,20 36,20 L 80,20 C 90,20 97,16 100,12 L 100,200 L 0,200 Z"
                fill="url(#podium-2nd-grad-full)"
              />
            </svg>
          )}

          {place === 2 && (
            <svg
              viewBox="0 0 100 200"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full drop-shadow-sm z-0"
            >
              <defs>
                <linearGradient id="podium-3rd-grad-full" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#F43F5E" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity="0.60" />
                </linearGradient>
              </defs>
              <path
                d="M 0,12 C 3,16 10,20 20,20 L 64,20 C 85,20 100,35 100,55 L 100,200 L 0,200 Z"
                fill="url(#podium-3rd-grad-full)"
              />
            </svg>
          )}

          {place === 0 && (
            <motion.div
              initial={{ scaleY: reduce ? 1 : 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay, type: "spring", stiffness: 140, damping: 18 }}
              className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#FBBF24] via-[#F59E0B] to-[#D97706] opacity-65 text-white rounded-t-[2.2rem] sm:rounded-t-[2.8rem] shadow-xl shadow-amber-500/15 z-10 overflow-hidden"
              style={{ transformOrigin: "bottom" }}
            >
              {!reduce && (
                <motion.span
                  className="absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.45),transparent)]"
                  animate={{ x: ["0%", "420%"] }}
                  transition={{
                    duration: 2,
                    delay: delay + 0.6,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>
          )}

          <div className={`relative z-20 flex h-full flex-col items-center justify-between ${contentPadding} px-1.5 sm:px-3 text-center`}>
            <span className={badgePillStyles}>
              {rankBadgeText}
            </span>

            <div className="my-auto py-0.5">
              <p className="flex items-baseline justify-center gap-1">
                <span className={pointsTextStyles}>
                  <CountUp target={entry.reputation} />
                </span>
                <span className={`text-xs sm:text-sm font-bold ${ptsUnitStyles}`}>
                  pts
                </span>
              </p>
            </div>

            <div className="w-[94%] sm:w-[90%] max-w-[220px] rounded-2xl py-1 sm:py-2 px-1 backdrop-blur-xs bg-white/20 shadow-2xs text-white">
              <div className="grid grid-cols-3 divide-x divide-white/25 text-center">
                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <span className="text-xs sm:text-base font-black leading-tight text-white drop-shadow-xs">
                    {formatNumber(entry.validReports ?? 0)}
                  </span>
                  <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold text-white/90 mt-0.5">
                    valid
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <span className="text-xs sm:text-base font-black leading-tight text-white drop-shadow-xs">
                    {formatNumber(entry.criticalReports)}
                  </span>
                  <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold text-white/90 mt-0.5">
                    critical
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-0.5 sm:px-1">
                  <span className="text-xs sm:text-base font-black leading-tight text-white drop-shadow-xs">
                    {formatNumber(entry.recognitionCount)}
                  </span>
                  <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold text-white/90 mt-0.5">
                    {RANKED_COUNT_LABEL[period].plural}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function LeaderboardPodium({
  podium,
  period,
}: {
  podium: LeaderboardEntry[];
  period: LeaderboardPeriod;
}) {
  if (podium.length < 3) return null;

  return (
    <section aria-labelledby="podium-heading" className="relative">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="h-px w-8 bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
              {PERIOD_LABEL_SHORT[period]} leaders
            </span>
          </div>
          <h2
            id="podium-heading"
            className="text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl"
          >
            Champions<span className="text-blue-600 dark:text-blue-400">.</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Ranked on reputation points, so a Critical counts the same whichever
          program it was found in.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-2 pb-0 pt-5 sm:p-4 sm:pb-0 sm:pt-6 shadow-sm">
        <FloatingConfetti />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-3 hidden select-none text-center text-[5.5rem] font-black leading-none tracking-[-0.06em] text-foreground/4 sm:block"
        >
          DevSolve
        </span>

        <div className="relative flex items-end justify-center w-full max-w-6xl mx-auto gap-0 pt-2">
          {COLUMNS.map((place) => (
            <PodiumColumn
              key={podium[place].id}
              entry={podium[place]}
              place={place}
              period={period}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
