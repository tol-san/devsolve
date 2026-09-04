"use client";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";

export type IdpHint = "google" | "github";

export function useKeycloakLogin() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingIdpHint, setPendingIdpHint] = useState<IdpHint | null>(null);

  useEffect(() => {
    const reset = () => {
      setIsLoggingIn(false);
      setPendingIdpHint(null);
    };
    window.addEventListener("pageshow", reset);
    window.addEventListener("focus", reset);
    return () => {
      window.removeEventListener("pageshow", reset);
      window.removeEventListener("focus", reset);
    };
  }, []);

  const handleLogin = async (
    callbackURL: string = "/",
    idpHint?: IdpHint,
  ) => {
    setIsLoggingIn(true);
    setPendingIdpHint(idpHint ?? null);

    const fail = (...log: unknown[]) => {
      console.error(...(log as [unknown, ...unknown[]]));
      setIsLoggingIn(false);
      setPendingIdpHint(null);
    };

    try {
      const targetUrl = callbackURL || "/";
      const result = await authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: targetUrl,
        disableRedirect: true,
      });

      if (result?.error) {
        const err: { message?: string; statusText?: string } = result.error;
        const errorMsg =
          err?.message ||
          err?.statusText ||
          (typeof err === "object" ? JSON.stringify(err) : String(err));
        fail("[Auth] Keycloak sign-in failed:", errorMsg, err);
        return;
      }

      if (result?.data?.url) {
        const authorizeUrl = new URL(result.data.url, window.location.origin);
        if (idpHint) {
          authorizeUrl.searchParams.set("kc_idp_hint", idpHint);
        }

        console.log("[Auth] Redirecting to Keycloak:", authorizeUrl.toString());
        window.location.href = authorizeUrl.toString();
      } else {
        fail("[Auth] No redirect URL returned:", result);
      }
    } catch (error) {
      fail("[Auth] Keycloak sign-in error:", error);
    }
  };

  return { isLoggingIn, pendingIdpHint, handleLogin };
}
