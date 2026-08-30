/**
 * Constraints for cover image uploads:
 * - `PUT /api/v1/user-profiles/me/cover`
 * - `PUT /api/v1/organizations/me/cover`
 */

/** Cover images render across full-width hero banners — 5MB maximum. */
export const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** No SVG: cover images are user-supplied and SVG can carry script. */
export const COVER_IMAGE_ACCEPTED = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

/** The `accept` attribute for the file input. */
export const COVER_IMAGE_ACCEPT_ATTR = COVER_IMAGE_ACCEPTED.join(",");

/** Null when the file is acceptable, otherwise the reason it is not. */
export function validateCoverImageFile(file: File): string | null {
  if (!COVER_IMAGE_ACCEPTED.includes(file.type)) {
    return "Cover image must be a PNG, JPG, or WebP image";
  }
  if (file.size > COVER_IMAGE_MAX_BYTES) {
    return `Image must be 5MB or smaller (this one is ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}
