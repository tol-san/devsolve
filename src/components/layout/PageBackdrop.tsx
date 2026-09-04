"use client";

import SectionBackdrop from "@/components/landing/SectionBackdrop";

export function PageBackdrop({
  seed = 0,
  gridSize = 88,
  cells = false,
}: {
  seed?: number;
  gridSize?: number;
  cells?: boolean;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-background"
    >
      <SectionBackdrop seed={seed} gridSize={gridSize} cells={cells} />
    </div>
  );
}

export default PageBackdrop;
