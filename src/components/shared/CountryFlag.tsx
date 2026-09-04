"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

import { cn } from "@/lib/utils";

type CountryFlagProps = {
  /** ISO 3166-1 alpha-2, any casing. Anything else renders the placeholder. */
  code: string | null | undefined;
  /** Height in px; width follows the 4:3 ratio flagcdn serves. */
  size?: 12 | 14 | 18 | 24;
  className?: string;
};

/*
 * flagcdn serves fixed sizes, so the src and the 2x srcSet are picked from
 * this table rather than computed — an arbitrary size would 404.
 */
const SIZES: Record<number, { w: number; src: string; retina: string }> = {
  12: { w: 16, src: "16x12", retina: "32x24" },
  14: { w: 19, src: "20x15", retina: "40x30" },
  18: { w: 24, src: "24x18", retina: "48x36" },
  24: { w: 32, src: "32x24", retina: "64x48" },
};

/**
 * A country's flag as an image.
 *
 * **Images, not emoji.** Emoji flags are regional-indicator pairs that Windows
 * has no glyphs for, so `🇰🇭` renders as the bare letters "KH" for most of our
 * users — which looks like a bug and, next to a country name, reads as noise.
 *
 * `alt` is empty on purpose. Every caller renders the country name as text
 * beside the flag, so the image is decorative; giving it alt text would make a
 * screen reader announce the country twice.
 *
 * Not every code we can name has an image — `un`, `ta` and a few others are in
 * our list because the backend may already hold them. A missing one falls back
 * to a neutral glyph, because a broken-image icon on a profile page is worse
 * than no flag at all.
 */
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
    // tiny dimensions, and no layout shift to optimise away; next/image would
    // add a proxy hop per flag on a page that can render fifty of them.
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
