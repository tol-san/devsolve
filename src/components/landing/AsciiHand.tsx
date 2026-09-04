"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

const FIELD_W = 560;
const FIELD_H = 300;
const COLS = 190;
const ROWS = 61;
const CELL_W = FIELD_W / COLS;
const CELL_H = FIELD_H / ROWS;

const RAMP = ".:-=+*#%@";

const len = (x: number, y: number) => Math.sqrt(x * x + y * y);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const RAD = Math.PI / 180;

const BLEND = 7;

type Part = {
  kind: 0 | 1;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  ra: number;
  rb: number;
  framed: boolean;
  cx: number;
  cy: number;
  cr: number;
};

type Builder = {
  bone: (
    ax: number,
    ay: number,
    bx: number,
    by: number,
    ra: number,
    rb: number,
    framed?: boolean,
  ) => void;
  ball: (x: number, y: number, r: number) => void;
  chain: (pts: [number, number][], radii: number[]) => void;
};

function buildHand(build: (b: Builder) => void): Part[] {
  const parts: Part[] = [];

  const push = (
    kind: 0 | 1,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    ra: number,
    rb: number,
    framed: boolean,
  ) =>
    parts.push({
      kind,
      ax,
      ay,
      bx,
      by,
      ra,
      rb,
      framed,
      cx: (ax + bx) / 2,
      cy: (ay + by) / 2,
      cr: len(bx - ax, by - ay) / 2 + Math.max(ra, rb),
    });

  const bone: Builder["bone"] = (ax, ay, bx, by, ra, rb, framed = true) =>
    push(0, ax, ay, bx, by, ra, rb, framed);
  const ball: Builder["ball"] = (x, y, r) => push(1, x, y, x, y, r, r, true);
  const chain: Builder["chain"] = (pts, radii) => {
    ball(pts[0][0], pts[0][1], radii[0] * 1.04); 
    for (let i = 0; i < pts.length - 1; i++) {
      bone(
        pts[i][0],
        pts[i][1],
        pts[i + 1][0],
        pts[i + 1][1],
        radii[i],
        radii[i + 1],
      );
      if (i < pts.length - 2) {
        ball(pts[i + 1][0], pts[i + 1][1], radii[i + 1] * 1.06);
      }
    }
    const tip = pts[pts.length - 1];
    ball(tip[0], tip[1], radii[radii.length - 1] * 0.92); 
  };

  build({ bone, ball, chain });
  return parts;
}

const ADAM = buildHand(({ bone, ball, chain }) => {
  bone(-128, 62, -66, 8, 36, 30, false); 
  bone(-66, 8, -22, 16, 33, 29); 
  bone(-22, 16, 50, 30, 29, 24); 
  chain(
    [
      [56, 20],
      [112, 28],
      [154, 34],
      [184, 40],
    ],
    [11.5, 10.5, 9, 6.8],
  ); 
  chain(
    [
      [54, 33],
      [108, 45],
      [144, 57],
      [164, 70],
    ],
    [11.5, 10.5, 9, 7],
  ); 
  chain(
    [
      [48, 45],
      [96, 60],
      [124, 75],
      [138, 88],
    ],
    [10.5, 9.5, 8, 6.5],
  ); 
  chain(
    [
      [40, 55],
      [78, 70],
      [100, 83],
      [110, 94],
    ],
    [9, 8, 7, 5.5],
  ); 
  ball(-8, -4, 17);
  chain(
    [
      [-8, -4],
      [32, -16],
      [66, -20],
      [88, -16],
    ],
    [17, 13.5, 11, 8.5],
  ); 
});

const GOD = buildHand(({ bone, ball, chain }) => {
  bone(-128, 44, -64, 2, 37, 31, false);
  bone(-64, 2, -20, 3, 34, 30);
  bone(-20, 3, 48, 10, 30, 25);
  chain(
    [
      [54, 2],
      [110, -2],
      [152, 3],
      [182, 10],
    ],
    [11.5, 10.5, 9, 6.5],
  ); 
  chain(
    [
      [52, 17],
      [102, 27],
      [130, 46],
      [134, 64],
    ],
    [11.5, 10, 8.5, 7],
  ); 
  chain(
    [
      [46, 29],
      [90, 43],
      [108, 62],
      [101, 76],
    ],
    [10.5, 9, 8, 6.5],
  ); 
  chain(
    [
      [38, 39],
      [74, 53],
      [86, 70],
      [75, 80],
    ],
    [9, 8, 7, 5.5],
  ); 
  ball(-6, -14, 17);
  chain(
    [
      [-6, -14],
      [34, -32],
      [70, -40],
      [94, -38],
    ],
    [17, 13.5, 11, 8.5],
  ); 
});

function renderPose(parts: Part[], tiltDeg: number) {
  const rot = tiltDeg * RAD;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);

  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of parts) {
    if (!p.framed) continue;
    const ends: [number, number, number][] =
      p.kind === 1
        ? [[p.ax, p.ay, p.ra]]
        : [
            [p.ax, p.ay, p.ra],
            [p.bx, p.by, p.rb],
          ];
    for (const [ex, ey, r] of ends) {
      const rx = ex * cosR - ey * sinR;
      const ry = ex * sinR + ey * cosR;
      if (rx - r < x0) x0 = rx - r;
      if (rx + r > x1) x1 = rx + r;
      if (ry - r < y0) y0 = ry - r;
      if (ry + r > y1) y1 = ry + r;
    }
  }
  const tx0 = FIELD_W * 0.24;
  const tx1 = FIELD_W * 0.99;
  const ty0 = FIELD_H * 0.06;
  const ty1 = FIELD_H * 0.94;
  const s = Math.min((tx1 - tx0) / (x1 - x0), (ty1 - ty0) / (y1 - y0));
  const tx = (tx0 + tx1) / 2 - ((x0 + x1) / 2) * s;
  const ty = (ty0 + ty1) / 2 - ((y0 + y1) / 2) * s;

  const lightX = -0.5 * cosR + -0.76 * sinR;
  const lightY = 0.5 * sinR + -0.76 * cosR;
  const lightZ = 0.41;

  const sd = new Float64Array(parts.length);
  const sx = new Float64Array(parts.length);
  const sy = new Float64Array(parts.length);

  const ink = (worldX: number, worldY: number) => {
    const ddx = (worldX - tx) / s;
    const ddy = (worldY - ty) / s;
    const x = ddx * cosR + ddy * sinR;
    const y = -ddx * sinR + ddy * cosR;

    let d = Infinity;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const gx = x - p.cx;
      const gy = y - p.cy;
      const reach = d + BLEND + p.cr;
      if (reach > 0 && gx * gx + gy * gy > reach * reach) {
        sd[i] = Infinity;
        continue;
      }
      if (p.kind === 1) {
        const ox = x - p.ax;
        const oy = y - p.ay;
        sd[i] = len(ox, oy) - p.ra;
        sx[i] = ox / p.ra;
        sy[i] = oy / p.ra;
      } else {
        const bax = p.bx - p.ax;
        const bay = p.by - p.ay;
        const pax = x - p.ax;
        const pay = y - p.ay;
        const t = clamp01((pax * bax + pay * bay) / (bax * bax + bay * bay));
        const ox = pax - bax * t;
        const oy = pay - bay * t;
        const r = p.ra + (p.rb - p.ra) * t;
        sd[i] = len(ox, oy) - r;
        sx[i] = ox / r;
        sy[i] = oy / r;
      }
      if (sd[i] < d) d = sd[i];
    }

    let nx = 0;
    let ny = 0;
    let wsum = 0;
    for (let i = 0; i < parts.length; i++) {
      const w = 1 - (sd[i] - d) / BLEND;
      if (w <= 0) continue;
      const ww = w * w;
      nx += sx[i] * ww;
      ny += sy[i] * ww;
      wsum += ww;
    }
    if (wsum > 0) {
      nx /= wsum;
      ny /= wsum;
    }

    const flat = nx * nx + ny * ny;
    const z = Math.sqrt(flat < 1 ? 1 - flat : 0);
    const lambert = nx * lightX + ny * lightY + z * lightZ;
    const lit = lambert > 0 ? lambert : 0;

    let tone = clamp01(0.94 - lit * 0.72);
    tone = tone * (0.72 + 0.28 * Math.sqrt(tone)); 

    const depth = -d * s; 
    tone = clamp01(tone + (1 - clamp01(depth / 9)) * 0.3);
    const cover = clamp01(depth / 7 + 0.5);
    const u = clamp01((worldX - 45) / 155);
    const enter = u * u * (3 - 2 * u);

    return cover * tone * enter;
  };

  const hash = (cx: number, cy: number) => {
    let h = (cx * 374761393 + cy * 668265263) | 0;
    h = (h ^ (h >> 13)) | 0;
    h = Math.imul(h, 1274126177) | 0;
    return ((h ^ (h >> 16)) >>> 0) / 4294967296;
  };

  const rows: { line: string; i: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    const y = (r + 0.5) * CELL_H;
    let line = "";
    for (let c = 0; c < COLS; c++) {
      const v = ink((c + 0.5) * CELL_W, y);
      if (v < 0.06 || v < hash(c, r) * 0.3) {
        line += " ";
        continue;
      }
      const step = Math.floor(v * RAMP.length);
      line += RAMP[step < RAMP.length ? step : RAMP.length - 1];
    }
    if (line.trim().length > 0) rows.push({ line, i: r });
  }
  return rows;
}

const POSES = {
  adam: renderPose(ADAM, 6),
  god: renderPose(GOD, -4),
};

export type HandPose = keyof typeof POSES;

export function AsciiHand({
  pose,
  flip = false,
  className = "",
  delay = 0,
}: {
  pose: HandPose;
  flip?: boolean;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox={`0 0 ${FIELD_W} ${FIELD_H}`}
      className={className}
      preserveAspectRatio={flip ? "xMaxYMid meet" : "xMinYMid meet"}
      aria-hidden="true"
      focusable="false"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        reduce ? { duration: 0 } : { duration: 1.6, delay, ease: "easeOut" }
      }
    >
      <g
        transform={flip ? `translate(${FIELD_W} 0) scale(-1 1)` : undefined}
        fill="currentColor"
      >
        {POSES[pose].map(({ line, i }) => (
          <text
            key={i}
            x={0}
            y={(i + 0.78) * CELL_H}
            textLength={FIELD_W}
            lengthAdjust="spacing"
            fontSize={CELL_H * 1.05}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            xmlSpace="preserve"
          >
            {line}
          </text>
        ))}
      </g>
    </motion.svg>
  );
}

export default AsciiHand;
