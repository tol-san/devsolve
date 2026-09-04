import type { Metadata } from "next";
import { NO_INDEX } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  robots: NO_INDEX,
};

export default function CompanyProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
