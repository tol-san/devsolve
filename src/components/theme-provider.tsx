"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useIsHydrated } from "@/hooks/use-is-hydrated";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * A `type` that is not a JavaScript MIME type, which makes the tag a *data
 * block*: the browser parses it and runs nothing, and React — which checks for
 * exactly that before complaining about scripts it has to create on the
 * client — stays quiet.
 */
const INERT_SCRIPT: NonNullable<ThemeProviderProps["scriptProps"]> = {
  type: "application/x-inert",
};

/**
 * Wraps next-themes and mutes its inline script once hydration is over.
 *
 * next-themes renders its FOUC-preventing script as an ordinary React element
 * inside the provider. That is right for the server render — the browser runs
 * it while still parsing, so `<html>` carries the theme class before the first
 * paint — but React never executes a script it *creates* on the client, and
 * says so: *"Encountered a script tag while rendering React component."*
 *
 * This app reaches that path often. `[lang]` is a dynamic segment of the root
 * layout, so switching language unmounts the whole layout and builds it again
 * client-side, and Fast Refresh does the same in development. Each of those
 * re-creates the script for nothing.
 *
 * Nothing is lost by marking it inert for those renders: the class is already
 * on `<html>` and next-themes' own effects keep it in step with the stored
 * preference. Only the server render and the hydration that has to match it
 * get the executable version — the one render where the script actually runs.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const hydrated = useIsHydrated();

  return (
    <NextThemesProvider
      {...props}
      scriptProps={hydrated ? INERT_SCRIPT : props.scriptProps}
    >
      {children}
    </NextThemesProvider>
  );
}
