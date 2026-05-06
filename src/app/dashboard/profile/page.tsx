"use client";

import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHydration } from "@/hooks/useHydration";
import { ProfileSetup } from "@/modules/profile/ProfileSetup";
import { ResearcherProfileSetup } from "@/modules/researcher-profile/ResearcherProfileSetup";
import { IndependentCROProfileSetup } from "@/modules/independent-cro-profile/IndependentCROProfileSetup";

// Roles that use the Researcher profile module (excludes "pi" = Independent CRO)
const RESEARCHER_PROFILE_ROLES = new Set(["cro", "scientist", "researcher"]);

function ProfileGate() {
  const { user } = useAuth();
  const hydrated = useHydration();

  // Wait for hydration so role is accurate from persisted store
  if (!hydrated || !user) return null;

  // profileSubtype wins: "pi" = Independent CRO profile module
  if (user.profileSubtype === "pi" || user.role === "pi") {
    return <IndependentCROProfileSetup />;
  }

  if (user.profileSubtype === "researcher" || RESEARCHER_PROFILE_ROLES.has(user.role)) {
    return <ResearcherProfileSetup />;
  }

  return <ProfileSetup />;
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileGate />
    </Suspense>
  );
}
