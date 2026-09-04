export const ORGANIZATION_LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const ORGANIZATION_LOGO_ACCEPTED = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const ORGANIZATION_LOGO_ACCEPT_ATTR =
  ORGANIZATION_LOGO_ACCEPTED.join(",");

export function validateOrganizationLogoFile(file: File): string | null {
  if (!ORGANIZATION_LOGO_ACCEPTED.includes(file.type)) {
    return "Logos must be a PNG, JPG, or WebP image";
  }

  if (file.size > ORGANIZATION_LOGO_MAX_BYTES) {
    return `Logo must be 2MB or smaller (this one is ${(
      file.size /
      1024 /
      1024
    ).toFixed(1)}MB)`;
  }

  return null;
}
