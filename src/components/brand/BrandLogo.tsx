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
    ? "/devsolvewithouttext-lightmode.png"
    : "/devsolve-logo.png";
  const darkSrc = isIcon
    ? "/only-devsolve-logo-notext-darkmode.png"
    : "/devsolve-fulltext-logo-darkmode.png";

  return (
    <span
      className={cn("relative block", isIcon ? "size-10" : "h-10 w-36", className)}
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
