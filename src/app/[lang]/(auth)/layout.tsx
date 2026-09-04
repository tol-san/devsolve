import type { Metadata } from "next";
import PageBackdrop from "@/components/layout/PageBackdrop";
import { NO_INDEX } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: { absolute: `Sign in · ${SITE_NAME}` },
  robots: NO_INDEX,
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageBackdrop seed={6} />
      {children}
    </>
  );
}
