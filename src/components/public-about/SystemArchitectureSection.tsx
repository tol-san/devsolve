"use client";

import React, { useRef } from "react";
import SectionBackdrop from "@/components/landing/SectionBackdrop";
import { SystemArchitectureDiagram } from "@/components/public-about/SystemArchitectureDiagram";

export function SystemArchitectureSection() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      id="architecture"
      ref={ref}
      className="relative overflow-hidden py-16 sm:py-24 border-t border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
    >
      <SectionBackdrop seed={4} gridSize={88} />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <SystemArchitectureDiagram />
      </div>
    </section>
  );
}

export default SystemArchitectureSection;
