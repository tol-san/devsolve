"use client";

import SectionBackdrop from "@/components/landing/SectionBackdrop";

export function PageBackdrop({
  seed = 0,
  gridSize = 88,
}: {
  seed?: number;
  gridSize?: number;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-background"
    >
      <SectionBackdrop seed={seed} gridSize={gridSize} />
    </div>
  );
}

export default PageBackdrop;
