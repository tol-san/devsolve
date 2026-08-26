export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ProfileProvisioningGate } from "@/components/auth/ProfileProvisioningGate";
import { NotificationProvider } from "@/components/notifications/NotificationContext";
import { NotificationTrigger } from "@/components/notifications/NotificationTrigger";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import PageBackdrop from "@/components/layout/PageBackdrop";
import { auth } from "@/lib/auth/auth";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import { NO_INDEX } from "@/lib/seo/metadata";

/**
 * Everything under `/dashboard` is signed-in only — this layout turns anyone
 * without a session away before rendering, so a crawler never sees a page
 * here anyway. Declaring it keeps that true if a route is ever opened up, and
 * the title template gives every dashboard screen a sensible tab label.
 */
export const metadata: Metadata = {
  // The root template adds `· DevSolve` on top of whatever this produces.
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: NO_INDEX,
};

/**
 * The gate for every private route.
 *
 * The middleware also checks for a session, but only that the cookie is
 * *present* — `getSessionCookie` reads the jar, it does not verify a
 * signature or look the session up. Any value under that name walks past it,
 * including one left behind by an expired session or typed into devtools. It
 * is a cheap fast path, not an authorization decision.
 *
 * This is the decision. `auth.api.getSession` validates the cookie against
 * better-auth's own store, so a forged or stale one resolves to no session
 * and never reaches a dashboard screen. It sits in the layout rather than in
 * each page so a new route under `/dashboard` is protected by existing.
 *
 * Turning someone away sends them to the home page. It goes via
 * `/api/auth/stale-session` rather than straight to `/` because the cookie
 * that got them this far is still in the jar, and the middleware would read
 * it on `/` and bounce them right back here. That handler drops it first, so
 * the home page is where they actually land.
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

  /* Fails closed. If the session store cannot answer, the honest result is
     "not signed in" — treating an error as a pass would put the hole straight
     back. `redirect` throws its own control-flow signal, so it is called
     outside the catch rather than swallowed by it. */
  let session: Awaited<ReturnType<typeof auth.api.getSession>> = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    session = null;
  }

  if (!session) {
    redirect(`/api/auth/stale-session?to=/${locale}`);
  }

  return (
    <NotificationProvider>
      {/* Same surface as the landing hero — the dashboard is a continuation of
          the site, not a separate application. The shell below is transparent
          so it shows through; panels keep their own `bg-card`. */}
      <PageBackdrop seed={3} />
      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Dashboard Top Navigation Bar with Notification Bell Icon & Dark/Light Theme Toggle in top-right.
              Hidden on mobile — Sidebar's own mobile header already has these controls. */}
          <header className="hidden lg:flex h-16 px-6 md:px-8 border-b border-slate-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30 items-center justify-end gap-2">
            <LanguageSwitcher />
            <NotificationTrigger />
            <ThemeToggle
              variant="rectangle"
              start="bottom-up"
              className="size-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-2xs transition-colors hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
              iconClassName="size-5"
            />
          </header>
          <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0 w-full">
            {/* The landing point for every signed-in user, social or not, so
                it is where an unprovisioned profile gets caught. */}
            <ProfileProvisioningGate>{children}</ProfileProvisioningGate>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
