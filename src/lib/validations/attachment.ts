export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MAX_FILES = 10;
export const ATTACHMENT_ACCEPT =
  ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.log";

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

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function validateAttachment(file: File): string | null {
  if (file.size === 0) return `${file.name} is empty.`;
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return `${file.name} is larger than 10 MiB.`;
  }

  const extension = extensionOf(file.name);
  const acceptedMimeTypes = MIME_BY_EXTENSION[extension];
  if (!acceptedMimeTypes) {
    return `${file.name} is not a supported PDF, Word, image, text, or log file.`;
  }
  if (file.type && !acceptedMimeTypes.includes(file.type.toLowerCase())) {
    return `${file.name} does not match its file type.`;
  }
  return null;
}

/** Browsers commonly leave .log files without a MIME type. */
export function withAttachmentMime(file: File): File {
  if (file.type) return file;
  const inferred = MIME_BY_EXTENSION[extensionOf(file.name)]?.[0];
  return inferred
    ? new File([file], file.name, { type: inferred, lastModified: file.lastModified })
    : file;
}
