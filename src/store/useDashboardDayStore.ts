/**
 * ─── Dashboard Day Store ────────────────────────────────────────────────────
 * TEMPORARY — dev/staging only.
 * Holds the active dashboard lifecycle state (Day 0 / Day 1 / Day 10).
 * Not persisted — resets to Day 0 on every page load.
 * Remove this file (and all imports of it) when staging nav is no longer needed.
 */

import { create } from "zustand";

export type DashboardDay = "day0" | "day1" | "day10";

interface DashboardDayStore {
  dashboardDay: DashboardDay;
  setDashboardDay: (day: DashboardDay) => void;
}

export const useDashboardDayStore = create<DashboardDayStore>()((set) => ({
  dashboardDay: "day0",
  setDashboardDay: (day) => set({ dashboardDay: day }),
}));
