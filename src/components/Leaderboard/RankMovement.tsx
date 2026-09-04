"use client";

import { ArrowDown, ArrowUp, Minus, Sparkle } from "lucide-react";
import { rankDelta } from "./leaderboard-ui";

type Tone = "light" | "dark";

const INK: Record<Tone, { up: string; down: string; flat: string; fresh: string }> = {
  light: {
    up: "text-emerald-700",
    down: "text-rose-700",
    flat: "text-muted-foreground",
    fresh: "text-blue-700",
  },
  dark: {
    up: "text-emerald-300",
    down: "text-rose-300",
    flat: "text-muted-foreground",
    fresh: "text-blue-300",
  },
};

export default function RankMovement({
  rank,
  previousRank,
  tone = "light",
  className = "",
}: {
  rank: number;
  previousRank: number | null;
  tone?: Tone;
  className?: string;
}) {
  const delta = rankDelta(rank, previousRank);
  const ink = INK[tone];

  if (delta.direction === "new") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${ink.flat} ${className}`}
      >
        <Sparkle className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">Previous rank unavailable</span>
        <span aria-hidden>--</span>
      </span>
    );
  }

  if (delta.direction === "flat") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${ink.flat} ${className}`}
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">No change in rank</span>
        <span aria-hidden>0</span>
      </span>
    );
  }

  const up = delta.direction === "up";
  const Icon = up ? ArrowUp : ArrowDown;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        up ? ink.up : ink.down
      } ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      {delta.value}
      <span className="sr-only"> places</span>
    </span>
  );
}
