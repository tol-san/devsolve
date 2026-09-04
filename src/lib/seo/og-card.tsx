import { ImageResponse } from "next/og";
import { SITE_NAME } from "./site";
import { truncate } from "./text";

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_CONTENT_TYPE = "image/png";

const BRAND = {
  background: "#0B1120",
  panel: "#111C33",
  accent: "#3B82F6",
  accentSoft: "#1D4ED8",
  text: "#F8FAFC",
  muted: "#94A3B8",
  border: "#1E293B",
};

export interface OgCardInput {
  eyebrow?: string;
  title: string;
  description?: string;
  chips?: string[];
  footnote?: string;
}

function titleSize(title: string): number {
  if (title.length > 90) return 54;
  if (title.length > 55) return 64;
  return 76;
}

export function ogCard({
  eyebrow,
  title,
  description,
  chips = [],
  footnote,
}: OgCardInput) {
  const headline = truncate(title, 120);
  const blurb = description ? truncate(description, 160) : undefined;
  const visibleChips = chips.filter(Boolean).slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BRAND.background,
          backgroundImage: `radial-gradient(900px 400px at 88% -10%, ${BRAND.accentSoft}55, transparent), radial-gradient(700px 400px at 0% 110%, ${BRAND.panel}, transparent)`,
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            backgroundColor: BRAND.accent,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: BRAND.accent,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 32,
                  height: 4,
                  backgroundColor: BRAND.accent,
                }}
              />
              {truncate(eyebrow, 48)}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              fontSize: titleSize(headline),
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -1.5,
              color: BRAND.text,
            }}
          >
            {headline}
          </div>

          {blurb ? (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.4,
                color: BRAND.muted,
              }}
            >
              {blurb}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {visibleChips.length ? (
            <div style={{ display: "flex", gap: 12 }}>
              {visibleChips.map((chip) => (
                <div
                  key={chip}
                  style={{
                    display: "flex",
                    padding: "10px 22px",
                    borderRadius: 999,
                    border: `2px solid ${BRAND.border}`,
                    backgroundColor: BRAND.panel,
                    fontSize: 24,
                    color: BRAND.muted,
                  }}
                >
                  {truncate(chip, 28)}
                </div>
              ))}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `2px solid ${BRAND.border}`,
              paddingTop: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 30,
                fontWeight: 800,
                color: BRAND.text,
              }}
            >
              {SITE_NAME}
              <div
                style={{
                  display: "flex",
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  backgroundColor: BRAND.accent,
                }}
              />
            </div>

            {footnote ? (
              <div style={{ display: "flex", fontSize: 26, color: BRAND.muted }}>
                {truncate(footnote, 60)}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
