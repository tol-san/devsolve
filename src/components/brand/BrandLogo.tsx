"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The DevSolve lockup with seamless dynamic Light & Dark mode support.
 *
 * Fulltext variant:
 * - Light: `/devsolve-logo.png`
 * - Dark: `/devsolve-fulltext-logo-darkmode.png`
 *
 * Icon / Badge variant:
 * - Light: `/devsolvewithouttext-lightmode.png`
 * - Dark: `/only-devsolve-logo-notext-darkmode.png`
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
   * `lockup` is the bulb and wordmark side by side.
   * `badge` or `icon` is the standalone bulb mark.
   */
  variant?: "lockup" | "badge" | "icon";
  /** Where the artwork sits in that box. */
  align?: "left" | "center";
  priority?: boolean;
  sizes?: string;
}) {
  const isIcon = variant === "badge" || variant === "icon";

  const lightSrc = isIcon
    ? "/devsolvewithouttext-lightmode.png"
    : "/devsolve-logo.png";
  const darkSrc = isIcon
    ? "/only-devsolve-logo-notext-darkmode.png"
    : "/devsolve-fulltext-logo-darkmode.png";

  return (
    <span
      className={cn("relative block", isIcon ? "size-10" : "h-10 w-36", className)}
    >
      {/* Light Mode Logo */}
      <Image
        src={lightSrc}
        alt="DevSolve"
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "object-contain dark:hidden",
          align === "center" ? "object-center" : "object-left",
        )}
      />
      {/* Dark Mode Logo */}
      <Image
        src={darkSrc}
        alt="DevSolve"
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          "hidden object-contain dark:block",
          align === "center" ? "object-center" : "object-left",
        )}
      />
    </span>
  );
}

export default BrandLogo;
