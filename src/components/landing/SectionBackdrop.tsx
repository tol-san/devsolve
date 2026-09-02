"use client";

import React, { useId, useMemo, useRef, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

/* ─── Brand palette (design.md) ────────────────────────────────────── */
export const PRIMARY = "#2563EB";
export const SECONDARY = "#1E293B";
export const ACCENT = "#10B981";

/** Near-white counterpart to SECONDARY, for headings on a dark surface.
    neutral-50, matching the `--foreground` the rest of the app resolves to
    in dark — the dark surfaces here are the neutral scale, not the slate
    one, so the ink on them is neutral too. */
export const INK_DARK = "#FAFAFA";

/* ─── Dark surfaces ──────────────────────────────────────────────────────
   The dark theme runs on the neutral scale, the same one `--background`,
   `--card` and `--muted` resolve to elsewhere in the app (the programs
   browser is the reference). Cool slate greys are a light-mode concern
   only; on a near-black field they read as a blue cast.

     page   neutral-950  #0A0A0A   = --background   oklch(0.145 0 0)
     card   neutral-900  #171717   = --card         oklch(0.205 0 0)
     muted  neutral-800  #262626   = --muted        oklch(0.269 0 0)
     hair   white / 10%            = --border       oklch(1 0 0 / 10%)
     ink    neutral-50   #FAFAFA   = --foreground   oklch(0.985 0 0)   */
export const SURFACE_DARK = "#0A0A0A";

/* ─── Theme-dependent values ─────────────────────────────────────────────
   These sections paint through inline `style` and SVG presentation
   attributes, which no `dark:` variant can reach. Resolving them in JS is
   what used to break hydration: next-themes' blocking script sets the class
   before React runs, so the client's *first* render already knows the theme
   while the server render never did — the two disagreed on every one of
   these values.

   So they are custom properties instead (defined in globals.css). The
   rendered string is identical on both sides, the browser resolves it, and
   there is no post-mount repaint either.
   ──────────────────────────────────────────────────────────────────── */

/** Heading ink for the current theme. */
export function useInk() {
  return "var(--ds-ink)";
}

/** Page surface — for rings that punch a mark out of the background. */
export const SURFACE = "var(--ds-surface)";

/* A store that reports `false` to the server and `true` to the client, which
   is how you ask React "has this hydrated yet?" without a setState in an
   effect. The subscribe callback is module-level so it stays referentially
   stable and never resubscribes. */
const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

/* Phones pay for this backdrop differently to laptops: it is `fixed inset-0`
   behind every route, so its cost is paid on every page, and a mid-range
   handset is compositing it on a fraction of the GPU. Below this width the
   layer keeps its character on a smaller budget. */
const COMPACT_QUERY = "(max-width: 640px)";

function subscribeToCompact(onStoreChange: () => void) {
  const list = window.matchMedia(COMPACT_QUERY);
  list.addEventListener("change", onStoreChange);
  return () => list.removeEventListener("change", onStoreChange);
}

function getCompact() {
  return window.matchMedia(COMPACT_QUERY).matches;
}

/**
 * Whether this is a small viewport.
 *
 * `onServer` is the server snapshot, so the hydrating render matches the HTML
 * and React swaps in the real value immediately afterwards — the same trick
 * `useIsDark` uses, and the reason this cannot be a bare `matchMedia` read.
 */
function useCompactViewport() {
  return useSyncExternalStore(subscribeToCompact, getCompact, onServer);
}

/**
 * Whether the dark theme is active.
 *
 * Only for values that genuinely cannot be a custom property — GSAP tweens
 * colours numerically and cannot interpolate a `var()`. Gated on hydration
 * so the server render and the first client render agree; callers get
 * `false` for one frame, then the real value.
 */
export function useIsDark() {
  const { resolvedTheme } = useTheme();
  const hydrated = useSyncExternalStore(neverChanges, onClient, onServer);
  return hydrated && resolvedTheme === "dark";
}

/* Deterministic PRNG so server and client render identical positions. */
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
  /**
   * Surface the backdrop sits on — drives grid and particle contrast.
   * Left off, it follows the active theme. Pass it only to pin a section
   * that is dark in both themes (the CTA banner).
   */
  tone?: Tone;
  /** Seeds the deterministic particle and cell layout. Vary per section. */
  seed?: number;
  /** Rising motes. */
  particles?: boolean;
  /** Sweeping scan beams. */
  beams?: boolean;
  /** Drifting colour fields. */
  aurora?: boolean;
  /** Grid cells that light up and fade. */
  cells?: boolean;
  gridSize?: number;
  className?: string;
};

const CELL_COUNT = 10;
const PARTICLE_COUNT = 14;

/* Static now that the colours are tokens — GPU-accelerated through CSS keyframes. */
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

/**
 * The animated layer shared by every landing section — grid paper, drifting
 * aurora, pulsing cells, scan beams and rising motes. GPU composited for
 * high performance and 60fps rendering without main-thread blocking.
 */
export function SectionBackdrop({
  tone,
  seed = 1,
  particles = true,
  beams = false,
  aurora = true,
  cells = true,
  gridSize = 88,
  className = "",
}: SectionBackdropProps) {
  const reduce = useReducedMotion();
  const compact = useCompactViewport();
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "200px 0px" });

  /* Counts, not just sizes: each cell and mote is its own compositor layer
     running an independent keyframe loop, so halving them halves the work
     regardless of how small the viewport has made each one. */
  const cellSpecs = useMemo(() => {
    const rand = mulberry32(seed * 977 + 7);
    return Array.from({ length: compact ? 4 : CELL_COUNT }, () => ({
      col: Math.floor(rand() * 22),
      row: Math.floor(rand() * 11),
      color: rand() > 0.5 ? "var(--ds-cell-primary)" : "var(--ds-cell-accent)",
      delay: rand() * 9,
      duration: 3.5 + rand() * 3,
    }));
  }, [seed, compact]);

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
      /* `tone` pins this layer to one palette regardless of theme. A class,
         not a JS branch, so it costs nothing at hydration. */
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        tone ? `ds-tone-${tone}` : ""
      } ${className}`}
      aria-hidden
    >
      {/* Drifting colour fields — pure CSS keyframes on the compositor thread */}
      {aurora &&
        BLOBS.map((blob, i) => (
          <div
            key={i}
            /* A Gaussian blur costs roughly its radius against the area it
               covers, and these are the largest moving things on the page —
               110px over a drifting blob is the single most expensive item in
               this layer on a phone. The narrower radius is proportionate on a
               narrow viewport, so it reads the same. */
            className={`absolute rounded-full blur-[48px] sm:blur-[110px] ${blob.className} ${blob.animClass}`}
            style={{ backgroundColor: blob.color }}
          />
        ))}

      {/* Grid paper + cells that light up */}
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
              /* Peaks at 1 because the tint level is carried by the token's
                 alpha; the theme cannot reach a numeric keyframe. */
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

      {/* Scan beams — GPU composited transform keyframes, avoiding layout reflows */}
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

      {/* Rising motes */}
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
              /* As with the cells: brightness is the token's alpha. */
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
