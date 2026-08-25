export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import { ProfileProvisioningGate } from "@/components/auth/ProfileProvisioningGate";
import { NotificationProvider } from "@/components/notifications/NotificationContext";
import { NotificationTrigger } from "@/components/notifications/NotificationTrigger";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import PageBackdrop from "@/components/layout/PageBackdrop";
import { NO_INDEX } from "@/lib/seo/metadata";

/**
 * Everything under `/dashboard` is signed-in only — the session middleware
 * bounces anonymous visitors to `/`, so a crawler never sees a page here
 * anyway. Declaring it keeps that true if a route is ever opened up, and the
 * title template gives every dashboard screen a sensible tab label.
 */
export const metadata: Metadata = {
  // The root template adds `· DevSolve` on top of whatever this produces.
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: NO_INDEX,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
