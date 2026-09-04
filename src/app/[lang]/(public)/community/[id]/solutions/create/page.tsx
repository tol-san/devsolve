import type { Metadata } from "next";
import { SolutionCreateScreen } from "@/components/discussions/create/SolutionCreateScreen";
import { NO_INDEX } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Post a solution",
  robots: NO_INDEX,
};

export default async function CreateSolutionPage({ params }: PageProps) {
  const { id } = await params;

  return <SolutionCreateScreen problemId={id} />;
}
