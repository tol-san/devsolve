export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MAX_FILES = 10;
export const ATTACHMENT_ACCEPT =
  ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.log";

export const URL_MAX_CHARS = 2048;

const BLOCKED_EXECUTABLE_EXTENSIONS = new Set([
  "exe",
  "dll",
  "bat",
  "cmd",
  "sh",
  "bin",
  "msi",
  "jar",
  "vbs",
  "ps1",
  "com",
  "scr",
  "app",
  "elf",
  "apk",
  "dmg",
  "iso",
  "wasm",
]);

const MIME_BY_EXTENSION: Record<string, readonly string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  webp: ["image/webp"],
  txt: ["text/plain"],
  log: ["text/plain"],
};

export function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function validateAttachment(file: File): string | null {
  if (!file.name || !file.name.trim()) {
    return "Filename cannot be blank.";
  }

  if (file.name.length > 255) {
    return `Filename "${file.name.slice(0, 30)}…" exceeds the 255-character limit.`;
  }

  const extension = extensionOf(file.name);

  if (BLOCKED_EXECUTABLE_EXTENSIONS.has(extension)) {
    return `${file.name} is an executable file and cannot be uploaded.`;
  }

  if (file.size === 0) return `${file.name} is empty.`;
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return `${file.name} exceeds the 10 MiB limit.`;
  }

  const acceptedMimeTypes = MIME_BY_EXTENSION[extension];
  if (!acceptedMimeTypes) {
    return `${file.name} is not a supported PDF, Word, image, text, or log file.`;
  }

  if (file.type && !acceptedMimeTypes.includes(file.type.toLowerCase())) {
    return `${file.name} does not match its file type signature.`;
  }

  return null;
}

export function validateScanUrl(rawUrl: string): string | null {
  if (!rawUrl || !rawUrl.trim()) {
    return "URL cannot be empty.";
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length > URL_MAX_CHARS) {
    return `URL exceeds the maximum limit of ${URL_MAX_CHARS} characters.`;
  }

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "URL must use http or https protocol.";
    }
  } catch {
    return "Please enter a valid URL (e.g. https://example.com/download).";
  }

  return null;
}

export function withAttachmentMime(file: File): File {
  if (file.type) return file;
  const inferred = MIME_BY_EXTENSION[extensionOf(file.name)]?.[0];
  return inferred
    ? new File([file], file.name, { type: inferred, lastModified: file.lastModified })
    : file;
}

