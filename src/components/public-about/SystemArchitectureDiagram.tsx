"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { SiMinio, SiTailwindcss } from "react-icons/si";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SystemArchitectureDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathsRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.from(".arch-title", {
        opacity: 0,
        x: 30,
        duration: 0.7,
        ease: "power3.out",
      });

      tl.from(
        ".arch-node-user",
        { opacity: 0, scale: 0.5, y: 20, duration: 0.5, ease: "back.out(1.8)" },
        "-=0.4"
      )
        .from(
          ".arch-node-proxy",
          { opacity: 0, scale: 0.5, y: 20, duration: 0.5, ease: "back.out(1.8)" },
          "-=0.3"
        )
        .from(
          [".arch-node-frontend", ".arch-node-auth"],
          {
            opacity: 0,
            scale: 0.6,
            y: 24,
            duration: 0.55,
            stagger: 0.1,
            ease: "back.out(1.7)",
          },
          "-=0.25"
        )
        .from(
          ".arch-node-core",
          { opacity: 0, scale: 0.5, duration: 0.6, ease: "back.out(2)" },
          "-=0.2"
        )
        .from(
          [
            ".arch-node-db",
            ".arch-node-redis",
            ".arch-node-scan",
            ".arch-node-storage",
            ".arch-node-search",
            ".arch-node-notify",
          ],
          {
            opacity: 0,
            scale: 0.7,
            y: 18,
            duration: 0.5,
            stagger: 0.06,
            ease: "back.out(1.6)",
          },
          "-=0.3"
        )
        .from(
          ".arch-label",
          {
            opacity: 0,
            scale: 0.8,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.3"
        );

      gsap.to(".flow-stream", {
        strokeDashoffset: -120,
        duration: 2.4,
        repeat: -1,
        ease: "none",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-transparent py-6 select-none"
    >
      <div className="flex items-center pb-4 mb-6 sm:mb-10">
        <h2 className="arch-title text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2563EB] dark:text-blue-400">
          System Architecture
        </h2>
      </div>

      <div className="relative mx-auto hidden lg:block w-full max-w-[1180px] h-[720px]">
        <svg
          ref={pathsRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 1180 720"
        >
          <defs>
            <marker
              id="arch-arrow-clean"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 1.5 L 8 5 L 0 8.5 z"
                fill="currentColor"
                className="text-slate-400 dark:text-neutral-500"
              />
            </marker>
          </defs>

          <path
            d="M 130 95 L 210 95"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-neutral-700"
            strokeWidth="2"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 130 95 L 210 95"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeDasharray="6 14"
            className="flow-stream opacity-70"
          />

          <path
            d="M 290 165 L 290 280"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-neutral-700"
            strokeWidth="2"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 290 165 L 290 280"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeDasharray="6 14"
            className="flow-stream opacity-70"
          />

          <path
            d="M 370 95 L 480 95"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-neutral-700"
            strokeWidth="2"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 370 95 L 480 95"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeDasharray="6 14"
            className="flow-stream opacity-70"
          />

          <path
            d="M 380 310 Q 435 210 490 160"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-neutral-700"
            strokeWidth="2"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 380 310 Q 435 210 490 160"
            fill="none"
            stroke="#EC4899"
            strokeWidth="2"
            strokeDasharray="5 12"
            className="flow-stream opacity-60"
          />

          <path
            d="M 380 360 L 480 360"
            fill="none"
            stroke="currentColor"
            className="text-slate-400 dark:text-neutral-600"
            strokeWidth="2.5"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 380 360 L 480 360"
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeDasharray="6 14"
            className="flow-stream opacity-80"
          />

          <path
            d="M 630 175 L 630 280"
            fill="none"
            stroke="currentColor"
            className="text-slate-400 dark:text-neutral-600"
            strokeWidth="2.5"
            markerStart="url(#arch-arrow-clean)"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 630 175 L 630 280"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeDasharray="6 14"
            className="flow-stream opacity-80"
          />

          <path
            d="M 780 320 Q 825 210 870 140"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-neutral-700"
            strokeWidth="2"
            markerStart="url(#arch-arrow-clean)"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 780 320 Q 825 210 870 140"
            fill="none"
            stroke="#84CC16"
            strokeWidth="2"
            strokeDasharray="5 12"
            className="flow-stream opacity-70"
          />

          <path
            d="M 780 360 L 870 360"
            fill="none"
            stroke="currentColor"
            className="text-slate-400 dark:text-neutral-600"
            strokeWidth="2.5"
            markerStart="url(#arch-arrow-clean)"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 780 360 L 870 360"
            fill="none"
            stroke="#4169E1"
            strokeWidth="2.5"
            strokeDasharray="6 14"
            className="flow-stream opacity-80"
          />

          <path
            d="M 720 445 Q 760 565 870 565"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-neutral-700"
            strokeWidth="2"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 720 445 Q 760 565 870 565"
            fill="none"
            stroke="#FF406E"
            strokeWidth="2"
            strokeDasharray="5 12"
            className="flow-stream opacity-70"
          />

          <path
            d="M 630 445 L 630 520"
            fill="none"
            stroke="currentColor"
            className="text-slate-400 dark:text-neutral-600"
            strokeWidth="2.5"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 630 445 L 630 520"
            fill="none"
            stroke="#DC382D"
            strokeWidth="2.5"
            strokeDasharray="6 14"
            className="flow-stream opacity-80"
          />

          <path
            d="M 540 445 Q 500 565 460 565"
            fill="none"
            stroke="currentColor"
            className="text-slate-300 dark:text-neutral-700"
            strokeWidth="2"
            markerStart="url(#arch-arrow-clean)"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 540 445 Q 500 565 460 565"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
            strokeDasharray="5 12"
            className="flow-stream opacity-70"
          />

          <path
            d="M 275 575 L 195 575"
            fill="none"
            stroke="currentColor"
            className="text-slate-400 dark:text-neutral-600"
            strokeWidth="2.5"
            markerEnd="url(#arch-arrow-clean)"
          />
          <path
            d="M 275 575 L 195 575"
            fill="none"
            stroke="#C72C48"
            strokeWidth="2.5"
            strokeDasharray="6 14"
            className="flow-stream opacity-80"
          />
        </svg>

        <div className="arch-label absolute left-[395px] top-[335px] z-10 flex flex-col items-center bg-card/95 px-3 py-1 rounded-lg text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-neutral-200 shadow-md backdrop-blur-md">
          <span>REST</span>
          <span>/HTTPS</span>
        </div>

        <div className="arch-label absolute left-[565px] top-[215px] z-10 flex flex-col items-center bg-card/95 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-neutral-200 shadow-md backdrop-blur-md">
          <span>VALIDATE JWT</span>
        </div>

        <div className="arch-label absolute left-[815px] top-[210px] z-10 bg-card/95 px-3 py-1 rounded-lg text-xs sm:text-sm font-mono font-bold text-slate-700 dark:text-neutral-300 shadow-md backdrop-blur-md">
          Events
        </div>

        <div className="arch-node-user absolute left-[40px] top-[50px] z-20 flex flex-col items-center">
          <div className="flex size-22 items-center justify-center rounded-full bg-slate-100 shadow-lg dark:bg-neutral-800 p-2">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#1e40af] text-white shadow-inner">
              <User className="size-9" />
            </div>
          </div>
          <span className="mt-3 text-lg sm:text-xl font-bold text-foreground tracking-tight">User</span>
        </div>

        <div className="arch-node-proxy absolute left-[210px] top-[35px] z-20 flex w-40 flex-col items-center rounded-3xl bg-card/95 p-5 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="relative h-16 w-20">
            <Image
              src="/traefik.png"
              alt="Traefik Reverse Proxy"
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
          <span className="mt-3 text-sm sm:text-base font-mono font-bold text-foreground">
            Reverse Proxy
          </span>
        </div>

        <div className="arch-node-frontend absolute left-[40px] top-[280px] z-20 flex w-[340px] flex-col items-center rounded-3xl bg-card/95 p-6 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="relative h-9 w-32">
            <Image
              src="/next.svg"
              alt="Next.js"
              fill
              className="object-contain dark:invert"
              sizes="128px"
            />
          </div>

          <div className="mt-5 flex items-center justify-center gap-5 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-2 font-mono">
              <div className="relative size-4.5">
                <Image
                  src="/shadcn.png"
                  alt="shadcn/ui"
                  fill
                  className="object-contain dark:invert"
                  sizes="18px"
                />
              </div>
            </span>
            <span className="flex items-center gap-2 text-[#06B6D4] font-semibold">
              <SiTailwindcss className="size-4.5" /> tailwindcss
            </span>
          </div>

          <span className="mt-4 text-lg sm:text-xl font-bold text-foreground tracking-tight">Frontend</span>
        </div>

        <div className="arch-node-auth absolute left-[480px] top-[30px] z-20 flex w-[300px] flex-col items-center rounded-3xl bg-card/95 p-6 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="relative h-14 w-52">
            <Image
              src="/keycloak.svg"
              alt="Keycloak"
              fill
              className="object-contain"
              sizes="208px"
            />
          </div>

          <span className="mt-4 text-sm sm:text-base font-mono font-bold text-foreground">
            Authorization Server
          </span>
        </div>

        <div className="arch-node-core absolute left-[480px] top-[280px] z-20 flex w-[300px] flex-col items-center rounded-3xl bg-card/95 p-6 shadow-2xl backdrop-blur-md dark:bg-neutral-900 ring-2 ring-emerald-500/30">
          <div className="relative h-14 w-44">
            <Image
              src="/spring.svg"
              alt="Spring Boot"
              fill
              className="object-contain"
              sizes="176px"
            />
          </div>

          <span className="mt-4 text-base sm:text-lg font-bold font-mono text-foreground">
            RESTful API
          </span>
        </div>

        <div className="arch-node-notify absolute left-[870px] top-[40px] z-20 flex w-52 flex-col items-center rounded-3xl bg-card/95 p-5 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="relative h-16 w-32">
            <Image
              src="/smtp.png"
              alt="SMTP Notification"
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
          <span className="mt-3 text-sm sm:text-base font-mono font-bold text-foreground">
            Notification
          </span>
        </div>

        <div className="arch-node-db absolute left-[870px] top-[285px] z-20 flex w-52 flex-col items-center rounded-3xl bg-card/95 p-5 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="relative h-16 w-40">
            <Image
              src="/postgresql.svg"
              alt="PostgreSQL Database"
              fill
              className="object-contain"
              sizes="160px"
            />
          </div>
          <span className="mt-3 text-sm sm:text-base font-mono font-bold text-foreground">
            Database
          </span>
        </div>

        <div className="arch-node-search absolute left-[870px] top-[515px] z-20 flex w-52 flex-col items-center rounded-3xl bg-card/95 p-5 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="relative h-12 w-40">
            <Image
              src="/Meilisearch.png"
              alt="Meilisearch Search Service"
              fill
              className="object-contain"
              sizes="160px"
            />
          </div>
          <span className="mt-4 text-sm sm:text-base font-mono font-bold text-foreground">
            Search Service
          </span>
        </div>

        <div className="arch-node-redis absolute left-[510px] top-[520px] z-20 flex w-60 flex-col items-center rounded-3xl bg-card/95 p-5 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="relative h-14 w-36">
            <Image
              src="/redis-logo-svgrepo-com.svg"
              alt="Redis Cache & Queue"
              fill
              className="object-contain"
              sizes="144px"
            />
          </div>
          <span className="mt-3 text-sm sm:text-base font-mono font-bold text-foreground">
            Cache & Queue
          </span>
        </div>

        <div className="arch-node-scan absolute left-[275px] top-[520px] z-20 flex w-48 flex-col items-center rounded-3xl bg-card/95 p-5 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="relative h-12 w-40">
            <Image
              src="/virustotal.svg"
              alt="VirusTotal File Upload Scan"
              fill
              className="object-contain dark:invert"
              sizes="160px"
            />
          </div>
          <span className="mt-4 text-sm sm:text-base font-mono font-bold text-foreground">
            File Upload Scan
          </span>
        </div>

        <div className="arch-node-storage absolute left-[40px] top-[520px] z-20 flex w-40 flex-col items-center rounded-3xl bg-card/95 p-5 shadow-lg backdrop-blur-md dark:bg-neutral-900/90">
          <div className="flex items-center justify-center gap-2 text-[#C72C48] py-1">
            <SiMinio className="size-8" />
            <span className="font-extrabold tracking-wider text-lg">MINIO</span>
          </div>
          <span className="mt-4 text-sm sm:text-base font-mono font-bold text-foreground">
            File Storage
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {[
          {
            title: "Frontend Layer",
            role: "Next.js 16 + shadcn/ui + Tailwind CSS",
            image: "/next.svg",
            desc: "Client-side & SSR presentation layer interacting via authenticated REST/HTTPS proxy.",
          },
          {
            title: "Reverse Proxy",
            role: "Traefik",
            image: "/traefik.png",
            desc: "Ingress controller routing user traffic, SSL termination, and rate limiting.",
          },
          {
            title: "Authorization Server",
            role: "Keycloak OIDC + JWT + OAuth 2.0",
            image: "/keycloak.svg",
            desc: "Centralized identity provider validating credentials and issuing secure JWT session tokens.",
          },
          {
            title: "Core Backend Hub",
            role: "Spring Boot RESTful API",
            image: "/spring.svg",
            desc: "Central business engine orchestrating reports, triage validations, and database transactions.",
          },
          {
            title: "Primary Datastore",
            role: "PostgreSQL Database",
            image: "/postgresql.svg",
            desc: "ACID relational persistence for programs, user metrics, reports, and bounties.",
          },
          {
            title: "Cache & Queue",
            role: "Redis",
            image: "/redis-logo-svgrepo-com.svg",
            desc: "In-memory cache bus for instant session validation, leaderboards, and message queues.",
          },
          {
            title: "Malware Scanning",
            role: "VirusTotal Scan Pipeline",
            image: "/virustotal.svg",
            desc: "Automated real-time attachment and file submission security checks.",
          },
          {
            title: "Object Storage",
            role: "MinIO S3",
            image: null,
            desc: "S3-compatible distributed storage for challenge files, proofs-of-concept, and assets.",
          },
          {
            title: "Search Service",
            role: "Meilisearch",
            image: "/Meilisearch.png",
            desc: "Sub-50ms typo-tolerant search across all public programs and technical write-ups.",
          },
          {
            title: "Notification Dispatch",
            role: "SMTP Service",
            image: "/smtp.png",
            desc: "Real-time event notification pipeline for report updates and security alerts.",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="rounded-2xl bg-card/90 p-5 shadow-md space-y-3 backdrop-blur-md"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {card.title}
            </span>
            <div className="flex items-center gap-3">
              {card.image && (
                <div className="relative h-8 w-16 shrink-0">
                  <Image
                    src={card.image}
                    alt={card.role}
                    fill
                    className="object-contain dark:invert-0"
                    sizes="64px"
                  />
                </div>
              )}
              <h4 className="text-sm font-bold text-foreground">{card.role}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
