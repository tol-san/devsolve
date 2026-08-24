/** KHMER SIGN COENG — invisible, and stacks the consonant after it beneath
 *  the one before it. */
const COENG = "\u17D2";

/* Built once. A Segmenter is not cheap to construct, and the rules it applies
   are the same for every string on the page. */
const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

/**
 * Splits text into the smallest pieces a per-character animation can move
 * without breaking the writing system.
 *
 * Not code points. `Array.from("រង្វាន់")` returns the base consonants and
 * every mark that belongs to them as separate items — the stacker, the vowel,
 * the diacritic — and giving each its own `inline-block` box stops the browser
 * from shaping them together. Khmer then renders as loose letters and dotted
 * circles instead of words. Latin never shows this, because a Latin letter is
 * already a whole cluster, which is why it only surfaces once the page is
 * translated.
 *
 * Grapheme clusters get most of the way and keep emoji and combining accents
 * whole too. Khmer needs one rule on top: UAX #29 closes a cluster *after*
 * COENG, leaving the consonant it carries to open the next one, so `ង្` and
 * `វា` would still be pulled apart. A piece ending in COENG therefore absorbs
 * the one after it, as often as the stack repeats — `ស្ត្រី` stays a single
 * unit.
 */
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
