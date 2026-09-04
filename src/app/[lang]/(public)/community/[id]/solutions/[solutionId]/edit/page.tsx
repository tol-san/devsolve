import type { Metadata } from "next";
import { SolutionEditScreen } from "@/components/discussions/create/SolutionEditScreen";
import { NO_INDEX } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ solutionId: string }>;
}

export const metadata: Metadata = {
  title: "Edit solution",
  robots: NO_INDEX,
};

export default async function EditSolutionPage({ params }: PageProps) {
  const { solutionId } = await params;

  return <SolutionEditScreen solutionId={solutionId} />;
}
