"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Bug, Lightbulb, MessagesSquare, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ACCENT, PRIMARY } from "./SectionBackdrop";

/* ════════════════════════════════════════════════════════════════════
   PILLAR ORBIT

   The hero's headline claims four disciplines on one platform, so the
   artwork states the same thing rather than decorating around it: the mark
   at the centre, the four pillars anchored to it, and a pulse running each
   spoke to say the connection is live rather than diagrammatic.

   Colour carries the argument. The two pillars where work *arrives* — a
   bounty programme, a problem someone is stuck on — are the brand primary.
   The two where it *resolves* — a solution that worked, a showcase on your
   profile — are the accent. Read clockwise from the top left, the diagram is
   the platform's own arc from finding to proof.
   ════════════════════════════════════════════════════════════════════ */

type Pillar = {
  label: string;
  caption: string;
  href: string;
  icon: LucideIcon;
  /** Degrees, 0 = east, measured clockwise because y runs down. */
  angle: number;
  /** True for the arriving side of the platform, false for the resolving. */
  inbound: boolean;
};

const PILLARS: Pillar[] = [
  { label: "Bug Bounty", caption: "Scope & tiers, public", href: "/programs", icon: Bug, angle: -142, inbound: true },
  { label: "Problems", caption: "Asked in the open", href: "/problems", icon: MessagesSquare, angle: -38, inbound: true },
  { label: "Showcases", caption: "Proof on your profile", href: "/showcases", icon: Trophy, angle: 142, inbound: false },
  { label: "Solutions", caption: "Answers that shipped", href: "/community", icon: Lightbulb, angle: 38, inbound: false },
];

/* One square viewBox; the parent decides the rendered size. */
const BOX = 400;
const MID = BOX / 2;
/** Where the spokes stop — short of the chips, so lines never run under them. */
const SPOKE = 118;
const RINGS = [58, 96, 134, 170];

const rad = (deg: number) => (deg * Math.PI) / 180;
const point = (deg: number, r: number) => ({
  x: MID + r * Math.cos(rad(deg)),
  y: MID + r * Math.sin(rad(deg)),
});

export function PillarOrbit({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${BOX} ${BOX}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        {RINGS.map((r, i) => (
          <circle
            key={r}
            cx={MID}
            cy={MID}
            r={r}
            fill="none"
            stroke={PRIMARY}
            strokeOpacity={i === RINGS.length - 1 ? 0.22 : 0.12}
            strokeWidth="1"
            strokeDasharray={i === RINGS.length - 1 ? "3 7" : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {PILLARS.map((p) => {
          const end = point(p.angle, SPOKE);
          const stroke = p.inbound ? PRIMARY : ACCENT;
          return (
            <g key={p.label}>
              <line
                x1={MID}
                y1={MID}
                x2={end.x.toFixed(2)}
                y2={end.y.toFixed(2)}
                stroke={stroke}
                strokeOpacity="0.35"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* The pulse runs outward on the arriving spokes and inward on
                  the resolving ones, so the two halves read as a cycle. */}
              {!reduce && (
                <motion.circle
                  r="3"
                  fill={stroke}
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: p.inbound ? [MID, end.x] : [end.x, MID],
                    cy: p.inbound ? [MID, end.y] : [end.y, MID],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: p.inbound ? 0 : 1.3,
                    repeatDelay: 1.1,
                  }}
                />
              )}
            </g>
          );
        })}

        <circle cx={MID} cy={MID} r="3" fill={PRIMARY} />
      </svg>

      {PILLARS.map((p, i) => {
        const at = point(p.angle, SPOKE + 46);
        const tint = p.inbound ? PRIMARY : ACCENT;
        return (
          <motion.div
            key={p.label}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(at.x / BOX) * 100}%`, top: `${(at.y / BOX) * 100}%` }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.09, ease: "easeOut" }}
          >
            <Link
              href={p.href}
              className="group flex w-max items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2 shadow-[0_6px_20px_-12px_rgba(15,23,42,0.45)] transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-neutral-900 dark:shadow-none dark:hover:border-white/25"
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${tint}1f`, color: tint }}
              >
                <p.icon className="size-4" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight text-[#1E293B] dark:text-white">
                  {p.label}
                </span>
                <span className="hidden text-xs text-slate-500 sm:block dark:text-neutral-400">
                  {p.caption}
                </span>
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export default PillarOrbit;
