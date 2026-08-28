"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The DevSolve lockup — the same artwork in both themes.
 *
 * `devsolve-logo.png` is the full-detail lockup: the puzzle bulb, "Dev" in
 * navy and "Solve" in blue, on a transparent background. It is deliberately
 * used on dark surfaces too, rather than swapping in the white-wordmark file,
 * so the brand reads identically everywhere. The trade is contrast: that navy
 * sits at roughly 1.1:1 against a near-black surface, so on dark the blue half
 * of the wordmark carries the mark while the navy half recedes. If that ever
 * needs fixing, the fix is a light plate behind it — not a second file, which
 * is what made the two themes disagree in the first place.
 *
 * No theme branch also means no hydration dance: one `src`, server and client
 * agreeing on the first frame.
 *
 * Sized by the caller through `className`. The box is fixed and the artwork is
 * contained inside it, so nothing around it moves.
 */
export function BrandLogo({
  className,
  variant = "lockup",
  align = "left",
  priority = false,
  sizes = "160px",
}: {
  /** The box. Give it a height and a width; defaults to a small header size. */
  className?: string;
  /**
   * `lockup` is the bulb and wordmark side by side, and takes the theme pair.
   * `badge` is the circular mark, which carries its own light disc and so is
   * one file on either surface — for square slots the lockup would only be
   * letterboxed into.
   */
  variant?: "lockup" | "badge";
  /** Where the artwork sits in that box. */
  align?: "left" | "center";
  priority?: boolean;
  sizes?: string;
}) {
  const badge = variant === "badge";

  return (
    <span
      className={cn("relative block", badge ? "size-10" : "h-10 w-36", className)}
    >
      <Image
        src={badge ? "/devsolve.png" : "/devsolve-logo.png"}
        alt="DevSolve"
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "object-contain",
          align === "center" ? "object-center" : "object-left",
        )}
      />
    </span>
  );
}

export default BrandLogo;
