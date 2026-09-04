import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { authClient } from "@/lib/auth/auth-client";
import { extractRealmRolesFromToken } from "@/lib/auth/token-utils";
import { useGetEditProfileFormQuery } from "@/lib/redux/services/profileApi";
import { getAccessToken, clearAccessToken } from "@/lib/auth/access-token";
import { baseApi } from "@/lib/redux/services/baseApi";
import { proxyApi } from "@/lib/redux/services/proxyApi";
import { useRouter } from "next/navigation";

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
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    getAccessToken()
      .then((rawToken) => {
        if (cancelled) return;

        if (!rawToken) {
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
      clearAccessToken();

      dispatch(baseApi.util.resetApiState());
      dispatch(proxyApi.util.resetApiState());

      await authClient.signOut();

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      if (typeof window !== "undefined") {
        try {
          await fetch("/api/auth/stale-session?to=/", {
            method: "GET",
            credentials: "same-origin",
            redirect: "manual",
          });
        } catch {
          // Best-effort: if this fails the cookies may already be gone via
          // step 3, so proceed to the Keycloak logout regardless.
        }
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

      if (issuer && clientId && typeof window !== "undefined") {
        const cleanIssuer = issuer.replace(/\/+$/, "");
        const logoutUrl = new URL(`${cleanIssuer}/protocol/openid-connect/logout`);
        logoutUrl.searchParams.set("client_id", clientId);
        logoutUrl.searchParams.set("post_logout_redirect_uri", window.location.origin + "/");
        window.location.href = logoutUrl.toString();
      } else if (typeof window !== "undefined") {
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
