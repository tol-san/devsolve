import * as z from "zod";
import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

/**
 * The weakness taxonomy a reporter picks from, grouped the way a triager
 * thinks about them.
 *
 * Deliberately long. `category` reaches the API as prose inside the report's
 * Classification block — nothing validates it against this list — so the list
 * is a vocabulary, not a constraint. A short one does not make reports
 * cleaner, it just pushes everything that does not fit into "Other", which is
 * the one answer a triager cannot act on. The field pairs this with free
 * entry, so a weakness nobody anticipated is still named precisely.
 */
export const VULNERABILITY_CATEGORY_GROUPS = [
  {
    label: "Injection",
    options: [
      "SQL Injection (SQLi)",
      "NoSQL Injection",
      "OS Command Injection",
      "Code Injection",
      "Server-Side Template Injection (SSTI)",
      "LDAP Injection",
      "XPath Injection",
      "CRLF / HTTP Header Injection",
      "HTTP Request Smuggling",
      "XML External Entity (XXE)",
      "Insecure Deserialization",
    ],
  },
  {
    label: "Cross-Site Scripting",
    options: [
      "Cross-Site Scripting (XSS - Stored)",
      "Cross-Site Scripting (XSS - Reflected)",
      "Cross-Site Scripting (XSS - DOM-based)",
      "Cross-Site Scripting (XSS - Self)",
    ],
  },
  {
    label: "Authentication & session",
    options: [
      "Authentication Bypass",
      "Broken Authentication / Session Management",
      "Session Fixation",
      "Weak Password Policy",
      "Missing or Bypassable MFA",
      "OAuth / SSO Misconfiguration",
      "JWT Flaw (algorithm confusion, weak signature)",
      "Improper Certificate Validation",
    ],
  },
  {
    label: "Authorization",
    options: [
      "Broken Access Control",
      "Insecure Direct Object Reference (IDOR)",
      "Privilege Escalation (Vertical)",
      "Privilege Escalation (Horizontal)",
      "Missing Function-Level Access Control",
    ],
  },
  {
    label: "Request forgery & client-side",
    options: [
      "Server-Side Request Forgery (SSRF)",
      "Cross-Site Request Forgery (CSRF)",
      "Cross-Site WebSocket Hijacking (CSWSH)",
      "CORS Misconfiguration",
      "Clickjacking / UI Redressing",
      "Open Redirect",
      "Prototype Pollution",
    ],
  },
  {
    label: "Data exposure",
    options: [
      "Information Disclosure / Sensitive Data Leak",
      "Path Traversal / Directory Listing",
      "Local File Inclusion (LFI)",
      "Remote File Inclusion (RFI)",
      "Source Code Disclosure",
      "Exposed Backup or Configuration File",
      "Exposed Secret / Hardcoded Credential",
      "PII Exposure",
    ],
  },
  {
    label: "Cryptography",
    options: [
      "Cryptographic Flaw",
      "Missing or Weak Encryption in Transit",
      "Insecure Randomness",
      "Padding Oracle",
    ],
  },
  {
    label: "Infrastructure & supply chain",
    options: [
      "Remote Code Execution (RCE)",
      "Subdomain Takeover",
      "Security Misconfiguration",
      "Default or Weak Credentials",
      "Vulnerable or Outdated Dependency",
      "Cloud or Container Misconfiguration",
      "Unrestricted File Upload",
    ],
  },
  {
    label: "Business logic & abuse",
    options: [
      "Business Logic Flaw",
      "Race Condition / TOCTOU",
      "Missing Rate Limiting / Brute Force",
      "Denial of Service (DoS)",
      "Payment or Pricing Manipulation",
    ],
  },
  {
    label: "Mobile & client applications",
    options: [
      "Insecure Data Storage (Mobile)",
      "Insecure Deep Link / Intent Handling",
      "Certificate Pinning Bypass",
    ],
  },
  {
    label: "Other",
    options: ["Other Security Issue"],
  },
] as const;

/** The same vocabulary flattened, for anything that just needs the values. */
export const VULNERABILITY_CATEGORIES = VULNERABILITY_CATEGORY_GROUPS.flatMap(
  (group) => group.options,
) as readonly string[];

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] as const;

/**
 * The values `CreateReportRequest.environment` accepts, paired with what a
 * reader should see. The form used to offer three title-cased labels of its
 * own and send them verbatim, which the backend could not match against this
 * enum — so the field is stored in the API's own vocabulary and only
 * translated for display.
 */
export const ENVIRONMENTS = [
  { value: "PRODUCTION", label: "Production" },
  { value: "STAGING", label: "Staging" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "TESTING", label: "Testing" },
  { value: "LOCAL", label: "Local" },
] as const;

export const ENVIRONMENT_VALUES = [
  "PRODUCTION",
  "STAGING",
  "DEVELOPMENT",
  "TESTING",
  "LOCAL",
] as const;

/** The label for a stored value, for screens that display the choice back. */
export function environmentLabel(value?: string): string {
  return ENVIRONMENTS.find((env) => env.value === value)?.label ?? value ?? "—";
}

export type ReportSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

/**
 * The severity a CVSS score sits in, using the v3.1 qualitative bands.
 *
 * The backend enforces this pairing and refuses a report whose two halves
 * disagree ("A CVSS score of 8.6 is rated HIGH, which does not match the
 * reported severity LOW"). The rule is spelled out here so the form can keep
 * the pair consistent as it is filled in, rather than discovering the conflict
 * from a 400 after the reader presses submit.
 *
 * `INFO` is this form's name for a 0.0 score; it is sent as the API's `NONE`.
 */
export function severityForCvss(score: number): ReportSeverity {
  if (score >= 9) return "CRITICAL";
  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  if (score > 0) return "LOW";
  return "INFO";
}

/** The score as a number, or null when the field is empty or unparseable. */
export function parseCvssScore(value?: string): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const score = Number(trimmed);
  return Number.isFinite(score) && score >= 0 && score <= 10 ? score : null;
}

export const SEVERITY_LABELS: Record<ReportSeverity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  INFO: "Info",
};

/* Ceilings copied from CreateReportRequest. They are enforced here so an
   over-long write-up is caught while the reader still has it on screen,
   rather than coming back as a 400 after they press submit. */
const MAX_TITLE = 255;
const MAX_LONG_TEXT = 20_000;
const MAX_REMEDIATION = 10_000;
const MAX_TARGET = 1_000;
const MAX_LINKS = 10;
const MAX_LINK_LENGTH = 500;

export const submitReportSchema = z.object({
  // Step 1: Target & Scope
  programId: z.string().min(1, "Please select a target program."),
  targetAsset: z
    .string()
    .min(2, "Target asset or endpoint URL is required.")
    .max(MAX_TARGET, `Endpoint cannot exceed ${MAX_TARGET} characters.`),
  httpMethod: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]),
  vulnerableParameter: z.string().optional(),
  environment: z.enum(ENVIRONMENT_VALUES),
  /* A plain `YYYY-MM-DD` from a date input. Optional, because a researcher
     does not always remember the day — but never in the future, which is the
     one value that is certainly a typo. */
  discoveredAt: z
    .string()
    .optional()
    .refine(
      (value) => !value || new Date(value) <= new Date(),
      "The discovery date cannot be in the future.",
    ),

  // Step 2: Vulnerability Classification
  title: z
    .string()
    .min(10, "Title must be at least 10 characters long.")
    .max(MAX_TITLE, `Title cannot exceed ${MAX_TITLE} characters.`)
    .refine(isCleanText, profanityMessage("Title"))
    .refine(isReadableText, readabilityMessage("Title")),
  category: z.string().min(1, "Please select a vulnerability type/category."),
  /* Set only when `category` came from the catalogue. Free-text entries leave
     it empty, which is what tells the submit step to send prose instead of a
     foreign key the backend would reject. */
  weaknessId: z.string().optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]),
  cweIdentifier: z.string().optional(),
  /* Text rather than a number because the input is free-form; the range is the
     one the API accepts, and an unparseable score is rejected here rather than
     silently dropped on the way out. */
  cvssScore: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || !value.trim()) return true;
      const score = Number(value);
      return Number.isFinite(score) && score >= 0 && score <= 10;
    }, "CVSS score must be a number between 0 and 10."),
  cvssVector: z.string().max(255, "CVSS vector cannot exceed 255 characters.").optional(),

  // Step 3: Report Details
  summaryPoC: z
    .string()
    .min(20, "Please provide a description/summary (at least 20 characters).")
    .refine(isCleanText, profanityMessage("The summary"))
    .refine(isReadableText, readabilityMessage("The summary")),
  reproduceStepsList: z.array(z.string()),
  impact: z.string().optional(),
  remediation: z
    .string()
    .max(MAX_REMEDIATION, `Remediation cannot exceed ${MAX_REMEDIATION} characters.`)
    .optional(),

  // Step 4: Proof of Concept
  pocPayload: z
    .string()
    .max(MAX_LONG_TEXT, `Proof of concept cannot exceed ${MAX_LONG_TEXT} characters.`)
    .optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  externalLinks: z
    .array(z.string().max(MAX_LINK_LENGTH, `Each link cannot exceed ${MAX_LINK_LENGTH} characters.`))
    .max(MAX_LINKS, `You can add up to ${MAX_LINKS} reference links.`),

  // Step 5: Submission Checklist
  checklistInScope: z.boolean(),
  checklistNotDuplicate: z.boolean(),
  checklistReproducible: z.boolean(),
  checklistNoPii: z.boolean(),
  checklistAgreeTerms: z.boolean(),
})
  /* The last line of defence for the pairing the backend enforces. The form
     keeps severity following the score as it is typed, so this should not fire
     in normal use — but a value restored from a draft, or a score edited after
     the severity was chosen, must not reach the API as a 400. */
  .superRefine((values, ctx) => {
    const score = parseCvssScore(values.cvssScore);
    if (score === null) return;

    const expected = severityForCvss(score);
    if (expected === values.severity) return;

    ctx.addIssue({
      code: "custom",
      path: ["cvssScore"],
      message: `A CVSS score of ${score} is rated ${SEVERITY_LABELS[expected]}, but this report is marked ${SEVERITY_LABELS[values.severity]}. Adjust one to match the other.`,
    });
  });

export type SubmitReportFormValues = z.infer<typeof submitReportSchema>;

