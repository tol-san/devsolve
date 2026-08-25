export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { NO_INDEX } from "@/lib/seo/metadata";

/* A retired route kept only so old links land somewhere explaining itself.
   The live equivalent is `/programs`, which is what should be indexed. */
export const metadata: Metadata = {
  title: "Program",
  robots: NO_INDEX,
};

export default function Page() {
  return (
    <main className="min-h-[100dvh]">
      <section className="flex min-h-[100dvh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-base text-muted-foreground">
            The public program content has been removed.
          </p>
          <Link
            href="/account-type"
            className={`${buttonVariants({ variant: "link" })} mt-2 text-lg font-bold`}
          >
            Create Account
          </Link>
        </div>
      </section>
    </main>
  );
}
