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

export const metadata: Metadata = {
  // The root template adds `· DevSolve` on top of whatever this produces.
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: NO_INDEX,
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;

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
      <PageBackdrop seed={3} />
      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full">
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
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto min-w-0 w-full">
            <ProfileProvisioningGate>{children}</ProfileProvisioningGate>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
