"use client";

import { use } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProjectDetail }             from "@/modules/dashboard/ProjectDetail";
import { ManufacturerProjectDetail } from "@/modules/dashboard/ManufacturerProjectDetail";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }   = use(params);
  const { user } = useAuth();

  // Manufacturer role → new detail page with trial/locked states
  // All other roles → existing detail page (unchanged)
  if (user?.role === "manufacturing") {
    return <ManufacturerProjectDetail id={Number(id)} />;
  }

  return <ProjectDetail id={Number(id)} />;
}
