"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  Database,
  Shield,
  Zap,
  Server,
  Cloud,
  HardDrive,
  Search,
  KeyRound,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Cpu,
  Activity,
  CheckCircle2,
} from "lucide-react";

export interface ArchNode {
  id: string;
  name: string;
  category: "frontend" | "backend" | "database" | "security" | "storage" | "cloud";
  layer: string;
  description: string;
  specs: string[];
  status: string;
  x: number;
  y: number;
  icon: typeof Server;
  accentColor: string;
}

const ARCH_NODES: ArchNode[] = [
  {
    id: "nextjs",
    name: "Next.js 16 (App Router)",
    category: "frontend",
    layer: "Client & Presentation",
    description: "SSR and interactive UI rendered with React Server Components, Tailwind CSS v4, and dynamic proxy routing.",
    specs: ["React 19 & Next.js 16", "RTK Query State Management", "Server Proxy API Layer"],
    status: "Active / Healthy",
    x: 180,
    y: 260,
    icon: Layers,
    accentColor: "#38bdf8", // Sky blue
  },
  {
    id: "proxy",
    name: "Reverse Proxy & TLS Gateway",
    category: "frontend",
    layer: "Edge & Routing",
    description: "High-performance reverse proxy for TLS termination, SSL offloading, and secure API relay to internal services.",
    specs: ["HTTP/2 & WebSocket support", "Rate limiting & DDoS Shield", "Strict CORS & Origin Guard"],
    status: "Operational",
    x: 320,
    y: 350,
    icon: Server,
    accentColor: "#60a5fa", // Blue
  },
  {
    id: "spring",
    name: "Spring Boot 3.3 Core",
    category: "backend",
    layer: "Core Microservices Engine",
    description: "Central reactive backend processor handling business logic, challenge verification, and bounty transaction workflows.",
    specs: ["Java 21 LTS Engine", "RESTful & Event APIs", "Role-Based Access Control"],
    status: "Core Engine Online",
    x: 580,
    y: 280,
    icon: Cpu,
    accentColor: "#34d399", // Emerald
  },
  {
    id: "keycloak",
    name: "Keycloak OIDC & PKCE",
    category: "security",
    layer: "Identity & Access Management",
    description: "Enterprise-grade identity federation, PKCE-guarded OAuth 2.0 authorization, and session token verification.",
    specs: ["OIDC with PKCE (S256)", "Multi-Factor Authentication", "JWT Bearer Token Issuance"],
    status: "Protected / Enforced",
    x: 230,
    y: 470,
    icon: KeyRound,
    accentColor: "#a855f7", // Purple
  },
  {
    id: "postgres",
    name: "PostgreSQL Database",
    category: "database",
    layer: "Relational Primary Datastore",
    description: "ACID-compliant primary database storing users, reports, programs, submissions, and audit log trails.",
    specs: ["Row-Level Security (RLS)", "Automated Point-in-Time Backup", "Connection Pooling"],
    status: "Synchronized",
    x: 900,
    y: 160,
    icon: Database,
    accentColor: "#38bdf8", // Cyan
  },
  {
    id: "redis",
    name: "Redis Cache & Memory Bus",
    category: "database",
    layer: "In-Memory Speed Layer",
    description: "Sub-millisecond latency distributed cache for fast session lookup, rate-limiting counters, and real-time leaderboards.",
    specs: ["In-Memory Data Structures", "Pub/Sub Messaging Bus", "High-Availability Sentinel"],
    status: "Low Latency (0.4ms)",
    x: 420,
    y: 190,
    icon: Zap,
    accentColor: "#f43f5e", // Rose
  },
  {
    id: "minio",
    name: "MinIO Object Storage",
    category: "storage",
    layer: "S3-Compatible Object Store",
    description: "High-performance distributed storage for challenge attachments, proof-of-concept files, and team avatars.",
    specs: ["S3 API Compatible", "Server-Side Encryption", "Signed URL Access Expiry"],
    status: "Encrypted & Distributed",
    x: 440,
    y: 90,
    icon: HardDrive,
    accentColor: "#f59e0b", // Amber
  },
  {
    id: "cloudflare",
    name: "Cloudflare Edge CDN",
    category: "cloud",
    layer: "Global Edge & Acceleration",
    description: "Global content distribution network, Web Application Firewall (WAF), and Anycast edge caching network.",
    specs: ["300+ Edge Locations", "Layer 7 DDoS Mitigation", "Instant Cache Purge"],
    status: "Global Anycast Active",
    x: 780,
    y: 430,
    icon: Cloud,
    accentColor: "#38bdf8", // Sky
  },
  {
    id: "search",
    name: "Meilisearch Engine",
    category: "backend",
    layer: "Fast Search & Indexing",
    description: "Ultra-fast typo-tolerant full-text search indexing vulnerabilities, write-ups, and developer profiles in under 50ms.",
    specs: ["Typo-Tolerant Search", "Instant Filterable Facets", "Real-Time Index Sync"],
    status: "Indexed",
    x: 740,
    y: 180,
    icon: Search,
    accentColor: "#ec4899", // Pink
  },
];

export function TechArchitectureDiagram() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("spring");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterLayer, setFilterLayer] = useState<string>("all");

  const activeNode =
    ARCH_NODES.find((n) => n.id === (hoveredNodeId || selectedNodeId)) || ARCH_NODES[2];

  const filteredNodes =
    filterLayer === "all"
      ? ARCH_NODES
      : ARCH_NODES.filter((n) => {
          if (filterLayer === "frontend") return n.category === "frontend";
          if (filterLayer === "backend") return n.category === "backend" || n.category === "security";
          if (filterLayer === "data") return n.category === "database" || n.category === "storage";
          if (filterLayer === "cloud") return n.category === "cloud";
          return true;
        });

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-border/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Live Topology Blueprint
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            DevSolve End-to-End System Architecture
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-muted/60 p-1 border border-border/60">
          {[
            { id: "all", label: "Full Architecture" },
            { id: "frontend", label: "Frontend & Edge" },
            { id: "backend", label: "Core & Auth" },
            { id: "data", label: "Databases & Storage" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterLayer(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filterLayer === tab.id
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 lg:gap-8 lg:p-8 items-center">
        <div className="relative lg:col-span-8 flex items-center justify-center min-h-[460px] sm:min-h-[520px] rounded-2xl bg-[#0c1322] overflow-hidden border border-white/10 shadow-inner">
          <div className="pointer-events-none absolute -top-20 -left-20 size-72 rounded-full bg-blue-500/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-teal-500/20 blur-[120px]" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-indigo-500/10 blur-[140px]" />

          <svg
            viewBox="0 0 1060 620"
            className="w-full h-full max-h-[580px] select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="circuit-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="core-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="core-die" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              <linearGradient id="cloud-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.85" />
              </linearGradient>

              <linearGradient id="portal-beam" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            <g className="circuit-traces" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M 235 300 L 290 330 L 330 350"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                opacity="0.85"
                filter="url(#circuit-glow)"
              />

              <path
                d="M 440 395 L 510 350 L 580 310"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="3"
                opacity="0.9"
                filter="url(#circuit-glow)"
              />

              <path
                d="M 230 460 L 230 390 L 330 360"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                opacity="0.8"
                filter="url(#circuit-glow)"
              />

              <path
                d="M 680 260 L 760 210 L 890 180"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                opacity="0.85"
                filter="url(#circuit-glow)"
              />

              <path
                d="M 540 240 L 460 200 L 410 210"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              />

              <path
                d="M 410 170 L 410 110 L 440 100"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                opacity="0.75"
              />

              <path
                d="M 620 340 L 680 380 L 760 410"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                opacity="0.85"
                filter="url(#circuit-glow)"
              />

              <path
                d="M 650 250 L 720 220 L 760 190"
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                strokeDasharray="5 3"
                opacity="0.75"
              />
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("nextjs")}
              onMouseEnter={() => setHoveredNodeId("nextjs")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <polygon points="120,270 200,230 260,260 180,300" fill="#1e293b" />
              <polygon points="120,270 180,300 180,315 120,285" fill="#0f172a" />
              <polygon points="260,260 180,300 180,315 260,275" fill="#1e3a8a" />
              <polygon points="140,240 190,210 230,230 180,260" fill="url(#core-top)" opacity="0.6" />
              <polygon points="140,240 180,260 180,285 140,265" fill="#0284c7" opacity="0.8" />
              <polygon points="230,230 180,260 180,285 230,255" fill="#38bdf8" opacity="0.7" />
              <text x="180" y="335" fill="#93c5fd" fontSize="13" fontWeight="bold" textAnchor="middle">
                Next.js Client
              </text>
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("proxy")}
              onMouseEnter={() => setHoveredNodeId("proxy")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <polygon points="280,380 430,300 520,350 370,430" fill="#e2e8f0" />
              <polygon points="280,380 370,430 370,470 280,420" fill="#0284c7" />
              <polygon points="520,350 370,430 370,470 520,390" fill="#0f172a" />
              <circle cx="300" cy="405" r="2.5" fill="#38ef7d" />
              <circle cx="310" cy="410" r="2.5" fill="#38ef7d" />
              <circle cx="320" cy="415" r="2.5" fill="#38bdf8" />
              <text x="380" y="490" fill="#93c5fd" fontSize="13" fontWeight="bold" textAnchor="middle">
                API Gateway / Proxy
              </text>
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("spring")}
              onMouseEnter={() => setHoveredNodeId("spring")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <polygon points="480,260 620,190 730,250 590,320" fill="#f8fafc" />
              <polygon points="480,260 590,320 590,335 480,275" fill="#0284c7" />
              <polygon points="730,250 590,320 590,335 730,265" fill="#0369a1" />
              <polygon points="520,255 610,210 680,250 590,295" fill="url(#core-die)" />
              <polygon points="550,250 610,220 650,245 590,275" fill="#ffffff" opacity="0.85" />
              <text x="600" y="355" fill="#6ee7b7" fontSize="14" fontWeight="bold" textAnchor="middle">
                Spring Boot Core Engine
              </text>
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("keycloak")}
              onMouseEnter={() => setHoveredNodeId("keycloak")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <ellipse cx="230" cy="480" rx="45" ry="20" fill="#0284c7" />
              <ellipse cx="230" cy="470" rx="45" ry="20" fill="#38bdf8" />
              <ellipse cx="230" cy="460" rx="35" ry="15" fill="#0c4a6e" />
              <polygon points="205,460 255,460 245,380 215,380" fill="url(#portal-beam)" />
              <ellipse cx="230" cy="380" rx="15" ry="7" fill="#67e8f9" opacity="0.9" />
              <text x="230" y="525" fill="#c084fc" fontSize="13" fontWeight="bold" textAnchor="middle">
                Keycloak OIDC / PKCE
              </text>
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("postgres")}
              onMouseEnter={() => setHoveredNodeId("postgres")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <path d="M 870 170 C 870 185, 930 185, 930 170 L 930 190 C 930 205, 870 205, 870 190 Z" fill="#0369a1" />
              <path d="M 870 150 C 870 165, 930 165, 930 150 L 930 170 C 930 185, 870 185, 870 170 Z" fill="#0284c7" />
              <ellipse cx="900" cy="150" rx="30" ry="12" fill="#38bdf8" />
              <circle cx="890" cy="125" r="2" fill="#67e8f9" />
              <circle cx="900" cy="120" r="2.5" fill="#38ef7d" />
              <circle cx="910" cy="127" r="2" fill="#67e8f9" />
              <circle cx="905" cy="112" r="1.5" fill="#ffffff" />
              <text x="900" y="225" fill="#93c5fd" fontSize="13" fontWeight="bold" textAnchor="middle">
                PostgreSQL Primary
              </text>
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("redis")}
              onMouseEnter={() => setHoveredNodeId("redis")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <g transform="translate(320, 200)">
                <polygon points="0,15 20,5 35,12 15,22" fill="#f43f5e" />
                <polygon points="0,15 15,22 15,30 0,23" fill="#be123c" />
                <polygon points="35,12 15,22 15,30 35,20" fill="#9f1239" />
              </g>
              <g transform="translate(345, 185)">
                <polygon points="0,15 20,5 35,12 15,22" fill="#fb7185" />
                <polygon points="0,15 15,22 15,30 0,23" fill="#be123c" />
                <polygon points="35,12 15,22 15,30 35,20" fill="#9f1239" />
              </g>
              <g transform="translate(370, 170)">
                <polygon points="0,15 20,5 35,12 15,22" fill="#fda4af" />
                <polygon points="0,15 15,22 15,30 0,23" fill="#be123c" />
                <polygon points="35,12 15,22 15,30 35,20" fill="#9f1239" />
              </g>
              <text x="360" y="245" fill="#fda4af" fontSize="13" fontWeight="bold" textAnchor="middle">
                Redis Cache Bus
              </text>
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("minio")}
              onMouseEnter={() => setHoveredNodeId("minio")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <polygon points="420,105 450,90 475,100 445,115" fill="#f59e0b" />
              <polygon points="420,105 445,115 445,170 420,160" fill="#b45309" />
              <polygon points="475,100 445,115 445,170 475,155" fill="#d97706" />
              <text x="445" y="195" fill="#fcd34d" fontSize="13" fontWeight="bold" textAnchor="middle">
                MinIO S3 Storage
              </text>
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("cloudflare")}
              onMouseEnter={() => setHoveredNodeId("cloudflare")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <g transform="translate(600, 360)">
                <path
                  d="M 10 30 Q 0 30 0 20 Q 0 10 15 10 Q 25 0 45 5 Q 65 0 75 15 Q 90 15 90 30 Z"
                  fill="url(#cloud-grad)"
                />
              </g>
              <g transform="translate(710, 320)">
                <path
                  d="M 10 30 Q 0 30 0 20 Q 0 10 15 10 Q 25 0 45 5 Q 65 0 75 15 Q 90 15 90 30 Z"
                  fill="url(#cloud-grad)"
                />
              </g>
              <g transform="translate(820, 270)">
                <path
                  d="M 10 30 Q 0 30 0 20 Q 0 10 15 10 Q 25 0 45 5 Q 65 0 75 15 Q 90 15 90 30 Z"
                  fill="url(#cloud-grad)"
                />
              </g>
              <text x="750" y="420" fill="#bae6fd" fontSize="13" fontWeight="bold" textAnchor="middle">
                Cloudflare Edge CDN
              </text>
            </g>

            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setSelectedNodeId("search")}
              onMouseEnter={() => setHoveredNodeId("search")}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              <polygon points="700,165 745,145 780,160 735,180" fill="#ec4899" />
              <polygon points="700,165 735,180 735,210 700,195" fill="#be185d" />
              <polygon points="780,160 735,180 735,210 780,190" fill="#9d174d" />
              <text x="740" y="235" fill="#fbcfe8" fontSize="13" fontWeight="bold" textAnchor="middle">
                Meilisearch Index
              </text>
            </g>
          </svg>

          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 backdrop-blur-md border border-white/10">
            <Sparkles className="size-3.5 text-cyan-400 animate-pulse" />
            <span>Click any node to inspect architecture layer & specs</span>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between h-full space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${activeNode.accentColor}18`,
                      color: activeNode.accentColor,
                    }}
                  >
                    <activeNode.icon className="size-3.5" />
                    {activeNode.layer}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {activeNode.status}
                  </span>
                </div>

                <h4 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {activeNode.name}
                </h4>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {activeNode.description}
              </p>

              <div className="border-t border-border/80 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Technical Specifications
                </p>
                <ul className="space-y-2">
                  {activeNode.specs.map((spec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium"
                    >
                      <CheckCircle2 className="size-4 shrink-0 text-blue-500 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Components Overview
            </p>
            <div className="grid grid-cols-3 gap-2">
              {filteredNodes.map((node) => {
                const isSelected = activeNode.id === node.id;
                const Icon = node.icon;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm font-bold"
                        : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/60"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="text-[11px] font-semibold truncate w-full">
                      {node.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
