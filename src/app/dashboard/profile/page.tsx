"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // Redirect to login if hydrated and still no user
  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login");
    }
  }, [hydrated, user, router]);

  // Show nothing while hydrating or redirecting
  if (!hydrated || !user) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-[#2ACB83] border-t-transparent animate-spin" />
    </div>
  );

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
