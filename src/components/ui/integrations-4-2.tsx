"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { SiMinio } from "react-icons/si";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Server,
  Layers,
  Database,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TechDetail = {
  id: string;
  name: string;
  category: string;
  role: string;
  description: string;
  accentColor: string;
  glowColor: string;
  protocol?: string;
  src?: string;
  isMinio?: boolean;
  isInvertable?: boolean;
};

export type TileData = {
  row: number;
  col: number;
  tech?: TechDetail;
};

export interface IntegrationsProps {
  kicker?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  tiles?: TileData[];
}

// DevSolve Core Technologies
export const DEVSOLVE_TECHS: Record<string, TechDetail> = {
  nextjs: {
    id: "nextjs",
    name: "Next.js 16 (App Router)",
    category: "Client & Gateway",
    role: "Presentation & Edge Proxy",
    description:
      "React 19 Server Components, RTK Query client caching, and server-side Bearer token injection.",
    accentColor: "#2563EB",
    glowColor: "rgba(37,99,235,0.45)",
    protocol: "HTTPS / REST",
    src: "/next.svg",
    isInvertable: true,
  },
  traefik: {
    id: "traefik",
    name: "Traefik Gateway",
    category: "Edge & Ingress",
    role: "Reverse Proxy & TLS",
    description:
      "Cloud-native ingress routing, automatic Let's Encrypt TLS termination, and rate-limiting shield.",
    accentColor: "#0284C7",
    glowColor: "rgba(2,132,199,0.45)",
    protocol: "TLS 1.3 / TCP",
    src: "/traefik.png",
  },
  spring: {
    id: "spring",
    name: "Spring Boot Core Engine",
    category: "Core Engine",
    role: "Backend Business Logic",
    description:
      "High-throughput enterprise API powering vulnerability workflows, rewards calculation, and audit trails.",
    accentColor: "#10B981",
    glowColor: "rgba(16,185,129,0.45)",
    protocol: "REST API / JSON",
    src: "/spring.svg",
  },
  keycloak: {
    id: "keycloak",
    name: "Keycloak Identity Server",
    category: "Identity & Access",
    role: "Federated OIDC & PKCE",
    description:
      "Zero-Trust OpenID Connect realm with S256 PKCE challenge flow and cryptographically signed JWTs.",
    accentColor: "#0088CE",
    glowColor: "rgba(0,136,206,0.45)",
    protocol: "OIDC / OAuth 2.0",
    src: "/keycloak.svg",
  },
  postgresql: {
    id: "postgresql",
    name: "PostgreSQL Database",
    category: "Relational Storage",
    role: "ACID Datastore",
    description:
      "Primary relational database handling transactional records, user profiles, bounties, and discussions.",
    accentColor: "#336791",
    glowColor: "rgba(51,103,145,0.45)",
    protocol: "ANSI SQL / TCP",
    src: "/postgresql.svg",
  },
  redis: {
    id: "redis",
    name: "Redis In-Memory Bus",
    category: "Cache & Performance",
    role: "High-Speed Memory Bus",
    description:
      "Sub-millisecond latency memory store for live leaderboard tallies, session distribution, and pub/sub queues.",
    accentColor: "#DC2626",
    glowColor: "rgba(220,38,38,0.45)",
    protocol: "RESP / In-Memory",
    src: "/redis-logo-svgrepo-com.svg",
  },
  minio: {
    id: "minio",
    name: "MinIO Object Storage",
    category: "Object Storage",
    role: "S3-Compatible Storage",
    description:
      "High-performance S3 storage for researcher proof-of-concept attachments, avatars, and evidence logs.",
    accentColor: "#E11D48",
    glowColor: "rgba(225,29,72,0.45)",
    protocol: "S3 API / HTTPS",
    isMinio: true,
  },
  meilisearch: {
    id: "meilisearch",
    name: "Meilisearch Engine",
    category: "Search & Discovery",
    role: "Instant Fuzzy Search",
    description:
      "Sub-50ms search index providing typo-tolerant discovery across bug programs, solutions, and community discussions.",
    accentColor: "#FF4066",
    glowColor: "rgba(255,64,102,0.45)",
    protocol: "HTTP / REST",
    src: "/Meilisearch.png",
  },
  virustotal: {
    id: "virustotal",
    name: "VirusTotal Sandbox",
    category: "Security Pipeline",
    role: "Automated Malware Scan",
    description:
      "Sandboxed malware inspection analyzing researcher file attachments against 70+ antivirus engines.",
    accentColor: "#6366F1",
    glowColor: "rgba(99,102,241,0.45)",
    protocol: "REST API / Async Webhook",
    src: "/virustotal.svg",
  },
  smtp: {
    id: "smtp",
    name: "SMTP Dispatcher",
    category: "Notifications",
    role: "Transactional Mail",
    description:
      "TLS-encrypted email dispatch for instant bounty awards, triage state changes, and verification emails.",
    accentColor: "#F59E0B",
    glowColor: "rgba(245,158,11,0.45)",
    protocol: "SMTP / TLS",
    src: "/smtp.png",
  },
};

// 5x5 Scattered Layout matching the constellation visual aesthetic
export const DEVSOLVE_TILES: TileData[] = [
  // Row 0
  { row: 0, col: 0 },
  { row: 0, col: 1, tech: DEVSOLVE_TECHS.nextjs },
  { row: 0, col: 2 },
  { row: 0, col: 3, tech: DEVSOLVE_TECHS.traefik },
  { row: 0, col: 4 },

  // Row 1
  { row: 1, col: 0 },
  { row: 1, col: 1, tech: DEVSOLVE_TECHS.keycloak },
  { row: 1, col: 2 },
  { row: 1, col: 3, tech: DEVSOLVE_TECHS.spring },
  { row: 1, col: 4 },

  // Row 2
  { row: 2, col: 0 },
  { row: 2, col: 1, tech: DEVSOLVE_TECHS.postgresql },
  { row: 2, col: 2 },
  { row: 2, col: 3, tech: DEVSOLVE_TECHS.redis },
  { row: 2, col: 4 },

  // Row 3
  { row: 3, col: 0, tech: DEVSOLVE_TECHS.minio },
  { row: 3, col: 1 },
  { row: 3, col: 2, tech: DEVSOLVE_TECHS.meilisearch },
  { row: 3, col: 3 },
  { row: 3, col: 4 },

  // Row 4
  { row: 4, col: 0 },
  { row: 4, col: 1, tech: DEVSOLVE_TECHS.virustotal },
  { row: 4, col: 2 },
  { row: 4, col: 3, tech: DEVSOLVE_TECHS.smtp },
  { row: 4, col: 4 },
];

export function Integrations({
  kicker,
  title,
  description,
  className,
  tiles: propTiles,
}: IntegrationsProps = {}) {
  const [activeTech, setActiveTech] = useState<TechDetail | null>(
    DEVSOLVE_TECHS.nextjs
  );
  const activeTiles = propTiles ?? DEVSOLVE_TILES;

  return (
    <div
      className={cn(
        "mx-auto grid max-w-6xl grid-cols-1 gap-12 p-4 lg:grid-cols-12 lg:items-center",
        className
      )}
    >
      {/* Left Content */}
      <div className="space-y-6 lg:col-span-6">
        {kicker ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400">
            <Sparkles className="size-3.5" />
            <span>{kicker}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400">
            <Sparkles className="size-3.5" />
            <span>Platform Technology</span>
          </div>
        )}

        <h2 className="font-extrabold text-3xl tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-slate-100">
          {title ?? (
            <>
              Engineered with High-Performance Tech
              <span className="text-[#2563EB] dark:text-blue-400">.</span>
            </>
          )}
        </h2>

        <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-neutral-300">
          {description ??
            "A resilient microservice architecture powered by modern edge routing, federated identity, high-throughput datastores, and an automated security pipeline."}
        </p>

        {/* Dynamic Tech Inspector Card */}
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900/80">
          <AnimatePresence mode="wait">
            {activeTech && (
              <motion.div
                key={activeTech.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 rounded-full ring-2 ring-white dark:ring-neutral-900"
                      style={{ backgroundColor: activeTech.accentColor }}
                    />
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                      {activeTech.name}
                    </h3>
                  </div>

                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${activeTech.accentColor}18`,
                      color: activeTech.accentColor,
                    }}
                  >
                    {activeTech.category}
                  </span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
                  {activeTech.description}
                </p>

                {activeTech.protocol && (
                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 dark:text-neutral-400">
                    <span className="font-mono font-medium">
                      Protocol: {activeTech.protocol}
                    </span>
                    <span className="size-1 rounded-full bg-slate-300 dark:bg-neutral-700" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
            <ShieldCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
            OIDC / PKCE Zero-Trust
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
            <Zap className="size-3.5 text-amber-500" />
            Sub-millisecond Redis
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
            <Server className="size-3.5 text-emerald-500" />
            Distributed S3 Storage
          </span>
        </div>
      </div>

      {/* Right Content - Visual Scattered Constellation */}
      <div className="flex justify-center lg:col-span-6 lg:justify-end">
        <div className="relative size-90 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]">
          {activeTiles.map((tile, idx) => (
            <IntegrationCard
              key={`${tile.row}_${tile.col}`}
              tile={tile}
              index={idx}
              isSelected={activeTech?.id === tile.tech?.id}
              onSelectTech={setActiveTech}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({
  tile,
  index,
  isSelected,
  onSelectTech,
}: {
  tile: TileData;
  index: number;
  isSelected?: boolean;
  onSelectTech: (tech: TechDetail) => void;
}) {
  const { row, col, tech } = tile;
  const isInteractive = !!tech;

  // Staggered bobbing motion for organic floating effect
  const floatDuration = 3.2 + ((row * 2 + col) % 4) * 0.5;
  const floatOffset = (row + col) % 2 === 0 ? -4 : 4;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay: index * 0.02,
      }}
      className={cn(
        "absolute flex size-18 items-center justify-center rounded-2xl border transition-all duration-300",
        isInteractive
          ? "cursor-pointer bg-white/95 shadow-sm dark:bg-neutral-900/95"
          : "pointer-events-none bg-slate-100/40 border-slate-200/50 dark:bg-neutral-800/30 dark:border-neutral-800/50",
        isSelected
          ? "ring-2 ring-offset-2 scale-105 z-20 dark:ring-offset-neutral-950"
          : isInteractive
          ? "hover:scale-110 hover:z-20 border-slate-200 dark:border-neutral-700"
          : ""
      )}
      style={{
        left: col * 72,
        top: row * 72,
        borderColor: isSelected ? tech?.accentColor : undefined,
        boxShadow:
          isSelected && tech
            ? `0 0 20px -2px ${tech.glowColor}`
            : undefined,
      }}
      onMouseEnter={() => {
        if (tech) onSelectTech(tech);
      }}
      onClick={() => {
        if (tech) onSelectTech(tech);
      }}
    >
      {/* Floating inner bobbing animation */}
      <motion.div
        animate={{ y: [0, floatOffset, 0] }}
        transition={{
          repeat: Infinity,
          duration: floatDuration,
          ease: "easeInOut",
        }}
        className="flex size-full items-center justify-center"
      >
        {tech && (
          <>
            {tech.isMinio ? (
              <SiMinio className="size-8 text-[#E11D48] transition-transform duration-300 group-hover:scale-110" />
            ) : tech.src ? (
              <Image
                src={tech.src}
                alt={tech.name}
                width={36}
                height={36}
                className={cn(
                  "pointer-events-none size-8 select-none object-contain p-0.5 transition-transform duration-300",
                  tech.isInvertable && "dark:invert"
                )}
              />
            ) : null}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default Integrations;
