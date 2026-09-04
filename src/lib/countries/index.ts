/**
 * Reading and writing the profile `country` field.
 *
 * **We store the ISO 3166-1 alpha-2 code, lowercased — `"kh"`, never
 * `"Cambodia"`.** Both the flag and the display name derive from the code, but
 * the code does not reliably derive from the name: our list spells things
 * "St. Kitts & Nevis" and "Trinidad & Tobago", so a reverse lookup against
 * anything a person or an older build wrote is guesswork.
 *
 * The backend does not validate this field — `UpdateUserProfileRequest` takes
 * up to 100 characters of free text and stores whatever it is given. So the
 * read path cannot assume it is getting a code back. Existing rows hold full
 * country names from before this change, and the profile editor offered a
 * free-text "Location / Country" box whose placeholder was
 * "e.g. San Francisco, USA or Remote" — so values like that genuinely exist.
 *
 * `resolveCountry` is the one place that decides what a stored value is.
 * Everything on screen goes through it, and it never throws: an unrecognised
 * value renders as its own text rather than taking a profile page down.
 */

import { COUNTRY_NAMES, COUNTRY_OPTIONS } from "./list";

export { COUNTRY_NAMES, COUNTRY_OPTIONS };

/** A stored value we recognised as a country code. */
export type ResolvedCountry =
  | { kind: "code"; code: string; name: string }
  /** Free text we could not read as a code — shown as written, without a flag. */
  | { kind: "text"; text: string };

/**
 * Whether a value is one of our codes.
 *
 * Two characters and present in the table. Length is checked first because
 * that is the rule that keeps "Cambodia" and "San Francisco, USA" out.
 */
export function isCountryCode(value: string | null | undefined): boolean {
  if (!value) return false;
  const code = value.trim().toLowerCase();
  return code.length === 2 && code in COUNTRY_NAMES;
}

/*
 * `Intl.DisplayNames` is built once, not per render: constructing one is not
 * free and a leaderboard renders fifty of these. Undefined where the runtime
 * lacks it, which is the case this falls back from.
 */
const displayNames: Intl.DisplayNames | undefined = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return undefined;
  }
})();

/**
 * The display name for a code.
 *
 * Derived at render time rather than stored alongside the code, so the name is
 * never duplicated in state and can follow the viewer's locale later — the
 * only change needed is passing that locale here instead of `"en"`.
 *
 * Falls back to the static table when `Intl.DisplayNames` is missing or does
 * not know the region, which is why the table carries names at all.
 */
export function countryName(code: string): string | null {
  const key = code.trim().toLowerCase();
  if (!(key in COUNTRY_NAMES)) return null;

  try {
    const derived = displayNames?.of(key.toUpperCase());
    /* An unknown region echoes the input back, which is not a name. */
    if (derived && derived.toLowerCase() !== key) return derived;
  } catch {
    /* Falls through to the table below. */
  }

  return COUNTRY_NAMES[key];
}

/**
 * What a stored `country` value actually is.
 *
 * The single entry point for the read path. Blank and whitespace-only values
 * are null — there is nothing to show — while anything non-empty that is not a
 * code comes back as text so it can still be displayed.
 */
export function resolveCountry(
  value: string | null | undefined,
): ResolvedCountry | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const code = trimmed.toLowerCase();
  if (code.length === 2 && code in COUNTRY_NAMES) {
    return { kind: "code", code, name: countryName(code) ?? COUNTRY_NAMES[code] };
  }

  return { kind: "text", text: trimmed };
}

/**
 * A best-effort name for a code, or the raw value when it is not one.
 *
 * For places that need a plain string — a `title` attribute, a search index, a
 * sort key — and cannot render a flag.
 */
export function countryLabel(value: string | null | undefined): string | null {
  const resolved = resolveCountry(value);
  if (!resolved) return null;
  return resolved.kind === "code" ? resolved.name : resolved.text;
}

/**
 * The code to store for a display name, if we can find one.
 *
 * Deliberately narrow: this exists for one-off migration of a legacy value a
 * person is re-saving, **not** as a general name→code path. It matches only an
 * exact (case-insensitive) hit against our own spellings, so "Saint Kitts and
 * Nevis" and "USA" return null rather than a confident guess.
 */
export function codeForCountryName(name: string | null | undefined): string | null {
  if (!name) return null;
  const needle = name.trim().toLowerCase();
  if (!needle) return null;

  const hit = COUNTRY_OPTIONS.find(
    (option) => option.name.toLowerCase() === needle,
  );
  return hit ? hit.code : null;
}
