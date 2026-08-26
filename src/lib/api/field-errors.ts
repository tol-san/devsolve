/**
 * Turns a backend rejection into per-field messages the form can attach.
 *
 * The report API answers a bad submission with a targeted reason — which
 * weakness id was retired, which asset is out of scope, that the severity and
 * score disagree. Flattening all of that into one red banner above the form
 * throws away the only part that tells the reporter what to change, and on a
 * fifteen-field form it leaves them hunting.
 *
 * Two sources are read. A Spring validation failure carries a field map; a
 * business-rule rejection carries prose. The prose is matched against the
 * phrases the API actually uses, and anything unrecognised is returned as a
 * form-level message rather than guessed at.
 */

/** Form field names this module can address. */
export type ReportField =
  | "title"
  | "vulnerabilityInformation"
  | "reportedSeverity"
  | "cvssScore"
  | "cvssVector"
  | "weaknessId"
  | "assetId"
  | "targetEndpoint"
  | "environment"
  | "discoveredAt"
  | "referenceLinks"
  | "impact"
  | "stepsToReproduce"
  | "proofOfConcept"
  | "remediationRecommendation";

/** API field name → the form control that owns it. */
const FIELD_ALIASES: Record<string, ReportField> = {
  title: "title",
  vulnerabilityInformation: "vulnerabilityInformation",
  reportedSeverity: "reportedSeverity",
  severity: "reportedSeverity",
  cvssScore: "cvssScore",
  cvssVector: "cvssVector",
  weaknessId: "weaknessId",
  assetId: "assetId",
  targetEndpoint: "targetEndpoint",
  environment: "environment",
  discoveredAt: "discoveredAt",
  referenceLinks: "referenceLinks",
  impact: "impact",
  stepsToReproduce: "stepsToReproduce",
  proofOfConcept: "proofOfConcept",
  remediationRecommendation: "remediationRecommendation",
};

/**
 * Phrases the backend returns, in the order they should be tried.
 *
 * Ordered because several overlap: "weakness not found" and "not found" would
 * both match a retired weakness, and the more specific rule has to win.
 */
const MESSAGE_RULES: Array<{
  field: ReportField;
  test: RegExp;
  message?: string;
}> = [
  {
    field: "weaknessId",
    test: /weakness.*(not found|inactive|retired|does not exist)|(not found|inactive).*weakness/i,
    message:
      "That weakness is no longer in the catalogue. Pick another, or leave it unset and let triage classify it.",
  },
  {
    field: "assetId",
    test: /asset.*(not found|out of scope|does not belong|invalid)|scope.*asset/i,
    message:
      "That asset is not in scope for this program. Choose one from the program's scope.",
  },
  {
    field: "reportedSeverity",
    test: /severity.*(none|invalid|must be one of)|reportedseverity/i,
  },
  {
    field: "cvssScore",
    test: /cvss.*score|score.*(0\.0|10\.0|decimal|range)/i,
  },
  {
    field: "cvssVector",
    test: /cvss.*vector|vector.*(invalid|malformed|format)/i,
  },
  {
    field: "discoveredAt",
    test: /discovered.*(past|future|present)|date.*future/i,
    message: "The discovery date cannot be in the future.",
  },
  {
    field: "referenceLinks",
    test: /reference.*link|links.*(10|exceed)/i,
  },
  {
    field: "targetEndpoint",
    test: /target.*endpoint|endpoint.*(1000|length)/i,
  },
  { field: "title", test: /title/i },
  { field: "vulnerabilityInformation", test: /vulnerabilityinformation|vulnerability information/i },
];

export interface MappedErrors {
  /** Messages to attach to individual controls. */
  fields: Partial<Record<ReportField, string>>;
  /** What could not be attributed to a field — shown once, above the form. */
  formMessage: string | null;
}

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string | string[]>;
  fieldErrors?: Record<string, string | string[]>;
  details?: unknown;
}

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value.find((entry) => Boolean(entry));
  return value || undefined;
}

/** Digs the API's JSON body out of an RTK Query error. */
function bodyOf(error: unknown): ApiErrorBody | null {
  if (typeof error !== "object" || error === null) return null;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return null;

  const body = data as ApiErrorBody;
  /* The proxy nests the upstream payload under `details` when it relays a
     failure, so the real field map is often one level down. */
  const nested =
    typeof body.details === "object" && body.details !== null
      ? (body.details as ApiErrorBody)
      : null;

  return {
    message: body.message ?? nested?.message,
    errors: body.errors ?? nested?.errors,
    fieldErrors: body.fieldErrors ?? nested?.fieldErrors,
  };
}

export function mapReportErrors(error: unknown): MappedErrors {
  const body = bodyOf(error);
  const fields: Partial<Record<ReportField, string>> = {};

  if (!body) {
    return {
      fields,
      formMessage:
        "The report could not be submitted. Check your connection and try again.",
    };
  }

  // 1. A structured field map is unambiguous — take it as given.
  const map = { ...(body.errors ?? {}), ...(body.fieldErrors ?? {}) };
  for (const [key, raw] of Object.entries(map)) {
    const field = FIELD_ALIASES[key];
    const message = firstString(raw);
    if (field && message) fields[field] = message;
  }

  // 2. Otherwise fall back to matching the prose.
  const prose = body.message?.trim();
  if (prose && Object.keys(fields).length === 0) {
    const rule = MESSAGE_RULES.find((candidate) => candidate.test.test(prose));
    if (rule) {
      fields[rule.field] = rule.message ?? prose;
      return { fields, formMessage: null };
    }
  }

  return {
    fields,
    formMessage: Object.keys(fields).length
      ? null
      : prose ||
        "The report could not be submitted. Check the highlighted fields and try again.",
  };
}
