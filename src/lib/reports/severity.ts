
export type ApiSeverity = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const API_SEVERITIES: readonly ApiSeverity[] = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

export function toApiSeverity(
  label: string | null | undefined,
): ApiSeverity | null {
  if (!label) return null;

  const value = label.trim().toUpperCase();

  if (value === "INFO" || value === "INFORMATIONAL") return "NONE";

  return API_SEVERITIES.includes(value as ApiSeverity)
    ? (value as ApiSeverity)
    : null;
}
