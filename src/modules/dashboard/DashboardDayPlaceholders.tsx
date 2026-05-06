"use client";

/**
 * ─── Dashboard Day Placeholders ────────────────────────────────────────────
 * TEMPORARY — dev/staging only.
 * Rendered under Day 1 and Day 10 tabs until those dashboards are built.
 * Remove this file when real Day 1 / Day 10 dashboards are implemented.
 */

import { FlaskConical, LayoutDashboard } from "lucide-react";

// ─── Shared card shell ────────────────────────────────────────────────────────

function PlaceholderCard({
  badge,
  badgeStyle,
  icon: Icon,
  iconStyle,
  title,
  subtitle,
}: {
  badge: string;
  badgeStyle: { background: string; border: string; color: string };
  icon: React.ElementType;
  iconStyle: { background: string; color: string };
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="max-w-sm w-full text-center p-10 rounded-2xl border border-dashed border-slate-200 bg-white shadow-sm flex flex-col items-center gap-4">
        {/* Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border"
          style={badgeStyle}
        >
          {badge}
        </span>

        {/* Icon ring */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={iconStyle}
        >
          <Icon size={28} />
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[20px] font-bold text-[#171717]">{title}</h2>
          <p className="text-sm text-[#68747a] leading-relaxed">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Day 1 Placeholder ────────────────────────────────────────────────────────

export function DashboardDay1Placeholder() {
  return (
    <PlaceholderCard
      badge="Coming next"
      badgeStyle={{
        background: "rgba(245,158,11,0.08)",
        border: "1px solid rgba(245,158,11,0.30)",
        color: "#b45309",
      }}
      icon={LayoutDashboard}
      iconStyle={{ background: "#fffbeb", color: "#d97706" }}
      title="Day 1 Dashboard"
      subtitle="Dashboard experience for profile-under-review state will render here."
    />
  );
}

// ─── Day 10 Placeholder ───────────────────────────────────────────────────────

export function DashboardDay10Placeholder() {
  return (
    <PlaceholderCard
      badge="Planned"
      badgeStyle={{
        background: "rgba(100,116,139,0.07)",
        border: "1px solid rgba(100,116,139,0.22)",
        color: "#64748b",
      }}
      icon={FlaskConical}
      iconStyle={{ background: "#f1f5f9", color: "#64748b" }}
      title="Day 10 Dashboard"
      subtitle="Post-verification active opportunity dashboard will render here."
    />
  );
}
