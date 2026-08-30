"use client";

import createGlobe, { type COBEOptions } from "cobe";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface GlobeProps {
  className?: string;
  config?: Partial<COBEOptions>;
}

export function Globe({ className, config }: GlobeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 200);
    }
  };

  useEffect(() => {
    let width = 0;
    let phi = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    const defaultConfig: COBEOptions = {
      devicePixelRatio: 2,
      width: (width || 600) * 2,
      height: (width || 600) * 2,
      phi: 0,
      theta: 0.25,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: isDark ? 6 : 1.2,
      baseColor: isDark ? [0.2, 0.25, 0.35] : [0.94, 0.96, 0.99],
      markerColor: [37 / 255, 99 / 255, 235 / 255],
      glowColor: isDark ? [0.15, 0.3, 0.7] : [0.85, 0.92, 1],
      markers: [
        // Global tech and security hubs
        { location: [37.7749, -122.4194], size: 0.08 }, // San Francisco
        { location: [40.7128, -74.006], size: 0.08 }, // New York
        { location: [51.5074, -0.1278], size: 0.08 }, // London
        { location: [11.5564, 104.9282], size: 0.1 }, // Phnom Penh
        { location: [1.3521, 103.8198], size: 0.08 }, // Singapore
        { location: [35.6762, 139.6503], size: 0.07 }, // Tokyo
        { location: [52.52, 13.405], size: 0.06 }, // Berlin
        { location: [-33.8688, 151.2093], size: 0.07 }, // Sydney
        { location: [28.6139, 77.209], size: 0.08 }, // New Delhi
        { location: [25.2048, 55.2708], size: 0.06 }, // Dubai
      ],
      ...config,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.0035;
        }
        state.phi = phi + r;
        state.width = (width || 600) * 2;
        state.height = (width || 600) * 2;
        config?.onRender?.(state);
      },
    };

    const globe = createGlobe(canvasRef.current, defaultConfig);

    canvasRef.current.style.opacity = "1";

    return () => {
      window.removeEventListener("resize", onResize);
      globe.destroy();
    };
  }, [isDark, r, config]);

  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[650px]",
        className,
      )}
    >
      <canvas
        className="size-full opacity-0 transition-opacity duration-700 [contain:layout_paint_size] cursor-grab"
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}

export default Globe;
