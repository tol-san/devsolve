"use client";

import Image from "next/image";
import { Building2, Code2, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type KnowledgeConvergenceProps = {
  className?: string;
};

const VIEWBOX_WIDTH = 720;
const VIEWBOX_HEIGHT = 520;
const HUB = { x: 370, y: 255 };

const NODES = [
  {
    id: "organizations",
    label: "Organizations",
    icon: Building2,
    x: 370,
    y: 72,
  },
  {
    id: "hackers",
    label: "Ethical Hackers",
    icon: ShieldCheck,
    x: 150,
    y: 300,
  },
  {
    id: "developers",
    label: "Developers",
    icon: Code2,
    x: 590,
    y: 300,
  },
] as const;

function getPath(node: (typeof NODES)[number]) {
  const curveStrength = node.id === "organizations" ? 86 : 108;

  if (node.id === "organizations") {
    return `M ${node.x} ${node.y + 28} C ${node.x} ${node.y + curveStrength}, ${HUB.x} ${HUB.y - curveStrength}, ${HUB.x} ${HUB.y - 38}`;
  }

  if (node.id === "hackers") {
    return `M ${node.x + 32} ${node.y} C ${node.x + curveStrength} ${node.y - 10}, ${HUB.x - curveStrength} ${HUB.y + 12}, ${HUB.x - 44} ${HUB.y + 12}`;
  }

  return `M ${node.x - 32} ${node.y} C ${node.x - curveStrength} ${node.y - 10}, ${HUB.x + curveStrength} ${HUB.y + 12}, ${HUB.x + 44} ${HUB.y + 12}`;
}

export default function KnowledgeConvergence({
  className,
}: KnowledgeConvergenceProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[720px] overflow-hidden rounded-[38px] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.96))] p-4 shadow-[0_18px_44px_rgba(37,99,235,0.10)] backdrop-blur-sm dark:border-blue-400/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.96))]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_22%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_22%)]" />
      <div className="pointer-events-none absolute right-6 top-8 hidden h-28 w-28 bg-[radial-gradient(circle,rgba(37,99,235,0.22)_1.5px,transparent_1.5px)] bg-[length:14px_14px] opacity-50 lg:block" />

      <div className="relative min-h-[520px]">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="pointer-events-none absolute inset-0 size-full"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="devsolve-knowledge-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(148,163,184,0.14)" />
              <stop offset="40%" stopColor="rgba(96,165,250,0.55)" />
              <stop offset="100%" stopColor="rgba(37,99,235,0.92)" />
            </linearGradient>
            <filter id="devsolve-knowledge-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={HUB.x}
            cy={HUB.y}
            r="132"
            fill="none"
            stroke="rgba(59,130,246,0.30)"
            strokeDasharray="4 8"
            strokeWidth="1.5"
          />

          {NODES.map((node, index) => {
            const path = getPath(node);

            return (
              <g key={node.id}>
                <path
                  d={path}
                  fill="none"
                  stroke="url(#devsolve-knowledge-line)"
                  strokeWidth="2"
                  strokeOpacity="0.9"
                  filter="url(#devsolve-knowledge-glow)"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(59,130,246,0.28)"
                  strokeWidth="1.5"
                  strokeDasharray="6 12"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="32"
                    to="0"
                    dur={`${1.7 + index * 0.2}s`}
                    repeatCount="indefinite"
                  />
                </path>
                <circle r="4" fill="#2563eb" filter="url(#devsolve-knowledge-glow)">
                  <animateMotion
                    path={path}
                    dur={`${2 + index * 0.24}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                </circle>
                <circle r="2.2" fill="#93c5fd">
                  <animateMotion
                    path={path}
                    dur={`${1.6 + index * 0.18}s`}
                    begin={`${index * 0.16}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {NODES.map((node) => {
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              className={cn(
                "absolute z-10 flex flex-col items-center gap-2",
                node.id === "organizations" && "left-1/2 top-5 -translate-x-1/2",
                node.id === "hackers" && "left-8 top-[240px]",
                node.id === "developers" && "right-8 top-[240px]"
              )}
            >
              <div className="flex size-22 items-center justify-center rounded-full border border-blue-100 bg-white/96 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-blue-400/10 dark:bg-slate-900/94">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <Icon className="size-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              <p className="text-center text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                {node.label}
              </p>
            </div>
          );
        })}

        <div className="absolute inset-x-0 top-[144px] flex justify-center">
          <div className="relative flex h-[360px] w-[360px] items-end justify-center">
            <div className="relative z-10 mb-10 flex h-[250px] w-[250px] items-center justify-center rounded-[42px] border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#dbeafe_100%)] shadow-[0_26px_60px_rgba(37,99,235,0.18)] dark:border-blue-400/15 dark:bg-[linear-gradient(180deg,#0f172a_0%,#142853_100%)]">
              <div className="absolute inset-5 rounded-[34px] border border-white/80 bg-[linear-gradient(180deg,#3b82f6_0%,#1d4ed8_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.30)] dark:border-white/10" />
              <Image
                src="/devsolve.png"
                alt="DevSolve logo"
                width={170}
                height={170}
                className="relative z-10 h-auto w-[170px] object-contain drop-shadow-[0_20px_30px_rgba(15,23,42,0.24)]"
                priority
              />
            </div>

            <div className="absolute bottom-0 h-[86px] w-[380px] rounded-[999px] border border-blue-100 bg-white/95 shadow-[0_24px_48px_rgba(37,99,235,0.12)] dark:border-blue-400/10 dark:bg-slate-900/95" />
            <div className="absolute bottom-4 h-[54px] w-[300px] rounded-[999px] border border-blue-50 bg-[linear-gradient(180deg,#ffffff_0%,#eaf2ff_100%)] dark:border-blue-400/10 dark:bg-[linear-gradient(180deg,#172033_0%,#0f172a_100%)]" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 flex justify-center">
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
  );
}
