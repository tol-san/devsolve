
import { COUNTRY_NAMES, COUNTRY_OPTIONS } from "./list";

export { COUNTRY_NAMES, COUNTRY_OPTIONS };

export type ResolvedCountry =
  | { kind: "code"; code: string; name: string }
  /** Free text we could not read as a code — shown as written, without a flag. */
  | { kind: "text"; text: string };

export function isCountryCode(value: string | null | undefined): boolean {
  if (!value) return false;
  const code = value.trim().toLowerCase();
  return code.length === 2 && code in COUNTRY_NAMES;
}

const displayNames: Intl.DisplayNames | undefined = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return undefined;
  }
})();

export function countryName(code: string): string | null {
  const key = code.trim().toLowerCase();
  if (!(key in COUNTRY_NAMES)) return null;

  try {
    const derived = displayNames?.of(key.toUpperCase());
    if (derived && derived.toLowerCase() !== key) return derived;
  } catch {
    /* Falls through to the table below. */
  }

  return COUNTRY_NAMES[key];
}

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

export function countryLabel(value: string | null | undefined): string | null {
  const resolved = resolveCountry(value);
  if (!resolved) return null;
  return resolved.kind === "code" ? resolved.name : resolved.text;
}

export function codeForCountryName(name: string | null | undefined): string | null {
  if (!name) return null;
  const needle = name.trim().toLowerCase();
  if (!needle) return null;

  const hit = COUNTRY_OPTIONS.find(
    (option) => option.name.toLowerCase() === needle,
  );
  return hit ? hit.code : null;
}
