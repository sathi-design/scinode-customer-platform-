"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Building2, Package, Award, Cpu, Wrench,
  Shield, Zap, FileCheck, Check, ArrowRight,
  Loader2, PartyPopper, Eye, Pencil, Microscope, ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIndependentCROProfileStore } from "@/store/useIndependentCROProfileStore";
import { getCROStepCompletions, getCROProfileProgress } from "./types";
import { CRO_TABS, type CROTabId } from "./constants";
import { Tab1CompanyProfile } from "./steps/Tab1CompanyProfile";
import { Tab2Products }       from "./steps/Tab2Products";
import { Tab3Certifications } from "./steps/Tab3Certifications";
import { Tab4Services }       from "./steps/Tab4Services";
import { Tab5Equipment }      from "./steps/Tab5Equipment";
import { Tab6Facility }       from "./steps/Tab6Facility";
import { Tab7Utility }        from "./steps/Tab7Utility";
import { Tab8Terms }          from "./steps/Tab8Terms";

type SaveStatus = "idle" | "saving" | "saved";

// ─── Tab icon map ─────────────────────────────────────────────────────────────
const TAB_ICONS: Record<CROTabId, React.ElementType> = {
  company:   Building2,
  products:  Package,
  certs:     Award,
  services:  Cpu,
  equipment: Wrench,
  facility:  Shield,
  utility:   Zap,
  terms:     FileCheck,
};

// ─── Right-panel "Why Details Matter" text ────────────────────────────────────
const WHY_MATTERS: Record<CROTabId, { heading: string; body: string }> = {
  company:   { heading: "Why details matter?", body: "A complete profile builds trust and helps buyers understand who you are at a glance." },
  products:  { heading: "Why details matter?", body: "Adding your products boosts visibility and helps you attract more relevant leads." },
  certs:     { heading: "Why details matter?", body: "Showcasing your credentials builds credibility and reassures potential buyers." },
  services:  { heading: "Why details matter?", body: "Clearly defining your services enables better project matchmaking and increases the likelihood of high-quality inquiries." },
  equipment: { heading: "Why details matter?", body: "Highlighting your equipment improves your chances of being discovered by buyers worldwide." },
  facility:  { heading: "Why details matter?", body: "Sharing your safety and compliance practices builds buyer confidence and sets you apart." },
  utility:   { heading: "Why details matter?", body: "Detailing your utilities helps buyers understand your operational strength and readiness." },
  terms:     { heading: "Why details matter?", body: "Completing your agreement confirms your commitment and activates your full profile." },
};

const TAB_SUBTITLES: Record<CROTabId, string> = {
  company:   "A complete company profile builds trust and helps potential buyers understand who you are.",
  products:  "Showcase your key products with details that help buyers find the right match.",
  certs:     "Add your licenses and certifications to build credibility with verified buyers.",
  services:  "Define your core service offerings to attract the right project opportunities.",
  equipment: "List your equipment to demonstrate technical depth and operational readiness.",
  facility:  "Detail your facility, ETP, clean rooms, and safety infrastructure.",
  utility:   "List your utilities to help buyers assess your operational strength.",
  terms:     "Review and accept the platform terms before submitting your profile for verification.",
};

// ─── Sidebar mission data (mirrors CRODashboard MISSIONS) ────────────────────
interface SidebarMission {
  id: CROTabId;
  title: string;
  subtitle: string;
  /** Shown below the tab title after the tab is completed */
  completedSubtitle: string;
  /** Headline for per-tab confetti celebration popup */
  confettiText: string;
  contribution: number;
  Icon: LucideIcon;
  badge: string;
  badgeEmoji: string;
  iconBg: string;
  iconColor: string;
  earnedLabel: string;
}

const SIDEBAR_MISSIONS: SidebarMission[] = [
  {
    id: "company",
    title: "Company Profile",
    subtitle: "Define your organisation, team size, and core research focus areas",
    completedSubtitle: "You're now visible for initial buyer discovery",
    confettiText: "Your company identity is now established",
    contribution: 15,
    Icon: Building2, badge: "Listed Lab", badgeEmoji: "🧪",
    iconBg: "#eff6ff", iconColor: "#2563eb", earnedLabel: "Earned",
  },
  {
    id: "products",
    title: "Products",
    subtitle: "List your ready-to-sell products to attract qualified product inquiries",
    completedSubtitle: "Buyers can now evaluate your product relevance",
    confettiText: "Your product portfolio is now discoverable",
    contribution: 10,
    Icon: Package, badge: "Product Lister", badgeEmoji: "📦",
    iconBg: "#fffbeb", iconColor: "#d97706", earnedLabel: "Earned",
  },
  {
    id: "certs",
    title: "License & Certifications",
    subtitle: "Showcase your regulatory compliance, GMP status, and quality certifications",
    completedSubtitle: "You're now eligible for compliance-sensitive opportunities",
    confettiText: "Your regulatory trust signals are now active",
    contribution: 15,
    Icon: Award, badge: "Certified Lab", badgeEmoji: "🏅",
    iconBg: "#f3f0ff", iconColor: "#7c3aed", earnedLabel: "Earned",
  },
  {
    id: "services",
    title: "Services & Capabilities",
    subtitle: "Detail your technical services, synthesis expertise, and execution capabilities",
    completedSubtitle: "Your services can now match active buyer requirements",
    confettiText: "Your technical capabilities are now mapped",
    contribution: 15,
    Icon: Cpu, badge: "Capable Partner", badgeEmoji: "🔬",
    iconBg: "#f0faf5", iconColor: "#1f6f54", earnedLabel: "Earned",
  },
  {
    id: "equipment",
    title: "Equipments",
    subtitle: "List key instruments and equipment to signal your technical readiness to buyers",
    completedSubtitle: "Buyers can now assess your execution readiness",
    confettiText: "Your infrastructure strength is now visible",
    contribution: 10,
    Icon: Microscope, badge: "Equipped Lab", badgeEmoji: "⚗️",
    iconBg: "#eff6ff", iconColor: "#2563eb", earnedLabel: "Earned",
  },
  {
    id: "facility",
    title: "Facility & EHS",
    subtitle: "Detail your facility size, safety standards, and environmental compliance",
    completedSubtitle: "Your facility readiness strengthens trust signals",
    confettiText: "Your operational standards are now verified",
    contribution: 10,
    Icon: Shield, badge: "EHS Compliant", badgeEmoji: "🛡️",
    iconBg: "#fffbeb", iconColor: "#d97706", earnedLabel: "Earned",
  },
  {
    id: "utility",
    title: "Utility",
    subtitle: "Describe available utilities to confirm your operational readiness",
    completedSubtitle: "Infrastructure completeness improves project fit",
    confettiText: "Your production support capabilities are now visible",
    contribution: 10,
    Icon: Zap, badge: "Ready Lab", badgeEmoji: "⚡",
    iconBg: "#f3f0ff", iconColor: "#7c3aed", earnedLabel: "Earned",
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    subtitle: "Complete agreements to enable trusted, verified collaboration requests",
    completedSubtitle: "You're now eligible for high-trust and regulated projects",
    confettiText: "Your profile is now compliant and verified via Scinode Secure",
    contribution: 15,
    Icon: ShieldCheck, badge: "Verified CRO", badgeEmoji: "✅",
    iconBg: "#dff3ee", iconColor: "#1f6f54", earnedLabel: "Verified",
  },
];

// ─── Dynamic profile-strength microcopy ───────────────────────────────────────
function getStrengthMicrocopy(pct: number, anyCompleted: boolean): string {
  if (!anyCompleted)  return "Complete key sections to align your capabilities with opportunities.";
  if (pct <= 10)      return "Your profile is taking shape";
  if (pct <= 25)      return "Your company foundation is now visible";
  if (pct <= 40)      return "Your capabilities are taking shape";
  if (pct <= 55)      return "Your buyer relevance is improving";
  if (pct <= 70)      return "You're becoming discoverable across active opportunities";
  if (pct <= 85)      return "Your profile is gaining strong market visibility";
  if (pct < 100)      return "You're almost ready for high-quality project matches";
  return "Your profile is fully optimized for collaboration discovery";
}

const SIDEBAR_LEVELS = [
  { name: "Explorer",        threshold:   0, emoji: "🗺️" },
  { name: "Listed Lab",      threshold:  20, emoji: "🧪" },
  { name: "Capable Partner", threshold:  65, emoji: "🔬" },
  { name: "Verified CRO",   threshold: 100, emoji: "✅" },
];

// ─── Progress ring (dashboard-style) ─────────────────────────────────────────
function SidebarProgressRing({ value }: { value: number }) {
  const size = 80, stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="sidebar-ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1f6f54" />
            <stop offset="100%" stopColor="#4ed589" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="#e8f0ec" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke="url(#sidebar-ring-grad)" strokeWidth={stroke}
          strokeLinecap="round" fill="none" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-bold text-[#171717] leading-none">{value}%</span>
        <span className="mt-0.5 text-[9px] font-medium text-[#68747a]">complete</span>
      </div>
    </div>
  );
}

// ─── Full Profile Completion card (dashboard design) ─────────────────────────
function ProfileCompletionCard({
  pct,
  completions,
  activeIndex,
  onTabClick,
}: {
  pct: number;
  completions: boolean[];
  activeIndex: number;
  onTabClick: (idx: number) => void;
}) {
  // Derive active level from pct
  let activeLevel = SIDEBAR_LEVELS[0];
  for (const lv of SIDEBAR_LEVELS) if (pct >= lv.threshold) activeLevel = lv;

  const anyCompleted = completions.some(Boolean);
  const microcopy    = getStrengthMicrocopy(Math.round(pct), anyCompleted);

  return (
    <div className="bg-white rounded-[16px] border border-slate-200 p-5 shadow-sm">

      {/* ── Ring + title ── */}
      <div className="flex items-center gap-4 mb-5">
        <SidebarProgressRing value={Math.round(pct)} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold text-[#171717]">Profile Completion</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-[#68747a]">
            {microcopy}
          </p>
          {/* Level badge */}
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#dff3ee] px-2 py-0.5 text-[10px] font-bold text-[#1f6f54] shadow-[0_0_0_3px_rgba(31,111,84,0.08)]">
            <span>{activeLevel.emoji}</span>
            <span>{activeLevel.name}</span>
            <span className="opacity-60">• Active</span>
          </div>
        </div>
      </div>

      {/* ── Horizontal level stepper ── */}
      <div className="flex items-center gap-1 mb-4">
        {SIDEBAR_LEVELS.map((lv, i) => {
          const reached     = pct >= lv.threshold;
          const isActive    = lv.name === activeLevel.name;
          const nextReached = i < SIDEBAR_LEVELS.length - 1 && pct >= SIDEBAR_LEVELS[i + 1].threshold;
          return (
            <div key={lv.name} className="flex flex-1 items-center gap-1">
              <div className="flex flex-1 flex-col items-center gap-0.5">
                <div className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[9px] transition-all duration-300",
                  isActive ? "bg-[#1f6f54] text-white ring-2 ring-[#1f6f54]/20"
                  : reached ? "bg-[#1f6f54] text-white"
                  : "bg-slate-100 text-[#94a3b8]",
                )}>
                  {reached
                    ? <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    : <span className="h-1 w-1 rounded-full bg-current" />}
                </div>
                <span className={cn("text-[8px] font-medium leading-none text-center",
                  isActive ? "text-[#1f6f54]" : "text-[#94a3b8]")}>
                  {lv.name.split(" ")[0]}
                </span>
              </div>
              {i < SIDEBAR_LEVELS.length - 1 && (
                <div className={cn("h-px flex-1 mb-3 transition-colors duration-300",
                  nextReached ? "bg-[#1f6f54]" : "bg-slate-200")} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-slate-100 mb-3" />

      {/* ── Profile Breakdown label ── */}
      <p className="px-0.5 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
        Profile Breakdown
      </p>

      {/* ── All 8 mission rows (no scroll) ── */}
      <div className="space-y-0.5">
        {SIDEBAR_MISSIONS.map((m, idx) => {
          const done      = completions[idx] ?? false;
          const isActive  = activeIndex === idx;
          const Icon      = m.Icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onTabClick(idx)}
              className={cn(
                "flex w-full items-center gap-2.5 px-2 py-1.5 rounded-xl border transition-all duration-150 text-left",
                done      ? "border-[#1f6f54]/20 bg-[#f0faf5]/60"
                : isActive ? "border-[#1f6f54]/25 bg-[#f8fafc]"
                : "border-transparent hover:bg-[#f8fafc]",
              )}
            >
              {/* Icon */}
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all duration-200"
                style={done
                  ? { background: "#1f6f54", color: "#ffffff" }
                  : { background: m.iconBg, color: m.iconColor }}
              >
                {done
                  ? <Check className="h-3 w-3" strokeWidth={2.5} />
                  : <Icon className="h-3 w-3" />}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-[#171717] leading-snug">{m.title}</p>
                {done ? (
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#dff3ee] text-[#1f6f54] leading-none shrink-0">
                      {m.earnedLabel}
                    </span>
                    <p className="truncate text-[10px] font-medium text-[#2563eb] leading-snug">
                      {m.completedSubtitle}
                    </p>
                  </div>
                ) : (
                  <p className="truncate text-[10px] text-[#68747a]">{m.subtitle}</p>
                )}
              </div>

              {/* Chip */}
              <span
                className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold transition-all duration-300 whitespace-nowrap",
                  done ? "text-white" : "bg-[#dff3ee] text-[#1f6f54]")}
                style={done ? {
                  background: "linear-gradient(135deg, #1f6f54, #2d9e70)",
                  boxShadow: "0 0 0 2px rgba(31,111,84,0.15)",
                } : undefined}
              >
                {done ? `+${m.contribution}% Added` : `+${m.contribution}%`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Auto-save footer ─────────────────────────────────────────────────────────
function AutoSaveFooter({ status, lastSaved }: { status: SaveStatus; lastSaved: string }) {
  return (
    <div className="px-4 sm:px-5 py-3 flex items-center justify-between border-t border-[#F3F4F6] bg-[#fafafa] rounded-b-[16px]">
      <div className="flex flex-col leading-tight">
        {status === "saving" ? (
          <span className="flex items-center gap-1.5 text-[13px] text-[#68747a]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#99a8af]" />
            Changes are getting autosaved
          </span>
        ) : (
          <>
            <span className="text-[13px] text-[#68747a]">Changes are getting autosaved</span>
            {lastSaved && <span className="text-[11px] text-[#99a8af]">Last saved: {lastSaved}</span>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Congratulations modal ────────────────────────────────────────────────────
function CongratsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-2xl p-8 max-w-[400px] w-full text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-[#f0faf5] border-2 border-[#86efac] flex items-center justify-center mx-auto mb-5">
          <PartyPopper className="w-8 h-8 text-[#018E7E]" />
        </div>
        <h2 className="text-[26px] font-semibold text-[#111] mb-3 tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
          Congratulations!
        </h2>
        <p className="text-[14px] text-[#64748b] leading-relaxed mb-2">
          You have successfully completed your CRO profile.
        </p>
        <p className="text-[12px] text-[#9ca3af] leading-relaxed mb-6">
          Your profile is now at 99% — our team will verify it within 2–3 business days.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0faf5] border border-[#d1fae5] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#018E7E]" />
          <span className="text-sm font-semibold text-[#018E7E]">Profile 99% complete</span>
        </div>
        <button
          onClick={onClose}
          className="w-full h-[44px] bg-[#018E7E] hover:bg-[#016B5F] text-white text-[14px] font-semibold rounded-[10px] transition-colors flex items-center justify-center gap-2"
        >
          View My Profile <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
export function IndependentCROProfileSetup() {
  const store = useIndependentCROProfileStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved]     = useState("");
  const [stickyH, setStickyH]         = useState(148);
  const [showCongrats, setShowCongrats] = useState(false);
  const [viewAsCustomer, setViewAsCustomer] = useState(false);

  const saveTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stickyRef  = useRef<HTMLDivElement>(null);

  // Measure sticky header height for right-panel top offset
  useEffect(() => {
    const measure = () => {
      if (stickyRef.current) setStickyH(stickyRef.current.offsetHeight + 16);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stickyRef.current) ro.observe(stickyRef.current);
    return () => ro.disconnect();
  }, []);

  // Exit customer-view when changing tab
  useEffect(() => { setViewAsCustomer(false); }, [activeIndex]);

  const formatTime = () => {
    const d = new Date();
    const h12 = d.getHours() % 12 || 12;
    const min  = String(d.getMinutes()).padStart(2, "0");
    const ampm = d.getHours() >= 12 ? "pm" : "am";
    return `${h12}:${min}${ampm}`;
  };

  const triggerAutoSave = useCallback(() => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    clearTimeout(clearTimer.current);
    saveTimer.current = setTimeout(() => {
      setLastSaved(formatTime());
      setSaveStatus("saved");
      clearTimer.current = setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1200);
  }, []);

  const goNext = useCallback(() => {
    if (activeIndex < CRO_TABS.length - 1) {
      triggerAutoSave();
      setActiveIndex((i) => i + 1);
      const main = document.querySelector("main");
      if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeIndex, triggerAutoSave]);

  const goBack = useCallback(() => {
    if (activeIndex > 0) setActiveIndex((i) => i - 1);
  }, [activeIndex]);

  const handleSubmit = useCallback(() => {
    store.setTerms({ submitted: true });
    setShowCongrats(true);
  }, [store]);

  const completions = getCROStepCompletions(store);
  const pct         = store.terms.submitted ? 99 : getCROProfileProgress(store);
  const canSubmit   = completions.every(Boolean);
  const activeTab   = CRO_TABS[activeIndex];
  const activeTabId = activeTab.id as CROTabId;

  // Customer preview (simplified read-only view)
  const CustomerPreview = () => (
    <div className="px-4 sm:px-5 py-6 flex flex-col gap-5">
      <div className="flex items-center gap-3 p-4 rounded-[12px] bg-[#f0faf5] border border-[#d1fae5]">
        <div className="w-14 h-14 rounded-[10px] bg-[#018E7E]/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-7 h-7 text-[#018E7E]" />
        </div>
        <div>
          <p className="text-base font-bold text-[#020202]">{store.company.companyName || "Company Name"}</p>
          <p className="text-sm text-[#62748e]">{store.company.stateCountry || "Location not set"}</p>
        </div>
      </div>

      {store.company.description && (
        <div>
          <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5">About</p>
          <p className="text-sm text-[#374151] leading-relaxed">{store.company.description}</p>
        </div>
      )}

      {store.company.industries.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5">Industries</p>
          <div className="flex flex-wrap gap-1.5">
            {store.company.industries.map((ind) => (
              <span key={ind} className="px-2.5 py-1 rounded-full bg-[#e6f4ef] text-[#018E7E] text-xs font-medium">{ind}</span>
            ))}
          </div>
        </div>
      )}

      {store.company.uniqueCapabilities.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1.5">Unique Capabilities</p>
          <div className="flex flex-wrap gap-1.5">
            {store.company.uniqueCapabilities.map((cap) => (
              <span key={cap} className="px-2.5 py-1 rounded-full bg-white border border-[#e4e4e7] text-[#374151] text-xs">{cap}</span>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[#9ca3af] text-center mt-2 italic">
        This is how your profile appears to verified buyers on Scinode.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full pb-10 px-2 sm:px-0">

      {/* ══ STICKY HEADER ═══════════════════════════════════════════════════ */}
      <div ref={stickyRef} className="sticky top-0 z-30 pb-3" style={{ background: "#f9fafb" }}>
        <div className="pt-4 pb-3 flex items-start justify-between">
          <div>
            <h1
              className="text-[30px] font-semibold leading-[36px] tracking-[-0.225px] text-[#18181b]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Profile
            </h1>
            <p className="text-[15px] text-[#62748e] mt-0.5 leading-[24px]">
              Build your Independent CRO profile to connect with verified industry buyers and win more projects.
            </p>
          </div>

          {/* View as Customer toggle */}
          <button
            onClick={() => setViewAsCustomer((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-full border text-sm font-medium transition-all flex-shrink-0 mt-1",
              viewAsCustomer
                ? "bg-[#018E7E] border-[#018E7E] text-white"
                : "bg-white border-[#cbd5e1] text-[#62748e] hover:border-[#018E7E]/50 hover:text-[#018E7E]"
            )}
          >
            {viewAsCustomer
              ? <><Pencil className="w-3.5 h-3.5" /> Edit Profile</>
              : <><Eye className="w-3.5 h-3.5" /> View as Customer</>}
          </button>
        </div>

        {/* Tab bar */}
        <div
          className="flex items-center gap-0.5 flex-nowrap rounded-[12px] p-[5px] overflow-x-auto no-scrollbar shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]"
          style={{ background: "#DFF3EE" }}
        >
          {CRO_TABS.map(({ id, label }, idx) => {
            const isActive = activeIndex === idx;
            const isDone   = completions[idx];
            const Icon     = TAB_ICONS[id as CROTabId];
            return (
              <button
                key={id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-[6px] rounded-[6px] text-[13px] font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
                  isActive
                    ? "bg-[#018e7e] text-white shadow-sm"
                    : isDone
                      ? "text-[#018e7e] hover:bg-white/70"
                      : "text-[#334155] hover:bg-white/50",
                )}
              >
                {isDone && !isActive ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#018e7e] flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                ) : (
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ MAIN — 70 / 30 ═══════════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row gap-4 items-start mt-4">

        {/* LEFT: Form card */}
        <div
          className="flex-1 min-w-0 bg-white rounded-[16px] border border-[#E4E4E7]/60 flex flex-col"
          onInput={triggerAutoSave}
        >
          {/* Section header */}
          <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 border-b border-[#F3F4F6]">
            <h2 className="text-[18px] font-semibold text-black leading-[28px]">{activeTab.label}</h2>
            <p className="text-[14px] text-[#62748e] mt-0.5 leading-[22px]">{TAB_SUBTITLES[activeTabId]}</p>
          </div>

          {/* Tab content — customer preview or editable form */}
          {viewAsCustomer ? <CustomerPreview /> : (
            <>
              {activeIndex === 0 && <Tab1CompanyProfile onNext={goNext} />}
              {activeIndex === 1 && <Tab2Products onNext={goNext} onBack={goBack} />}
              {activeIndex === 2 && <Tab3Certifications onNext={goNext} onBack={goBack} />}
              {activeIndex === 3 && <Tab4Services onNext={goNext} onBack={goBack} />}
              {activeIndex === 4 && <Tab5Equipment onNext={goNext} onBack={goBack} />}
              {activeIndex === 5 && <Tab6Facility onNext={goNext} onBack={goBack} />}
              {activeIndex === 6 && <Tab7Utility onNext={goNext} onBack={goBack} />}
              {activeIndex === 7 && <Tab8Terms onBack={goBack} onSubmit={handleSubmit} canSubmit={canSubmit} />}
            </>
          )}

          {activeIndex < 7 && <AutoSaveFooter status={saveStatus} lastSaved={lastSaved} />}
        </div>

        {/* RIGHT: Sticky sidebar */}
        <div className="xl:sticky w-full xl:w-[300px] flex-shrink-0" style={{ top: stickyH, alignSelf: "flex-start" }}>

          {/* Profile Completion card — dashboard design */}
          <ProfileCompletionCard
            pct={pct}
            completions={completions}
            activeIndex={activeIndex}
            onTabClick={setActiveIndex}
          />

          {/* Why Details Matter */}
          <div className="rounded-[12px] p-4 mt-3" style={{ background: "#f0fdf6", border: "1px solid #d1fae5" }}>
            <p className="text-[14px] font-bold text-[#016358] leading-[20px]">
              {WHY_MATTERS[activeTabId].heading}
            </p>
            <p className="text-[12px] text-[#374151] leading-[16px] mt-1">
              {WHY_MATTERS[activeTabId].body}
            </p>
          </div>
        </div>
      </div>

      <CongratsModal open={showCongrats} onClose={() => setShowCongrats(false)} />
    </div>
  );
}
