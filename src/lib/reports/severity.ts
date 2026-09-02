/**
 * Turning a severity the screens show into the one the API accepts.
 *
 * `ReportSeverity` upstream has five members and **`INFO` is not one of
 * them**. The triage screens offer "Info" as the label for a finding that is
 * valid but unrated, which the API calls `NONE` — so uppercasing the label and
 * sending it, as the triage calls used to, produced `"INFO"` and a request the
 * backend could not read.
 *
 * That failure was worth hiding from nobody and yet hid itself: Jackson raises
 * `HttpMessageNotReadableException` for a body it cannot bind, the same
 * exception it raises for a body that is absent, and the generic handler
 * answers both with *"The request body is missing or is not valid JSON"*. So a
 * perfectly well-formed request came back looking like it had no body at all,
 * and only ever when the triager picked Info.
 *
 * Every severity that leaves for `triageSeverity` goes through here.
 */

/** `ReportSeverity` upstream, in full. */
export type ApiSeverity = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const API_SEVERITIES: readonly ApiSeverity[] = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

/**
 * The enum member for a label, or null when it names no severity at all.
 *
 * Null rather than a guess: a caller that cannot say what severity it means
 * should send nothing and let the backend refuse it, instead of quietly
 * triaging a report at a level nobody chose.
 */
export function toApiSeverity(
  label: string | null | undefined,
): ApiSeverity | null {
  if (!label) return null;

  const value = label.trim().toUpperCase();

  /* The screens' word for an unrated finding. `Informational` is the same
     thing spelled out, and appears in the severity picker's own labels. */
  if (value === "INFO" || value === "INFORMATIONAL") return "NONE";

  return API_SEVERITIES.includes(value as ApiSeverity)
    ? (value as ApiSeverity)
    : null;
}
