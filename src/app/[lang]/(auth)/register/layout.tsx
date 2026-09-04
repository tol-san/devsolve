import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: { absolute: `Create an account · ${SITE_NAME}` },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
