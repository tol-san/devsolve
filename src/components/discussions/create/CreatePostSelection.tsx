"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Bug, Rocket, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AuthGatedLink } from "@/components/auth/AuthGatedLink";
import {
  ACCENT,
  PRIMARY,
  SECONDARY,
} from "@/components/landing/SectionBackdrop";
import { cn } from "@/lib/utils";

const SHIP_RED = "#ff5b4f";
const PANEL_STROKE = "#E2E8F0";
const ROW = "#F1F5F9";

function ProblemArt({ reduce }: { reduce: boolean | null }) {
  return (
    <svg
      viewBox="0 0 260 150"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="14"
        y="30"
        width="132"
        height="100"
        rx="10"
        fill="#fff"
        stroke={PANEL_STROKE}
      />
      <rect x="28" y="46" width="50" height="7" rx="3.5" fill="#CBD5E1" />

      <rect x="28" y="66" width="104" height="6" rx="3" fill={ROW} />
      <rect
        x="28"
        y="82"
        width="86"
        height="6"
        rx="3"
        fill={PRIMARY}
        fillOpacity="0.25"
      />
      <rect x="22" y="80" width="3" height="10" rx="1.5" fill={PRIMARY} />
      <rect x="28" y="98" width="96" height="6" rx="3" fill={ROW} />
      <rect x="28" y="114" width="62" height="6" rx="3" fill={ROW} />

      <g>
        <rect
          x="92"
          y="16"
          width="76"
          height="25"
          rx="7"
          fill={SHIP_RED}
          opacity="0.14"
          transform="translate(0 4)"
        />
        <rect x="92" y="16" width="76" height="25" rx="7" fill={SHIP_RED} />
        <text
          x="130"
          y="33"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.5"
          fill="#fff"
        >
          SEV 9.8
        </text>
      </g>

      <path
        d="M 146 88 H 158 L 168 98 H 178"
        stroke={PRIMARY}
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        [158, 88],
        [168, 98],
      ].map(([x, y]) => (
        <rect
          key={x}
          x={x - 2.4}
          y={y - 2.4}
          width="4.8"
          height="4.8"
          fill={PRIMARY}
          fillOpacity="0.7"
          transform={`rotate(45 ${x} ${y})`}
        />
      ))}

      <g transform="translate(206 92)">
        {!reduce && (
          <motion.circle
            r="14"
            fill="none"
            stroke={PRIMARY}
            strokeWidth="2"
            initial={{ scale: 0.5, opacity: 0.6 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {[34, 23].map((r, i) => (
          <circle
            key={r}
            r={r}
            fill="none"
            stroke={PRIMARY}
            strokeOpacity={0.2 + i * 0.15}
            strokeWidth="1.5"
          />
        ))}

        {[
          [0, -40, 0, -30],
          [0, 30, 0, 40],
          [-40, 0, -30, 0],
          [30, 0, 40, 0],
        ].map(([x1, y1, x2, y2]) => (
          <line
            key={`${x1}${y1}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={PRIMARY}
            strokeOpacity="0.5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        <motion.g
          animate={reduce ? undefined : { rotate: [-6, 6, -6] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {[-1, 1].map((side) =>
            [-6, 0, 6].map((dy) => (
              <line
                key={`${side}-${dy}`}
                x1={side * 6}
                y1={dy}
                x2={side * 14}
                y2={dy + (dy === 0 ? 0 : dy > 0 ? 5 : -5)}
                stroke={SECONDARY}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )),
          )}
          {[-1, 1].map((side) => (
            <line
              key={`ant-${side}`}
              x1={side * 3}
              y1={-9}
              x2={side * 8}
              y2={-16}
              stroke={SECONDARY}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ))}
          <ellipse rx="8" ry="11" fill={SECONDARY} />
          <ellipse cy="-8" rx="5" ry="4.5" fill={SECONDARY} />
          <line
            x1="0"
            y1="-3"
            x2="0"
            y2="9"
            stroke="#fff"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
        </motion.g>
      </g>
    </svg>
  );
}

function ShowcaseArt({ reduce }: { reduce: boolean | null }) {
  const bars = [22, 34, 30, 48, 62];

  return (
    <svg
      viewBox="0 0 260 150"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="42"
        y="46"
        width="132"
        height="86"
        rx="10"
        fill="#fff"
        stroke={PANEL_STROKE}
        opacity="0.55"
      />
      <rect
        x="33"
        y="39"
        width="132"
        height="86"
        rx="10"
        fill="#fff"
        stroke={PANEL_STROKE}
        opacity="0.8"
      />

      <rect
        x="24"
        y="32"
        width="132"
        height="86"
        rx="10"
        fill="#fff"
        stroke={PANEL_STROKE}
      />
      <rect x="38" y="46" width="44" height="7" rx="3.5" fill="#CBD5E1" />
      <rect x="88" y="46" width="24" height="7" rx="3.5" fill={ROW} />

      <g transform="translate(38 104)">
        {bars.map((h, i) => (
          <motion.rect
            key={i}
            x={i * 20}
            width="12"
            rx="3"
            fill={ACCENT}
            fillOpacity={0.35 + i * 0.14}
            initial={reduce ? false : { height: 0, y: 0 }}
            animate={{ height: h, y: -h }}
            transition={{
              duration: 0.6,
              delay: 0.3 + i * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
        <line
          x1="-4"
          y1="4"
          x2="96"
          y2="4"
          stroke={PANEL_STROKE}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      <g>
        <rect
          x="104"
          y="16"
          width="86"
          height="25"
          rx="7"
          fill={ACCENT}
          opacity="0.14"
          transform="translate(0 4)"
        />
        <rect x="104" y="16" width="86" height="25" rx="7" fill={ACCENT} />
        <text
          x="147"
          y="33"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.5"
          fill="#fff"
        >
          PUBLISHED
        </text>
      </g>

      <motion.path
        d="M 168 118 C 196 112 214 92 224 58"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="5 7"
        initial={{ opacity: 0 }}
        animate={
          reduce
            ? { opacity: 0.65 }
            : { opacity: 0.65, strokeDashoffset: [0, -24] }
        }
        transition={{
          opacity: { duration: 0.5, delay: 0.5 },
          strokeDashoffset: { duration: 1.4, repeat: Infinity, ease: "linear" },
        }}
      />

      <motion.g
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="226" cy="48" r="10" fill={ACCENT} />
        <path
          d="M 226 42.5 L 227.6 46.4 L 231.5 46.4 L 228.4 49 L 229.6 53 L 226 50.6 L 222.4 53 L 223.6 49 L 220.5 46.4 L 224.4 46.4 Z"
          fill="#fff"
        />
      </motion.g>

      {!reduce &&
        [
          { cx: 196, cy: 106, d: 0 },
          { cx: 212, cy: 88, d: 0.6 },
          { cx: 221, cy: 68, d: 1.2 },
        ].map((spark) => (
          <motion.circle
            key={spark.cx}
            cx={spark.cx}
            cy={spark.cy}
            r="2.5"
            fill={ACCENT}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.4, 1.2, 0.4] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: spark.d,
              ease: "easeInOut",
            }}
          />
        ))}
    </svg>
  );
}

type Format = {
  slug: string;
  n: string;
  title: string;
  body: string;
  brings: string[];
  promptTitle: string;
  icon: LucideIcon;
  accent: string;
  Art: (props: { reduce: boolean | null }) => React.ReactElement;
};

const FORMATS: Format[] = [
  {
    slug: "problem",
    n: "01",
    title: "Problem & Bug",
    body: "Report a security flaw, system bug, or technical blocker and let the community work it with you.",
    brings: ["Steps to reproduce", "Impact", "Stack details"],
    promptTitle: "Sign in to post a problem",
    icon: Bug,
    accent: PRIMARY,
    Art: ProblemArt,
  },
  {
    slug: "showcase",
    n: "02",
    title: "Showcase Project",
    body: "Share a project, an architecture write-up, or a guide worth reading twice.",
    brings: ["Write-up", "Diagrams", "Repo link"],
    promptTitle: "Sign in to post a showcase",
    icon: Rocket,
    accent: ACCENT,
    Art: ShowcaseArt,
  },
];

interface CreatePostSelectionProps {
  basePath?: string;
  backHref?: string;
  backLabel?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function CreatePostSelection({
  basePath = "/community/create",
  backHref = "/community",
  backLabel = "Back",
  title = "What are you sharing",
  description = "Pick a format to start with. Nothing is published until you say so.",
  className,
}: CreatePostSelectionProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "relative flex min-h-dvh w-full overflow-hidden",
        className,
      )}
    >
      <Link
        href={backHref}
        aria-label={backLabel}
        className="absolute right-5 top-5 z-20 inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-400 backdrop-blur transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:text-neutral-100"
      >
        <X className="size-4.5" />
      </Link>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="mb-4 flex items-center gap-2.5">
            <span className="h-px w-8" style={{ backgroundColor: PRIMARY }} />
            <span
              className="text-xs font-bold uppercase tracking-[0.22em]"
              style={{ color: PRIMARY }}
            >
              New post
            </span>
          </div>

          <h1
            className="font-bold leading-[1.05] tracking-[-0.035em] text-slate-900 dark:text-neutral-100"
            style={{ fontSize: "clamp(30px, 3.6vw, 48px)" }}
          >
            {title}
            <span style={{ color: PRIMARY }}>?</span>
          </h1>

          <p className="mt-3 max-w-xl text-base leading-[1.6] text-slate-500 dark:text-neutral-400">
            {description}
          </p>
        </motion.header>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2">
          {FORMATS.map((format, i) => {
            const Icon = format.icon;
            const Art = format.Art;

            return (
              <motion.div
                key={format.slug}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={reduce ? undefined : { y: -4 }}
                whileTap={{ scale: 0.99 }}
              >
                <AuthGatedLink
                  href={`${basePath}/${format.slug}`}
                  promptTitle={format.promptTitle}
                  style={
                    { "--format-accent": format.accent } as React.CSSProperties
                  }
                  className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-[border-color,box-shadow] duration-200 hover:border-(--format-accent)/45 hover:shadow-[0_18px_38px_-22px_var(--format-accent)] dark:border-neutral-800 dark:bg-neutral-900 sm:p-6"
                >
                  <div className="relative overflow-hidden rounded-xl border border-slate-200/70 bg-[#F8FAFC] dark:border-neutral-800 dark:bg-neutral-950/40">
                    <div className="aspect-26/15 w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                      <Art reduce={reduce} />
                    </div>

                    <span className="absolute right-3 top-3 font-mono text-sm font-bold tabular-nums text-slate-300 dark:text-neutral-700">
                      {format.n}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 dark:border-neutral-800"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${format.accent} 9%, transparent)`,
                        color: format.accent,
                      }}
                    >
                      <Icon className="size-4.5" />
                    </span>

                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
                      {format.title}
                      <span style={{ color: format.accent }}>.</span>
                    </h2>
                  </div>

                  <p className="mt-2.5 text-sm leading-[1.7] text-slate-500 dark:text-neutral-400">
                    {format.body}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {format.brings.map((item) => (
                      <li
                        key={item}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-neutral-800 dark:text-neutral-400"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-slate-400 transition-colors duration-200 group-hover:text-(--format-accent)">
                    Start writing
                    <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </AuthGatedLink>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-neutral-800">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Saved as a draft until published
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xs font-medium tracking-[0.2em] text-slate-300 dark:text-neutral-700">
              01 — {String(FORMATS.length).padStart(2, "0")}
            </span>
            <span
              className="size-1.5 animate-pulse rounded-full"
              style={{ backgroundColor: SECONDARY }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
