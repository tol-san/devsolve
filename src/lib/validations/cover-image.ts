
export const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const COVER_IMAGE_ACCEPTED = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const COVER_IMAGE_ACCEPT_ATTR = COVER_IMAGE_ACCEPTED.join(",");

export function validateCoverImageFile(file: File): string | null {
  if (!COVER_IMAGE_ACCEPTED.includes(file.type)) {
    return "Cover image must be a PNG, JPG, or WebP image";
  }
  if (file.size > COVER_IMAGE_MAX_BYTES) {
    return `Image must be 5MB or smaller (this one is ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}
