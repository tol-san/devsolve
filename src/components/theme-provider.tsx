"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useIsHydrated } from "@/hooks/use-is-hydrated";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

const INERT_SCRIPT: NonNullable<ThemeProviderProps["scriptProps"]> = {
  type: "application/x-inert",
};

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
