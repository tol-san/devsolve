/**
 * DevSolve API standard error response structure and parser.
 *
 * Backend error shape:
 * {
 *   message: string,
 *   code: number,
 *   status: string,
 *   timestamp: string,
 *   path: string,
 *   errorDetails?: Record<string, unknown> | null,
 *   violations?: Array<{ field?: string; message?: string }> | null,
 *   traceId?: string | null
 * }
 */

export interface RestErrorResponse {
  message?: string;
  code?: number;
  status?: string | number;
  timestamp?: string;
  path?: string;
  errorDetails?: {
    requiredPermission?: string;
    organizationIds?: string[];
    offendingPermissions?: string[];
    [key: string]: unknown;
  } | null;
  violations?: Array<{
    field?: string;
    message?: string;
    [key: string]: unknown;
  }> | null;
  traceId?: string | null;
}

export interface ParsedApiError {
  status: number;
  message: string;
  requiredPermission?: string;
  organizationIds?: string[];
  offendingPermissions?: string[];
  violations: Record<string, string>;
  raw?: RestErrorResponse;
}

/**
 * Extracts and normalizes the backend error response from RTK Query / fetch errors.
 */
export function parseApiError(error: unknown): ParsedApiError {
  let status = 500;
  let raw: RestErrorResponse | undefined;

  if (error && typeof error === "object") {
    const maybeFetchError = error as {
      status?: number | string;
      data?: unknown;
    };

    if (typeof maybeFetchError.status === "number") {
      status = maybeFetchError.status;
    }

    const data = maybeFetchError.data;
    if (data && typeof data === "object") {
      // Check for nested details/error wrapper
      const d = data as Record<string, unknown>;
      raw = (d.details as RestErrorResponse) || (d as RestErrorResponse);
    }
  }

  const violations: Record<string, string> = {};
  if (Array.isArray(raw?.violations)) {
    for (const v of raw.violations) {
      if (v.field && v.message) {
        violations[v.field] = v.message;
      }
    }
  }

  const requiredPermission =
    typeof raw?.errorDetails?.requiredPermission === "string"
      ? raw.errorDetails.requiredPermission
      : undefined;

  const organizationIds = Array.isArray(raw?.errorDetails?.organizationIds)
    ? (raw.errorDetails.organizationIds as string[])
    : undefined;

  let offendingPermissions: string[] | undefined;
  if (Array.isArray(raw?.errorDetails?.offendingPermissions)) {
    offendingPermissions = raw.errorDetails.offendingPermissions as string[];
  } else if (raw?.errorDetails && typeof raw.errorDetails === "object") {
    // If errorDetails directly contains offending keys or array
    const values = Object.values(raw.errorDetails);
    for (const val of values) {
      if (Array.isArray(val) && val.every((item) => typeof item === "string")) {
        offendingPermissions = val;
        break;
      }
    }
  }

  let message = raw?.message || "An unexpected error occurred.";

  // Rule 403: errorDetails.requiredPermission names what the caller lacks
  if (status === 403 && requiredPermission) {
    message = `You need ${requiredPermission} to do this.`;
  } else if (status === 403 && !requiredPermission) {
    message = "You do not have permission to perform this action.";
  }

  // Rule 409 without errorDetails: database constraint conflict
  if (status === 409 && !organizationIds) {
    if (raw?.path || raw?.timestamp) {
      console.warn(
        `[DevSolve API] 409 Database constraint conflict at path="${raw?.path ?? "unknown"}" timestamp="${raw?.timestamp ?? "unknown"}" traceId="${raw?.traceId ?? "none"}"`,
      );
    }

    if (raw?.path?.includes("invitations")) {
      message =
        "This person is already a member of your organization, or an active invitation has already been sent to them.";
    } else {
      message = "Something went wrong on our end — please report this.";
    }
  }

  // Rule 422: permissions exceed role ceiling
  if (status === 422) {
    if (offendingPermissions && offendingPermissions.length > 0) {
      message = `The selected role cannot hold: ${offendingPermissions.join(", ")}.`;
    } else {
      message =
        raw?.message ||
        "One or more permissions are not allowed for this role.";
    }
  }

  return {
    status,
    message,
    requiredPermission,
    organizationIds,
    offendingPermissions,
    violations,
    raw,
  };
}

/**
 * Formats a user-facing error message adhering strictly to DevSolve error rules.
 */
export function formatApiErrorMessage(
  error: unknown,
  fallback = "Unable to complete request. Please try again.",
): string {
  const parsed = parseApiError(error);
  return parsed.message || fallback;
}
