"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ChevronDown, X, ArrowUpRight, Sparkles,
  Info, Lock, SlidersHorizontal, ChevronRight, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_PROJECTS, type BadgeType } from "@/lib/projectsData";

// ─── Dev config — change these constants to preview different states ───────────
// planState:      "trial" | "trial_used" | "trial_expired" | "growth" | "scale"
// exclusiveState: "empty" | "available" | "locked"
const PLAN_STATE:        PlanState      = "trial";
const EXCLUSIVE_STATE:   ExclusiveState = "available";
const TRIAL_DAYS_LEFT                  = 11;
const PROPOSALS_USED                   = 0;   // 0 = 1 remaining, 1+ = limit reached
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────
type PlanState      = "trial" | "trial_used" | "trial_expired" | "growth" | "scale";
type ExclusiveState = "empty" | "available" | "locked";
type MatchType      = "Capability-Based" | "Catalogue-Based";
type TabType        = "open" | "exclusive";

interface Project {
  id: number;
  image: string;
  badge: BadgeType | null;
  industry: string;
  title: string;
  description: string;
  matchType: MatchType;
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

const OPEN_SEED: Project[] = ALL_PROJECTS.map((p, i) => ({
  id: i + 1,
  image: p.image,
  badge: p.badge,
  industry: p.industry,
  title: p.title,
  description: p.description,
  matchType: (i % 3 === 0 ? "Catalogue-Based" : "Capability-Based") as MatchType,
}));

const EXCLUSIVE_PROJECTS: Project[] = ALL_PROJECTS.map((p, i) => ({
  id: i + 200,
  image: p.image,
  badge: "Exclusive" as BadgeType,
  industry: p.industry,
  title: p.title,
  description: p.description,
  matchType: (i % 2 === 0 ? "Capability-Based" : "Catalogue-Based") as MatchType,
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
    options: ["RFQ", "Co Development", "Contract Manufacturing"],
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

// ─── Trial banner ─────────────────────────────────────────────────────────────
function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border"
      style={{ background: "linear-gradient(90deg,#111111,#1a1400)", borderColor: "#c9a227" }}>
      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
        <span className="text-[12px] font-bold whitespace-nowrap" style={{ color: "#f5c842" }}>Free Trial Active</span>
        <span style={{ color: "#c9a227" }}>•</span>
        <span className="text-[12px]" style={{ color: "#e0c97a" }}>
          Explore Exclusive Projects for 14 days. 1 proposal included during trial access.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <p className="hidden sm:block text-[11px] italic" style={{ color: "#a07e30" }}>
          After trial expiry, Exclusive Projects will lock.
        </p>
        <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold border"
          style={{ background: "#1f1700", color: "#f5c842", borderColor: "#c9a227" }}>
          {daysLeft} days left
        </span>
        <button
          className="px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-colors"
          style={{ background: "#c9a227", color: "#111111" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#f5c842")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#c9a227")}
        >
          Upgrade Plan
        </button>
        <button onClick={() => setDismissed(true)} className="transition-colors" style={{ color: "#c9a227" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#f5c842")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#c9a227")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Exclusive tooltip ────────────────────────────────────────────────────────
function ExclusiveInfoTooltip() {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
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
          className="absolute bottom-full right-0 mb-2.5 w-[288px] z-50"
          style={{ animation: "tooltipFadeIn 160ms ease both" }}
        >
          {/* Arrow */}
          <div className="absolute -bottom-1.5 right-3 w-3 h-3 rotate-45 border-b border-r"
            style={{ background: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }} />
          <div className="relative bg-[#1e293b] rounded-xl p-4 shadow-2xl border border-white/10">
            <p className="text-[11.5px] font-bold text-white mb-2">What are Exclusive Projects?</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Exclusive Projects are highly matched opportunities tailored specifically to your
              manufacturing capabilities, certifications, and catalogue.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
              These projects are not visible to all suppliers and are curated specifically for your business profile.
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
    >
      <Info size={12} className="text-slate-400 cursor-help" />
      {show && (
        <div
          className="absolute bottom-full left-0 mb-2.5 w-[272px] z-50"
          style={{ animation: "tooltipFadeIn 160ms ease both" }}
        >
          <div className="absolute -bottom-1.5 left-3 w-3 h-3 rotate-45 border-b border-r"
            style={{ background: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }} />
          <div className="relative bg-[#1e293b] rounded-xl p-4 shadow-2xl border border-white/10">
            <p className="text-[11.5px] font-bold text-white mb-2">What are Open Projects?</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Open Projects are publicly visible manufacturing opportunities available to all qualified suppliers on the platform.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
              They are matched to you based on your capabilities, certifications, and industry focus.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Match type info tooltips ─────────────────────────────────────────────────
function MatchTypeInfoTooltip({ type }: { type: "Capability-Based" | "Catalogue-Based" }) {
  const [show, setShow] = useState(false);
  const isCapability = type === "Capability-Based";
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info size={10} className="cursor-help" style={{ color: isCapability ? "#0E6F5C" : "#6237C7", opacity: 0.7 }} />
      {show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-[248px] z-50"
          style={{ animation: "tooltipFadeIn 160ms ease both" }}
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r"
            style={{ background: "#1e293b", borderColor: "rgba(255,255,255,0.08)" }} />
          <div className="relative bg-[#1e293b] rounded-xl p-4 shadow-2xl border border-white/10">
            <p className="text-[11.5px] font-bold text-white mb-2">{type}</p>
            {isCapability ? (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Projects matched because your manufacturing capabilities, certifications, or past project history align with the buyer's requirements.
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Projects matched because products in your catalogue match what the buyer is sourcing — by molecule, CAS number, or category.
              </p>
            )}
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
                      return (
                        <label
                          key={opt}
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
                        </label>
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
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#185C45")}
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
  if (planState === "trial" && proposalsUsed === 0)
    return { text: "1 trial proposal remaining", color: "#059669" };
  if (planState === "trial" && proposalsUsed >= 1)
    return { text: "Upgrade to continue submitting proposals", color: "#d97706" };
  if (planState === "trial_used")
    return { text: "Upgrade to continue submitting proposals", color: "#d97706" };
  if (planState === "trial_expired" && isExclusive)
    return { text: "Exclusive access requires premium upgrade", color: "#dc2626" };
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
}: {
  project: Project;
  onClick: () => void;
  isExclusive?: boolean;
  matchType?: MatchType;
  planState: PlanState;
  proposalsUsed: number;
}) {
  const badge       = project.badge ? BADGE_CONFIG[project.badge] : null;
  const footer      = getFooterMessage(isExclusive, planState, proposalsUsed);
  const displayMT   = matchType ?? project.matchType;

  return (
    <div className="group relative cursor-pointer flex-1 min-w-0" onClick={onClick}>
      {/* Animated gradient border on hover */}
      <div
        className="absolute -inset-[1.5px] rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:     "linear-gradient(135deg, #1F6F54 0%, #2ACB83 40%, #1F6F54 70%, #2dd194 100%)",
          backgroundSize: "300% 300%",
          animation:      "gradientShift 3s ease infinite",
        }}
      />

      {/* Card body */}
      <div className={cn(
        "relative bg-white rounded-[12px] p-[10px] flex flex-col gap-3 overflow-hidden",
        "shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.06)]",
        "group-hover:shadow-[0px_16px_32px_rgba(31,111,84,0.18)] group-hover:pb-11",
        "transition-[box-shadow,padding] duration-300 ease-in-out",
      )}>

        {/* Image */}
        <div className="relative overflow-hidden rounded-[10px] h-[140px] bg-[#cfd8dc] flex-shrink-0">
          <img
            src={project.image} alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Match type pill — top-right of image */}
          {displayMT && (
            <div className="absolute top-[8px] right-[9px] px-2 py-[3px] rounded-full text-[9px] font-semibold"
              style={{
                background: displayMT === "Capability-Based" ? "rgba(14,111,92,0.88)" : "rgba(99,55,199,0.88)",
                color: "#fff",
                backdropFilter: "blur(4px)",
              }}>
              {displayMT === "Capability-Based" ? "Capability" : "Catalogue"}
            </div>
          )}
        </div>

        {/* Industry pill */}
        <div>
          <span className="inline-flex items-center px-[10px] py-[2px] rounded-full bg-[#e3f4ff] text-[#171717] text-[13px] font-medium leading-[24px]">
            {project.industry}
          </span>
        </div>

        {/* Title + description */}
        <div className="flex flex-col gap-[4px] flex-1">
          <h3 className="font-semibold text-[16px] leading-[24px] text-black line-clamp-2">
            {project.title}
          </h3>
          {/* Exclusive context strip */}
          {isExclusive && (
            <p className="text-[10.5px] italic text-[#1F6F54]/70 leading-snug -mt-0.5">
              Matched specifically for your manufacturing profile
            </p>
          )}
          <p className="text-[13px] font-normal leading-[20px] text-[#353535] line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Footer message */}
        {footer && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 mt-auto">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: footer.color }} />
            <p className="text-[10.5px] font-medium leading-snug" style={{ color: footer.color }}>
              {footer.text}
            </p>
          </div>
        )}

        {/* Hover arrow */}
        <div className={cn(
          "absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
          "bg-[#1F6F54] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
          "transition-all duration-300 ease-in-out",
        )}>
          <ArrowUpRight className="w-4 h-4 text-white" />
        </div>
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
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-[480px] mx-auto">
      {/* Illustration */}
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg,#020202,#1a1a2e)", border: "1px solid rgba(245,200,66,0.22)" }}>
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <rect x="4"  y="10" width="30" height="22" rx="3" stroke="rgba(245,200,66,0.60)" strokeWidth="1.5" fill="none"/>
          <rect x="10" y="16" width="18" height="10" rx="2" stroke="rgba(245,200,66,0.40)" strokeWidth="1.2" fill="none"/>
          <path d="M19 5l1.5 3 3.5.4-2.5 2.4.6 3.4L19 12.8l-3.1 1.4.6-3.4L14 8.4l3.5-.4z"
            fill="#f5c842" opacity="0.90"/>
        </svg>
      </div>

      <h3 className="text-[18px] font-bold text-[#09090b] mb-2.5"
        style={{ fontFamily: "Poppins, sans-serif" }}>
        Exclusive Projects Are Being Curated For You
      </h3>
      <p className="text-[13.5px] text-[#62748e] leading-relaxed mb-1.5">
        We&apos;re actively mapping exclusive projects tailored to your manufacturing capabilities and catalogue.
      </p>
      <p className="text-[13.5px] text-[#62748e] leading-relaxed mb-8">
        Meanwhile, explore capability-based opportunities to improve your matching score.
      </p>

      <button
        onClick={onExplore}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors"
        style={{ background: "#1F6F54" }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#185C45")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#1F6F54")}
      >
        Explore Capability-Based Projects <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

// ─── Exclusive locked overlay ─────────────────────────────────────────────────
function ExclusiveLockedOverlay() {
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
        <p className="text-[13px] text-slate-400 leading-relaxed mb-6">
          Upgrade to Premium to continue accessing highly matched manufacturing opportunities
          tailored specifically for your business.
        </p>
        <div className="flex flex-col gap-2">
          <button className="w-full py-2.5 rounded-xl text-[13px] font-bold text-[#020202] transition-all hover:brightness-110"
            style={{ background: "linear-gradient(90deg,#f5c842,#f59e0b)" }}>
            Upgrade to Premium
          </button>
          <button className="w-full py-2.5 rounded-xl text-[13px] font-semibold border transition-colors hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.70)" }}>
            View Plans
          </button>
        </div>
      </div>
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

// ─── Main component ───────────────────────────────────────────────────────────
export function ProjectsListing() {
  const router = useRouter();

  // Plan state (from dev config)
  const planState:      PlanState      = PLAN_STATE;
  const exclusiveState: ExclusiveState = EXCLUSIVE_STATE;
  const trialDaysLeft                  = TRIAL_DAYS_LEFT;
  const proposalsUsed                  = PROPOSALS_USED;

  // Tab + match type
  const [activeTab,       setActiveTab]       = useState<TabType>("open");
  const [matchTypeFilter, setMatchTypeFilter] = useState<"all" | MatchType>("all");

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
    setDrawerFilters(prev => ({
      ...prev,
      [section]: prev[section].includes(value)
        ? prev[section].filter(v => v !== value)
        : [...prev[section], value],
    }));
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

  const isExclusiveLocked =
    exclusiveState === "locked" || planState === "trial_expired";

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
      `}</style>

      {/* Filter drawer — rendered outside scroll container */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={drawerFilters}
        onToggle={toggleDrawerFilter}
        onClear={() => setDrawerFilters(EMPTY_DRAWER_FILTERS)}
        activeCount={activeFilterCount}
      />

      <div className="flex flex-col gap-3 p-4 sm:p-6 pb-8 h-full overflow-y-auto">

        {/* ── Page header ── */}
        <div>
          <h1 className="text-[26px] font-semibold leading-[32px] tracking-[-0.2px] text-[#18181b]"
            style={{ fontFamily: "Poppins, sans-serif" }}>
            Projects
          </h1>
          <p className="text-[13px] text-[#62748e] mt-0.5 leading-[20px] max-w-[600px]">
            Manufacturing opportunities matched to your capabilities, products, and industry focus.
          </p>
        </div>

        {/* ── Search + Sort + Filters CTA ── */}
        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 py-[9px] bg-white border border-[#e4e4e7] rounded-[6px] hover:border-[#1F6F54]/40 transition-colors focus-within:border-[#1F6F54]/60">
            <Search className="w-4 h-4 text-[#71717a] flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search CAS No., Molecular Name, Projects Name"
              className="flex-1 text-sm text-[#09090b] placeholder:text-[#71717a] outline-none bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#9ca3af] hover:text-[#353535] transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <SortDropdown value={sort} onSelect={setSort} />

          {/* Filters CTA */}
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

        {/* ── Trial banner ── */}
        {planState === "trial" && <TrialBanner daysLeft={trialDaysLeft} />}

        {/* ── Primary tabs ── */}
        <div className="border-b border-slate-200">
          <div className="flex items-end gap-0">
            {/* Open Projects tab */}
            <button
              onClick={() => switchTab("open")}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2 text-[13.5px] font-semibold transition-all duration-200 border-b-2 -mb-px",
                activeTab === "open"
                  ? "border-[#1F6F54] text-[#1F6F54]"
                  : "border-transparent text-[#62748e] hover:text-[#374151]",
              )}
            >
              Open Projects
              <OpenProjectsInfoTooltip />
            </button>

            {/* Exclusive Projects tab */}
            <button
              onClick={() => switchTab("exclusive")}
              className={cn(
                "flex items-center gap-1.5 px-5 py-2 text-[13.5px] font-semibold transition-all duration-200 border-b-2 -mb-px",
                activeTab === "exclusive"
                  ? "border-[#1F6F54] text-[#1F6F54]"
                  : isExclusiveLocked
                  ? "border-transparent text-[#9ca3af] opacity-60"
                  : "border-transparent text-[#62748e] hover:text-[#374151]",
              )}
            >
              {isExclusiveLocked && <Lock size={11} className="shrink-0" />}
              Exclusive Projects
              <ExclusiveInfoTooltip />
            </button>
          </div>
        </div>

        {/* ── Secondary match type filter ── */}
        <div className="flex items-center gap-2 mt-2">
          {/* Segmented control wrapper */}
          <div className="flex items-center p-[3px] bg-[#f4f4f5] rounded-[8px] border border-[#e4e4e7]">
            {(["all", "Capability-Based", "Catalogue-Based"] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setMatchTypeFilter(opt)}
                className={cn(
                  "flex items-center gap-1 px-4 py-[6px] rounded-[6px] text-[12.5px] font-semibold transition-all duration-200",
                  matchTypeFilter === opt
                    ? opt === "Capability-Based"
                      ? "bg-[#0E6F5C] text-white shadow-sm"
                      : opt === "Catalogue-Based"
                      ? "bg-[#6237C7] text-white shadow-sm"
                      : "bg-white text-[#18181b] shadow-sm"
                    : "text-[#62748e] hover:text-[#374151]",
                )}
              >
                {opt === "all" ? "All" : opt}
                {opt !== "all" && <MatchTypeInfoTooltip type={opt} />}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB CONTENT
        ═══════════════════════════════════════════════════════════════════════ */}

        {activeTab === "open" && (
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

        {activeTab === "exclusive" && (
          <>
            {exclusiveState === "empty" && (
              <ExclusiveEmptyState onExplore={() => switchTab("open")} />
            )}

            {exclusiveState === "available" && !isExclusiveLocked && (
              <>
                {filteredExclusive.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredExclusive.map(project => (
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
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#f0faf5] flex items-center justify-center mb-4">
                      <Search className="w-7 h-7 text-[#1F6F54]" />
                    </div>
                    <p className="text-base font-semibold text-[#020202]">No exclusive projects found</p>
                    <p className="text-sm text-[#62748e] mt-1">Try adjusting your search or filters.</p>
                  </div>
                )}
              </>
            )}

            {isExclusiveLocked && (
              <div className="relative min-h-[400px]">
                {/* Ghost cards behind blur */}
                <div
                  className="pointer-events-none select-none"
                  style={{ filter: "blur(5px)", opacity: 0.45 }}
                >
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
                {/* Overlay */}
                <ExclusiveLockedOverlay />
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}
