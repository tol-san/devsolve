export const dynamic = "force-dynamic";

import { ShowcaseReviewDetail } from "@/components/admin/showcases/ShowcaseReviewDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowcaseReviewDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <ShowcaseReviewDetail id={id} />;
}
