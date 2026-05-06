"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Send,
  TrendingUp,
  CircleUser,
  ArrowRight,
} from "lucide-react";
import { useAuth, RESEARCHER_ROLES } from "@/hooks/useAuth";

// ─── Local SVG logo assets ────────────────────────────────────────────────────
const LOGO_COLLAPSED_SRC       = "/images/logo-collapsed.svg";    // 413×411 hexagonal sphere
const LOGO_EXPANDED_MFG_SRC    = "/images/logo-expanded.svg";     // "V for Manufacturers"
const LOGO_EXPANDED_RESEARCH_SRC = "/images/v-for-researchers.svg"; // "V for Researchers"

// ─── Bottom banner assets (Figma CDN) ─────────────────────────────────────────
const BANNER_BG_IMG =
  "https://www.figma.com/api/mcp/asset/b2b12d65-f458-4e17-a4eb-901ebf102dae";
const BADGE_ICON_SRC =
  "https://www.figma.com/api/mcp/asset/c3c1fa3f-1ed6-4b52-96e8-61899f8442b4";

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",       href: "/dashboard",           icon: LayoutDashboard },
  { label: "Projects",        href: "/dashboard/projects",  icon: FolderOpen },
  { label: "Proposals",       href: "/dashboard/proposals", icon: Send },
  { label: "Active Projects", href: "/dashboard/orders",    icon: TrendingUp },
  { label: "Profile",         href: "/dashboard/profile",   icon: CircleUser },
] as const;

const W_COLLAPSED = 56;
const W_EXPANDED  = 259;

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

// ─── Inner panel content (shared between desktop + mobile) ───────────────────
function SidebarContent({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const expandedLogoSrc = user && RESEARCHER_ROLES.has(user.role)
    ? LOGO_EXPANDED_RESEARCH_SRC
    : LOGO_EXPANDED_MFG_SRC;

  const expandedLogoAlt = user && RESEARCHER_ROLES.has(user.role)
    ? "Scinode for Researchers"
    : "Scinode for Manufacturers";

  return (
    <div className="flex flex-col h-full">

      {/* ── LOGO HEADER ── */}
      {/* Height expands when open to fit the full logo (1623×560 @ width 227px ≈ 78px tall) */}
      {/* + 16px top padding + 10px bottom = 104px open, 64px collapsed */}
      <div
        className="relative flex-shrink-0 border-b border-[#e4e4e7] overflow-visible"
        style={{
          height: open ? 104 : 64,
          transition: "height 280ms ease-in-out",
        }}
      >
        {/* Collapsed: hexagonal icon — centered */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_COLLAPSED_SRC}
          alt="Scinode"
          className="absolute block object-contain"
          style={{
            width: 34,
            height: 34,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${open ? 0.8 : 1})`,
            opacity: open ? 0 : 1,
            transition: "opacity 200ms ease-in-out, transform 280ms ease-in-out",
            pointerEvents: "none",
          }}
        />
        {/* Expanded: full-width logo, padded 16px from top */}
        {/* 1623×560 at width 227px → height ≈ 78px, sits inside 104px header */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={expandedLogoSrc}
          alt={expandedLogoAlt}
          className="absolute block"
          style={{
            width: W_EXPANDED - 32,
            height: "auto",
            left: 16,
            top: 13,
            opacity: open ? 1 : 0,
            transform: `translateX(${open ? 0 : -8}px)`,
            transition: `opacity 220ms ease-in-out ${open ? "80ms" : "0ms"}, transform 280ms ease-in-out`,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 list-none p-0 m-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center rounded-lg",
                    "transition-[gap,padding,background] duration-[280ms] ease-in-out",
                    open ? "gap-3 px-3 py-2" : "justify-center px-0 py-2",
                    active
                      ? "text-white"
                      : "text-[#71717a] hover:text-[#111] hover:bg-black/[0.05]",
                  )}
                  style={
                    active
                      ? { background: "linear-gradient(98.03deg, #016358 12.27%, #182133 110.8%)" }
                      : undefined
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span
                    className="text-sm font-medium whitespace-nowrap leading-5 overflow-hidden"
                    style={{
                      maxWidth: open ? 180 : 0,
                      opacity: open ? 1 : 0,
                      transform: `translateX(${open ? 0 : -4}px)`,
                      transition: `max-width 280ms ease-in-out, opacity 200ms ease-in-out ${open ? "60ms" : "0ms"}, transform 250ms ease-in-out ${open ? "60ms" : "0ms"}`,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── BOTTOM SECTION ── */}
      <div
        className="flex-shrink-0 overflow-hidden relative"
        style={{
          padding: open ? 16 : 8,
          height: open ? 282 : 90,
          transition: "height 280ms ease-in-out, padding 280ms ease-in-out",
        }}
      >
        {/* Collapsed badge */}
        <div
          className="absolute"
          style={{
            opacity: open ? 0 : 1,
            transform: `scale(${open ? 0.92 : 1})`,
            transition: "opacity 180ms ease-in-out, transform 280ms ease-in-out",
            pointerEvents: open ? "none" : "auto",
          }}
        >
          <div
            className="relative rounded-[8px] overflow-hidden flex flex-col items-center gap-[4px] pb-[4px]"
            style={{ width: W_COLLAPSED - 16 }}
          >
            <div className="absolute pointer-events-none" style={{ width: 312, height: 412, left: -101, top: -59 }}>
              <div className="w-full h-full flex items-center justify-center">
                <div style={{ transform: "rotate(90.62deg)", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BANNER_BG_IMG} alt="" className="block object-cover" style={{ width: 409, height: 307 }} />
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center pt-[5px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BADGE_ICON_SRC} alt="Scinode" className="block" style={{ width: 32, height: 32 }} />
            </div>
            <p className="relative text-white font-semibold text-[10px] text-center leading-tight tracking-[-0.3px]">
              SCINODE<br />Connect
            </p>
          </div>
        </div>

        {/* Expanded "Need Help?" card */}
        <div
          style={{
            opacity: open ? 1 : 0,
            transform: `translateY(${open ? 0 : 8}px)`,
            transition: `opacity 220ms ease-in-out ${open ? "100ms" : "0ms"}, transform 280ms ease-in-out ${open ? "80ms" : "0ms"}`,
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <div className="relative rounded-[16px] overflow-hidden">
            <div className="absolute pointer-events-none" style={{ width: 312, height: 412, left: -56, top: -107 }}>
              <div className="w-full h-full flex items-center justify-center">
                <div style={{ transform: "rotate(90.62deg)", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BANNER_BG_IMG} alt="" className="block object-cover" style={{ width: 409, height: 307 }} />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-[16px]" style={{ background: "rgba(0,0,0,0.65)" }} />
            <div className="absolute inset-0 mix-blend-overlay rounded-[16px]" style={{ background: "rgba(255,255,255,0.2)" }} />
            <div className="absolute inset-0 rounded-[16px]" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="relative p-[16px] flex flex-col items-center gap-[16px] text-white text-center">
              <div className="flex flex-col gap-[11px]">
                <p className="text-[18px] font-semibold leading-[28px]">Need Help?</p>
                <p className="text-sm leading-[24px]">
                  Have questions about posting an R&amp;D brief or submitting a proposal? Our scientific support team is here to guide you.
                </p>
              </div>
              <button className="flex items-center justify-center gap-2 w-full bg-[#1F6F54] hover:bg-[#185C45] text-white text-sm font-medium px-4 py-2 rounded-[6px] transition-colors">
                Schedule Call <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* ══ MOBILE / TABLET — fixed slide-in panel ══ */}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden",
          "bg-[#f8f9fa] border-r border-[#e4e4e7] shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ width: W_EXPANDED }}
      >
        <SidebarContent open={true} onClose={onClose} />
      </aside>

      {/* ══ DESKTOP — hover-to-expand sidebar ══ */}
      <div
        className="relative flex-shrink-0 hidden lg:block transition-[width] duration-300 ease-in-out"
        style={{ width: expanded ? W_EXPANDED : W_COLLAPSED }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-30 flex flex-col overflow-hidden",
            "border-r border-[#e4e4e7]",
            "transition-[width,box-shadow,background-color] duration-[280ms] ease-in-out",
            expanded
              ? "bg-[#f8f9fa] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.10),0px_10px_10px_-5px_rgba(0,0,0,0.04)]"
              : "bg-[#fafafa]",
          )}
          style={{ width: expanded ? W_EXPANDED : W_COLLAPSED }}
        >
          <SidebarContent open={expanded} />
        </aside>
      </div>
    </>
  );
}
