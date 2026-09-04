"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import { cn } from "@/lib/utils";

export interface AnimatedWaveProps {
  className?: string;
  colorFrom?: string;
  colorTo?: string;
  speed?: number;
  amplitude?: number;
  wireframe?: boolean;
  showParticles?: boolean;
  particleSize?: number;
  resolution?: number;
  mouseInteraction?: boolean;
  backgroundColor?: string;
  opacity?: number;
  cameraX?: number;
  cameraY?: number;
  cameraZ?: number;
}

const createCircleTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
  }
  return new THREE.CanvasTexture(canvas);
};

export const AnimatedWave: React.FC<AnimatedWaveProps> = ({
  className,
  colorFrom = "#6366f1", // indigo
  colorTo = "#06b6d4",   // cyan
  speed = 0.8,
  amplitude = 25,
  wireframe = true,
  showParticles = true,
  particleSize = 5,
  resolution = 70,
  mouseInteraction = true,
  backgroundColor = "transparent",
  opacity = 0.6,
  cameraX = 0,
  cameraY = 160,
  cameraZ = 250,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        precision: "mediump",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.error("WebGL initialization failed", e);
      setWebGLFailed(true);
      return;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8, 1000);
    pointLight.position.set(0, 300, 200);
    scene.add(pointLight);

    const gridSize = resolution;
    const gridSpacing = 45;

    const geometry = new THREE.BufferGeometry();
    const count = gridSize * gridSize;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cFrom = new THREE.Color(colorFrom);
    const cTo = new THREE.Color(colorTo);

    let index = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const posX = (x - gridSize / 2) * gridSpacing;
        const posZ = (y - gridSize / 2) * gridSpacing;

        positions[index] = posX;
        positions[index + 1] = 0;
        positions[index + 2] = posZ;

        const t = x / gridSize;
        const mixedColor = new THREE.Color().lerpColors(cFrom, cTo, t);
        colors[index] = mixedColor.r;
        colors[index + 1] = mixedColor.g;
        colors[index + 2] = mixedColor.b;

        index += 3;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    let lineSegments: THREE.LineSegments | null = null;
    if (wireframe) {
      const indices: number[] = [];
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const currentIdx = x * gridSize + y;
          if (x < gridSize - 1) {
            indices.push(currentIdx, (x + 1) * gridSize + y);
          }
          if (y < gridSize - 1) {
            indices.push(currentIdx, x * gridSize + (y + 1));
          }
        }
      }
      geometry.setIndex(indices);

      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: opacity * 0.4,
        blending: THREE.NormalBlending,
      });
      lineSegments = new THREE.LineSegments(geometry, lineMaterial);
      scene.add(lineSegments);
    }

    let points: THREE.Points | null = null;
    if (showParticles) {
      const pointsMaterial = new THREE.PointsMaterial({
        size: particleSize,
        vertexColors: true,
        transparent: true,
        opacity: opacity,
        sizeAttenuation: true,
        map: createCircleTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      points = new THREE.Points(geometry, pointsMaterial);
      scene.add(points);
    }

    const noise2D = createNoise2D();
    const clock = new THREE.Timer();

    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const planeXZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      mouse.x = (mouseX / rect.width) * 2 - 1;
      mouse.y = -(mouseY / rect.height) * 2 + 1;
    };

    if (mouseInteraction) {
      container.addEventListener("mousemove", onMouseMove);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    const targetCamera = new THREE.Vector3(cameraX, cameraY, cameraZ);

    let animationFrameId: number;
    const animate = () => {
      clock.update();
      const time = clock.getElapsed() * speed;

      if (mouseInteraction) {
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(planeXZ, targetMouse);
        
        targetCamera.x = cameraX + mouse.x * 90;
        targetCamera.y = cameraY + mouse.y * 50;
        camera.position.x += (targetCamera.x - camera.position.x) * 0.05;
        camera.position.y += (targetCamera.y - camera.position.y) * 0.05;
        camera.lookAt(0, -30, 0);
      }

      const posArray = geometry.attributes.position.array as Float32Array;
      let idx = 0;
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const posX = posArray[idx];
          const posZ = posArray[idx + 2];

          const n1 = noise2D(posX * 0.0004, posZ * 0.0004 + time) * amplitude;
          const n2 = Math.sin(posX * 0.001 + time * 2) * Math.cos(posZ * 0.001 + time) * (amplitude * 0.4);
          let height = n1 + n2;

          if (mouseInteraction) {
            const dx = posX - targetMouse.x;
            const dz = posZ - targetMouse.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 280) {
              const rippleFactor = (1 - dist / 280);
              height += Math.sin(dist * 0.04 - time * 6) * (amplitude * 1.5) * rippleFactor;
            }
          }

          posArray[idx + 1] = height;
          idx += 3;
        }
      }

      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (mouseInteraction) {
        container.removeEventListener("mousemove", onMouseMove);
      }
      
      geometry.dispose();
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    colorFrom,
    colorTo,
    speed,
    amplitude,
    wireframe,
    showParticles,
    particleSize,
    resolution,
    mouseInteraction,
    opacity,
    cameraX,
    cameraY,
    cameraZ,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full z-0 overflow-hidden select-none",
        !mouseInteraction && "pointer-events-none",
        className
      )}
      style={{ backgroundColor }}
    >
      {webGLFailed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-background/90 text-foreground z-20">
          <p className="text-sm font-semibold">🚫 WebGL Support Required</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Unable to render the 3D animated wave. Please enable hardware acceleration in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimatedWave;