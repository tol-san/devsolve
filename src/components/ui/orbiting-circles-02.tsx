"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import ParticleSphereAnimation from "@/components/ui/orbiting-circles-02-utils/particalsphear";
import {
  SiNextdotjs,
  SiSpringboot,
  SiPostgresql,
  SiRedis,
  SiKeycloak,
  SiMinio,
  SiTraefikproxy,
  SiMeilisearch,
  SiVirustotal,
  SiDocker,
} from "react-icons/si";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrbitIconItem {
  name: string;
  alt: string;
  angle: number;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  src?: string;
  color?: string;
}

export interface OrbitConfig {
  size: string;
  duration: number;
  icons: OrbitIconItem[];
}

const DEFAULT_ORBITS: OrbitConfig[] = [
  {
    // Inner Ring: Core Backend Engine & Datastores (14s)
    size: "w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[480px] md:h-[480px]",
    duration: 14,
    icons: [
      {
        name: "Spring Boot",
        alt: "Spring Boot",
        angle: -60,
        icon: SiSpringboot,
        color: "#6DB33F",
      },
      {
        name: "PostgreSQL",
        alt: "PostgreSQL",
        angle: 0,
        icon: SiPostgresql,
        color: "#4169E1",
      },
      {
        name: "Redis",
        alt: "Redis",
        angle: 60,
        icon: SiRedis,
        color: "#DC382D",
      },
    ],
  },
  {
    // Middle Ring: Edge Gateway, Auth & Containers (20s)
    size: "w-[440px] h-[440px] sm:w-[560px] sm:h-[560px] md:w-[660px] md:h-[660px]",
    duration: 20,
    icons: [
      {
        name: "Traefik Gateway",
        alt: "Traefik",
        angle: -90,
        icon: SiTraefikproxy,
        color: "#24A1C1",
      },
      {
        name: "Keycloak",
        alt: "Keycloak",
        angle: -10,
        icon: SiKeycloak,
        color: "#0088CE",
      },
      {
        name: "Docker",
        alt: "Docker",
        angle: 70,
        icon: SiDocker,
        color: "#2496ED",
      },
    ],
  },
  {
    // Outer Ring: Frontend, Storage, Search & Security Pipeline (26s)
    size: "w-[580px] h-[580px] sm:w-[720px] sm:h-[720px] md:w-[840px] md:h-[840px]",
    duration: 26,
    icons: [
      {
        name: "Next.js 16",
        alt: "Next.js",
        angle: -70,
        icon: SiNextdotjs,
        color: "currentColor",
      },
      {
        name: "MinIO S3",
        alt: "MinIO",
        angle: -10,
        icon: SiMinio,
        color: "#C72C48",
      },
      {
        name: "Meilisearch",
        alt: "Meilisearch",
        angle: 50,
        icon: SiMeilisearch,
        color: "#FF406E",
      },
      {
        name: "VirusTotal",
        alt: "VirusTotal",
        angle: 110,
        icon: SiVirustotal,
        color: "#3949AB",
      },
    ],
  },
];

export interface OrbitingCirclesGlobeProps {
  orbits?: OrbitConfig[];
  className?: string;
}

export function OrbitingCirclesGlobe({
  orbits = DEFAULT_ORBITS,
  className,
}: OrbitingCirclesGlobeProps) {
  return (
    <div
      className={cn(
        "relative w-full h-[580px] sm:h-[700px] md:h-[820px] lg:h-[880px] overflow-hidden flex items-center justify-center select-none bg-transparent",
        className
      )}
    >
      <style>{`
        @keyframes orbit-cw {
          from { transform: rotate(var(--start-angle)); }
          to   { transform: rotate(calc(var(--start-angle) + 360deg)); }
        }
        @keyframes orbit-ccw {
          from { transform: rotate(var(--start-angle)); }
          to   { transform: rotate(calc(var(--start-angle) - 360deg)); }
        }
        @keyframes counter-cw {
          from { transform: rotate(var(--counter-offset, 0deg)); }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) - 360deg)); }
        }
        @keyframes counter-ccw {
          from { transform: rotate(var(--counter-offset, 0deg)); }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) + 360deg)); }
        }
        @keyframes radar-ripple {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes pulse-halo {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.08); }
        }
      `}</style>

      {/* Ambient background glow & atmospheric effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[340px] sm:size-[480px] md:size-[640px] rounded-full bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-indigo-500/15 blur-3xl pointer-events-none -z-10" />

      {/* Concentric subtle radar effect rings — must include translate to stay centered */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-36 sm:size-48 rounded-full border border-blue-500/25 pointer-events-none -z-0"
        style={{ animation: "radar-ripple 3.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-52 sm:size-64 rounded-full border border-cyan-500/20 pointer-events-none -z-0"
        style={{ animation: "radar-ripple 3.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite 1.4s" }}
      />

      {/* Center particle globe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square pointer-events-none w-[240px] sm:w-[320px] md:w-[420px] z-10 opacity-90">
        <ParticleSphereAnimation />
      </div>

      {/* CENTER HUB: DevSolve Lightbulb Icon — perfectly centered, high-res & sleek */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
        {/* Soft ambient glow */}
        <div className="absolute size-36 sm:size-44 md:size-52 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />

        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="group relative flex size-28 sm:size-36 md:size-40 cursor-pointer items-center justify-center"
        >
          {/* Spinning dashed halo */}
          <div className="absolute -inset-2.5 sm:-inset-3 rounded-full border-2 border-dashed border-blue-500/40 animate-[spin_24s_linear_infinite] pointer-events-none" />

          {/* Clean circular white core for dark mode — perfectly round, no square box */}
          <div className="absolute inset-1 sm:inset-1.5 rounded-full bg-white opacity-0 dark:opacity-100 shadow-[0_0_35px_rgba(59,130,246,0.35),0_0_70px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/25 pointer-events-none transition-opacity duration-300" />

          {/* DevSolve Icon — crisp high-DPI cropped transparent icon */}
          <Image
            src="/devsolve-icon.png"
            alt="DevSolve"
            width={256}
            height={256}
            unoptimized
            priority
            className="relative z-10 size-22 sm:size-28 md:size-32 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />

          {/* Hover Tooltip */}
          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg pointer-events-none transition-opacity duration-200 group-hover:opacity-100 dark:bg-white dark:text-slate-900 z-30">
            DevSolve Core Hub
          </div>
        </motion.div>
      </div>

      {/* Orbiting rings with standardized technology nodes */}
      {orbits.map((orbit, index) => {
        const isCW = index % 2 === 0;
        const orbitAnim = isCW ? "orbit-cw" : "orbit-ccw";
        const counterAnim = isCW ? "counter-cw" : "counter-ccw";

        const allIcons = [
          ...orbit.icons,
          ...orbit.icons.map((ic) => ({
            ...ic,
            angle: ic.angle + 180,
            alt: `${ic.alt}-mirror`,
          })),
        ];

        return (
          <div
            key={index}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70 dark:border-border/60 pointer-events-none",
              orbit.size
            )}
          >
            {allIcons.map((iconData, iconIndex) => {
              const IconComp = iconData.icon;

              return (
                <div
                  key={iconIndex}
                  className="absolute top-0 left-1/2 h-1/2 -ml-7 sm:-ml-8 origin-bottom flex flex-col justify-start items-center pointer-events-auto"
                  style={
                    {
                      "--start-angle": `${iconData.angle}deg`,
                      animation: `${orbitAnim} ${orbit.duration}s linear infinite`,
                    } as React.CSSProperties
                  }
                >
                  <div
                    title={iconData.name}
                    className="group relative -mt-7 sm:-mt-8 flex size-14 sm:size-16 items-center justify-center rounded-full border border-border/80 bg-background/95 p-3 shadow-md backdrop-blur-md transition-transform duration-300 hover:scale-115 hover:border-primary/50 dark:bg-neutral-900/95 cursor-pointer ring-1 ring-foreground/5"
                    style={
                      {
                        "--counter-offset": `${-iconData.angle}deg`,
                        animation: `${counterAnim} ${orbit.duration}s linear infinite`,
                      } as React.CSSProperties
                    }
                  >
                    {IconComp ? (
                      <IconComp
                        className="size-6 sm:size-7 shrink-0 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: iconData.color || "currentColor" }}
                      />
                    ) : iconData.src ? (
                      <img
                        src={iconData.src}
                        alt={iconData.alt}
                        width={28}
                        height={28}
                        className="size-6 sm:size-7 object-contain"
                      />
                    ) : null}

                    {/* Clean hover tooltip with name */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 shadow-sm pointer-events-none transition-opacity duration-200 group-hover:opacity-100 dark:bg-white dark:text-slate-900 z-30">
                      {iconData.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default OrbitingCirclesGlobe;
