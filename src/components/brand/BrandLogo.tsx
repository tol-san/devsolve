"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  variant = "lockup",
  align = "left",
  priority = false,
  sizes = "160px",
}: {
  className?: string;
  variant?: "lockup" | "badge" | "icon";
  align?: "left" | "center";
  priority?: boolean;
  sizes?: string;
}) {
  const isIcon = variant === "badge" || variant === "icon";

  const lightSrc = isIcon
    ? "/devsolve-icon.png"
    : "/devsolve-logo.png";
  const darkSrc = isIcon
    ? "/devsolve-icon.png"
    : "/devsolve-fulltext-logo-darkmode.png";

  return (
    <span
      className={cn("relative block", isIcon ? "size-11 sm:size-12" : "h-11 w-44 sm:h-12 sm:w-48", className)}
    >
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
