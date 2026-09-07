import * as z from "zod";
import { isCleanText, profanityMessage } from "@/lib/moderation/profanity";
import { isReadableText, readabilityMessage } from "@/lib/moderation/readability";

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

export const VULNERABILITY_CATEGORIES = VULNERABILITY_CATEGORY_GROUPS.flatMap(
  (group) => group.options,
) as readonly string[];

export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] as const;

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

export function environmentLabel(value?: string): string {
  return ENVIRONMENTS.find((env) => env.value === value)?.label ?? value ?? "—";
}

export type ReportSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export function severityForCvss(score: number): ReportSeverity {
  if (score >= 9) return "CRITICAL";
  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  if (score > 0) return "LOW";
  return "INFO";
}

export type ClaimableSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export function claimableSeverityForCvss(score: number): ClaimableSeverity | null {
  if (score >= 9) return "CRITICAL";
  if (score >= 7) return "HIGH";
  if (score >= 4) return "MEDIUM";
  if (score > 0) return "LOW";
  return null;
}

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

const MAX_TITLE = 255;
const MAX_LONG_TEXT = 20_000;
const MAX_REMEDIATION = 10_000;
const MAX_TARGET = 1_000;
const MAX_LINKS = 10;
const MAX_LINK_LENGTH = 500;

export const submitReportSchema = z.object({
  programId: z.string().min(1, "Please select a target program."),
  assetId: z.string().optional(),
  targetAsset: z
    .string()
    .min(2, "Target asset or endpoint URL is required.")
    .max(MAX_TARGET, `Endpoint cannot exceed ${MAX_TARGET} characters.`),
  environment: z.enum(ENVIRONMENT_VALUES),
  discoveredAt: z
    .string()
    .optional()
    .refine(
      (value) => !value || new Date(value) <= new Date(),
      "The discovery date cannot be in the future.",
    ),

  title: z
    .string()
    .min(10, "Title must be at least 10 characters long.")
    .max(MAX_TITLE, `Title cannot exceed ${MAX_TITLE} characters.`)
    .refine(isCleanText, profanityMessage("Title"))
    .refine(isReadableText, readabilityMessage("Title")),
  category: z.string().optional(),
  weaknessId: z.string().optional(),
  suggestedWeakness: z
    .string()
    .max(255, "Suggested weakness cannot exceed 255 characters.")
    .optional(),
  weaknessMode: z.enum(["catalog", "unsure", "custom"]).optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  cweIdentifier: z.string().optional(),
  cvssScore: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || !value.trim()) return true;
      const score = Number(value);
      return Number.isFinite(score) && score >= 0 && score <= 10;
    }, "CVSS score must be a number between 0 and 10."),
  cvssVector: z.string().max(255, "CVSS vector cannot exceed 255 characters.").optional(),

  summaryPoC: z
    .string()
    .min(20, "Please provide a description/summary (at least 20 characters).")
    .refine(isCleanText, profanityMessage("The summary")),
  reproduceStepsList: z
    .array(z.string())
    .refine(
      (steps) => steps.join("\n").length <= MAX_LONG_TEXT,
      `The reproduction steps cannot exceed ${MAX_LONG_TEXT} characters in total.`,
    ),
  impact: z.string().optional(),
  remediation: z
    .string()
    .max(MAX_REMEDIATION, `Remediation cannot exceed ${MAX_REMEDIATION} characters.`)
    .optional(),

  pocPayload: z
    .string()
    .max(MAX_LONG_TEXT, `Proof of concept cannot exceed ${MAX_LONG_TEXT} characters.`)
    .optional(),
  expectedResult: z.string().optional(),
  actualResult: z.string().optional(),
  externalLinks: z
    .array(z.string().max(MAX_LINK_LENGTH, `Each link cannot exceed ${MAX_LINK_LENGTH} characters.`))
    .max(MAX_LINKS, `You can add up to ${MAX_LINKS} reference links.`),

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
    if (
      values.weaknessId &&
      values.suggestedWeakness &&
      values.suggestedWeakness.trim().length > 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["suggestedWeakness"],
        message: "Choose a weakness from the catalog or name your own, not both",
      });
    }

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

