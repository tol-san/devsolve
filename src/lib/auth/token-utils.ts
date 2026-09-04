export function extractRealmRolesFromToken(rawToken: string): string[] {
  if (!rawToken || typeof rawToken !== "string") return [];

  try {
    const parts = rawToken.split(".");
    if (parts.length < 2) return [];

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    const realmRoles: string[] = payload?.realm_access?.roles || [];
    return realmRoles.map((r) => String(r).toUpperCase());
  } catch (err) {
    console.error("Error parsing JWT access token roles:", err);
    return [];
  }
}
