"use client";

import { useAuth } from "@/hooks/useAuth";
import { useHydration } from "@/hooks/useHydration";

// Day 0 dashboards (untouched)
import { CRODashboard } from "@/modules/dashboard/CRODashboard";
import { ManufacturingDashboard } from "@/modules/dashboard/ManufacturingDashboard";
import { ScientistDashboard } from "@/modules/dashboard/ScientistDashboard";
import { ResearcherDashboard } from "@/modules/dashboard/ResearcherDashboard";
import { ResearcherPlaceholderDashboard } from "@/modules/dashboard/ResearcherPlaceholderDashboard";
import { PIPlaceholderDashboard } from "@/modules/dashboard/PIPlaceholderDashboard";
import { IndependentCRODashboard } from "@/modules/dashboard/IndependentCRODashboard";

// Day 1 dashboards
import { Day1ResearcherDashboard, Day1CRODashboard } from "@/modules/dashboard/Day1Dashboard";

// TEMPORARY — dev/staging: remove when Day 10 dashboard is built
import { DashboardDay10Placeholder } from "@/modules/dashboard/DashboardDayPlaceholders";

import { useDashboardDayStore } from "@/store/useDashboardDayStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const hydrated     = useHydration();
  const router       = useRouter();
  const dashboardDay = useDashboardDayStore((s) => s.dashboardDay);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return null;
  if (!user)     return null;

  // ── profileSubtype takes priority over role ──────────────────────────────────
  const subtype = user.profileSubtype;

  // ── Resolve which Day 0 dashboard to render ──────────────────────────────────
  const Day0Dashboard = (() => {
    if (subtype === "pi")         return <IndependentCRODashboard />;
    if (subtype === "researcher") return <ResearcherDashboard />;
    if (subtype === "others")     return <ResearcherDashboard />;
    switch (user.role) {
      case "manufacturing": return <ManufacturingDashboard />;
      case "scientist":     return <ScientistDashboard />;
      case "researcher":    return <ResearcherPlaceholderDashboard />;
      case "pi":            return <IndependentCRODashboard />;
      case "cro":
      default:              return <CRODashboard />;
    }
  })();

  // ── Resolve which Day 1 dashboard to render ──────────────────────────────────
  const Day1Dashboard = (() => {
    if (subtype === "pi")         return <Day1CRODashboard />;
    if (subtype === "researcher") return <Day1ResearcherDashboard />;
    if (subtype === "others")     return <Day1ResearcherDashboard />;
    switch (user.role) {
      case "pi":
      case "cro":  return <Day1CRODashboard />;
      default:     return <Day1ResearcherDashboard />;
    }
  })();

  // ── Render based on selected day ─────────────────────────────────────────────
  if (dashboardDay === "day1") {
    return (
      <div key="day1" className="animate-in fade-in duration-200">
        {Day1Dashboard}
      </div>
    );
  }

  // TEMPORARY — day10 placeholder
  if (dashboardDay === "day10") {
    return (
      <div key="day10" className="animate-in fade-in duration-200">
        <DashboardDay10Placeholder />
      </div>
    );
  }

  // Day 0 — existing dashboards (untouched)
  return (
    <div key="day0" className="animate-in fade-in duration-200">
      {Day0Dashboard}
    </div>
  );
}
