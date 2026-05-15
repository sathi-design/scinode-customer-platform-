"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  Mail,
  Phone,
  ChevronRight,
  X,
  Crown,
  Check,
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

// ─── Upgrade modal data ───────────────────────────────────────────────────────
const UPGRADE_BENEFITS = [
  "Send unlimited proposals, including exclusive, capability-matched projects",
  "Get global leads across your entire product catalogue",
  "Access projects curated specifically for your plant",
  "Track every proposal through to conversion and delivery",
  "Expert support on compliance and quality requirements",
  "Work closely with the SciNode team to win the right projects",
  "On-demand R&D and process optimization support from domain experts",
  "Guidance for certifications, audits, and global regulatory readiness",
];

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#fff" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Green header ── */}
        <div
          className="relative px-6 pt-6 pb-7"
          style={{ background: "linear-gradient(135deg, #1a5c3a 0%, #0d3d26 100%)" }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border border-white/30 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={15} strokeWidth={2.5} />
          </button>

          {/* Premium badge */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Crown size={18} className="text-white" />
            </div>
            <span className="text-white text-[12px] font-bold tracking-[0.14em]">PREMIUM</span>
          </div>

          {/* Heading */}
          <h2 className="text-white text-[26px] font-bold leading-tight mb-2">
            Unlock Full Project Access
          </h2>
          <p className="text-white/75 text-[14px] leading-relaxed">
            You&apos;ve reached your limit. Upgrade to unlock exclusive projects,
            unlimited proposals, demand, and execution support built around your plant.
          </p>
        </div>

        {/* ── Benefits list ── */}
        <div className="px-6 py-5 max-h-[340px] overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          <p className="text-[11px] font-bold text-slate-400 tracking-[0.14em] mb-4">
            WHAT YOU UNLOCK
          </p>
          <ul className="space-y-3.5">
            {UPGRADE_BENEFITS.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#e3f5ec" }}>
                  <Check size={11} strokeWidth={3} style={{ color: "#1a5c3a" }} />
                </div>
                <span className="text-[14px] text-slate-700 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Footer CTA ── */}
        <div className="px-6 pb-5 pt-2 flex items-center gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-[14px] font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            Maybe later
          </button>
          <button
            className="flex-1 py-3 rounded-xl text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-sm"
            style={{ background: "linear-gradient(135deg, #1a5c3a 0%, #0d3d26 100%)" }}
          >
            <Crown size={15} />
            Get Full Access
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

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
  const [upgradeOpen, setUpgradeOpen] = useState(false);
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
          height: open ? 316 : 76,
          transition: "height 280ms ease-in-out",
        }}
      >

        {/* ── COLLAPSED STATE ── */}
        <div
          className="absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-1 py-3"
          style={{
            opacity: open ? 0 : 1,
            transform: `scale(${open ? 0.88 : 1})`,
            transition: "opacity 180ms ease-in-out, transform 280ms ease-in-out",
            pointerEvents: open ? "none" : "auto",
          }}
        >
          {/* Mint pill */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#e2f5ee" }}
          >
            <span className="text-[20px] leading-none select-none">🚀</span>
          </div>
          <p className="text-[9px] font-bold text-[#1F6F54] tracking-[0.06em] text-center leading-tight">
            HELP
          </p>
        </div>

        {/* ── EXPANDED STATE ── */}
        <div
          className="absolute inset-x-0 top-0 px-3 pt-3 pb-3 flex flex-col gap-0"
          style={{
            opacity: open ? 1 : 0,
            transform: `translateY(${open ? 0 : 10}px)`,
            transition: `opacity 220ms ease-in-out ${open ? "100ms" : "0ms"}, transform 280ms ease-in-out ${open ? "80ms" : "0ms"}`,
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {/* Card */}
          <div
            className="rounded-2xl px-4 pt-4 pb-3 flex flex-col"
            style={{ background: "#e8f5f0" }}
          >
            {/* Rocket */}
            <div className="flex justify-center mb-2.5">
              <span className="text-[42px] leading-none select-none drop-shadow-sm">🚀</span>
            </div>

            {/* Heading */}
            <p className="text-[14px] font-bold text-[#0d1f1a] leading-snug text-center mb-1.5">
              We are here if you need us!
            </p>

            {/* Subtext */}
            <p className="text-[11px] text-[#4b6b62] leading-relaxed text-center mb-3">
              Get a quick product walkthrough, ask questions, or connect with our experts anytime.
            </p>

            {/* Button row — visual hierarchy fix:
                Mail = ghost/outline (tertiary)
                Schedule a call = outline teal (secondary)
                Upgrade plan = filled dark (primary conversion) */}
            <div className="flex items-center gap-2 mb-3">
              {/* Mail — ghost icon button */}
              <button
                className="flex items-center justify-center rounded-xl border border-[#b8ddd0] bg-white hover:bg-[#f0faf5] active:scale-95 transition-all duration-150 shrink-0"
                style={{ width: 42, height: 42 }}
                aria-label="Email us"
              >
                <Mail size={15} style={{ color: "#1F6F54" }} />
              </button>

              {/* Schedule a call — outline (secondary, not filled) */}
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-[9px] rounded-xl text-[12px] font-semibold border hover:bg-[#0d2b22] hover:text-white active:scale-[0.98] transition-all duration-150"
                style={{
                  border: "1.5px solid #0d2b22",
                  color: "#0d2b22",
                  background: "transparent",
                }}
              >
                <Phone size={12} strokeWidth={2.5} />
                Schedule a call
              </button>
            </div>

            {/* Divider */}
            <div className="h-px mb-3" style={{ background: "#cde8df" }} />

            {/* Upgrade plan — primary conversion CTA, visually dominant */}
            <button
              onClick={() => setUpgradeOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white hover:brightness-110 active:scale-[0.98] transition-all duration-150"
              style={{
                background: "#111111",
                boxShadow: "0 0 0 2px #3b5bdb, 0 2px 8px rgba(59,91,219,0.25)",
              }}
            >
              <span className="text-[15px] leading-none shrink-0">💎</span>
              <span className="flex-1 text-left text-[12px] font-semibold tracking-[-0.01em]">
                Upgrade plan
              </span>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.14)" }}
              >
                <ChevronRight size={12} strokeWidth={2.5} />
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* ── Upgrade modal ── */}
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}

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
