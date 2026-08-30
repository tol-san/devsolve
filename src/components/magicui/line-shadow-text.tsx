"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface LineShadowTextProps
  extends React.ComponentPropsWithoutRef<"span"> {
  shadowColor?: string;
  as?: "span" | "div" | "h1" | "h2" | "h3" | "p";
}

export function LineShadowText({
  children,
  shadowColor = "currentColor",
  className,
  as: Component = "span",
  ...props
}: LineShadowTextProps) {
  const content = typeof children === "string" ? children : String(children || "");

  const MotionComponent = (motion as Record<string, any>)[Component] || motion.span;

  return (
    <MotionComponent
      style={
        {
          "--shadow-color": shadowColor,
          ...props.style,
        } as React.CSSProperties
      }
      className={cn(
        "relative z-0 inline-flex",
        "after:absolute after:left-[0.06em] after:top-[0.06em] after:-z-10",
        "after:bg-[linear-gradient(45deg,transparent_45%,var(--shadow-color)_45%,var(--shadow-color)_55%,transparent_0)]",
        "after:bg-[length:0.08em_0.08em] after:bg-clip-text after:text-transparent",
        "after:content-[attr(data-text)]",
        "after:animate-line-shadow",
        className
      )}
      data-text={content}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

export default LineShadowText;
