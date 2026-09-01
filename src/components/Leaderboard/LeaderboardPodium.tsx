"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Crown, Medal } from "lucide-react";
import {
  LeaderboardEntry,
  LeaderboardPeriod,
} from "@/lib/types/leaderboard/types";
import ResearcherAvatar from "./ResearcherAvatar";
import RankMovement from "./RankMovement";
import {
  MEDALS,
  PERIOD_LABEL_SHORT,
  formatNumber,
  isUuid,
  profileHref,
} from "./leaderboard-ui";

/* Left-to-right reading order is the podium order: 2nd · 1st · 3rd. */
const COLUMNS = [1, 0, 2];

/* Pedestal heights, kept compact so the board stays above the fold. */
const RISER = ["h-36 sm:h-40", "h-28 sm:h-32", "h-24 sm:h-28"];
const AVATAR = [64, 54, 54];

/* The champion's pedestal lands last, so the eye finishes in the middle. */
const BUILD_DELAY = [0.34, 0.06, 0.2];

/** Points tick up once on mount — the only number worth counting. */
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
      {/* Final value reserves the width so the count never shifts the layout */}
      <span className="opacity-0">{formatNumber(target)}</span>
      <span aria-hidden className="absolute inset-0">
        {formatNumber(reduce ? target : value)}
      </span>
    </span>
  );
}

function PodiumColumn({
  entry,
  place,
}: {
  entry: LeaderboardEntry;
  place: number;
}) {
  const reduce = useReducedMotion();
  const medal = MEDALS[place];
  const tone = medal.podium;
  const isChampion = place === 0;
  const delay = BUILD_DELAY[place];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay * 0.5 }}
      className="group flex min-w-0 flex-col items-center justify-end"
    >
      <Link
        href={profileHref(entry.username)}
        aria-label={`Rank ${entry.rank}: ${entry.displayName}, ${formatNumber(
          entry.reputation,
        )} reputation points. Open profile.`}
        className="flex w-full min-w-0 flex-col items-center rounded-t-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        {/* Identity and avatar lift together on hover; the pedestal stays
            planted on the floor, the way a podium should read. */}
        <div className="flex w-full min-w-0 flex-col items-center transition-transform duration-200 ease-out group-hover:-translate-y-1">
          {/* ── Identity, sitting on top of the pedestal ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: delay + 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex w-full min-w-0 flex-col items-center px-1 text-center"
          >
            <p className="w-full truncate text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-400 sm:text-base">
              {entry.displayName}
            </p>
            {!isUuid(entry.username) && (
              <p className="hidden w-full truncate text-xs font-medium text-muted-foreground sm:block">
                @{entry.username}
              </p>
            )}
          </motion.div>


          {/* ── Avatar with medal ring and rank chip ── */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.82 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: delay + 0.24,
              type: "spring",
              stiffness: 320,
              damping: 20,
            }}
            className="relative mt-2.5"
          >
            {isChampion && (
              <motion.span
                aria-hidden
                animate={reduce ? undefined : { y: [0, -3, 0] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-2 left-1/2 -translate-x-1/2"
                style={{ color: medal.ring }}
              >
                <Crown
                  className="h-5 w-5"
                  fill="currentColor"
                  strokeWidth={1.2}
                />
              </motion.span>
            )}

            <motion.span
              whileHover={reduce ? undefined : { scale: 1.06 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-white p-1"
              // Ring takes the pedestal's rim colour, so each column reads as
              // one hue from crown to floor.
              style={{ boxShadow: `0 0 0 2px ${tone.edge}` }}
            >
              <span className="hidden sm:inline-block">
                <ResearcherAvatar
                  username={entry.username}
                  displayName={entry.displayName}
                  avatarUrl={entry.avatarUrl}
                  initials={entry.avatarInitials}
                  size={AVATAR[place]}
                />
              </span>
              <span className="sm:hidden">
                <ResearcherAvatar
                  username={entry.username}
                  displayName={entry.displayName}
                  avatarUrl={entry.avatarUrl}
                  initials={entry.avatarInitials}
                  size={place === 0 ? 48 : 40}
                />
              </span>
            </motion.span>

            <span
              className="absolute -bottom-1 left-1/2 flex h-6 -translate-x-1/2 items-center gap-0.5 rounded-full px-2 text-xs font-bold ring-2 ring-white"
              style={{ backgroundColor: medal.soft, color: medal.ink }}
            >
              {isChampion ? (
                <Crown className="h-3 w-3" aria-hidden />
              ) : (
                <Medal className="h-3 w-3" aria-hidden />
              )}
              {entry.rank}
            </span>
          </motion.div>
        </div>

        {/* ── Pedestal ── */}
        <div className={`relative mt-4 w-full ${RISER[place]}`}>
          {/* The riser scales up from the floor; content stays undistorted */}
          <motion.span
            aria-hidden
            initial={{ scaleY: reduce ? 1 : 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay, type: "spring", stiffness: 130, damping: 18 }}
            className="absolute inset-0 overflow-hidden rounded-t-2xl"
            style={{
              transformOrigin: "bottom",
              backgroundColor: tone.block,
              // Rim in the hue plus a light top edge, so the block reads as a
              // solid riser rather than a flat swatch.
              boxShadow: `inset 0 0 0 1px ${tone.edge}, inset 0 1px 0 0 rgba(255,255,255,0.55)`,
            }}
          >
            {/* One slow sheen across the champion's block */}
            {isChampion && !reduce && (
              <motion.span
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.7),transparent)]"
                animate={{ x: ["0%", "420%"] }}
                transition={{
                  duration: 1.8,
                  delay: delay + 0.7,
                  repeat: Infinity,
                  repeatDelay: 6,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: delay + 0.3, ease: "easeOut" }}
            className="relative flex h-full flex-col items-center justify-center px-1.5 text-center"
          >
            <span
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: tone.heading }}
            >
              {medal.label}
            </span>

            <p className="mt-1 flex items-baseline justify-center gap-1">
              <span
                className={`font-bold leading-none tracking-tighter ${
                  isChampion ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
                style={{ color: tone.figure }}
              >
                <CountUp target={entry.reputation} />
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: tone.muted }}
              >
                pts
              </span>
            </p>

            {/* Sat on a near-white pill: the movement inks are tuned for white,
                and a saturated pedestal would drop them below 4.5:1. */}
            <RankMovement
              rank={entry.rank}
              previousRank={entry.previousRank}
              className="mt-1.5 rounded-md bg-white/90 px-1.5 py-0.5"
            />

            {/* Supporting counts — aggregates only, never report detail.
                Narrow columns drop to single-letter labels rather than
                shrinking the type below 12px. */}
            <p
              className="mt-2 flex items-center gap-1 text-xs font-medium sm:gap-2.5"
              style={{ color: tone.muted }}
            >
              {[
                ...(entry.validReports != null
                  ? [{ short: "v", label: "valid", value: entry.validReports }]
                  : []),
                { short: "c", label: "critical", value: entry.criticalReports },
                { short: "t", label: "thanks", value: entry.recognitionCount },
              ].map((stat, i) => (
                <span
                  key={stat.label}
                  className="flex items-center gap-1 sm:gap-2.5"
                >
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="hidden text-muted-foreground/70 sm:inline"
                    >
                      ·
                    </span>
                  )}
                  <span className="whitespace-nowrap">
                    <span
                      className="font-bold tabular-nums"
                      style={{ color: tone.figure }}
                    >
                      {formatNumber(stat.value)}
                    </span>
                    <span className="hidden sm:inline"> {stat.label}</span>
                    <span aria-hidden className="sm:hidden">
                      {stat.short}
                    </span>
                    <span className="sr-only sm:hidden">{stat.label}</span>
                  </span>
                </span>
              ))}
            </p>
          </motion.div>
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

      <div className="relative overflow-hidden rounded-2xl bg-card px-3 pb-1.5 pt-10 ring-1 ring-foreground/5 dark:ring-foreground/10 sm:px-8 sm:pb-2 sm:pt-12">
        {/* Watermark, echoing the reference board's oversized title */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-3 hidden select-none text-center text-[5.5rem] font-bold leading-none tracking-[-0.06em] text-foreground/4 sm:block"
        >
          DevSolve
        </span>

        {/* Floor the pedestals stand on */}
        <div className="relative grid grid-cols-3 items-end gap-2 border-b-2 border-border sm:gap-4">
          {COLUMNS.map((place) => (
            <PodiumColumn
              key={podium[place].id}
              entry={podium[place]}
              place={place}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
