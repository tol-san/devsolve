"use client";

"use client";

import { useEffect, useState } from "react";
import Globe from "@/components/originkit/ui/hero-24/globe";
import { useIsDark } from "@/components/landing/SectionBackdrop";

const ACCENT = "#2563EB";

const DOTS = { color: ACCENT, size: 5, density: 8, allDots: false };
const FILL_PARENT = { width: "100%", height: "100%" } as const;

export const MediaGlobe = ({ query }: { query: string }) => {
  const [matches, setMatches] = useState(false);
  const isDark = useIsDark();

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  if (!matches) return null;

  return (
    <Globe
      scale={9.7}
      stopOnHover
      initialLatitude={23}
      initialLongitude={-23}
      fill="dots"
      dots={DOTS}
      showOutline
      outlineColor={ACCENT}
      showGrid
      graticuleColor={ACCENT}
      oceanColor={isDark ? "#0A0A0A" : "#FFFFFF"}
      style={FILL_PARENT}
    />
  );
};
