export const dynamic = "force-dynamic";

import { ProblemReviewDetail } from "@/components/admin/problems/ProblemReviewDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemReviewDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <ProblemReviewDetail id={id} />;
}
