const COENG = "\u17D2";

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export function splitTextUnits(text: string): string[] {
  const clusters = segmenter
    ? Array.from(segmenter.segment(text), (piece) => piece.segment)
    : Array.from(text);

  const units: string[] = [];
  for (const cluster of clusters) {
    const previous = units.at(-1);
    if (previous !== undefined && previous.endsWith(COENG)) {
      units[units.length - 1] = previous + cluster;
    } else {
      units.push(cluster);
    }
  }
  return units;
}
