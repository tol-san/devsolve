import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { describe } from "./text";

// Truncate at grapheme boundaries so Khmer vowel signs stay with their base.
function clip(text: string, limit: number) {
  const parts = Array.from(new Intl.Segmenter("km", { granularity: "grapheme" }).segment(text), p => p.segment);
  return parts.length > limit ? `${parts.slice(0, limit - 1).join("")}…` : text;
}

interface ContentCardInput {
  title: string;
  description?: string;
  label: string;
  author?: { name?: string; username?: string };
}

export async function contentCard(input: ContentCardInput) {
  const font = await readFile(join(process.cwd(), "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"));
  const title = clip(input.title, 100);
  const description = clip(describe(input.description, "", 240), 135);
  const author = input.author || {};
  const category = clip(input.label, 30);
  // ImageResponse does not shape Khmer conjuncts. Pango/HarfBuzz in Sharp
  // shapes the bundled font before the text is placed in the card.
  async function text(value: string, size: number, width: number, height: number, color = "#171717") {
    if (!/[\u1780-\u17ff\u19e0-\u19ff]/.test(value)) return value;
    const escaped = value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const { data, info } = await sharp({ text: {
      text: `<span foreground="${color}">${escaped}</span>`, font: `Angkor ${size}`,
      fontfile: join(process.cwd(), "public/fonts/Angkor-Regular.ttf"),
      width, wrap: "word-char", rgba: true,
    } }).resize({ width, height, fit: "inside", withoutEnlargement: true }).png().toBuffer({ resolveWithObject: true });
    // Local PNG data, with no user-controlled HTML or remote image requests.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`data:image/png;base64,${data.toString("base64")}`} width={info.width} height={info.height} alt="" />;
  }
  const [titleText, descriptionText, categoryText, authorText, usernameText] = await Promise.all([
    text(title, 48, 1038, 210), text(description, 22, 1038, 80, "#666666"),
    text(category, 20, 440, 50, "#4d4d4d"), text(clip(author.name || "", 40), 22, 750, 42),
    text(`@${clip(author.username || "", 36)}`, 18, 750, 30, "#666666"),
  ]);
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#fafafa", padding: 32, fontFamily: "Geist", color: "#171717" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", background: "white", border: "1px solid #ebebeb", borderRadius: 28, padding: "40px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 700 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, background: "#2563eb", color: "white", fontSize: 25 }}>D</div>
            DevSolve
          </div>
          <div style={{ display: "flex", border: "1px solid #ebebeb", borderRadius: 12, padding: "10px 18px", fontSize: 20, color: "#4d4d4d" }}>{categoryText}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: title.length > 100 ? 44 : title.length > 65 ? 50 : 60, lineHeight: 1.25, fontWeight: 700, wordBreak: "break-word" }}>{titleText}</div>
          {description ? <div style={{ display: "flex", fontSize: 23, lineHeight: 1.55, color: "#666666" }}>{descriptionText}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #ebebeb", paddingTop: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {author.name ? <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>{authorText}</div> : null}
            {author.username ? <div style={{ display: "flex", fontSize: 18, color: "#666666" }}>{usernameText}</div> : null}
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#666666" }}>devsolve.app</div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts: [{ name: "Geist", data: font, weight: 400, style: "normal" }], headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
  );
}
