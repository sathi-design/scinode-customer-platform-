"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useAppStore } from "@/store/useAppStore";

interface DashboardLayoutProps {
  children: React.ReactNode;  
}
  
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  return (
    <div className="h-screen flex overflow-hidden bg-bg-page">
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
  );
}
