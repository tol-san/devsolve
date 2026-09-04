export const dynamic = "force-dynamic";

import { SolutionReviewDetail } from "@/components/admin/solutions/SolutionReviewDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolutionReviewDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <SolutionReviewDetail id={id} />;
}
