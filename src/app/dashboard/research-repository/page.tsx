"use client";

import { Suspense } from "react";
import { DeepResearchRepository } from "@/modules/dashboard/DeepResearchRepository";

export default function ResearchRepositoryPage() {
  return (
    <Suspense>
      <DeepResearchRepository />
    </Suspense>
  );
}
