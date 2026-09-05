"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Highly optimized particle count: dense, sharp, and buttery-smooth 60 FPS
const PARTICLE_COUNT = 1400;
const RADIUS = 240;

// DevSolve brand color palette: blues, cyan, emerald, amber, and star highlights
const COLORS = [
  "#2563eb", // DevSolve Primary Blue
  "#3b82f6", // Sky Blue
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#60a5fa", // Light Blue
  "#f97316", // Warm Orange
  "#e0f2fe", // Star Highlight / Ice Blue
  "#ffffff", // Pure White
];

export default function ParticleSphereAnimation({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true, // Lowest latency rendering
    });
    if (!ctx) return;

    // Pre-allocated flat arrays to eliminate GC pressure completely
    const count = PARTICLE_COUNT;
    const origX = new Float32Array(count);
    const origY = new Float32Array(count);
    const origZ = new Float32Array(count);
    const rotX = new Float32Array(count);
    const rotY = new Float32Array(count);
    const rotZ = new Float32Array(count);
    const pointColor = new Array<string>(count);
    const indices = new Uint16Array(count);

    // Generate points uniformly on sphere using Archimedes' theorem
    for (let i = 0; i < count; i++) {
      indices[i] = i;
      const z = Math.random() * 2 - 1;
      const theta = Math.random() * 2 * Math.PI;
      const r_at_z = Math.sqrt(Math.max(0, 1 - z * z));
      const r = RADIUS * (0.97 + Math.random() * 0.06);

      origX[i] = r * r_at_z * Math.cos(theta);
      origY[i] = r * r_at_z * Math.sin(theta);
      origZ[i] = r * z;

      // Color distribution based on Y position + highlights
      const yFactor = (origY[i] + RADIUS) / (2 * RADIUS);
      if (Math.random() > 0.88) {
        pointColor[i] = COLORS[7]; // Star white
      } else if (yFactor > 0.58) {
        pointColor[i] = COLORS[Math.floor(Math.random() * 3)]; // Blues / Cyan
      } else if (yFactor < 0.38) {
        pointColor[i] = COLORS[3 + Math.floor(Math.random() * 3)]; // Emerald / Orange
      } else {
        pointColor[i] = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    }

    // High-DPI sizing
    const size = 520;
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let rotation = 0;
    let animId: number;
    let isVisible = true;

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return; // Skip work if scrolled out of view

      rotation += 0.0035;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      // Fast rotation computation (0 allocations)
      for (let i = 0; i < count; i++) {
        const ox = origX[i];
        const oz = origZ[i];
        rotX[i] = ox * cos - oz * sin;
        rotY[i] = origY[i];
        rotZ[i] = ox * sin + oz * cos;
      }

      // Fast depth sort using pre-allocated typed indices
      indices.sort((a, b) => rotZ[a] - rotZ[b]);

      ctx.clearRect(0, 0, size, size);

      const half = size / 2;
      const invRadius = 1 / (2 * RADIUS);

      // Render sorted particles
      for (let i = 0; i < count; i++) {
        const idx = indices[i];
        const px = rotX[idx] + half;
        const py = rotY[idx] + half;
        const pz = rotZ[idx];

        const scale = (pz + RADIUS) * invRadius;
        const dx = rotX[idx];
        const dy = rotY[idx];
        const dist = Math.sqrt(dx * dx + dy * dy);
        const rim = Math.min(dist / RADIUS, 1);

        const opacity = Math.max(0.12, rim * rim * rim * 0.85) * (0.35 + 0.65 * scale);
        const pSize = (0.5 + 0.9 * scale) * 1.6;

        ctx.globalAlpha = opacity;
        ctx.fillStyle = pointColor[idx];
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, 6.283185307179586); // 2 * Math.PI
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative mx-auto w-full flex items-center justify-center", className)}>
      <canvas
        ref={canvasRef}
        className="rounded-full select-none pointer-events-none w-full h-auto aspect-square max-w-[520px]"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
