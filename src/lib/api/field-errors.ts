
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
  fields: Partial<Record<ReportField, string>>;
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

function bodyOf(error: unknown): ApiErrorBody | null {
  if (typeof error !== "object" || error === null) return null;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return null;

  const body = data as ApiErrorBody;
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

  const map = { ...(body.errors ?? {}), ...(body.fieldErrors ?? {}) };
  for (const [key, raw] of Object.entries(map)) {
    const field = FIELD_ALIASES[key];
    const message = firstString(raw);
    if (field && message) fields[field] = message;
  }

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
