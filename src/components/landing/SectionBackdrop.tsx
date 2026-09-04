"use client";

import React, { useId, useMemo, useRef, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

export const PRIMARY = "#2563EB";
export const SECONDARY = "#1E293B";
export const ACCENT = "#10B981";

export const INK_DARK = "#FAFAFA";

export const SURFACE_DARK = "#0A0A0A";

export function useInk() {
  return "var(--ds-ink)";
}

export const SURFACE = "var(--ds-surface)";

const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

const COMPACT_QUERY = "(max-width: 640px)";

function subscribeToCompact(onStoreChange: () => void) {
  const list = window.matchMedia(COMPACT_QUERY);
  list.addEventListener("change", onStoreChange);
  return () => list.removeEventListener("change", onStoreChange);
}

function getCompact() {
  return window.matchMedia(COMPACT_QUERY).matches;
}

function useCompactViewport() {
  return useSyncExternalStore(subscribeToCompact, getCompact, onServer);
}

export function useIsDark() {
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(neverChanges, onClient, onServer);
  return hydrated && resolvedTheme === "dark";
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Tone = "light" | "dark";

export type SectionBackdropProps = {
  tone?: Tone;
  seed?: number;
  particles?: boolean;
  beams?: boolean;
  aurora?: boolean;
  cells?: boolean;
  gridSize?: number;
  className?: string;
};

const CELL_COUNT = 10;
const PARTICLE_COUNT = 14;

const BLOBS = [
  {
    color: "var(--ds-blob-a)",
    className: "left-[-14%] top-[4%] h-[30rem] w-[30rem]",
    animClass: "animate-ds-aurora-a",
  },
  {
    color: "var(--ds-blob-b)",
    className: "right-[-10%] top-[30%] h-[26rem] w-[26rem]",
    animClass: "animate-ds-aurora-b",
  },
  {
    color: "var(--ds-blob-c)",
    className: "bottom-[-12%] left-1/3 h-[22rem] w-[34rem]",
    animClass: "animate-ds-aurora-c",
  },
];

export function SectionBackdrop({
  tone,
  seed = 1,
  particles = true,
  beams = false,
  aurora = true,
  cells = false,
  gridSize = 88,
  className = "",
}: SectionBackdropProps) {
  const reduce = useReducedMotion();
  const compact = useCompactViewport();
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "200px 0px" });

  const cellSpecs = useMemo(() => {
    if (!cells) return [];
    const rand = mulberry32(seed * 977 + 7);
    return Array.from({ length: compact ? 4 : CELL_COUNT }, () => ({
      col: Math.floor(rand() * 22),
      row: Math.floor(rand() * 11),
      color: rand() > 0.5 ? "var(--ds-cell-primary)" : "var(--ds-cell-accent)",
      delay: rand() * 9,
      duration: 3.5 + rand() * 3,
    }));
  }, [seed, compact, cells]);

  const particleSpecs = useMemo(() => {
    const rand = mulberry32(seed * 5081 + 23);
    return Array.from({ length: compact ? 5 : PARTICLE_COUNT }, () => ({
      left: 4 + rand() * 92,
      size: 2 + rand() * 3,
      delay: rand() * 16,
      duration: 16 + rand() * 12,
      drift: (rand() - 0.5) * 70,
      color: rand() > 0.55 ? "var(--ds-mote-accent)" : "var(--ds-mote-primary)",
    }));
  }, [seed, compact]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        tone ? `ds-tone-${tone}` : ""
      } ${className}`}
      aria-hidden
    >
      {aurora &&
        BLOBS.map((blob, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-[48px] sm:blur-[110px] ${blob.className} ${blob.animClass}`}
            style={{ backgroundColor: blob.color }}
          />
        ))}

      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern
            id={`bg-grid-${uid}`}
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="var(--ds-grid)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#bg-grid-${uid})`} />

        {cells &&
          inView &&
          cellSpecs.map((cell, i) => (
            <motion.rect
              key={i}
              x={cell.col * gridSize + 1}
              y={cell.row * gridSize + 1}
              width={gridSize - 2}
              height={gridSize - 2}
              fill={cell.color}
              initial={{ opacity: 0 }}
              animate={reduce ? undefined : { opacity: [0, 1, 0] }}
              transition={{
                duration: cell.duration,
                repeat: Infinity,
                delay: cell.delay,
                ease: "easeInOut",
                repeatDelay: 4,
              }}
            />
          ))}
      </svg>

      {beams && (
        <>
          <div
            className="absolute inset-y-0 w-px animate-ds-beam-v"
            style={{
              background: `linear-gradient(to bottom, transparent, ${PRIMARY}, transparent)`,
            }}
          />
          <div
            className="absolute inset-x-0 h-px animate-ds-beam-h"
            style={{
              background: `linear-gradient(to right, transparent, ${ACCENT}, transparent)`,
            }}
          />
        </>
      )}

      {particles &&
        !reduce &&
        inView &&
        particleSpecs.map((p, i) => (
          <motion.span
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
            animate={{
              y: ["0%", "-1600%"],
              x: [0, p.drift, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
    </div>
  );
}

export default SectionBackdrop;
