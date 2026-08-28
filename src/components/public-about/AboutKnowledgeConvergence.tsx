"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  BadgeCheck,
  Building2,
  Code2,
  FileText,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

type ConvergenceNode = {
  id: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
};

const VIEWBOX_WIDTH = 720;
const VIEWBOX_HEIGHT = 520;
const TARGET = { x: 510, y: 260 };
const NODE_SIZE = { width: 180, height: 68 };

const NODES: ConvergenceNode[] = [
  {
    id: "orgs",
    label: "Organizations",
    detail: "Programs & trust",
    icon: Building2,
    x: 88,
    y: 92,
  },
  {
    id: "hackers",
    label: "Ethical Hackers",
    detail: "Find & report",
    icon: ShieldCheck,
    x: 56,
    y: 184,
  },
  {
    id: "community",
    label: "Community",
    detail: "Learn together",
    icon: UsersRound,
    x: 104,
    y: 274,
  },
  {
    id: "reports",
    label: "Research Docs",
    detail: "Evidence & scope",
    icon: FileText,
    x: 64,
    y: 364,
  },
  {
    id: "builders",
    label: "Developers",
    detail: "Build & ship",
    icon: Code2,
    x: 120,
    y: 450,
  },
] as const;

function pathForNode(node: ConvergenceNode) {
  const startX = node.x + NODE_SIZE.width;
  const startY = node.y + NODE_SIZE.height / 2;
  const curveX1 = startX + 110;
  const curveY1 = startY;
  const curveX2 = TARGET.x - 130;
  const curveY2 = TARGET.y;

  return `M ${startX} ${startY} C ${curveX1} ${curveY1}, ${curveX2} ${curveY2}, ${TARGET.x} ${TARGET.y}`;
}

export function AboutKnowledgeConvergence() {
  return (
    <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-[36px] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.94))] p-4 shadow-[0_18px_44px_rgba(37,99,235,0.10)] backdrop-blur-sm dark:border-blue-400/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.96))]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_22%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-y-4 left-[53%] w-px bg-[linear-gradient(180deg,transparent,rgba(59,130,246,0.24),transparent)]" />

      <div className="relative min-h-[520px]">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="pointer-events-none absolute inset-0 size-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="devsolve-convergence-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(148,163,184,0.18)" />
              <stop offset="45%" stopColor="rgba(59,130,246,0.55)" />
              <stop offset="100%" stopColor="rgba(29,78,216,0.92)" />
            </linearGradient>
            <filter id="devsolve-convergence-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {NODES.map((node, index) => {
            const path = pathForNode(node);

            return (
              <g key={node.id}>
                <path
                  d={path}
                  fill="none"
                  stroke="url(#devsolve-convergence-line)"
                  strokeWidth="2"
                  strokeOpacity="0.95"
                  filter="url(#devsolve-convergence-glow)"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(59,130,246,0.32)"
                  strokeWidth="1.5"
                  strokeDasharray="8 12"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="40"
                    to="0"
                    dur={`${2 + index * 0.25}s`}
                    repeatCount="indefinite"
                  />
                </path>
                <circle r="4" fill="#2563eb" filter="url(#devsolve-convergence-glow)">
                  <animateMotion
                    path={path}
                    dur={`${2.2 + index * 0.22}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                </circle>
                <circle r="2.2" fill="#93c5fd">
                  <animateMotion
                    path={path}
                    dur={`${1.8 + index * 0.18}s`}
                    begin={`${index * 0.18}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        <div className="absolute left-0 top-0 flex w-[240px] flex-col gap-4">
          {NODES.map((node, index) => {
            const Icon = node.icon;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.06 * index }}
                className="relative flex items-center gap-3 rounded-[24px] border border-slate-200/90 bg-white/92 px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/90"
                style={{ marginTop: index === 0 ? 8 : 0 }}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                  <Icon className="size-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {node.label}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {node.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="absolute right-0 top-1/2 w-[360px] -translate-y-1/2">
          <div className="pointer-events-none absolute inset-x-0 top-4 mx-auto h-[320px] w-[320px] rounded-full border border-blue-100/80 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.14),rgba(255,255,255,0)_68%)] dark:border-blue-400/10 dark:bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),rgba(2,6,23,0)_66%)]" />

          <div className="relative flex h-[360px] items-end justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.34, ease: "easeOut" }}
              className="relative z-10 mb-10 flex h-[236px] w-[236px] items-center justify-center rounded-[44px] border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#dbeafe_100%)] shadow-[0_28px_60px_rgba(37,99,235,0.18)] dark:border-blue-400/15 dark:bg-[linear-gradient(180deg,#0f172a_0%,#142853_100%)]"
            >
              <div className="absolute inset-5 rounded-[36px] border border-white/80 bg-[linear-gradient(180deg,#3b82f6_0%,#1d4ed8_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.30)] dark:border-white/10" />
              <div className="relative z-10 flex flex-col items-center">
                <Image
                  src="/devsolve.png"
                  alt="DevSolve logo"
                  width={150}
                  height={150}
                  className="h-auto w-[150px] object-contain drop-shadow-[0_20px_30px_rgba(15,23,42,0.24)]"
                  priority
                />
                <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                  <BadgeCheck className="size-3.5" />
                  Trusted hub
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-0 h-[82px] w-[330px] rounded-[999px] border border-blue-100 bg-white/95 shadow-[0_24px_48px_rgba(37,99,235,0.12)] dark:border-blue-400/10 dark:bg-slate-900/95" />
            <div className="absolute bottom-4 h-[52px] w-[258px] rounded-[999px] border border-blue-50 bg-[linear-gradient(180deg,#ffffff_0%,#eaf2ff_100%)] dark:border-blue-400/10 dark:bg-[linear-gradient(180deg,#172033_0%,#0f172a_100%)]" />
          </div>

          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            <div className="rounded-full border border-blue-100 bg-white/92 px-5 py-2.5 text-sm font-semibold tracking-[0.08em] text-blue-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:border-blue-400/15 dark:bg-slate-900/92 dark:text-blue-200">
              Collaborate
              <span className="mx-3 text-slate-300 dark:text-slate-600">&bull;</span>
              Secure
              <span className="mx-3 text-slate-300 dark:text-slate-600">&bull;</span>
              Innovate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
