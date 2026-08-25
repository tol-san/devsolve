import type { Metadata } from "next";
import PageBackdrop from "@/components/layout/PageBackdrop";
import { NO_INDEX } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

/**
 * Carries the shared page backdrop and describes the routes under it.
 *
 * Sign-in, registration and account-type selection are forms, not documents:
 * there is nothing on them worth a search result, and a signed-out visitor
 * arriving from one has no context. `robots.txt` also disallows them, but a
 * disallowed URL someone links to can still be listed — the header here is
 * what actually keeps them out.
 */
/* `absolute`, because the root template also applies to a nested segment's
   plain title — which is how these pages came out as `Sign in · DevSolve ·
   DevSolve`. It leaves the template in place for any child that sets one. */
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
      {/* Sign-in and registration sit on the same surface the landing hero
          opens on, so arriving from the marketing pages is continuous. */}
      <PageBackdrop seed={6} />
      {children}
    </>
  );
}
