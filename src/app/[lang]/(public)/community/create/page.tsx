"use client";

import React from "react";
import { CreatePostSelection } from "@/components/discussions/create/CreatePostSelection";

export default function PublicCreatePostSelectionPage() {
  return (
    <CreatePostSelection
      basePath="/community/create"
      backHref="/community"
      backLabel="Back to community"
      className="min-h-[calc(100dvh-var(--navbar-height))]"
    />
  );
}
