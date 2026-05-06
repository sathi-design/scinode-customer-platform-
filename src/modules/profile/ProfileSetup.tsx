"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2, Package, Award, FlaskConical, Wrench,
  ShieldCheck, Zap, FileText, CircleChevronDown,
  Check, ArrowRight, Loader2,
} from "lucide-react";

import { CompanyProfile }         from "./tabs/CompanyProfile";
import { Products }               from "./tabs/Products";
import { LicencesCertifications } from "./tabs/LicencesCertifications";
import { Reactors }               from "./tabs/Reactors";
import { Equipments }             from "./tabs/Equipments";
import { EHSFacility }            from "./tabs/EHSFacility";
import { Utilities }              from "./tabs/Utilities";
import { TermsCondition }         from "./tabs/TermsCondition";

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: "company",    label: "Company Profile",          Icon: Building2,   step: "COMPANY PROFILE",    subtitle: "A complete profile builds trust and helps buyers understand who you are at a glance." },
  { id: "products",   label: "Products",                 Icon: Package,     step: "PRODUCTS",           subtitle: "Adding your products boosts visibility and helps you attract more relevant leads." },
  { id: "licences",   label: "Licenses & Certifications",Icon: Award,       step: "LICENSES",           subtitle: "Showcasing your credentials builds credibility and reassures potential buyers." },
  { id: "reactors",   label: "Reactors",                 Icon: FlaskConical,step: "REACTORS",           subtitle: "Accurate reactor data helps match you to projects with specific manufacturing needs." },
  { id: "equipments", label: "Equipments",               Icon: Wrench,      step: "EQUIPMENTS",         subtitle: "Listing your equipment capability increases your eligibility for complex projects." },
  { id: "ehs",        label: "Facility & EHS",           Icon: ShieldCheck, step: "FACILITY & EHS",     subtitle: "EHS standards and facility details demonstrate your commitment to safe operations." },
  { id: "utilities",  label: "Utilities",                Icon: Zap,         step: "UTILITIES",          subtitle: "Utility availability determines feasibility of large-scale or sensitive processes." },
  { id: "terms",      label: "Terms & Condition",        Icon: FileText,    step: "TERMS & CONDITION",  subtitle: "Please read and accept the platform terms before submitting your profile." },
] as const;

type TabId      = (typeof TABS)[number]["id"];
type SaveStatus = "idle" | "saving" | "saved";

// ─── Donut / radial progress chart ────────────────────────────────────────────
function DonutChart({ pct }: { pct: number }) {
  const r  = 46;
  const cx = 66;
  const cy = 66;
  const circumference = 2 * Math.PI * r;
  const filled        = (pct / 100) * circumference;
  const gap           = circumference - filled;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 132, height: 132 }}>
      <svg width="132" height="132" className="-rotate-90">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e4e4e7" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#018e7e" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[22px] font-bold text-[#09090b] leading-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
          {Math.round(pct * 8)}
        </span>
        <span className="text-[10px] text-[#71717a] leading-[14px]">Profile<br />Completed</span>
      </div>
    </div>
  );
}

// ─── Vertical step tracker (right sidebar) ────────────────────────────────────
function VerticalStepTracker({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex flex-col">
      {TABS.map((tab, idx) => {
        const isActive = idx === activeIndex;
        const isDone   = idx < activeIndex;
        return (
          <div key={tab.id} className="flex items-start gap-3">
            {/* Dot + connector */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isDone  ? "border-[#10b981] bg-white"
                  : isActive ? "border-[#1abc9c] bg-white shadow-[0_0_0_3px_rgba(26,188,156,0.15)]"
                  : "border-[#b3b7bd] bg-white",
                )}
              >
                {isDone ? (
                  <Check className="w-3 h-3 text-[#10b981]" strokeWidth={2.5} />
                ) : (
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isActive ? "bg-[#1abc9c] opacity-70" : "bg-[#b3b7bd]",
                  )} />
                )}
              </div>
              {/* Vertical line */}
              {idx < TABS.length - 1 && (
                <div className={cn(
                  "w-[2px] h-5 mt-0.5 transition-colors duration-500",
                  isDone ? "bg-[#10b981]" : "bg-[#d1d5db]",
                )} />
              )}
            </div>
            {/* Label */}
            <span
              className={cn(
                "text-[11px] font-semibold tracking-wide mt-[3px] leading-tight",
                isActive ? "text-[#1abc9c]" : isDone ? "text-[#10b981]" : "text-[#9ca3af]",
              )}
            >
              {tab.step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Right sidebar card ───────────────────────────────────────────────────────
function RightSidebar({ activeIndex }: { activeIndex: number }) {
  const pct = Math.round((activeIndex / TABS.length) * 100);

  return (
    <div className="flex flex-col gap-3 w-full xl:w-[300px] flex-shrink-0">
      {/* Profile completion card */}
      <div className="bg-white rounded-[12px] p-5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
        {/* Donut chart */}
        <div className="flex justify-center mb-4">
          <DonutChart pct={pct} />
        </div>

        {/* Title + description */}
        <div className="mb-4">
          <p className="text-[16px] font-semibold text-black leading-[24px] mb-1">
            Complete your profile to get started!
          </p>
          <p className="text-[13px] text-[#62748e] leading-[20px]">
            Unlock access to global R&amp;D projects, connect with top CROs, and showcase your
            organisation&rsquo;s expertise by completing your company profile.
          </p>
        </div>

        {/* Vertical step tracker */}
        <VerticalStepTracker activeIndex={activeIndex} />
      </div>

      {/* Why details matter */}
      <div
        className="rounded-[12px] p-4"
        style={{ background: "#f0fdf6", border: "1px solid #d1fae5" }}
      >
        <div className="flex items-start gap-2">
          <CircleChevronDown className="w-5 h-5 flex-shrink-0 text-[#016358] mt-0.5" />
          <div>
            <p className="text-[14px] font-bold text-[#016358] leading-[20px]">
              Why details matter?
            </p>
            <p className="text-[12px] text-[#374151] leading-[16px] mt-0.5">
              Accurate info ensures compliant invoicing and faster vendor matching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Auto-save footer ─────────────────────────────────────────────────────────
function AutoSaveFooter({
  status,
  lastSaved,
  onContinue,
  isLast,
}: {
  status: SaveStatus;
  lastSaved: string;
  onContinue: () => void;
  isLast: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-[#F3F4F6] bg-white rounded-b-[16px] mt-4">
      {/* Auto-save status */}
      <div className="flex flex-col leading-tight">
        {status === "saving" ? (
          <span className="flex items-center gap-1.5 text-[13px] text-[#68747a]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#99a8af]" />
            Changes are getting autosaved
          </span>
        ) : status === "saved" ? (
          <>
            <span className="text-[13px] text-[#68747a]">Changes are getting autosaved</span>
            <span className="text-[11px] text-[#99a8af]">Last saved on: {lastSaved}</span>
          </>
        ) : (
          <>
            <span className="text-[13px] text-[#68747a]">Changes are getting autosaved</span>
            {lastSaved && (
              <span className="text-[11px] text-[#99a8af]">Last saved on: {lastSaved}</span>
            )}
          </>
        )}
      </div>

      {/* Continue / Submit button */}
      <button
        onClick={onContinue}
        className="flex items-center gap-2 px-5 py-2 rounded-[6px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[14px] font-medium transition-colors"
      >
        {isLast ? "Submit Profile" : "Continue"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProfileSetup() {
  const searchParams = useSearchParams();
  const initialIndex = useMemo(() => {
    const tab = searchParams.get("tab");
    if (!tab) return 0;
    const idx = TABS.findIndex((t) => t.id === tab);
    return idx >= 0 ? idx : 0;
  }, [searchParams]);
  const [activeIndex, setActiveIndex]   = useState(initialIndex);
  const [saveStatus, setSaveStatus]     = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved]       = useState("");
  const [stickyH, setStickyH]           = useState(148);
  const saveTimer                       = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clearTimer                      = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stickyRef                       = useRef<HTMLDivElement>(null);

  // Measure sticky header height so right sidebar aligns below it
  useEffect(() => {
    const measure = () => {
      if (stickyRef.current) setStickyH(stickyRef.current.offsetHeight + 16);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stickyRef.current) ro.observe(stickyRef.current);
    return () => ro.disconnect();
  }, []);

  const activeTab = TABS[activeIndex];
  const isLast    = activeIndex === TABS.length - 1;

  // Format current time as HH:MMam/pm
  const formatTime = () => {
    const d   = new Date();
    const hrs = d.getHours();
    const min = String(d.getMinutes()).padStart(2, "0");
    const ampm = hrs >= 12 ? "pm" : "am";
    const h12  = hrs % 12 || 12;
    return `${h12}:${min}${ampm}`;
  };

  // Debounced auto-save — fires on any input bubble from the form card
  const triggerAutoSave = useCallback(() => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    clearTimeout(clearTimer.current);
    saveTimer.current = setTimeout(() => {
      const t = formatTime();
      setLastSaved(t);
      setSaveStatus("saved");
      clearTimer.current = setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1200);
  }, []);

  const goNext = () => {
    if (!isLast) {
      triggerAutoSave();
      setActiveIndex((i) => i + 1);
      // Scroll to top of the main scroll container
      const main = document.querySelector("main");
      if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (activeIndex > 0) setActiveIndex((i) => i - 1);
  };

  return (
    // Page wrapper — normal flow, no fixed height
    <div className="flex flex-col min-h-full pb-10 px-2 sm:px-0">

      {/* ══ STICKY TOP BLOCK — title + subtitle + tabs ══════════════════════ */}
      <div
        ref={stickyRef}
        className="sticky top-0 z-30 pb-3"
        style={{ background: "#f9fafb" }}
      >
        {/* Shadow separator while sticky */}
        <div className="pt-4 pb-3">
          <h1
            className="text-[30px] font-semibold leading-[36px] tracking-[-0.225px] text-[#18181b]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Profile
          </h1>
          <p className="text-[15px] text-[#62748e] mt-0.5 leading-[24px]">
            Manage your supplier information, technical capabilities, and customer-facing profile visibility.
          </p>
        </div>

        {/* Tab bar */}
        <div
          className="flex items-center gap-0.5 flex-nowrap rounded-[12px] p-[5px] overflow-x-auto no-scrollbar shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]"
          style={{ background: "#DFF3EE" }}
        >
          {TABS.map(({ id, label }, idx) => {
            const isActive = activeIndex === idx;
            const isDone   = idx < activeIndex;
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
                {isDone && !isActive && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#018e7e] flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ MAIN CONTENT — 70 / 30 split ════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row gap-4 items-start mt-4">

        {/* LEFT: Form card (flex-1) */}
        <div
          className="flex-1 min-w-0 bg-white rounded-[16px] border border-[#E4E4E7]/60 flex flex-col"
          onInput={triggerAutoSave}
        >
          {/* Card section header */}
          <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 border-b border-[#F3F4F6]">
            <h2 className="text-[18px] font-semibold text-black leading-[28px]">
              {activeTab.label}
            </h2>
            <p className="text-[14px] text-[#62748e] mt-0.5 leading-[22px]">
              {activeTab.subtitle}
            </p>
          </div>

          {/* Tab content — free flow, no height constraint */}
          <div>
            {activeTab.id === "company"    && <CompanyProfile    onNext={goNext} isFirst />}
            {activeTab.id === "products"   && <Products          onNext={goNext} onBack={goBack} />}
            {activeTab.id === "licences"   && <LicencesCertifications onNext={goNext} onBack={goBack} />}
            {activeTab.id === "reactors"   && <Reactors          onNext={goNext} onBack={goBack} />}
            {activeTab.id === "equipments" && <Equipments        onNext={goNext} onBack={goBack} />}
            {activeTab.id === "ehs"        && <EHSFacility       onNext={goNext} onBack={goBack} />}
            {activeTab.id === "utilities"  && <Utilities         onNext={goNext} onBack={goBack} />}
            {activeTab.id === "terms"      && <TermsCondition    onNext={goNext} onBack={goBack} isLast />}
          </div>

          {/* Auto-save footer + Continue */}
          <AutoSaveFooter
            status={saveStatus}
            lastSaved={lastSaved}
            onContinue={goNext}
            isLast={isLast}
          />
        </div>

        {/* RIGHT: Sticky sidebar — top aligns exactly below sticky header */}
        <div className="xl:sticky w-full xl:w-auto" style={{ top: stickyH, alignSelf: "flex-start" }}>
          <RightSidebar activeIndex={activeIndex} />
        </div>
      </div>
    </div>
  );
}
