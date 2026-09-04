"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";

type CountryFlagProps = {
  code: string | null | undefined;
  size?: 12 | 14 | 18 | 24;
  className?: string;
};

const SIZES: Record<number, { w: number; src: string; retina: string }> = {
  12: { w: 16, src: "16x12", retina: "32x24" },
  14: { w: 19, src: "20x15", retina: "40x30" },
  18: { w: 24, src: "24x18", retina: "48x36" },
  24: { w: 32, src: "32x24", retina: "64x48" },
};

export function CountryFlag({ code, size = 14, className }: CountryFlagProps) {
  const [failed, setFailed] = useState(false);

  const normalized = code?.trim().toLowerCase() ?? "";
  const usable = /^[a-z]{2}$/.test(normalized);
  const { w, src, retina } = SIZES[size] ?? SIZES[14];

  if (!usable || failed) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-2xs border border-border bg-muted text-muted-foreground",
          className,
        )}
        style={{ width: w, height: size }}
      >
        <Flag style={{ width: size - 5, height: size - 5 }} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote CDN, fixed
    <img
      src={`https://flagcdn.com/${src}/${normalized}.png`}
      srcSet={`https://flagcdn.com/${retina}/${normalized}.png 2x`}
      width={w}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn(
        "inline-block shrink-0 rounded-2xs border border-border object-cover",
        className,
      )}
    />
  );
}

export default CountryFlag;
