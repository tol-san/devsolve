"use client";

import React, { useRef } from "react";
import SectionBackdrop from "@/components/landing/SectionBackdrop";
import { TeamTabContent } from "@/components/public-about/TeamTabContent";

export function TeamSection() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      id="team"
      ref={ref}
      className="relative overflow-hidden py-16 sm:py-24 border-t border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
    >
      <SectionBackdrop seed={5} gridSize={88} />

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-12">
        <TeamTabContent />
      </div>
    </section>
  );
}

export default TeamSection;
