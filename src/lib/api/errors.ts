
export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
  status?: number;
}

const STATUS_FALLBACKS: Record<number, string> = {
  400: "Some of the details weren't accepted. Check the fields below.",
  401: "Your session has expired. Sign in again to continue.",
  403: "You don't have permission to make this change.",
  404: "That record no longer exists.",
  409: "This item is awaiting moderation or closed, and cannot be edited.",
  412: "This item has been updated on the server. Please refresh or review your changes before saving.",
  413: "That file is too large.",
  415: "That file type isn't supported.",
  422: "Some of the details weren't accepted. Check the fields below.",
  429: "Too many attempts. Wait a moment and try again.",
  500: "The server hit an error. Nothing was saved.",
  502: "The server is unreachable right now.",
  503: "The service is temporarily unavailable.",
  504: "The server took too long to respond.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractFieldErrors(body: Record<string, unknown>): Record<string, string> {
  const found: Record<string, string> = {};

  if (isRecord(body.fieldErrors)) {
    for (const [field, value] of Object.entries(body.fieldErrors)) {
      const text = Array.isArray(value) ? value[0] : value;
      if (typeof text === "string" && text) found[field] = text;
    }
  }

  const springErrors = body.errors ?? body.errorDetails ?? body.violations;
  if (Array.isArray(springErrors)) {
    for (const entry of springErrors) {
      if (!isRecord(entry)) continue;
      const field =
        entry.field ?? entry.fieldName ?? entry.property ?? entry.propertyPath;
      const text = entry.defaultMessage ?? entry.message ?? entry.reason;
      if (typeof field === "string" && typeof text === "string" && text) {
        found[field] = text;
      }
    }
  }

  if (isRecord(springErrors) && !Array.isArray(springErrors)) {
    for (const [field, value] of Object.entries(springErrors)) {
      if (typeof value === "string" && value) found[field] = value;
    }
  }

  return found;
}

function nestedErrorMessage(body: Record<string, unknown>): string | null {
  if (!isRecord(body.error)) return null;
  const text = body.error.message;
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed || /^an error occurred\.?$/i.test(trimmed)) return null;
  return trimmed;
}

export function parseApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): ParsedApiError {
  if (!isRecord(error)) {
    return { message: fallback, fieldErrors: {} };
  }

  const status = error.status;

  if (status === "FETCH_ERROR") {
    return {
      message:
        "Couldn't reach the server. Check your connection and try again.",
      fieldErrors: {},
    };
  }
  if (status === "TIMEOUT_ERROR") {
    return {
      message: "The request timed out. Please try again.",
      fieldErrors: {},
    };
  }
  if (status === "PARSING_ERROR") {
    return {
      message: "The server sent a response we couldn't read.",
      fieldErrors: {},
      status: typeof error.originalStatus === "number" ? error.originalStatus : undefined,
    };
  }

  if (typeof status !== "number") {
    return {
      message: typeof error.message === "string" ? error.message : fallback,
      fieldErrors: {},
    };
  }

  const body = error.data;

  if (typeof body === "string" && body.trim()) {
    return { message: body, fieldErrors: {}, status };
  }

  if (isRecord(body)) {
    const details = isRecord(body.details) ? body.details : null;
    const fieldErrors = {
      ...(details ? extractFieldErrors(details) : {}),
      ...extractFieldErrors(body),
    };

    const message =
      (typeof body.message === "string" && body.message.trim()
        ? body.message
        : null) ??
      (Array.isArray(body.formErrors) && typeof body.formErrors[0] === "string"
        ? body.formErrors[0]
        : null) ??
      nestedErrorMessage(body) ??
      STATUS_FALLBACKS[status] ??
      (typeof body.error === "string" && body.error.trim()
        ? body.error
        : null) ??
      fallback;

    return { message, fieldErrors, status };
  }

  return { message: STATUS_FALLBACKS[status] ?? fallback, fieldErrors: {}, status };
}
