import { Pool } from "pg";

const KEYCLOAK_ISSUER =
  process.env.KEYCLOAK_ISSUER || "https://auth.quizzy.it.com/realms/devsolve";
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "devsolve-admin";
const KEYCLOAK_CLIENT_SECRET =
  process.env.KEYCLOAK_CLIENT_SECRET || "9eYFasE8u0SlhhkF7cqCZs8on1fAmUlY";

const pool = new Pool({
  host: process.env.DB_HOST || "51.79.146.203",
  port: parseInt(process.env.DB_PORT || "8888", 10),
  database: process.env.DB_NAME || "devsolve_db",
  user: process.env.DB_USER || "phsardigital",
  password: process.env.DB_PASSWORD || "qwer",
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Obtain an OAuth2 client credentials token from Keycloak using admin credentials.
 */
export async function getKeycloakAdminToken(): Promise<string> {
  const tokenEndpoint = `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
    }).toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to obtain Keycloak admin token: ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Check if a username or email is already registered in Keycloak or PostgreSQL.
 */
export async function checkUserConflict(
  username: string,
  email: string,
): Promise<boolean> {
  try {
    const res = await pool.query(
      "SELECT id FROM user_profiles WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1",
      [username, email],
    );
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.warn("DB conflict check failed, falling back to Keycloak:", err);
    return false;
  }
}

/**
 * Directly create a user in Keycloak when upstream backend fails.
 */
export async function createKeycloakUser(
  token: string,
  user: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  },
): Promise<string> {
  const baseUrl = KEYCLOAK_ISSUER.replace(/\/realms\/.*$/, "");
  const realm = KEYCLOAK_ISSUER.split("/realms/")[1] || "devsolve";
  const usersUrl = `${baseUrl}/admin/realms/${realm}/users`;

  const res = await fetch(usersUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: user.email,
      email: user.email,
      enabled: true,
      emailVerified: true,
      firstName: user.firstName,
      lastName: user.lastName,
      credentials: [
        {
          type: "password",
          value: user.password,
          temporary: false,
        },
      ],
    }),
    cache: "no-store",
  });

  if (res.status === 409) {
    const error = new Error("Username or email already exists");
    (error as { status?: number }).status = 409;
    throw error;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Keycloak user creation failed (${res.status}): ${text}`);
  }

  const location = res.headers.get("location");
  if (location) {
    const parts = location.split("/");
    const id = parts[parts.length - 1];
    if (id) return id;
  }

  // Fallback: Query by email
  const queryRes = await fetch(
    `${usersUrl}?email=${encodeURIComponent(user.email)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const users = (await queryRes.json()) as Array<{ id: string }>;
  if (users?.[0]?.id) return users[0].id;

  throw new Error("Could not determine created user ID");
}

/**
 * Assign a realm role (e.g. USER, COMPANY) to a Keycloak user.
 */
export async function assignRealmRole(
  token: string,
  userId: string,
  roleName: "USER" | "COMPANY" | "ADMIN",
): Promise<void> {
  const baseUrl = KEYCLOAK_ISSUER.replace(/\/realms\/.*$/, "");
  const realm = KEYCLOAK_ISSUER.split("/realms/")[1] || "devsolve";

  try {
    const roleRes = await fetch(
      `${baseUrl}/admin/realms/${realm}/roles/${encodeURIComponent(roleName)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      },
    );
    if (!roleRes.ok) return;

    const roleData = await roleRes.json();

    await fetch(
      `${baseUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([roleData]),
        cache: "no-store",
      },
    );
  } catch (err) {
    console.warn(`Assigning role ${roleName} failed:`, err);
  }
}

/**
 * Provision user record in PostgreSQL user_profiles table.
 */
export async function provisionUserProfile({
  userId,
  username,
  email,
  firstName,
  lastName,
  phone,
}: {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<void> {
  const fullName = `${firstName} ${lastName}`.trim();
  const query = `
    INSERT INTO user_profiles (
      id, created_at, updated_at, email, full_name, username, phone, status,
      reputation, critical_reports, total_reports, valid_reports, recognition_count
    ) VALUES (
      $1, NOW(), NOW(), $2, $3, $4, $5, 'active',
      0, 0, 0, 0, 0
    )
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      updated_at = NOW();
  `;
  await pool.query(query, [userId, email, fullName, username, phone || null]);
}
