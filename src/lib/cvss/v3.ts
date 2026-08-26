/**
 * CVSS v3.1 base metrics — scoring, parsing and formatting.
 *
 * Implemented from the specification (CVSS v3.1 §7.1, Equations 1–4) rather
 * than pulled in as a dependency: the whole file is a dozen lookups and four
 * equations, and the backend rejects a vector whose score disagrees with it,
 * so the arithmetic has to be exactly right rather than approximately right.
 *
 * Only the Base group is modelled. Temporal and Environmental metrics change
 * the score a triager would compute, not the one a reporter is asked for, and
 * the API's `cvssVector` is documented as a base vector.
 */

export const CVSS_VERSIONS = ["CVSS:3.1", "CVSS:3.0"] as const;
export type CvssVersion = (typeof CVSS_VERSIONS)[number];

/** The eight base metrics, in the order the specification prints them. */
export const CVSS_METRIC_ORDER = [
  "AV",
  "AC",
  "PR",
  "UI",
  "S",
  "C",
  "I",
  "A",
] as const;

export type CvssMetric = (typeof CVSS_METRIC_ORDER)[number];

export interface CvssOption {
  value: string;
  label: string;
  /** One line on what choosing this actually claims about the finding. */
  hint: string;
}

export interface CvssMetricSpec {
  key: CvssMetric;
  label: string;
  question: string;
  options: CvssOption[];
}

export const CVSS_METRICS: CvssMetricSpec[] = [
  {
    key: "AV",
    label: "Attack Vector",
    question: "Where does the attacker have to be?",
    options: [
      { value: "N", label: "Network", hint: "Exploitable over the internet." },
      { value: "A", label: "Adjacent", hint: "Same local or logical network." },
      { value: "L", label: "Local", hint: "Local access or a shell is needed." },
      { value: "P", label: "Physical", hint: "The attacker must touch the device." },
    ],
  },
  {
    key: "AC",
    label: "Attack Complexity",
    question: "What has to go right beyond the attacker's control?",
    options: [
      { value: "L", label: "Low", hint: "Repeatable, no special conditions." },
      { value: "H", label: "High", hint: "Depends on conditions the attacker cannot arrange." },
    ],
  },
  {
    key: "PR",
    label: "Privileges Required",
    question: "What account does the attacker need first?",
    options: [
      { value: "N", label: "None", hint: "No account at all." },
      { value: "L", label: "Low", hint: "An ordinary user account." },
      { value: "H", label: "High", hint: "An admin or privileged account." },
    ],
  },
  {
    key: "UI",
    label: "User Interaction",
    question: "Does a victim have to do something?",
    options: [
      { value: "N", label: "None", hint: "No victim action needed." },
      { value: "R", label: "Required", hint: "A victim must click or open something." },
    ],
  },
  {
    key: "S",
    label: "Scope",
    question: "Does the impact escape the vulnerable component?",
    options: [
      { value: "U", label: "Unchanged", hint: "Damage stays inside the same component." },
      { value: "C", label: "Changed", hint: "It reaches resources beyond it." },
    ],
  },
  {
    key: "C",
    label: "Confidentiality",
    question: "How much data can be read?",
    options: [
      { value: "H", label: "High", hint: "All of it, or the most sensitive part." },
      { value: "L", label: "Low", hint: "Some of it, with limited control." },
      { value: "N", label: "None", hint: "Nothing is disclosed." },
    ],
  },
  {
    key: "I",
    label: "Integrity",
    question: "How much data can be changed?",
    options: [
      { value: "H", label: "High", hint: "Anything, with serious consequence." },
      { value: "L", label: "Low", hint: "Some of it, with limited control." },
      { value: "N", label: "None", hint: "Nothing can be modified." },
    ],
  },
  {
    key: "A",
    label: "Availability",
    question: "How badly can service be disrupted?",
    options: [
      { value: "H", label: "High", hint: "Fully denied, or sustained outage." },
      { value: "L", label: "Low", hint: "Degraded or intermittently interrupted." },
      { value: "N", label: "None", hint: "No effect on availability." },
    ],
  },
];

export type CvssSelection = Partial<Record<CvssMetric, string>>;
/** Every metric answered — the only state a vector can be built from. */
export type CompleteCvss = Record<CvssMetric, string>;

/* ─── Weights (specification §7.4 Table 16) ─────────────────────────────── */

const AV_WEIGHT: Record<string, number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
const AC_WEIGHT: Record<string, number> = { L: 0.77, H: 0.44 };
const UI_WEIGHT: Record<string, number> = { N: 0.85, R: 0.62 };
const CIA_WEIGHT: Record<string, number> = { H: 0.56, L: 0.22, N: 0 };

/* Privileges Required is the one metric whose weight depends on Scope: a
   changed scope makes holding privileges worth more to the attacker. */
const PR_WEIGHT: Record<"U" | "C", Record<string, number>> = {
  U: { N: 0.85, L: 0.62, H: 0.27 },
  C: { N: 0.85, L: 0.68, H: 0.5 },
};

/**
 * The specification's own rounding (§7.1 Appendix A) — not `Math.ceil` on a
 * float. Working in integers avoids the binary-representation edge cases that
 * make a naive implementation disagree with the reference in the last decimal,
 * which is exactly the disagreement the API would reject.
 */
export function roundUp1(value: number): number {
  const scaled = Math.round(value * 100_000);
  if (scaled % 10_000 === 0) return scaled / 100_000;
  return (Math.floor(scaled / 10_000) + 1) / 10;
}

export function isComplete(selection: CvssSelection): selection is CompleteCvss {
  return CVSS_METRIC_ORDER.every((metric) => Boolean(selection[metric]));
}

/** The base score for a fully answered selection, to one decimal place. */
export function baseScore(selection: CompleteCvss): number {
  const scopeChanged = selection.S === "C";

  const iss =
    1 -
    (1 - CIA_WEIGHT[selection.C]) *
      (1 - CIA_WEIGHT[selection.I]) *
      (1 - CIA_WEIGHT[selection.A]);

  const impact = scopeChanged
    ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15)
    : 6.42 * iss;

  if (impact <= 0) return 0;

  const exploitability =
    8.22 *
    AV_WEIGHT[selection.AV] *
    AC_WEIGHT[selection.AC] *
    PR_WEIGHT[scopeChanged ? "C" : "U"][selection.PR] *
    UI_WEIGHT[selection.UI];

  const raw = scopeChanged
    ? 1.08 * (impact + exploitability)
    : impact + exploitability;

  return roundUp1(Math.min(raw, 10));
}

export type CvssRating = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Qualitative rating bands (specification §5, Table 14). */
export function ratingFor(score: number): CvssRating {
  if (score >= 9) return "CRITICAL";
  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

/** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` */
export function formatVector(
  selection: CompleteCvss,
  version: CvssVersion = "CVSS:3.1",
): string {
  const parts = CVSS_METRIC_ORDER.map(
    (metric) => `${metric}:${selection[metric]}`,
  );
  return [version, ...parts].join("/");
}

export interface ParsedVector {
  version: CvssVersion;
  selection: CompleteCvss;
}

/**
 * Reads a pasted vector back into metric choices.
 *
 * Strict on purpose: an unknown metric, a value the metric does not define, a
 * duplicate, or a missing one all return null rather than a partial guess. A
 * vector the parser had to repair is a vector the backend may still refuse, so
 * the reporter is told it is wrong while they can still fix it.
 */
export function parseVector(input: string): ParsedVector | null {
  const trimmed = input.trim().toUpperCase();
  if (!trimmed) return null;

  const segments = trimmed.split("/").filter(Boolean);
  const [head, ...rest] = segments;

  const version = CVSS_VERSIONS.find((candidate) => candidate === head);
  if (!version) return null;

  const seen = new Map<string, string>();
  for (const segment of rest) {
    const [key, value, ...extra] = segment.split(":");
    if (!key || !value || extra.length) return null;
    if (seen.has(key)) return null;
    seen.set(key, value);
  }

  const selection: CvssSelection = {};
  for (const spec of CVSS_METRICS) {
    const value = seen.get(spec.key);
    if (!value) return null;
    if (!spec.options.some((option) => option.value === value)) return null;
    selection[spec.key] = value;
    seen.delete(spec.key);
  }

  /* Anything left over is a temporal or environmental metric, or a typo. The
     API wants a base vector, so neither is passed along silently. */
  if (seen.size > 0) return null;

  return { version, selection: selection as CompleteCvss };
}

export interface CvssResult {
  vector: string;
  score: number;
  rating: CvssRating;
}

/** Everything the form needs from a complete selection, in one call. */
export function evaluate(
  selection: CompleteCvss,
  version: CvssVersion = "CVSS:3.1",
): CvssResult {
  const score = baseScore(selection);
  return { vector: formatVector(selection, version), score, rating: ratingFor(score) };
}
