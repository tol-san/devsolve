import React from "react";
import ProblemDetailPage from "@/components/discussions/ProblemDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DiscussionPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <ProblemDetailPage />
    </div>
  );
}