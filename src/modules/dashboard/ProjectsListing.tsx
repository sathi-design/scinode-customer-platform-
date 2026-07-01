"use client";

import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ChevronDown, X, ArrowUpRight, Sparkles,
  Info, Lock, SlidersHorizontal, ChevronRight, Check,
  AlertCircle, Zap, UserCheck, Upload, FileSpreadsheet,
  CheckCircle2, Package, Download, Plus, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_PROJECTS, type BadgeType } from "@/lib/projectsData";
import { UpgradePremiumModal } from "./UpgradePremiumModal";

// ─── Demo config ───────────────────────────────────────────────────────────────
const FREE_PROPOSAL_LIMIT = 2;
const PROPOSALS_USED      = 0;   // 0 = fresh free account for demo
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────
type DemoState      = "free" | "premium";
type PlanState      = "free" | "premium";
type ExclusiveState = "available" | "locked";
type MatchType      = "Capability-Based" | "Product Catalogue-Based";
type TabType        = "open" | "exclusive";

interface Project {
  id: number;
  image: string;
  badge: BadgeType | null;
  industry: string;
  title: string;
  description: string;
  matchType: MatchType;
  country: string;
  countryFlag: string;
  postedDate: string;
  quantity: string;
}

type DrawerFilters = {
  matchType:       string[];
  industry:        string[];
  capabilityType:  string[];
  batchScale:      string[];
  geography:       string[];
  certifications:  string[];
  deadline:        string[];
  projectType:     string[];
};

const EMPTY_DRAWER_FILTERS: DrawerFilters = {
  matchType: [], industry: [], capabilityType: [], batchScale: [],
  geography: [], certifications: [], deadline: [], projectType: [],
};

// ─── Badge config ─────────────────────────────────────────────────────────────
const BADGE_CONFIG: Record<BadgeType, { bg: string; text: string; hasStar: boolean }> = {
  Exclusive:       { bg: "#020202",  text: "white", hasStar: true  },
  CMO:             { bg: "#1F6F54",  text: "white", hasStar: false },
  RFQ:             { bg: "#0077CC",  text: "white", hasStar: false },
  "Tech Transfer": { bg: "#7C3AED",  text: "white", hasStar: false },
  Open:            { bg: "#D97706",  text: "white", hasStar: false },
};

// ─── Project data ─────────────────────────────────────────────────────────────
const INITIAL_COUNT   = 16;
const LOAD_MORE_COUNT = 8;
const MATCHED_COUNT   = 47;

const COUNTRY_DATA = [
  { country: "Germany",       flag: "🇩🇪" },
  { country: "Japan",         flag: "🇯🇵" },
  { country: "United States", flag: "🇺🇸" },
  { country: "France",        flag: "🇫🇷" },
  { country: "United Kingdom",flag: "🇬🇧" },
  { country: "India",         flag: "🇮🇳" },
  { country: "UAE",           flag: "🇦🇪" },
  { country: "South Korea",   flag: "🇰🇷" },
  { country: "Singapore",     flag: "🇸🇬" },
  { country: "Switzerland",   flag: "🇨🇭" },
  { country: "Netherlands",   flag: "🇳🇱" },
  { country: "Sweden",        flag: "🇸🇪" },
  { country: "Australia",     flag: "🇦🇺" },
  { country: "Canada",        flag: "🇨🇦" },
  { country: "Brazil",        flag: "🇧🇷" },
  { country: "Italy",         flag: "🇮🇹" },
  { country: "Spain",         flag: "🇪🇸" },
  { country: "Belgium",       flag: "🇧🇪" },
  { country: "China",         flag: "🇨🇳" },
  { country: "Taiwan",        flag: "🇹🇼" },
];

const OPEN_SEED: Project[] = ALL_PROJECTS.map((p, i) => ({
  id: i + 1,
  image: p.image,
  badge: p.badge,
  industry: p.industry,
  title: p.title,
  description: p.description,
  matchType: (i % 3 === 0 ? "Product Catalogue-Based" : "Capability-Based") as MatchType,
  country: COUNTRY_DATA[i % COUNTRY_DATA.length].country,
  countryFlag: COUNTRY_DATA[i % COUNTRY_DATA.length].flag,
  postedDate: p.postedDate,
  quantity: p.quantity,
}));

const EXCLUSIVE_PROJECTS: Project[] = ALL_PROJECTS.map((p, i) => ({
  id: i + 200,
  image: p.image,
  badge: "Exclusive" as BadgeType,
  industry: p.industry,
  title: p.title,
  description: p.description,
  matchType: (i % 2 === 0 ? "Capability-Based" : "Product Catalogue-Based") as MatchType,
  country: COUNTRY_DATA[(i + 3) % COUNTRY_DATA.length].country,
  countryFlag: COUNTRY_DATA[(i + 3) % COUNTRY_DATA.length].flag,
  postedDate: p.postedDate,
  quantity: p.quantity,
}));

function generateOpenProjects(count: number, offset = 0): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    ...OPEN_SEED[(offset + i) % OPEN_SEED.length],
    id: offset + i + 1,
  }));
}

// ─── Filter drawer sections ───────────────────────────────────────────────────
const FILTER_SECTIONS: { id: keyof DrawerFilters; label: string; options: string[] }[] = [
  {
    id: "matchType",      label: "Type of Project",
    options: ["Capability-Based", "Product Catalogue-Based"],
  },
  {
    id: "industry",       label: "Industry",
    options: ["Agro Chemical", "Pharmaceutical", "Industrial Chemicals", "Flavors & Fragrances",
              "Beauty & Personal Care", "Food & Nutrition", "Dyes and Pigments", "Oleochemicals",
              "Metallurgy Chemicals", "Elemental Derivatives"],
  },
  {
    id: "geography",      label: "Geography",
    options: ["India", "Europe", "USA", "APAC", "Middle East", "Latin America"],
  },
  {
    id: "certifications", label: "Certification Requirements",
    options: ["GMP", "ISO 9001", "ISO 14001", "REACH Compliant", "FSSC 22000", "Halal / Kosher"],
  },
  {
    id: "deadline",       label: "Proposal Deadline",
    options: ["< 7 days", "7–14 days", "14–30 days", "> 30 days"],
  },
];

const SORT_OPTIONS = ["Latest", "Most Relevant", "Deadline Soon", "Newest First"];

// ─── Inline star SVG (replaces broken Figma asset URL) ────────────────────────
function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 1l1.545 3.09L12 4.545l-2.5 2.41.59 3.41L7 8.82l-3.09 1.545.59-3.41L2 4.545l3.455-.455L7 1z"
        fill="#f5c842"
        stroke="#f5c842"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// (internal TrialBanner removed — replaced by FreeAccessStrip / PremiumAccessStrip below)

// ─── Exclusive tooltip ────────────────────────────────────────────────────────
function ExclusiveInfoTooltip() {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={e => e.stopPropagation()}
    >
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
      <Info size={12} className="text-slate-400 cursor-help" />
      {show && (
        <div
          className="absolute bottom-full right-0 mb-2.5 w-[288px] z-50 pointer-events-none"
          style={{ animation: "tooltipFadeIn 160ms ease both" }}
        >
          {/* Arrow */}
          <div className="absolute -bottom-1.5 right-3 w-3 h-3 rotate-45 border-b border-r"
            style={{ background: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }} />
          <div className="relative bg-[#1e293b] rounded-xl p-3.5 shadow-2xl border border-white/10">
            <p className="text-[11.5px] font-bold text-white mb-1.5">Exclusive Projects</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Projects matched exclusively to your capabilities — no competing bids.
              Premium plan required.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Open Projects tooltip ────────────────────────────────────────────────────
function OpenProjectsInfoTooltip() {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={e => e.stopPropagation()}
    >
      <Info size={12} className="text-slate-400 cursor-help" />
      {show && (
        <div
          className="absolute bottom-full left-0 mb-2.5 w-[272px] z-50 pointer-events-none"
          style={{ animation: "tooltipFadeIn 160ms ease both" }}
        >
          <div className="absolute -bottom-1.5 left-3 w-3 h-3 rotate-45 border-b border-r"
            style={{ background: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }} />
          <div className="relative bg-[#1e293b] rounded-xl p-3.5 shadow-2xl border border-white/10">
            <p className="text-[11.5px] font-bold text-white mb-1.5">Open Projects</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Projects open to all approved manufacturers on the platform.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Match type info tooltips ─────────────────────────────────────────────────
function MatchTypeInfoTooltip({ type }: { type: "Capability-Based" | "Product Catalogue-Based" }) {
  const [show, setShow] = useState(false);
  const isCapability = type === "Capability-Based";
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={e => e.stopPropagation()}   /* prevent tooltip click stealing the filter-button click */
    >
      <Info size={10} className="cursor-help" style={{ color: isCapability ? "#0E6F5C" : "#6237C7", opacity: 0.7 }} />
      {show && (
        <div
          className="absolute top-full left-0 mt-2 w-[200px] z-[200] pointer-events-none"
          style={{ animation: "tooltipFadeIn 160ms ease both" }}
        >
          <div className="absolute -top-1.5 left-3 w-2.5 h-2.5 rotate-45 border-l border-t"
            style={{ background: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }} />
          <div className="relative bg-[#1e293b] rounded-xl p-3.5 shadow-2xl border border-white/10">
            <p className="text-[11.5px] font-bold text-white mb-1.5">
              {isCapability ? "Capability-Based Projects" : "Catalogue-Based Projects"}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isCapability
                ? "Projects manufacturers can pursue based on their capability fit."
                : "Leads generated for products listed in your catalogue."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Filter drawer ────────────────────────────────────────────────────────────
function FilterDrawer({
  open,
  onClose,
  filters,
  onToggle,
  onClear,
  activeCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: DrawerFilters;
  onToggle: (section: keyof DrawerFilters, value: string) => void;
  onClear: () => void;
  activeCount: number;
}) {
  const [expanded, setExpanded] = useState<string[]>(["matchType", "industry"]);

  const toggleSection = (id: string) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background:    "rgba(0,0,0,0.32)",
          opacity:       open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition:    "opacity 250ms ease",
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full w-[340px] max-w-[92vw] bg-white z-50 flex flex-col shadow-2xl"
        style={{
          transform:  open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-[#1F6F54]" />
            <h2 className="text-[15px] font-bold text-[#09090b]">Filters</h2>
            {activeCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: "#1F6F54" }}>
                {activeCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto">
          {FILTER_SECTIONS.map(section => {
            const isOpen       = expanded.includes(section.id);
            const sectionCount = filters[section.id].length;
            return (
              <div key={section.id} className="border-b border-slate-100">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#09090b]">{section.label}</span>
                    {sectionCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-[#1F6F54] bg-[#e8faf2]">
                        {sectionCount}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-400 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                  />
                </button>
                {/* Options */}
                {isOpen && (
                  <div className="px-5 pb-3 flex flex-col gap-0.5">
                    {section.options.map(opt => {
                      const checked = filters[section.id].includes(opt);
                      const isCapabilityOption = section.id === "matchType" && opt === "Capability-Based";
                      const capSubOptions = ["RFQ", "Co Development", "Contract Manufacturing"];
                      return (
                        <div key={opt}>
                        <label
                          className="flex items-center gap-2.5 py-1.5 cursor-pointer group/opt"
                          onClick={() => onToggle(section.id, opt)}
                        >
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all duration-150"
                            style={{
                              background:   checked ? "#1F6F54" : "#fff",
                              borderColor:  checked ? "#1F6F54" : "#d1d5db",
                            }}
                          >
                            {checked && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className={cn(
                            "text-[12.5px] transition-colors",
                            checked ? "text-[#1F6F54] font-medium" : "text-[#374151] group-hover/opt:text-[#09090b]",
                          )}>
                            {opt}
                          </span>
                          {section.id === "matchType" && (opt === "Capability-Based" || opt === "Product Catalogue-Based") && (
                            <MatchTypeInfoTooltip type={opt as "Capability-Based" | "Product Catalogue-Based"} />
                          )}
                        </label>

                        {/* Nested sub-options for Capability-Based */}
                        {isCapabilityOption && checked && (
                          <div className="ml-6 mb-1 mt-0.5 flex flex-col gap-0.5 border-l-2 border-[#1F6F54]/20 pl-3">
                            <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide py-1">
                              Capability Type
                            </p>
                            {capSubOptions.map(sub => {
                              const subChecked = filters.capabilityType.includes(sub);
                              return (
                                <label
                                  key={sub}
                                  className="flex items-center gap-2.5 py-1.5 cursor-pointer group/sub"
                                  onClick={e => { e.stopPropagation(); onToggle("capabilityType", sub); }}
                                >
                                  <div
                                    className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-all duration-150"
                                    style={{
                                      background:  subChecked ? "#0E6F5C" : "#fff",
                                      borderColor: subChecked ? "#0E6F5C" : "#d1d5db",
                                    }}
                                  >
                                    {subChecked && <Check size={9} color="#fff" strokeWidth={3} />}
                                  </div>
                                  <span className={cn(
                                    "text-[12px] transition-colors",
                                    subChecked ? "text-[#0E6F5C] font-medium" : "text-[#374151] group-hover/sub:text-[#09090b]",
                                  )}>
                                    {sub}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2 shrink-0">
          <button
            onClick={onClear}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-[12.5px] font-semibold text-white transition-colors"
            style={{ background: "#1F6F54" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#1e3612")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#1F6F54")}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Sort dropdown ────────────────────────────────────────────────────────────
function SortDropdown({ value, onSelect }: { value: string; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-[10px] bg-white border border-[#e4e4e7] rounded-[6px]",
          "text-sm text-[#09090b] hover:border-[#1F6F54]/40 transition-colors whitespace-nowrap",
          open && "border-[#1F6F54]/60",
        )}
      >
        <span>Sort By: <strong className="font-medium">{value}</strong></span>
        <ChevronDown size={14} className={cn("text-[#71717a] transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-[#e4e4e7] rounded-[8px] shadow-lg z-20 py-1 min-w-[160px]">
          {SORT_OPTIONS.map(opt => (
            <button key={opt} onClick={() => { onSelect(opt); setOpen(false); }}
              className={cn("w-full text-left px-3 py-2 text-sm transition-colors",
                value === opt ? "bg-[#f0faf5] text-[#1F6F54] font-medium" : "text-[#353535] hover:bg-[#f7f7f7]")}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Proposal CTA helpers ─────────────────────────────────────────────────────
function getFooterMessage(
  isExclusive: boolean,
  planState: PlanState,
  proposalsUsed: number,
): { text: string; color: string } | null {
  if (planState === "premium") return null;

  // Free plan — exclusive projects are always locked
  if (isExclusive)
    return { text: "Exclusive projects require Premium upgrade", color: "#dc2626" };

  return null;
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onClick,
  isExclusive = false,
  matchType,
  planState,
  proposalsUsed,
  onSendProposal,
}: {
  project: Project;
  onClick: () => void;
  isExclusive?: boolean;
  matchType?: MatchType;
  planState: PlanState;
  proposalsUsed: number;
  onSendProposal?: () => void;
}) {
  const footer    = getFooterMessage(isExclusive, planState, proposalsUsed);
  const displayMT = matchType ?? project.matchType;

  // Quantity — truncate to ~30 chars
  const qtyShort = project.quantity.length > 32
    ? project.quantity.slice(0, 30) + "…"
    : project.quantity;

  return (
    <div className="group relative cursor-pointer h-full" onClick={onClick}>
      {/* Card body */}
      <div className={cn(
        "relative bg-white rounded-[12px] p-[10px] flex flex-col overflow-hidden h-full",
        "shadow-[0px_4px_6px_0px_rgba(0,0,0,0.08),0px_2px_4px_0px_rgba(0,0,0,0.04)]",
        "ring-1 ring-transparent group-hover:ring-[#1F6F54] group-hover:shadow-[0px_8px_24px_rgba(40,71,26,0.12)]",
        "transition-[box-shadow,ring-color] duration-200 ease-in-out",
      )}>

        {/* ── Image ── */}
        <div className="relative overflow-hidden rounded-[10px] h-[148px] bg-[#cfd8dc] flex-shrink-0 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.image} alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.07]" />
          {/* Top scrim */}
          <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, transparent 100%)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Pill over image — Exclusive OR Capability/Catalogue (never both) */}
          <div className="absolute top-[8px] left-[9px]">
            {isExclusive ? (
              /* Exclusive pill */
              <div className="flex items-center gap-[4px] px-2 py-[3px] rounded-full text-[9px] font-bold"
                style={{
                  background: "linear-gradient(135deg,#111111 0%,#1a1400 100%)",
                  color: "#f5c842",
                  border: "1px solid #c9a22766",
                  backdropFilter: "blur(4px)",
                  letterSpacing: "0.02em",
                }}>
                <span style={{ fontSize: 9, lineHeight: 1 }}>⭐</span>
                Exclusive
              </div>
            ) : (
              /* Capability / Catalogue pill */
              <div className="px-2 py-[3px] rounded-full text-[9px] font-semibold text-white"
                style={{
                  background: displayMT === "Capability-Based" ? "rgba(14,111,92,0.88)" : "rgba(99,55,199,0.88)",
                  backdropFilter: "blur(4px)",
                }}>
                {displayMT === "Capability-Based" ? "Capability" : "Catalogue"}
              </div>
            )}
          </div>
        </div>

        {/* ── Industry pill ── */}
        <div className="mb-2">
          <span className="inline-flex items-center px-[9px] py-[2px] rounded-full bg-[#e3f4ff] text-[#171717] text-[11.5px] font-medium leading-[22px]">
            {project.industry}
          </span>
        </div>

        {/* ── Project name ── */}
        <h3 className="font-semibold text-[14.5px] leading-snug text-black line-clamp-2 mb-2">
          {project.title}
        </h3>

        {/* ── Meta rows + hover arrow: two-column layout ── */}
        <div className="flex items-end justify-between gap-2 mt-auto">
          {/* Left: details */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] leading-none">{project.countryFlag}</span>
              <span className="text-[11.5px] text-[#353535] font-medium">{project.country}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">📦</span>
              <span className="text-[11.5px] text-[#353535]">{qtyShort}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">🗓</span>
              <span className="text-[11px] text-slate-400">Posted {project.postedDate}</span>
            </div>
          </div>

          {/* Right: circle arrow — appears on hover */}
          {onSendProposal && planState === "free" && !isExclusive && (FREE_PROPOSAL_LIMIT - proposalsUsed) > 0 ? (
            <button
              onClick={e => { e.stopPropagation(); onSendProposal(); }}
              className={cn(
                "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                "transition-all duration-200 ease-out",
              )}
              style={{ background: "#1F6F54" }}
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
            </button>
          ) : (
            <div
              className={cn(
                "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                "transition-all duration-200 ease-out",
              )}
              style={{ background: "#1F6F54" }}
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Footer message */}
        {footer && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 mt-3">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: footer.color }} />
            <p className="text-[10.5px] font-medium leading-snug" style={{ color: footer.color }}>
              {footer.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Matched profile banner ───────────────────────────────────────────────────
function MatchedBanner({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-[10px] cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.005]"
      style={{ background: "linear-gradient(90deg, #1F6F54 0%, #185C45 40%, #0d4a37 100%)" }}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-white text-sm font-semibold">{count} projects matched to your profile</span>
        <span className="text-white/70 text-sm ml-2">
          — based on your capabilities, certifications, and past projects.
        </span>
      </div>
      <span className="text-white/80 text-sm font-medium items-center gap-1 flex-shrink-0 hidden sm:flex">
        View all <ArrowUpRight className="w-4 h-4" />
      </span>
    </div>
  );
}

// ─── Exclusive empty state ────────────────────────────────────────────────────
function ExclusiveEmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="relative flex flex-col items-center justify-center py-14 text-center overflow-hidden rounded-2xl border border-[#e6f4ee]"
      style={{ background: "linear-gradient(145deg,rgba(31,111,84,0.06) 0%,rgba(42,203,131,0.04) 50%,rgba(255,255,255,0.10) 100%), #ffffff" }}>
      {/* Subtle green radial glow behind icon */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[420px] h-[240px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(42,203,131,0.10) 0%,transparent 70%)" }} />

      {/* Illustration */}
      <div className="relative mb-7">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full opacity-20 blur-xl"
          style={{ background: "radial-gradient(circle,#f5c842,transparent 70%)" }} />
        {/* Main icon container */}
        <div className="relative w-24 h-24 rounded-[22px] flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(145deg,#0e1a14,#1a2e20)",
            border: "1px solid rgba(245,200,66,0.28)",
            boxShadow: "0 4px 32px rgba(42,203,131,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            {/* Layered cards */}
            <rect x="6"  y="18" width="40" height="28" rx="4" stroke="rgba(42,203,131,0.25)" strokeWidth="1.2" fill="rgba(42,203,131,0.06)"/>
            <rect x="10" y="14" width="32" height="28" rx="4" stroke="rgba(42,203,131,0.40)" strokeWidth="1.2" fill="rgba(42,203,131,0.09)"/>
            <rect x="14" y="20" width="24" height="16" rx="3" stroke="rgba(42,203,131,0.60)" strokeWidth="1.2" fill="rgba(42,203,131,0.12)"/>
            {/* Lines representing content */}
            <line x1="18" y1="25" x2="34" y2="25" stroke="rgba(42,203,131,0.50)" strokeWidth="1" strokeLinecap="round"/>
            <line x1="18" y1="29" x2="30" y2="29" stroke="rgba(42,203,131,0.35)" strokeWidth="1" strokeLinecap="round"/>
            {/* Gold star */}
            <path d="M26 5l1.8 3.6 4.2.5-3 2.9.7 4.1-3.7-1.9-3.7 1.9.7-4.1-3-2.9 4.2-.5z"
              fill="#f5c842" opacity="0.95"/>
            {/* Sparkle dots */}
            <circle cx="44" cy="12" r="1.5" fill="#f5c842" opacity="0.60"/>
            <circle cx="8"  cy="11" r="1.2" fill="#2ACB83" opacity="0.55"/>
            <circle cx="46" cy="34" r="1.0" fill="#2ACB83" opacity="0.45"/>
          </svg>
        </div>
      </div>

      <div className="relative max-w-[440px] mx-auto px-4">
        <h3 className="text-[19px] font-bold text-[#09090b] mb-3 leading-snug"
          style={{ fontFamily: "Poppins, sans-serif" }}>
          Exclusive Projects Are Being Curated For You
        </h3>
        <p className="text-[13.5px] text-[#4b5563] leading-relaxed mb-1">
          We&apos;re actively mapping exclusive projects tailored to your manufacturing capabilities and catalogue.
        </p>
        <p className="text-[13.5px] text-[#4b5563] leading-relaxed mb-8">
          Meanwhile, explore generic capability-based open projects.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onExplore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all whitespace-nowrap"
            style={{ background: "#1F6F54" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#1e3612")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#1F6F54")}
          >
            Explore Open Projects <ArrowUpRight size={14} />
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all border whitespace-nowrap"
            style={{ borderColor: "#d1d5db", color: "#374151", background: "white" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "#1F6F54")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "#d1d5db")}
          >
            <UserCheck size={14} />
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Exclusive locked overlay ─────────────────────────────────────────────────
function ExclusiveLockedOverlay({ onUpgrade }: { onUpgrade?: () => void }) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center rounded-xl"
      style={{ backdropFilter: "blur(7px)", background: "rgba(2,2,2,0.60)" }}
    >
      <div className="text-center px-8 py-10 rounded-2xl max-w-[400px] w-full mx-4"
        style={{
          background:   "rgba(255,255,255,0.05)",
          border:       "1px solid rgba(245,200,66,0.22)",
          backdropFilter: "blur(12px)",
        }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.28)" }}>
          <Lock size={24} style={{ color: "#f5c842" }} />
        </div>
        <h3 className="text-[20px] font-black text-white mb-2.5"
          style={{ fontFamily: "Poppins, sans-serif" }}>
          Exclusive Access Locked
        </h3>
        <p className="text-[13px] text-slate-400 leading-relaxed mb-1.5">
          Exclusive Projects are reserved for Premium members and matched specifically to your
          capabilities and product portfolio for more relevant, high-fit opportunities.
        </p>
        <p className="text-[12px] text-slate-500 mb-6">
          Free plan includes 2 proposals on Open Projects only.
        </p>
        <button
          onClick={onUpgrade}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold text-[#020202] transition-all hover:brightness-110 active:scale-[0.98]"
          style={{
            background: "linear-gradient(90deg,#f5c842,#c9a227)",
            boxShadow: "0 0 18px rgba(245,200,66,0.50), 0 2px 6px rgba(0,0,0,0.25)",
          }}>
          <Zap size={13} /> Upgrade to Premium
        </button>
      </div>
    </div>
  );
}

// ─── Demo state switcher ──────────────────────────────────────────────────────
const DEMO_CONFIG: Record<DemoState, { label: string; desc: string }> = {
  free:    { label: "Free Plan",   desc: "Free — 2 proposals, Exclusive locked" },
  premium: { label: "Premium",     desc: "Premium — unlimited access"           },
};
function DemoSwitcher({ current, onChange }: { current: DemoState; onChange: (s: DemoState) => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa]">
      <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest shrink-0">Demo</span>
      <div className="flex items-center gap-1">
        {(["free", "premium"] as DemoState[]).map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            title={DEMO_CONFIG[s].desc}
            className={cn(
              "px-2.5 py-[3px] rounded-[5px] text-[11px] font-semibold transition-all duration-150",
              current === s
                ? "bg-[#020202] text-white"
                : "text-[#6b7280] hover:bg-[#f0f0f0]",
            )}
          >
            {DEMO_CONFIG[s].label}
          </button>
        ))}
      </div>
      <span className="text-[10.5px] text-[#9ca3af] italic truncate hidden sm:block">
        {DEMO_CONFIG[current].desc}
      </span>
    </div>
  );
}

// ─── Proposal‑remaining popup ─────────────────────────────────────────────────
function ProposalRemainingPopup({
  remaining,
  onClose,
  onViewBanner,
}: {
  remaining: number;
  onClose: () => void;
  onViewBanner: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(201,162,39,0.35)" }}>
            <Crown size={20} style={{ color: "#c9a227" }} />
          </div>
          <h3 className="text-[17px] font-black text-slate-900 mb-1">
            {remaining === 0
              ? "Proposal limit reached"
              : `You have ${remaining} proposal${remaining === 1 ? "" : "s"} left`}
          </h3>
          <p className="text-[12.5px] text-slate-500 leading-relaxed">
            {remaining === 0
              ? "You've used all your free proposals. Upgrade to send unlimited proposals."
              : `Free plan includes ${FREE_PROPOSAL_LIMIT} proposals. Upgrade to unlock unlimited submissions and Exclusive Projects.`}
          </p>
        </div>
        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between text-[10.5px] text-slate-400 mb-1.5">
            <span>Free proposals used</span>
            <span className="font-semibold text-slate-700">{FREE_PROPOSAL_LIMIT - remaining} / {FREE_PROPOSAL_LIMIT}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((FREE_PROPOSAL_LIMIT - remaining) / FREE_PROPOSAL_LIMIT) * 100}%`,
                background: remaining === 0 ? "#dc2626" : "linear-gradient(90deg,#f5c842,#c9a227)",
              }} />
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
            Close
          </button>
          <button onClick={() => { onClose(); onViewBanner(); }}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-[#020202] transition-all hover:brightness-110"
            style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}>
            View Premium Info
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Free plan strip ──────────────────────────────────────────────────────────
function FreeAccessStrip({
  open,
  onUpgrade,
  onDismiss,
}: {
  open: boolean;
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  if (!open) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-400">Plan info hidden.</span>
        <button onClick={onDismiss}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#c9a227] hover:underline">
          <Crown size={10} /> Show plan info
        </button>
      </div>
    );
  }
  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-xl border flex-wrap"
      style={{ background: "#111111", borderColor: "rgba(201,162,39,0.50)" }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(245,200,66,0.10)", border: "1px solid rgba(245,200,66,0.25)" }}>
          <Crown size={14} style={{ color: "#f5c842" }} />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12.5px] font-bold" style={{ color: "#f5c842" }}>Free Plan Active</span>
            <span className="text-[#c9a227] text-[10px]">•</span>
            <span className="text-[12.5px] font-medium" style={{ color: "#e0c97a" }}>
              {FREE_PROPOSAL_LIMIT} proposals included · Exclusive Projects locked
            </span>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            Upgrade to Premium for unlimited proposals, Exclusive Projects, and Market Intelligence.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUpgrade}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-[#020202] transition-all hover:brightness-110 active:scale-[0.97] whitespace-nowrap"
          style={{
            background: "linear-gradient(90deg,#f5c842,#c9a227)",
            boxShadow: "0 0 14px rgba(245,200,66,0.50), 0 2px 4px rgba(0,0,0,0.30)",
          }}
        >
          <Zap size={11} /> Upgrade Plan
        </button>
        <button
          onClick={onDismiss}
          className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: "rgba(201,162,39,0.70)" }}
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Premium plan strip ───────────────────────────────────────────────────────
function PremiumAccessStrip() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl border flex-wrap"
      style={{ background: "#111111", borderColor: "rgba(201,162,39,0.50)" }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(201,162,39,0.35)" }}
        >
          <Crown size={13} style={{ color: "#f5c842" }} />
        </div>
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span className="text-[12.5px] font-bold whitespace-nowrap" style={{ color: "#f5c842" }}>
            Premium Active
          </span>
          <span className="text-[12.5px] font-normal" style={{ color: "rgba(255,255,255,0.50)" }}>
            — Unlimited proposals · Full Exclusive Projects access · Market Intelligence
          </span>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-white/10 shrink-0"
        style={{ color: "rgba(201,162,39,0.60)" }}
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT CATALOGUE-BASED FLOW — Components
// ═══════════════════════════════════════════════════════════════════════════════

type CatDemoState = 1 | 2 | 3;

// ─── Catalogue Demo Switcher ──────────────────────────────────────────────────
function CatalogueDemoSwitcher({ current, onChange }: { current: CatDemoState; onChange: (s: CatDemoState) => void }) {
  const labels: Record<CatDemoState, string> = {
    1: "No Products",
    2: "Mapping Demand",
    3: "Demand Mapped",
  };
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa]">
      <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest shrink-0">Demo</span>
      <div className="flex items-center gap-1">
        {([1, 2, 3] as const).map(s => (
          <button key={s} onClick={() => onChange(s)}
            className={cn(
              "px-2.5 py-[3px] rounded-[5px] text-[11px] font-semibold transition-all duration-150",
              current === s ? "bg-[#020202] text-white" : "text-[#6b7280] hover:bg-[#f0f0f0]",
            )}>
            {labels[s]}
          </button>
        ))}
      </div>
      <span className="text-[10.5px] text-[#9ca3af] italic hidden sm:block">{labels[current]}</span>
    </div>
  );
}

// ─── Quick Add Product Drawer ─────────────────────────────────────────────────
type QuickAddTab = "single" | "bulk";
type BulkPhase   = "idle" | "uploading" | "parsing" | "success" | "error";

function QuickAddProductDrawer({
  open, onClose, onProductSaved, initialTab = "single",
}: { open: boolean; onClose: () => void; onProductSaved: () => void; initialTab?: QuickAddTab }) {
  const [tab, setTab]       = React.useState<QuickAddTab>(initialTab);
  // Sync initial tab whenever the drawer opens
  React.useEffect(() => { if (open) setTab(initialTab); }, [open, initialTab]);
  const [form, setForm]     = React.useState({ name: "", casNo: "", category: "", capability: "", moq: "", capacity: "", certifications: "", description: "" });
  const [saved, setSaved]   = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [bulkPhase, setBulkPhase]   = React.useState<BulkPhase>("idle");
  const [fileName, setFileName]     = React.useState("");
  const [progress, setProgress]     = React.useState(0);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); onProductSaved(); onClose(); resetDrawer(); }, 1400);
  };

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "csv", "xls"].includes(ext ?? "")) { setBulkPhase("error"); return; }
    if (file.size > 10 * 1024 * 1024) { setBulkPhase("error"); return; }
    setFileName(file.name); setBulkPhase("uploading"); setProgress(0);
    const tick = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(tick); setBulkPhase("parsing"); return 100; } return p + 15; });
    }, 100);
    setTimeout(() => { setBulkPhase("success"); }, 2000);
  };

  const resetDrawer = () => {
    setTab("single"); setForm({ name: "", casNo: "", category: "", capability: "", moq: "", capacity: "", certifications: "", description: "" });
    setSaved(false); setBulkPhase("idle"); setFileName(""); setProgress(0);
  };

  const handleClose = () => { resetDrawer(); onClose(); };

  if (!open) return null;

  const inputCls = "w-full px-3 py-2 text-[13px] rounded-[8px] border border-[#e4e4e7] bg-white text-[#020202] placeholder:text-[#9ca3af] outline-none focus:border-[#1F6F54] focus:ring-2 focus:ring-[#1F6F54]/15 transition-all";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={handleClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#e8faf2] flex items-center justify-center">
              <Package size={17} className="text-[#1F6F54]" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#020202]">Add to Product Catalogue</h3>
              <p className="text-[11.5px] text-[#62748e]">Data saved to Profile → Product Catalogue</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#374151] hover:bg-[#f3f4f6] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#f3f4f6] px-5">
          {(["single", "bulk"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "px-4 py-3 text-[13px] font-semibold transition-all border-b-2 -mb-px",
                tab === t ? "border-[#1F6F54] text-[#1F6F54]" : "border-transparent text-[#62748e] hover:text-[#374151]",
              )}>
              {t === "single" ? "Single Product" : "Bulk Upload"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">

          {/* ─── Single Product Tab ─── */}
          {tab === "single" && !saved && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold text-[#374151] uppercase tracking-wide">Product Name *</label>
                <input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Ibuprofen API" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-[#374151] uppercase tracking-wide">CAS Number</label>
                  <input className={inputCls} value={form.casNo} onChange={e => set("casNo", e.target.value)} placeholder="e.g. 15687-27-1" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-[#374151] uppercase tracking-wide">Category</label>
                  <input className={inputCls} value={form.category} onChange={e => set("category", e.target.value)} placeholder="e.g. API, Excipient" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold text-[#374151] uppercase tracking-wide">Manufacturing Capability</label>
                <input className={inputCls} value={form.capability} onChange={e => set("capability", e.target.value)} placeholder="e.g. Custom Synthesis, Fermentation" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-[#374151] uppercase tracking-wide">MOQ</label>
                  <input className={inputCls} value={form.moq} onChange={e => set("moq", e.target.value)} placeholder="e.g. 50 kg" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-[#374151] uppercase tracking-wide">Production Capacity</label>
                  <input className={inputCls} value={form.capacity} onChange={e => set("capacity", e.target.value)} placeholder="e.g. 500 MT/yr" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold text-[#374151] uppercase tracking-wide">Certifications</label>
                <input className={inputCls} value={form.certifications} onChange={e => set("certifications", e.target.value)} placeholder="e.g. GMP, ISO 9001" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold text-[#374151] uppercase tracking-wide">Product Description</label>
                <textarea className={inputCls + " resize-none"} rows={3} value={form.description}
                  onChange={e => set("description", e.target.value)} placeholder="Brief description of the product and its applications…" />
              </div>
            </div>
          )}

          {/* Single product success */}
          {tab === "single" && saved && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#e8faf2] flex items-center justify-center">
                <CheckCircle2 size={32} className="text-[#1F6F54]" />
              </div>
              <p className="text-[15px] font-semibold text-[#020202]">Product added successfully</p>
              <p className="text-[13px] text-[#62748e] max-w-[280px] leading-[20px]">
                We'll begin mapping relevant buyer demand to your product catalogue.
              </p>
            </div>
          )}

          {/* ─── Bulk Upload Tab ─── */}
          {tab === "bulk" && (
            <div className="flex flex-col gap-5">
              <p className="text-[13px] text-[#62748e] leading-[20px]">
                Upload your complete product catalogue. We'll process and map products to relevant buyer demand automatically.
              </p>

              {bulkPhase === "idle" && (
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-[12px] py-12 flex flex-col items-center gap-3 cursor-pointer transition-all",
                    isDragging ? "border-[#1F6F54] bg-[#f0faf5]" : "border-[#d1d5db] hover:border-[#1F6F54]/50 hover:bg-[#fafafa]",
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-[#e8faf2] flex items-center justify-center">
                    <FileSpreadsheet size={22} className="text-[#1F6F54]" />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-[#020202]">Drop your file here</p>
                    <p className="text-[12.5px] text-[#62748e] mt-0.5">
                      or <span className="text-[#1F6F54] font-semibold underline underline-offset-2">browse files</span>
                    </p>
                  </div>
                  <p className="text-[11.5px] text-[#9ca3af]">XLSX · CSV · XLS — Maximum 10 MB</p>
                  <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>
              )}

              {bulkPhase === "uploading" && (
                <div className="flex flex-col gap-3 p-4 bg-[#fafafa] rounded-[10px] border border-[#e4e4e7]">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={16} className="text-[#6237C7] shrink-0" />
                    <span className="text-[13px] font-medium text-[#020202] truncate flex-1">{fileName}</span>
                    <span className="text-[12px] text-[#62748e]">{progress}%</span>
                  </div>
                  <div className="w-full h-[5px] bg-[#e4e4e7] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1F6F54] rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[11.5px] text-[#62748e]">Uploading…</p>
                </div>
              )}

              {bulkPhase === "parsing" && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-10 h-10 rounded-full border-2 border-[#1F6F54] border-t-transparent animate-spin" />
                  <p className="text-[13px] font-medium text-[#020202]">Parsing catalogue…</p>
                  <p className="text-[12px] text-[#62748e]">Reading product rows and validating fields</p>
                </div>
              )}

              {bulkPhase === "success" && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#e8faf2] flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-[#1F6F54]" />
                  </div>
                  <p className="text-[15px] font-semibold text-[#020202]">Catalogue uploaded successfully</p>
                  <p className="text-[13px] text-[#62748e] max-w-[300px] leading-[20px]">
                    Our system is processing your products for demand matching. You'll be notified once matching begins.
                  </p>
                  <button onClick={() => { setBulkPhase("idle"); setFileName(""); setProgress(0); onProductSaved(); onClose(); resetDrawer(); }}
                    className="mt-2 px-5 py-2 rounded-[8px] bg-[#1F6F54] text-white text-[13px] font-semibold hover:bg-[#185C45] transition-colors">
                    Done
                  </button>
                </div>
              )}

              {bulkPhase === "error" && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#ffefef] flex items-center justify-center">
                    <AlertCircle size={24} className="text-[#C30E1A]" />
                  </div>
                  <p className="text-[13.5px] font-semibold text-[#020202]">Upload failed</p>
                  <p className="text-[12.5px] text-[#62748e]">Please upload a valid .xlsx or .csv file under 10 MB.</p>
                  <button onClick={() => { setBulkPhase("idle"); setFileName(""); setProgress(0); }}
                    className="mt-1 px-4 py-2 rounded-[8px] border border-[#e4e4e7] text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
                    Try Again
                  </button>
                </div>
              )}

              {bulkPhase === "idle" && (
                <button className="flex items-center justify-center gap-2 text-[12.5px] font-medium text-[#0077CC] hover:text-[#005fa3] transition-colors">
                  <Download size={13} /> Download Sample Template
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer — single product only */}
        {tab === "single" && !saved && (
          <div className="px-5 py-4 border-t border-[#f3f4f6] flex items-center justify-between gap-3">
            <p className="text-[11.5px] text-[#9ca3af] leading-[17px]">
              Saved data goes to Profile → Product Catalogue
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleClose}
                className="px-3.5 py-2 rounded-[8px] border border-[#e4e4e7] text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!form.name.trim()}
                className="px-4 py-2 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold transition-colors">
                Save Product
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── State 1 — No products added ─────────────────────────────────────────────
function CatalogueEmptyState({
  onAddProduct, onBulkUpload,
}: { onAddProduct: () => void; onBulkUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-5 max-w-[480px] mx-auto">
      {/* Illustration */}
      <div className="relative w-[88px] h-[88px]">
        <div className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(31,111,84,0.10) 0%,transparent 70%)" }} />
        <div className="absolute inset-0 rounded-full border border-[#1F6F54]/20 animate-pulse" />
        <div className="absolute inset-3 rounded-full bg-[#e8faf2] flex items-center justify-center">
          <Package size={28} className="text-[#1F6F54]" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[16px] font-semibold text-[#020202]">Add your Product Catalogue</h3>
        <p className="text-[13px] text-[#62748e] leading-[20px]">
          This section tracks projects and demand mapped to your product catalogue.
          It looks like you haven't added any products yet. Upload your catalogue to help us
          match relevant buyer demand to your offerings.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button onClick={onAddProduct}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[13px] font-semibold transition-colors shadow-sm">
          <Plus size={14} /> Add Products
        </button>
        <button onClick={onBulkUpload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] border border-[#e4e4e7] text-[#374151] text-[13px] font-medium hover:bg-[#f9fafb] transition-colors">
          <Upload size={14} /> Bulk Upload Catalogue
        </button>
      </div>

      <p className="text-[12px] text-[#9ca3af]">
        Data saved to your{" "}
        <button className="text-[#0077CC] hover:underline">Profile → Product Catalogue</button>
      </p>
    </div>
  );
}

// ─── State 2 — Products added, demand mapping in progress ────────────────────
function CatalogueMappingState({ onExploreCapability, onManageCatalogue }: {
  onExploreCapability: () => void; onManageCatalogue: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-5 max-w-[480px] mx-auto">
      {/* Animated searching illustration */}
      <div className="relative w-[88px] h-[88px]">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1F6F54]/30 animate-spin"
          style={{ animationDuration: "5s" }} />
        <div className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(31,111,84,0.08) 0%,transparent 70%)" }} />
        <div className="absolute inset-4 rounded-full bg-[#e8faf2] flex items-center justify-center">
          <Search size={22} className="text-[#1F6F54]" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1F6F54] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#1F6F54] uppercase tracking-wide">Mapping Demand</span>
        </div>
        <h3 className="text-[16px] font-semibold text-[#020202]">Products added successfully</h3>
        <p className="text-[13px] text-[#62748e] leading-[20px]">
          Our team is identifying and mapping relevant buyer demand to your catalogue.
          In the meantime, explore open opportunities based on your manufacturing capabilities.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button onClick={onExploreCapability}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[13px] font-semibold transition-colors shadow-sm">
          <ArrowUpRight size={14} /> Explore Capability-Based Projects
        </button>
        <button onClick={onManageCatalogue}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] border border-[#e4e4e7] text-[#374151] text-[13px] font-medium hover:bg-[#f9fafb] transition-colors">
          <Package size={14} /> Manage Product Catalogue
        </button>
      </div>
    </div>
  );
}

// ─── State 3 — Demand mapped banner ──────────────────────────────────────────
function CatalogueMappedBanner({ onManageCatalogue }: { onManageCatalogue: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-[10px] bg-[#f0faf5] border border-[#1F6F54]/20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-full bg-[#1F6F54]/10 flex items-center justify-center shrink-0">
          <CheckCircle2 size={14} className="text-[#1F6F54]" />
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-semibold text-[#1F6F54]">Demand mapped to your catalogue </span>
          <span className="text-[12.5px] text-[#62748e]">— projects matched to your products are shown below</span>
        </div>
      </div>
      <button onClick={onManageCatalogue}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-white border border-[#e4e4e7] text-[12px] font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors shrink-0 whitespace-nowrap">
        <Package size={12} /> Manage Catalogue
      </button>
    </div>
  );
}

// ─── Scroll loader ────────────────────────────────────────────────────────────
function ScrollLoader() {
  return (
    <div className="relative h-16 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-16"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(247,247,247,0.9))" }} />
      <div className="relative flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-[#1F6F54] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Derive plan/exclusive state from demo state ──────────────────────────────
function deriveStates(demo: DemoState): { planState: PlanState; exclusiveState: ExclusiveState } {
  if (demo === "free")    return { planState: "free",    exclusiveState: "locked"    };
  return                         { planState: "premium", exclusiveState: "available" };
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProjectsListing() {
  const router = useRouter();

  // Demo switcher state — "free" or "premium"
  const [demoState, setDemoState] = useState<DemoState>("free");
  const { planState, exclusiveState } = deriveStates(demoState);
  const [exclAssigned, setExclAssigned] = useState(true); // free plan: has some exclusive assigned?
  const [proposalsUsed, setProposalsUsed] = useState(PROPOSALS_USED);

  // Plan banner visibility
  const [bannerOpen, setBannerOpen] = useState(true);

  // Proposal-remaining popup: stores remaining count, null = hidden
  const [proposalPopup, setProposalPopup] = useState<number | null>(null);

  // Handle "Send Proposal" from a card
  const handleSendProposal = () => {
    if (planState !== "free") return;
    const next = proposalsUsed + 1;
    setProposalsUsed(next);
    const remaining = FREE_PROPOSAL_LIMIT - next;
    setProposalPopup(remaining);
  };

  // Upgrade modal
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const openUpgrade = () => setUpgradeOpen(true);

  // Tab + match type
  const [activeTab,       setActiveTab]       = useState<TabType>("open");
  const [matchTypeFilter, setMatchTypeFilter] = useState<"all" | MatchType>("all");

  // Product Catalogue-Based demo state
  const [catDemoState, setCatDemoState] = useState<CatDemoState>(1);

  // Premium exclusive sub-state: "empty" = no projects assigned yet, "cards" = projects available
  type PremiumExclusiveState = "empty" | "cards";
  const [premiumExclusiveState, setPremiumExclusiveState] = useState<PremiumExclusiveState>("empty");
  const [quickAddOpen,  setQuickAddOpen]  = useState(false);
  const [quickAddTab,   setQuickAddTab]   = useState<QuickAddTab>("single");

  const openQuickAdd = (tab: QuickAddTab = "single") => { setQuickAddTab(tab); setQuickAddOpen(true); };

  // Search + sort
  const [search, setSearch] = useState("");
  const [sort,   setSort]   = useState("Latest");

  // Filter drawer
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [drawerFilters, setDrawerFilters] = useState<DrawerFilters>(EMPTY_DRAWER_FILTERS);

  // Infinite scroll — open projects only
  const [openProjects, setOpenProjects] = useState<Project[]>(() => generateOpenProjects(INITIAL_COUNT));
  const [isLoading,    setIsLoading]    = useState(false);
  const [hasMore,      setHasMore]      = useState(true);
  const sentinelRef  = useRef<HTMLDivElement>(null);
  const loadedCount  = useRef(INITIAL_COUNT);

  const activeFilterCount = Object.values(drawerFilters).reduce((a, v) => a + v.length, 0);

  // Toggle drawer filter
  const toggleDrawerFilter = (section: keyof DrawerFilters, value: string) => {
    setDrawerFilters(prev => {
      const next = {
        ...prev,
        [section]: prev[section].includes(value)
          ? prev[section].filter(v => v !== value)
          : [...prev[section], value],
      };
      // Sync matchTypeFilter from drawer
      if (section === "matchType") {
        const selected = next.matchType;
        if (selected.length === 1) setMatchTypeFilter(selected[0] as MatchType);
        else setMatchTypeFilter("all");
      }
      return next;
    });
  };

  // Filter + search projects
  const filterProjects = (list: Project[]) => {
    const q = search.toLowerCase();
    return list.filter(p => {
      if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.industry.toLowerCase().includes(q)) return false;
      if (matchTypeFilter !== "all" && p.matchType !== matchTypeFilter) return false;
      return true;
    });
  };

  const filteredOpen      = filterProjects(openProjects);
  const filteredExclusive = filterProjects(EXCLUSIVE_PROJECTS);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      const next = generateOpenProjects(LOAD_MORE_COUNT, loadedCount.current);
      loadedCount.current += LOAD_MORE_COUNT;
      setOpenProjects(prev => [...prev, ...next]);
      if (loadedCount.current >= 60) setHasMore(false);
      setIsLoading(false);
    }, 600);
  }, [isLoading, hasMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [loadMore]);

  // Reset match type filter on tab switch
  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setMatchTypeFilter("all");
  };

  const isExclusiveLocked = exclusiveState === "locked";

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
      `}</style>

      {/* Proposal-remaining popup */}
      {proposalPopup !== null && (
        <ProposalRemainingPopup
          remaining={proposalPopup}
          onClose={() => setProposalPopup(null)}
          onViewBanner={() => setBannerOpen(true)}
        />
      )}

      {/* Upgrade modal */}
      <UpgradePremiumModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {/* Filter drawer — rendered outside scroll container */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={drawerFilters}
        onToggle={toggleDrawerFilter}
        onClear={() => setDrawerFilters(EMPTY_DRAWER_FILTERS)}
        activeCount={activeFilterCount}
      />

      {/* Quick Add Product Drawer */}
      <QuickAddProductDrawer
        open={quickAddOpen}
        initialTab={quickAddTab}
        onClose={() => setQuickAddOpen(false)}
        onProductSaved={() => setCatDemoState(2)}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6 pb-8 h-full overflow-y-auto">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold leading-[32px] tracking-[-0.2px] text-[#18181b]"
              style={{ fontFamily: "Poppins, sans-serif" }}>
              Opportunities
            </h1>
            <p className="text-[13px] text-[#62748e] mt-0.5 leading-[20px]">
              Manufacturing opportunities matched to your capabilities, products, and industry focus.
            </p>
          </div>
          {/* Plan info controls — aligned to top-right of heading */}
          {demoState === "free" && (
            <div className="flex items-center gap-2 shrink-0 mt-1">
              {!bannerOpen && (
                <span className="text-[11px] text-slate-400">Plan info hidden.</span>
              )}
              {!bannerOpen && (
                <button
                  onClick={() => setBannerOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold hover:underline"
                  style={{ color: "#c9a227" }}
                >
                  <Crown size={10} /> Show plan info
                </button>
              )}
              {bannerOpen && (
                <button
                  onClick={() => setBannerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-amber-50"
                  style={{ color: "#c9a227", borderColor: "rgba(201,162,39,0.40)" }}
                >
                  <Crown size={11} /> Plan info
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Plan banner — above search, visible when open ── */}
        {demoState === "free" && bannerOpen && (
          <FreeAccessStrip
            open={bannerOpen}
            onUpgrade={openUpgrade}
            onDismiss={() => setBannerOpen(false)}
          />
        )}
        {demoState === "premium" && <PremiumAccessStrip />}

        {/* ── Project count summary cards ── */}
        {(() => {
          const openCap    = openProjects.filter(p => p.matchType === "Capability-Based").length;
          const openCat    = openProjects.filter(p => p.matchType === "Product Catalogue-Based").length;
          const openTotal  = openProjects.length;
          const exclCap    = EXCLUSIVE_PROJECTS.filter(p => p.matchType === "Capability-Based").length;
          const exclCat    = EXCLUSIVE_PROJECTS.filter(p => p.matchType === "Product Catalogue-Based").length;
          const exclTotal  = EXCLUSIVE_PROJECTS.length;

          const hasAssignedExcl = exclAssigned;
          const lockedMoreCount = 17;

          return (
            <div className="flex items-stretch gap-3">
              {/* Open Projects card */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 min-w-0" style={{ borderColor: "rgba(31,111,84,0.20)", background: "rgba(31,111,84,0.04)" }}>
                <div className="shrink-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">Open Projects</p>
                  <span className="text-[26px] font-black leading-none tabular-nums" style={{ color: "#1F6F54" }}>{openTotal}</span>
                </div>
                <div className="w-px self-stretch bg-slate-200/70 shrink-0" />
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[16px] font-black leading-none tabular-nums text-slate-800 shrink-0">{openCap}</span>
                    <span className="text-[8.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 whitespace-nowrap">Capability-Based</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 shrink-0" />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[16px] font-black leading-none tabular-nums text-slate-800 shrink-0">{openCat}</span>
                    <span className="text-[8.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 whitespace-nowrap">Catalogue-Based</span>
                  </div>
                </div>
              </div>

              {/* Exclusive Projects card — 3 states */}
              {isExclusiveLocked ? (
                !hasAssignedExcl ? (
                  /* ── State A: locked + nothing assigned yet ── */
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 min-w-0"
                    style={{ borderColor: "rgba(100,116,139,0.20)", background: "rgba(100,116,139,0.04)" }}>
                    <div className="shrink-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lock size={9} className="text-slate-400" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Exclusive Projects</p>
                      </div>
                      <span className="text-[26px] font-black leading-none tabular-nums text-slate-300">—</span>
                    </div>
                    <div className="w-px self-stretch bg-slate-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-500 leading-snug">
                        Upgrade to Premium to unlock exclusive opportunities matched to your plant.
                      </p>
                    </div>
                    <button onClick={openUpgrade}
                      className="ml-auto shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9.5px] font-bold whitespace-nowrap transition-all hover:brightness-110"
                      style={{ background: "#1F6F54", color: "#fff" }}>
                      ⚡ Upgrade
                    </button>
                  </div>
                ) : (
                  /* ── State B: locked + some projects assigned (free plan partial view) ── */
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 min-w-0"
                    style={{ borderColor: "rgba(100,116,139,0.20)", background: "rgba(100,116,139,0.04)" }}>
                    <div className="shrink-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Lock size={9} className="text-slate-400" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Exclusive Projects</p>
                      </div>
                      <span className="text-[26px] font-black leading-none tabular-nums text-slate-400">{exclTotal}</span>
                    </div>
                    <div className="w-px self-stretch bg-slate-200 shrink-0" />
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[16px] font-black leading-none tabular-nums text-slate-500 shrink-0">{exclCap}</span>
                        <span className="text-[8.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 whitespace-nowrap">Capability-Based</span>
                      </div>
                      <div className="w-px h-4 bg-slate-200 shrink-0" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[16px] font-black leading-none tabular-nums text-slate-500 shrink-0">{exclCat}</span>
                        <span className="text-[8.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 whitespace-nowrap">Catalogue-Based</span>
                      </div>
                    </div>
                    <button onClick={openUpgrade} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[10px] font-bold transition-all hover:brightness-110 shrink-0 whitespace-nowrap ml-auto" style={{ background: "#1F6F54" }}>
                      <span>⚡</span> Upgrade
                    </button>
                  </div>
                )
              ) : premiumExclusiveState === "empty" ? (
                /* ── State C-empty: premium but no projects assigned yet ── */
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 min-w-0" style={{ borderColor: "rgba(0,119,204,0.20)", background: "rgba(0,119,204,0.04)" }}>
                  <div className="shrink-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">Exclusive Projects</p>
                    <span className="text-[26px] font-black leading-none tabular-nums text-slate-300">—</span>
                  </div>
                  <div className="w-px self-stretch bg-slate-200/70 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold leading-snug" style={{ color: "#0077CC" }}>Exclusive projects are being curated for your plant.</p>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">Our team is matching opportunities — check back soon.</p>
                  </div>
                </div>
              ) : (
                /* ── State C-assigned: premium — full access with numbers ── */
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 min-w-0" style={{ borderColor: "rgba(0,119,204,0.20)", background: "rgba(0,119,204,0.04)" }}>
                  <div className="shrink-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">Exclusive Projects</p>
                    <span className="text-[26px] font-black leading-none tabular-nums" style={{ color: "#0077CC" }}>{exclTotal}</span>
                  </div>
                  <div className="w-px self-stretch bg-slate-200/70 shrink-0" />
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[16px] font-black leading-none tabular-nums text-slate-800 shrink-0">{exclCap}</span>
                      <span className="text-[8.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 whitespace-nowrap">Capability-Based</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200 shrink-0" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[16px] font-black leading-none tabular-nums text-slate-800 shrink-0">{exclCat}</span>
                      <span className="text-[8.5px] font-semibold uppercase tracking-[0.09em] text-slate-400 whitespace-nowrap">Catalogue-Based</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Search row: search + Open/Exclusive pill + Sort ── */}
        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 py-[9px] bg-white border border-[#e4e4e7] rounded-[6px] hover:border-[#1F6F54]/40 transition-colors focus-within:border-[#1F6F54]/60">
            <Search className="w-4 h-4 text-[#71717a] flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="flex-1 min-w-0 text-sm text-[#09090b] placeholder:text-[#71717a] outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#9ca3af] hover:text-[#353535] transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Open / Exclusive toggle — same corner radius as search box */}
          <div className="flex items-center p-[3px] bg-[#f4f4f5] rounded-[8px] border border-[#e4e4e7]">
            <button
              onClick={() => switchTab("open")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-[6px] rounded-[6px] text-[13px] font-semibold transition-all duration-200 whitespace-nowrap",
                activeTab === "open"
                  ? "bg-[#1F6F54] text-white shadow-sm"
                  : "text-[#62748e] hover:text-[#374151]",
              )}
            >
              Open Projects
              <OpenProjectsInfoTooltip />
            </button>
            <button
              onClick={() => switchTab("exclusive")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-[6px] rounded-[6px] text-[13px] font-semibold transition-all duration-200 whitespace-nowrap",
                activeTab === "exclusive"
                  ? "bg-[#1F6F54] text-white shadow-sm"
                  : "text-[#62748e] hover:text-[#374151]",
              )}
            >
              {isExclusiveLocked && <Lock size={11} className="shrink-0" />}
              Exclusive Projects
              <ExclusiveInfoTooltip />
            </button>
          </div>

          {/* Sort */}
          <SortDropdown value={sort} onSelect={setSort} />

          {/* Filters — same row as sort */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-[9px] border rounded-[6px] text-sm font-medium transition-all whitespace-nowrap",
              activeFilterCount > 0
                ? "bg-[#1F6F54] text-white border-[#1F6F54] shadow-sm"
                : "bg-white text-[#374151] border-[#e4e4e7] hover:border-[#1F6F54]/40",
            )}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/30 text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Row below search: Demo switcher only ── */}
        <div className="flex items-center gap-2.5 -mt-1">
          <DemoSwitcher current={demoState} onChange={s => { setDemoState(s); setMatchTypeFilter("all"); setBannerOpen(true); setProposalsUsed(PROPOSALS_USED); }} />
          {/* Exclusive state toggle — only visible on free plan */}
          {isExclusiveLocked && (
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-200">
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-300">Excl:</span>
              {[{ label: "No Projects", val: false }, { label: "Has Projects", val: true }].map(opt => (
                <button key={String(opt.val)} onClick={() => setExclAssigned(opt.val)}
                  className="text-[9px] font-bold px-2 py-[3px] rounded-full transition-all border"
                  style={{
                    background:  exclAssigned === opt.val ? "#1F6F54" : "#f9fafb",
                    color:       exclAssigned === opt.val ? "#fff"    : "#9ca3af",
                    borderColor: exclAssigned === opt.val ? "#1F6F54" : "#e5e7eb",
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Applied filter chips ── */}
        {activeFilterCount > 0 && (() => {
          const chips = (Object.entries(drawerFilters) as [keyof DrawerFilters, string[]][])
            .flatMap(([key, vals]) => vals.map(v => ({ key, v })));
          return (
            <div className="flex items-center gap-2 flex-wrap -mt-1">
              <span className="text-[12px] font-semibold text-[#374151] shrink-0">Applied Filters</span>
              {chips.map(({ key, v }) => (
                <span
                  key={`${key}-${v}`}
                  className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-[4px] bg-[#f0faf5] border border-[#1F6F54]/25 text-[11.5px] font-medium text-[#1F6F54]"
                >
                  {v}
                  <button
                    onClick={() => toggleDrawerFilter(key, v)}
                    className="ml-0.5 hover:text-[#0E6F5C] transition-colors"
                    aria-label={`Remove ${v}`}
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <button
                onClick={() => setDrawerFilters(EMPTY_DRAWER_FILTERS)}
                className="ml-auto text-[11.5px] font-semibold text-[#0077CC] hover:underline shrink-0"
              >
                Clear All
              </button>
            </div>
          );
        })()}


        {/* ══════════════════════════════════════════════════════════════════════
            TAB CONTENT
        ═══════════════════════════════════════════════════════════════════════ */}

        {activeTab === "open" && (
          <>
            {/* ─── Product Catalogue-Based: 3-state demo flow ─── */}
            {matchTypeFilter === "Product Catalogue-Based" ? (
              <div className="flex flex-col gap-4">
                {/* Demo switcher */}
                <CatalogueDemoSwitcher current={catDemoState} onChange={setCatDemoState} />

                {/* State 1 — no products */}
                {catDemoState === 1 && (
                  <CatalogueEmptyState
                    onAddProduct={() => openQuickAdd("single")}
                    onBulkUpload={() => openQuickAdd("bulk")}
                  />
                )}

                {/* State 2 — products added, mapping in progress */}
                {catDemoState === 2 && (
                  <CatalogueMappingState
                    onExploreCapability={() => setMatchTypeFilter("Capability-Based")}
                    onManageCatalogue={() => openQuickAdd("single")}
                  />
                )}

                {/* State 3 — demand mapped, show project cards */}
                {catDemoState === 3 && (
                  <>
                    <CatalogueMappedBanner onManageCatalogue={() => openQuickAdd("single")} />
                    {filteredOpen.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredOpen.map(project => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                            planState={planState}
                            proposalsUsed={proposalsUsed}
                            onSendProposal={handleSendProposal}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#f0faf5] flex items-center justify-center mb-3">
                          <Search className="w-6 h-6 text-[#1F6F54]" />
                        </div>
                        <p className="text-base font-semibold text-[#020202]">No catalogue projects found</p>
                        <p className="text-sm text-[#62748e] mt-1">Try adjusting your search or filters.</p>
                      </div>
                    )}
                    {/* Infinite scroll */}
                    <div ref={sentinelRef} className="h-1" />
                    {isLoading && <ScrollLoader />}
                    {!hasMore && filteredOpen.length > 0 && (
                      <div className="flex items-center justify-center py-4">
                        <p className="text-sm text-[#9ca3af]">All projects loaded</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* ─── Normal / Capability-Based flow ─── */
              <>
                {filteredOpen.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredOpen.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        planState={planState}
                        proposalsUsed={proposalsUsed}
                        onSendProposal={handleSendProposal}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f0faf5] flex items-center justify-center mb-4">
                      <Search className="w-7 h-7 text-[#1F6F54]" />
                    </div>
                    <p className="text-base font-semibold text-[#020202]">No projects found</p>
                    <p className="text-sm text-[#62748e] mt-1">Try adjusting your search or filters.</p>
                  </div>
                )}

                {/* Infinite scroll */}
                <div ref={sentinelRef} className="h-1" />
                {isLoading && <ScrollLoader />}
                {!hasMore && filteredOpen.length > 0 && (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-sm text-[#9ca3af]">All projects loaded</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "exclusive" && (
          <div className="flex flex-col gap-4">

            {/* ══ PREMIUM — two exclusive sub-states ══ */}
            {demoState === "premium" && (
              <>
                {/* Sub-state switcher */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa]">
                  <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest shrink-0">Exclusive</span>
                  <div className="flex items-center gap-1">
                    {(["empty", "cards"] as const).map(s => (
                      <button key={s} onClick={() => setPremiumExclusiveState(s)}
                        className={cn(
                          "px-2.5 py-[3px] rounded-[5px] text-[11px] font-semibold transition-all duration-150",
                          premiumExclusiveState === s ? "bg-[#020202] text-white" : "text-[#6b7280] hover:bg-[#f0f0f0]",
                        )}>
                        {s === "empty" ? "Not Assigned" : "Projects Assigned"}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10.5px] text-[#9ca3af] italic hidden sm:block">
                    {premiumExclusiveState === "empty"
                      ? "Premium unlocked — no exclusive projects curated yet"
                      : "2 exclusive projects matched to your profile"}
                  </span>
                </div>

                {/* Sub-state 1 — Premium unlocked, no projects assigned yet */}
                {premiumExclusiveState === "empty" && (
                  <ExclusiveEmptyState onExplore={() => switchTab("open")} />
                )}

                {/* Sub-state 2 — 2–3 exclusive project cards */}
                {premiumExclusiveState === "cards" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {EXCLUSIVE_PROJECTS.slice(0, 3).map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        isExclusive
                        matchType={project.matchType}
                        planState={planState}
                        proposalsUsed={proposalsUsed}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ══ FREE — always locked ══ */}
            {demoState === "free" && (
              <div className="relative min-h-[480px]">
                {/* Ghost cards behind blur */}
                <div className="pointer-events-none select-none"
                  style={{ filter: "blur(6px)", opacity: 0.35 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {EXCLUSIVE_PROJECTS.slice(0, 8).map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => {}}
                        isExclusive
                        matchType={project.matchType}
                        planState={planState}
                        proposalsUsed={proposalsUsed}
                      />
                    ))}
                  </div>
                </div>
                {/* Overlay with upgrade CTA */}
                <ExclusiveLockedOverlay onUpgrade={openUpgrade} />
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
