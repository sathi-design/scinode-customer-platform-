"use client";

import { useAuth } from "@/hooks/useAuth";
import { ProjectsListing }       from "@/modules/dashboard/ProjectsListing";
import { ProjectsListingLegacy } from "@/modules/dashboard/ProjectsListingLegacy";

export default function ProjectsPage() {
  const { user } = useAuth();

  // New manufacturer-specific listing (tabs, trial banner, filter drawer, exclusive states)
  // All other roles (cro, researcher, pi, scientist, …) keep the original listing
  if (user?.role === "manufacturing") {
    return <ProjectsListing />;
  }

  return <ProjectsListingLegacy />;
}
