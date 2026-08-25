"use client";

import SectionBackdrop from "@/components/landing/SectionBackdrop";

/**
 * The landing hero's backdrop, promoted to the whole app.
 *
 * Every route sits on the same surface the home page opens on — grid paper,
 * drifting colour fields, pulsing cells, scan beams and rising motes. The
 * layer is `fixed` rather than `absolute` on purpose: a page-length absolute
 * layer would stretch the aurora into invisibility and re-tile the grid per
 * route, whereas a viewport-sized one keeps the composition the hero has at
 * any scroll depth and any page height.
 *
 * `-z-10` puts it behind everything in the layout while still painting over
 * the canvas background propagated from `body`, so no page-level surface is
 * needed underneath. Anything that wants the texture to show through must
 * therefore *not* paint its own opaque page shell — cards and panels
 * (`bg-card`, `bg-background`) still read correctly on top of it.
 */
export function PageBackdrop({
  seed = 0,
  gridSize = 88,
}: {
  /** Seeds the deterministic cell and mote layout — vary it per shell. */
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
