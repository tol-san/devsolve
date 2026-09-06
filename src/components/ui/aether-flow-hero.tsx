"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ShieldCheck, Code2, ArrowRight } from "lucide-react";
import { useLocale, useLocalePath, useT } from "@/lib/i18n/I18nProvider";
import { useIsDark } from "@/components/landing/SectionBackdrop";

export interface AetherFlowHeroProps {
  className?: string;
}

export function AetherFlowHero({ className = "" }: AetherFlowHeroProps) {
  const lp = useLocalePath();
  const locale = useLocale();
  const isKm = locale === "km";
  const t = useT();
  const isDarkTheme = useIsDark();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDarkRef = useRef<boolean>(isDarkTheme);

  useEffect(() => {
    isDarkRef.current = isDarkTheme;
  }, [isDarkTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const pointer: { x: number | null; y: number | null; radius: number } = {
      x: null,
      y: null,
      radius: 180,
    };

    // Live theme observer
    const updateThemeState = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };
    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      colorType: "primary" | "secondary" | "accent";

      constructor(
        x: number,
        y: number,
        directionX: number,
        directionY: number,
        size: number,
        colorType: "primary" | "secondary" | "accent"
      ) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.colorType = colorType;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);

        if (this.colorType === "accent") {
          // Cyber Emerald (#10B981)
          ctx.fillStyle = isDarkRef.current
            ? "rgba(52, 211, 153, 0.85)"
            : "rgba(16, 185, 129, 0.75)";
        } else if (this.colorType === "secondary") {
          // Dark Slate (#1E293B) / Slate-300
          ctx.fillStyle = isDarkRef.current
            ? "rgba(203, 213, 225, 0.65)"
            : "rgba(71, 85, 105, 0.55)";
        } else {
          // Electric Blue (#2563EB)
          ctx.fillStyle = isDarkRef.current
            ? "rgba(96, 165, 250, 0.85)"
            : "rgba(37, 99, 235, 0.75)";
        }
        ctx.fill();
      }

      update() {
        if (!canvas) return;
        if (this.x > canvas.width || this.x < 0) {
          this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.directionY = -this.directionY;
        }

        // Pointer deflection (supports both desktop mouse & mobile touch)
        if (pointer.x !== null && pointer.y !== null) {
          const dx = pointer.x - this.x;
          const dy = pointer.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < pointer.radius + this.size) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (pointer.radius - distance) / pointer.radius;
            this.x -= forceDirectionX * force * 3.6;
            this.y -= forceDirectionY * force * 3.6;
          }
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function init() {
      if (!canvas) return;
      particles = [];
      const numberOfParticles = Math.min(
        190,
        Math.max(60, Math.floor((canvas.height * canvas.width) / 7500))
      );
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 1.8 + 1.8;
        const x = Math.random() * (canvas.width - size * 4) + size * 2;
        const y = Math.random() * (canvas.height - size * 4) + size * 2;
        const directionX = Math.random() * 0.4 - 0.2;
        const directionY = Math.random() * 0.4 - 0.2;

        const rand = Math.random();
        const colorType: "primary" | "secondary" | "accent" =
          rand < 0.55 ? "primary" : rand < 0.8 ? "accent" : "secondary";

        particles.push(new Particle(x, y, directionX, directionY, size, colorType));
      }
    }

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || window.innerHeight;
      init();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const connect = () => {
      if (!ctx || !canvas) return;
      const maxDistance = 24000;
      const connectionCounts = new Uint8Array(particles.length);
      const MAX_CONNECTIONS_PER_PARTICLE = 5;

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          if (
            connectionCounts[a] >= MAX_CONNECTIONS_PER_PARTICLE ||
            connectionCounts[b] >= MAX_CONNECTIONS_PER_PARTICLE
          ) {
            continue;
          }

          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = dx * dx + dy * dy;

          if (distance < maxDistance) {
            connectionCounts[a]++;
            connectionCounts[b]++;

            const opacityValue = Math.max(0, 1 - distance / maxDistance);
            const isDark = isDarkRef.current;

            let isNearPointer = false;
            if (pointer.x !== null && pointer.y !== null) {
              const dxPointer = particles[a].x - pointer.x;
              const dyPointer = particles[a].y - pointer.y;
              isNearPointer =
                Math.sqrt(dxPointer * dxPointer + dyPointer * dyPointer) < pointer.radius;
            }

            if (isDark) {
              ctx.strokeStyle = isNearPointer
                ? `rgba(52, 211, 153, ${opacityValue * 0.7})`
                : `rgba(96, 165, 250, ${opacityValue * 0.38})`;
            } else {
              ctx.strokeStyle = isNearPointer
                ? `rgba(16, 185, 129, ${opacityValue * 0.58})`
                : `rgba(37, 99, 235, ${opacityValue * 0.28})`;
            }

            ctx.lineWidth = isNearPointer ? 1.35 : 0.95;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      if (isDarkRef.current) {
        ctx.fillStyle = "#090d16";
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    };

    // Mouse handlers (Desktop)
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const handleMouseOut = () => {
      pointer.x = null;
      pointer.y = null;
    };

    // Touch handlers (Mobile responsive)
    const handleTouchMove = (event: TouchEvent) => {
      if (!canvas || !event.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.touches[0].clientX - rect.left;
      pointer.y = event.touches[0].clientY - rect.top;
    };

    const handleTouchEnd = () => {
      pointer.x = null;
      pointer.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.12 + 0.05,
        duration: 0.5,
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <section
      className={`relative -mt-(--navbar-height) pt-(--navbar-height) min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#090d16] transition-colors duration-500 py-10 sm:py-0 ${className}`}
    >
      {/* Interactive primary + accent particle canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />

      {/* Atmospheric lighting blobs */}
      <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[380px] sm:h-[450px] w-[500px] sm:w-[650px] max-w-full rounded-full bg-blue-500/10 dark:bg-blue-500/14 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 h-[320px] sm:h-[380px] w-[420px] sm:w-[550px] max-w-full rounded-full bg-emerald-500/8 dark:bg-emerald-500/12 blur-[120px]" />

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 text-center select-none flex flex-col items-center">
        
        {/* Display Headline in Hackdaddy / KhBaphnom Font: Responsive Architecture */}
        <motion.h1
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="font-cyber font-normal uppercase select-none leading-[1.14] sm:leading-[1.26]"
        >
          {/* Mobile View: Vertical Stack with Consistent Font Size */}
          <div
            className="flex flex-col items-center justify-center gap-1 sm:hidden"
            style={{
              fontSize: isKm ? "clamp(20px, 5.8vw, 32px)" : "clamp(34px, 11vw, 54px)",
              lineHeight: isKm ? 1.35 : 1.2,
            }}
          >
            <span className="text-[#2563EB] dark:text-blue-400 drop-shadow-[0_0_24px_rgba(37,99,235,0.35)]">
              {t("hero.titleBounty") || "BUG BOUNTY"}
            </span>
            <span className="text-[#1E293B] dark:text-white px-2 text-center text-balance">
              {t("hero.titlePlatform") || "PLATFORM"}
            </span>
            <span className="text-[#10B981] dark:text-emerald-400 drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]">
              {t("hero.titleDev") || "DEVELOPER"}
            </span>
            {t("hero.titleCommunity") ? (
              <span className="text-[#1E293B] dark:text-white">
                {t("hero.titleCommunity")}
              </span>
            ) : null}
          </div>

          {/* PC / Desktop View: Original 2-Line Horizontal Layout */}
          <div
            className={
              isKm
                ? "hidden sm:flex sm:flex-col sm:items-center sm:text-2xl md:text-3xl lg:text-[2.6rem] xl:text-[3.1rem] leading-[1.32] max-w-5xl"
                : "hidden sm:flex sm:flex-col sm:items-center sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] leading-[1.24]"
            }
          >
            <div className="text-center">
              <span className="text-[#2563EB] dark:text-blue-400 drop-shadow-[0_0_24px_rgba(37,99,235,0.35)]">
                {t("hero.titleBounty") || "BUG BOUNTY"}
              </span>{" "}
              <span className="text-[#1E293B] dark:text-white">
                {t("hero.titlePlatform") || "PLATFORM"}
              </span>
            </div>
            <div className="mt-2 text-center">
              <span className="text-[#10B981] dark:text-emerald-400 drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]">
                {t("hero.titleDev") || "DEVELOPER"}
              </span>
              {t("hero.titleCommunity") ? (
                <>
                  {" "}
                  <span className="text-[#1E293B] dark:text-white">
                    {t("hero.titleCommunity")}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </motion.h1>

        {/* Subtitle explicitly uniting Bounty Hunters and Developers */}
        <motion.p
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-6 sm:mt-8 max-w-2xl px-2 sm:px-0 text-sm sm:text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300 font-normal text-balance tracking-normal"
        >
          {t("hero.subtitle") ||
            "DevSolve bridges security researchers and engineering teams — offering guaranteed bounty escrow for hunters, and verified code solutions for developers."}
        </motion.p>

        {/* Balanced Dual-Pillar Action System: Responsive full-width on mobile, side-by-side on desktop */}
        <motion.div
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-4 sm:px-0"
        >
          {/* Pillar 1: Bug Bounty Platform (Electric Blue PRIMARY) */}
          <Link
            href={lp("/programs")}
            className="group w-full max-w-xs sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm sm:text-base font-semibold text-white shadow-[0_10px_25px_-8px_rgba(37,99,235,0.75)] hover:shadow-[0_14px_30px_-8px_rgba(37,99,235,0.9)] hover:brightness-110 active:scale-[0.98] transition-all duration-200"
            style={{ backgroundColor: "#2563EB" }}
          >
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white shrink-0" />
            <span>{t("hero.explorePrograms") || "Explore Programs"}</span>
            <ArrowRight className="h-4 w-4 text-white/90 transition-transform group-hover:translate-x-0.5 shrink-0" />
          </Link>

          {/* Pillar 2: Developer Community (Cyber Emerald ACCENT) */}
          <Link
            href={lp("/community")}
            className="group w-full max-w-xs sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm sm:text-base font-semibold text-white shadow-[0_10px_25px_-8px_rgba(16,185,129,0.75)] hover:shadow-[0_14px_30px_-8px_rgba(16,185,129,0.9)] hover:brightness-110 active:scale-[0.98] transition-all duration-200"
            style={{ backgroundColor: "#10B981" }}
          >
            <Code2 className="h-4 w-4 sm:h-5 sm:w-5 text-white shrink-0 transition-transform group-hover:rotate-12" />
            <span>{t("hero.devCommunity") || "Developer Community"}</span>
            <ArrowRight className="h-4 w-4 text-white/90 transition-transform group-hover:translate-x-0.5 shrink-0" />
          </Link>
        </motion.div>

      </div>

      {/* Seamless bottom fade veil into the rest of the landing page */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 bg-linear-to-b from-transparent to-white dark:to-[#0A0A0A]" />
    </section>
  );
}

export default AetherFlowHero;
