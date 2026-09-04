import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { authClient } from "@/lib/auth/auth-client";
import { extractRealmRolesFromToken } from "@/lib/auth/token-utils";
import { useGetEditProfileFormQuery } from "@/lib/redux/services/profileApi";
import { getAccessToken, clearAccessToken } from "@/lib/auth/access-token";
import { baseApi } from "@/lib/redux/services/baseApi";
import { proxyApi } from "@/lib/redux/services/proxyApi";
import { useRouter } from "next/navigation";

/** Extension of the better-auth session user that includes the role field injected by Keycloak */
interface SessionUserWithRole {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  roles?: string[];
}

export function useSidebarAuth() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const { data: profile } = useGetEditProfileFormQuery(undefined, { skip: !session });
  const displayName = profile?.fullName || user?.name || user?.email || "User";
  const [tokenRoles, setTokenRoles] = useState<string[]>([]);
  const [tokenRolesResolved, setTokenRolesResolved] = useState(false);
  // Tracks whether the Keycloak JWT is genuinely available (not just that
  // the better-auth session cookie exists). Used by the rest of the app to
  // decide whether it is safe to fire authenticated requests.
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    // Use the shared getAccessToken() from access-token.ts so that the
    // singleton token cache is warm by the time areRolesResolved flips to
    // true. Previously, calling authClient.getAccessToken() directly left the
    // cache cold, causing RTK Query's prepareHeaders to race the token fetch
    // on first load — resulting in a 401 "Not authenticated" error on every
    // fresh page visit.
    getAccessToken()
      .then((rawToken) => {
        if (cancelled) return;

        if (!rawToken) {
          // A session cookie exists but the Keycloak refresh token has
          // expired (or was revoked). The cookie is now stale: clear it
          // server-side and send the user back to the login page so they
          // can get a fresh Keycloak token instead of seeing 401 errors
          // on every API call.
          router.replace("/api/auth/stale-session?to=/");
          return;
        }

        setTokenReady(true);
        const realmRoles = extractRealmRolesFromToken(rawToken);
        const appRoles = realmRoles.filter((r) =>
          ["USER", "COMPANY", "ADMIN", "MODERATOR"].includes(r)
        );
        setTokenRoles(
          appRoles.length > 0 ? Array.from(new Set(appRoles)) : ["USER"]
        );
      })
      .finally(() => {
        if (!cancelled) setTokenRolesResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, [session, router]);

  const sessionRoles = (user as SessionUserWithRole)?.role
    ? String((user as SessionUserWithRole).role)
        .split(",")
        .map((r) => r.trim().toUpperCase())
    : [];

  const activeRoles =
    sessionRoles.length > 0
      ? sessionRoles
      : tokenRoles.length > 0
      ? tokenRoles
      : ["USER"];
  const areRolesResolved =
    !isPending && Boolean(user) &&
    (sessionRoles.length > 0 || tokenRolesResolved);

  const effectiveUser: SidebarUser | undefined = user
    ? {
        name: user.name,
        email: user.email,
        image: profile?.avatarUrl || user.image,
        role: activeRoles.join(","),
        roles: activeRoles,
      }
    : undefined;

  const handleSignOut = async () => {
    try {
      // 1. Clear cached access token in memory
      clearAccessToken();

      // 2. Dispatch RTK Query resetApiState to wipe cached user data from Redux
      dispatch(baseApi.util.resetApiState());
      dispatch(proxyApi.util.resetApiState());

      // 3. Clear better-auth session & cookies on the client domain
      await authClient.signOut();

      // 4. Clear client storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      // 5. Redirect to Keycloak OIDC end_session endpoint to clear Keycloak SSO session & cookies
      const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

      if (issuer && clientId) {
        const cleanIssuer = issuer.replace(/\/+$/, "");
        const logoutUrl = new URL(`${cleanIssuer}/protocol/openid-connect/logout`);
        logoutUrl.searchParams.set("client_id", clientId);
        logoutUrl.searchParams.set("post_logout_redirect_uri", window.location.origin);
        window.location.href = logoutUrl.toString();
      } else {
        window.location.href = "/";
      }
    }
  };

  return {
    user: effectiveUser,
    isPending,
    areRolesResolved,
    tokenReady,
    displayName,
    handleSignOut,
  };
}
