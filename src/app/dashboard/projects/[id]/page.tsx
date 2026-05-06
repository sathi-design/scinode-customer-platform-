"use client";

import { use } from "react";
import { ProjectDetail } from "@/modules/dashboard/ProjectDetail";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ProjectDetail id={Number(id)} />;
}
