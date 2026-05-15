"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { TrialBanner } from "./TrialBanner";
import { useAppStore } from "@/store/useAppStore";
import { useAuth, RESEARCHER_ROLES } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarOpen    = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const { user }       = useAuth();

  // Show trial banner only for manufacturing users
  const isManufacturing = user ? !RESEARCHER_ROLES.has(user.role) : false;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-page">

      {/* ── Global trial banner — manufacturing only, above everything ── */}
      {isManufacturing && <TrialBanner />}

      {/* ── Main app shell ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

    </div>
  );
}
