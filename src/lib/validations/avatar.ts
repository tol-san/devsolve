
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const AVATAR_ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export const AVATAR_ACCEPT_ATTR = AVATAR_ACCEPTED.join(",");

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ACCEPTED.includes(file.type)) {
    return "Avatars must be a PNG, JPG, or WebP image";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return `Image must be 2MB or smaller (this one is ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}
