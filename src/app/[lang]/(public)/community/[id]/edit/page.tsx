import type { Metadata } from "next";
import { ProblemEditScreen } from "@/components/discussions/create/ProblemEditScreen";
import { NO_INDEX } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit problem",
  robots: NO_INDEX,
};

export default async function EditProblemPage({ params }: PageProps) {
  const { id } = await params;

  return <ProblemEditScreen problemId={id} />;
}
