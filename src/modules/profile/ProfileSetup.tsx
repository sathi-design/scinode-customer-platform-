"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2, Package, Award, FlaskConical, Wrench,
  ShieldCheck, Zap, FileText,
  Check, ArrowRight, Loader2, ChevronDown, Eye, Pencil,
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
const ONBOARDING_TABS = [
  { id: "company",  label: "Company Profile",   Icon: Building2,   step: "COMPANY PROFILE",   subtitle: "Your company overview, manufacturing location, and business details visible to all buyers on the platform." },
  { id: "products", label: "Product Catalogue", Icon: Package,     step: "PRODUCT CATALOGUE", subtitle: "Your product listings with CAS numbers, purity specs, and applications — the primary surface buyers use to discover you." },
  { id: "terms",    label: "Terms & Condition",  Icon: FileText,   step: "TERMS & CONDITION", subtitle: "Accepting platform terms activates your account for buyer engagement — receiving RFQs, messages, and proposals." },
] as const;

const ENRICHMENT_TABS = [
  { id: "licences",   label: "Licenses & Certifications", Icon: Award,        step: "LICENSES",       subtitle: "Upload ISO, GMP, FDA, REACH, or other certifications — displayed as a verified trust signal to buyers." },
  { id: "reactors",   label: "Reactors",                  Icon: FlaskConical, step: "REACTORS",       subtitle: "Detail reactor types, material of construction, capacities, and production output for capability matching." },
  { id: "equipments", label: "Equipments",                Icon: Wrench,       step: "EQUIPMENTS",     subtitle: "List process equipment — distillation columns, dryers, centrifuges — to signal complex execution capability." },
  { id: "ehs",        label: "Facility & EHS",            Icon: ShieldCheck,  step: "FACILITY & EHS", subtitle: "Highlight ETP systems, fire safety, and compliance records required by international buyers." },
  { id: "utilities",  label: "Utilities",                 Icon: Zap,          step: "UTILITIES",      subtitle: "Document chilling plants, boilers, HVAC, and nitrogen lines for scale-up project matching." },
] as const;

const TABS = [...ONBOARDING_TABS, ...ENRICHMENT_TABS];

type TabId      = (typeof TABS)[number]["id"];
type SaveStatus = "idle" | "saving" | "saved";

// ─── Tab context ──────────────────────────────────────────────────────────────
const TAB_CONTEXT: Record<TabId, {
  group: "onboarding" | "enrichment";
  scoreImpact: string;
  buyerRationale: string;
  unlocks: string[];
  fieldsHelp: string;
}> = {
  company: {
    group: "onboarding",
    scoreImpact: "+10%",
    buyerRationale: "Buyers validate manufacturing credibility and geographic sourcing fit as their first step. A complete company profile is often the deciding factor for initial shortlisting.",
    unlocks: ["Basic discoverability by 2,400+ active buyers", "Listed in the manufacturing supplier index", "Eligible for general sourcing enquiries"],
    fieldsHelp: "Company description, address, industries, reaction types, unique capabilities, and plant images.",
  },
  products: {
    group: "onboarding",
    scoreImpact: "+25%",
    buyerRationale: "Buyers search by product first, not by company. Your catalogue is your primary discovery surface — incomplete listings reduce match accuracy and reduce your RFQ volume significantly.",
    unlocks: ["Product-level RFQ matching with active buyer demand", "Enquiry notifications for each listed product", "Catalogue indexed in global buyer search"],
    fieldsHelp: "Product name, CAS number, grade, purity, packaging, and available quantities. Each product adds a new discovery entry point.",
  },
  terms: {
    group: "onboarding",
    scoreImpact: "+35%",
    buyerRationale: "Activated accounts are trusted, verified participants in the sourcing ecosystem. Buyers can only initiate contact with fully activated suppliers.",
    unlocks: ["Live RFQ delivery to your dashboard", "Read and respond to direct buyer messages", "Submit proposals on open manufacturing projects"],
    fieldsHelp: "Review platform participation terms and accept to activate your account for full buyer engagement.",
  },
  licences: {
    group: "enrichment",
    scoreImpact: "+50%",
    buyerRationale: "Global buyers filter suppliers by certification readiness before shortlisting — especially for pharma, food-grade, and export-market projects. Missing certifications means missing these projects entirely.",
    unlocks: ["Access to regulated-industry buyers (pharma, nutraceutical, food-grade)", "Premium filter visibility in certification-required searches", "Eligible for export market sourcing projects", "Verified compliance badge on your profile"],
    fieldsHelp: "ISO, GMP, FDA, REACH, or other audit certificates. Each certification expands your eligible buyer pool and project types.",
  },
  reactors: {
    group: "enrichment",
    scoreImpact: "+65%",
    buyerRationale: "Buyers evaluate reactor compatibility and production scale alignment before shortlisting manufacturing partners — especially for multi-batch CMO and CDMO projects.",
    unlocks: ["Capability-based project matching for CMO/CDMO tenders", "Reactor-specific RFQ routing (glass-lined, SS, HDPE)", "Eligible for high-value multi-batch manufacturing contracts"],
    fieldsHelp: "Reactor types, material of construction, vessel capacities (KL), working volumes, and annual production output.",
  },
  equipments: {
    group: "enrichment",
    scoreImpact: "+78%",
    buyerRationale: "Detailed infrastructure data signals execution capability for complex chemistry. Buyers use this to assess whether a supplier can handle their specific synthesis pathway.",
    unlocks: ["Custom synthesis project matching based on process fit", "Complex multi-step chemistry and specialty RFQs", "Higher proposal conversion on technical project briefs"],
    fieldsHelp: "Distillation columns, dryers, centrifuges, filtration units, spray dryers, and any specialty process systems.",
  },
  ehs: {
    group: "enrichment",
    scoreImpact: "+90%",
    buyerRationale: "International buyers increasingly require EHS compliance as a non-negotiable sourcing criterion, especially for regulated markets in the EU, US, and Japan.",
    unlocks: ["Export-grade project access for EU, US, and regulated markets", "International compliance-required tenders", "ESG-conscious buyer matching in premium sourcing programs"],
    fieldsHelp: "ETP systems, fire safety certifications, solvent recovery, hazardous material handling, and environmental compliance records.",
  },
  utilities: {
    group: "enrichment",
    scoreImpact: "+100%",
    buyerRationale: "Utility infrastructure determines your ability to handle large-scale, continuous production runs. Buyers assess this for scale-up partnerships and volume manufacturing projects.",
    unlocks: ["Large-scale manufacturing contract eligibility", "Scale-up partnership opportunities with global buyers", "Full Discovery Score — maximum platform visibility"],
    fieldsHelp: "Chilling plants, boilers, HVAC, nitrogen lines, compressed air, steam supply, and power reliability (captive power, DG backup).",
  },
};

// ─── Profile Progress: Donut + Collapsible timelines ─────────────────────────
function ProgressTracker({ activeIndex }: { activeIndex: number }) {
  // Completion calculations
  const overallPct     = Math.round((activeIndex / (TABS.length - 1)) * 100);
  const onboardingDone = Math.min(activeIndex, ONBOARDING_TABS.length);
  const onboardingPct  = Math.round((onboardingDone / ONBOARDING_TABS.length) * 100);
  const enrichmentDone = Math.max(0, activeIndex - ONBOARDING_TABS.length);
  const enrichmentPct  = Math.round((enrichmentDone / ENRICHMENT_TABS.length) * 100);

  const [expandOnboarding, setExpandOnboarding] = useState(activeIndex < ONBOARDING_TABS.length);
  const [expandEnrichment, setExpandEnrichment] = useState(activeIndex >= ONBOARDING_TABS.length);

  // Auto-expand the section containing the active step when navigation changes
  useEffect(() => {
    setExpandOnboarding(activeIndex < ONBOARDING_TABS.length);
    setExpandEnrichment(activeIndex >= ONBOARDING_TABS.length);
  }, [activeIndex]);

  // Donut SVG
  const r    = 34;
  const circ = 2 * Math.PI * r;
  const dash = (overallPct / 100) * circ;

  const overallLabel =
    overallPct === 0   ? "Start filling in your profile to get discovered."
    : overallPct < 40  ? "Activate your profile to start receiving RFQs."
    : overallPct < 70  ? "Good progress! Enrich your profile for premium visibility."
    : overallPct < 100 ? "Almost there — unlock your full discovery score."
    : "Full profile complete. Maximum visibility achieved!";

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">

      {/* ── Donut header ──────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
        {/* Donut */}
        <div className="relative shrink-0">
          <svg width="76" height="76" viewBox="0 0 88 88">
            {/* Track */}
            <circle cx="44" cy="44" r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
            {/* Progress */}
            <circle
              cx="44" cy="44" r={r}
              fill="none"
              stroke="#2ACB83"
              strokeWidth="8"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 44 44)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[15px] font-bold leading-none" style={{ color: "#018e7e" }}>
              {overallPct}%
            </span>
            <span className="text-[8px] text-slate-400 mt-0.5">complete</span>
          </div>
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-1">
            Profile Progress
          </p>
          <p className="text-[11px] text-slate-500 leading-snug">{overallLabel}</p>
        </div>
      </div>

      {/* ── Onboarding collapsible ────────────────────── */}
      <div className="border-b border-slate-100">
        <button
          onClick={() => setExpandOnboarding(v => !v)}
          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50/70 transition-colors"
        >
          <span className="text-[9px] font-bold tracking-[0.14em] uppercase shrink-0" style={{ color: "#018e7e" }}>
            Onboarding
          </span>
          {/* Mini bar */}
          <div className="flex-1 h-[4px] bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${onboardingPct}%`, background: "#018e7e" }}
            />
          </div>
          <span className="text-[9px] font-semibold shrink-0" style={{ color: "#018e7e" }}>
            {onboardingPct}%
          </span>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200",
            expandOnboarding && "rotate-180"
          )} />
        </button>

        {expandOnboarding && (
          <div className="px-4 pb-3">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-[9px] bottom-[9px] w-px bg-slate-200" />

              {ONBOARDING_TABS.map((tab, i) => {
                const isDone    = i < activeIndex;
                const isActive  = i === activeIndex;
                const tCtx      = TAB_CONTEXT[tab.id];

                return (
                  <div key={tab.id} className="relative pl-[22px] mb-2.5 last:mb-0">
                    {/* Dot */}
                    <div className={cn(
                      "absolute left-0 top-[3px] w-[11px] h-[11px] rounded-full flex items-center justify-center z-10",
                      isDone   ? "bg-[#018e7e]"
                      : isActive ? "bg-[#018e7e] ring-[3px] ring-[#018e7e]/20"
                      : "bg-white border-2 border-slate-300"
                    )}>
                      {(isDone || isActive) && (
                        <Check className="w-[6px] h-[6px] text-white" strokeWidth={3.5} />
                      )}
                    </div>

                    {/* Label */}
                    <p className={cn(
                      "text-[11.5px] font-medium leading-snug pt-[1px]",
                      isActive ? "text-[#018e7e]"
                      : isDone  ? "text-slate-600"
                      : "text-slate-400"
                    )}>
                      {tab.label}
                    </p>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Enrichment collapsible ────────────────────── */}
      <div>
        <button
          onClick={() => setExpandEnrichment(v => !v)}
          className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50/70 transition-colors"
        >
          <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-amber-600 shrink-0">
            Enrichment
          </span>
          {/* Mini bar */}
          <div className="flex-1 h-[4px] bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${enrichmentPct}%`, background: "#d97706" }}
            />
          </div>
          <span className="text-[9px] font-semibold text-amber-600 shrink-0">
            {enrichmentPct}%
          </span>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200",
            expandEnrichment && "rotate-180"
          )} />
        </button>

        {expandEnrichment && (
          <div className="px-4 pb-3">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-[9px] bottom-[9px] w-px bg-slate-200" />

              {ENRICHMENT_TABS.map((tab, i) => {
                const globalIdx = ONBOARDING_TABS.length + i;
                const isDone    = globalIdx < activeIndex;
                const isActive  = globalIdx === activeIndex;
                const tCtx      = TAB_CONTEXT[tab.id];

                return (
                  <div key={tab.id} className="relative pl-[22px] mb-2.5 last:mb-0">
                    {/* Dot */}
                    <div className={cn(
                      "absolute left-0 top-[3px] w-[11px] h-[11px] rounded-full flex items-center justify-center z-10",
                      isDone   ? "bg-amber-500"
                      : isActive ? "bg-amber-500 ring-[3px] ring-amber-400/25"
                      : "bg-white border-2 border-slate-300"
                    )}>
                      {(isDone || isActive) && (
                        <Check className="w-[6px] h-[6px] text-white" strokeWidth={3.5} />
                      )}
                    </div>

                    {/* Label */}
                    <p className={cn(
                      "text-[11.5px] font-medium leading-snug pt-[1px]",
                      isActive ? "text-amber-700"
                      : isDone  ? "text-slate-600"
                      : "text-slate-400"
                    )}>
                      {tab.label}
                    </p>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Right context panel ──────────────────────────────────────────────────────
function RightPanel({ activeIndex }: { activeIndex: number }) {
  const activeTab = TABS[activeIndex];
  const ctx       = TAB_CONTEXT[activeTab.id];
  const isEnrich  = ctx.group === "enrichment";

  return (
    <div className="flex flex-col gap-3 w-full xl:w-[290px] flex-shrink-0">

      {/* 1 — Profile progress (donut + timelines) */}
      <ProgressTracker activeIndex={activeIndex} />

      {/* 2 — Discovery score boost — shown for ALL tabs */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white">
        <div>
          <p className="text-[22px] font-black leading-none tabular-nums" style={{ color: "#018e7e" }}>
            {ctx.scoreImpact}
          </p>
          <p className="text-[8.5px] text-slate-400 tracking-wide uppercase mt-0.5">Discovery Score</p>
        </div>
        <div className="w-px self-stretch bg-slate-100 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="w-full h-[5px] bg-slate-100 rounded-full overflow-hidden mb-1">
            <div
              className="h-full rounded-full"
              style={{ width: ctx.scoreImpact, background: "linear-gradient(90deg,#2ACB83,#018e7e)", transition: "width 0.8s ease" }}
            />
          </div>
          <p className="text-[9px] text-slate-400 leading-snug">Your profile strength after completing this section</p>
        </div>
      </div>

      {/* 3 — Why buyers need this */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100" style={{ background: "rgba(1,142,126,0.04)" }}>
          <p className="text-[8.5px] font-bold tracking-[0.15em] uppercase" style={{ color: "#018e7e" }}>
            {ctx.group === "onboarding" ? "Why Buyers Value This" : "Why Buyers Need This"}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[12px] text-slate-600 leading-relaxed">{ctx.buyerRationale}</p>
        </div>
      </div>

      {/* 4 — What you'll unlock */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100">
          <p className="text-[8.5px] font-bold tracking-[0.15em] uppercase text-slate-500">
            {ctx.group === "onboarding" ? "What You've Unlocked" : "What You'll Unlock"}
          </p>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          {ctx.unlocks.map((u, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-[1px]"
                style={{
                  background: ctx.group === "onboarding" ? "rgba(1,142,126,0.12)" : "#f8fafc",
                  border: ctx.group === "onboarding" ? "1px solid rgba(1,142,126,0.3)" : "1px solid #e2e8f0",
                }}
              >
                {ctx.group === "onboarding"
                  ? <Check className="w-2 h-2" style={{ color: "#018e7e" }} strokeWidth={3} />
                  : <span className="text-[8px] font-bold text-slate-400">{i + 1}</span>}
              </div>
              <p className="text-[11.5px] text-slate-600 leading-snug flex-1">{u}</p>
            </div>
          ))}
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
  group,
}: {
  status: SaveStatus;
  lastSaved: string;
  onContinue: () => void;
  isLast: boolean;
  group: "onboarding" | "enrichment";
}) {
  const btnLabel = isLast
    ? "Finish Setup"
    : group === "onboarding"
      ? "Continue →"
      : "Save & Continue →";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-[#F3F4F6] bg-white rounded-b-[16px] mt-4">
      <div className="flex flex-col leading-tight">
        {status === "saving" ? (
          <span className="flex items-center gap-1.5 text-[13px] text-[#68747a]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#99a8af]" />
            Changes are getting autosaved
          </span>
        ) : (
          <>
            <span className="text-[13px] text-[#68747a]">Changes are getting autosaved</span>
            {lastSaved && (
              <span className="text-[11px] text-[#99a8af]">Last saved on: {lastSaved}</span>
            )}
          </>
        )}
      </div>
      <button
        onClick={onContinue}
        className="flex items-center gap-2 px-5 py-2 rounded-[8px] text-white text-[14px] font-medium transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ background: "linear-gradient(90deg,#1F6F54,#018e7e)" }}
      >
        {btnLabel}
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

  const [activeIndex,     setActiveIndex]     = useState(initialIndex);
  const [saveStatus,      setSaveStatus]       = useState<SaveStatus>("idle");
  const [lastSaved,       setLastSaved]        = useState("");
  const [stickyH,         setStickyH]          = useState(148);
  const [viewAsCustomer,  setViewAsCustomer]   = useState(false);

  const saveTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stickyRef  = useRef<HTMLDivElement>(null);

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
  const ctx       = TAB_CONTEXT[activeTab.id];

  const formatTime = () => {
    const d    = new Date();
    const hrs  = d.getHours();
    const min  = String(d.getMinutes()).padStart(2, "0");
    const ampm = hrs >= 12 ? "pm" : "am";
    const h12  = hrs % 12 || 12;
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

  const goNext = () => {
    if (!isLast) {
      triggerAutoSave();
      setActiveIndex((i) => i + 1);
      const main = document.querySelector("main");
      if (main) main.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (activeIndex > 0) setActiveIndex((i) => i - 1);
  };

  // Within-group step counters
  const withinGroupStep = ctx.group === "onboarding"
    ? `Step ${activeIndex + 1} of ${ONBOARDING_TABS.length}`
    : `Step ${activeIndex - ONBOARDING_TABS.length + 1} of ${ENRICHMENT_TABS.length}`;

  return (
    <div className="flex flex-col min-h-full pb-10 px-2 sm:px-0 -mt-4 md:-mt-6">

      {/* ══ STICKY HEADER ═══════════════════════════════════════════════════ */}
      {/* top-[-16px] md:top-[-24px] compensates for the layout's p-4/p-6 so the header sticks flush with the nav bar */}
      <div ref={stickyRef} className="sticky top-[-16px] md:top-[-24px] z-30 pb-3 pt-2" style={{ background: "#f9fafb" }}>

        {/* Title row + View as Customer toggle */}
        <div className="pt-0 pb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1
              className="text-[22px] sm:text-[28px] font-semibold leading-[30px] sm:leading-[34px] tracking-[-0.02em] text-[#18181b]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Profile
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#62748e] mt-0.5 leading-[20px] sm:leading-[22px] hidden sm:block">
              Manage your supplier information, technical capabilities, and customer-facing profile visibility.
            </p>
          </div>

          {/* Edit / View toggle */}
          <div className="flex items-center self-start sm:self-auto sm:mt-2 rounded-[8px] overflow-hidden border border-slate-200 shadow-sm shrink-0">
            <button
              onClick={() => setViewAsCustomer(false)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 sm:px-3 py-[7px] text-[12px] font-medium transition-all whitespace-nowrap",
                !viewAsCustomer
                  ? "bg-[#018e7e] text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              <Pencil className="w-3 h-3" />
              <span className="hidden sm:inline">Edit your profile</span>
              <span className="sm:hidden">Edit</span>
            </button>
            <div className="w-px h-5 bg-slate-200 shrink-0" />
            <button
              onClick={() => setViewAsCustomer(true)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 sm:px-3 py-[7px] text-[12px] font-medium transition-all whitespace-nowrap",
                viewAsCustomer
                  ? "bg-[#018e7e] text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">View your profile as a customer</span>
              <span className="sm:hidden">Preview</span>
            </button>
          </div>
        </div>

        {/* ── Two separate group containers — wrapped in one card with shadow ── */}
        <div className="flex flex-col sm:flex-row items-stretch gap-0 rounded-xl border border-slate-200 bg-white w-full"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" }}>

          {/* Onboarding box */}
          <div className={cn(
            "flex flex-col min-w-0 transition-all duration-200 p-3 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none sm:flex-1",
            ctx.group === "onboarding" ? "bg-[#E8FBF2]" : "bg-white"
          )}>
            {/* Box header */}
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#018e7e" }} />
              <span
                className="text-[9px] font-bold tracking-[0.15em] uppercase"
                style={{ color: ctx.group === "onboarding" ? "#018e7e" : "#94a3b8" }}
              >
                Onboarding
              </span>
              <span
                className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={ctx.group === "onboarding"
                  ? { background: "rgba(1,142,126,0.12)", color: "#018e7e" }
                  : { background: "#f1f5f9", color: "#94a3b8" }}
              >
                {ctx.group === "onboarding"
                  ? `Step ${activeIndex + 1} of ${ONBOARDING_TABS.length}`
                  : `${ONBOARDING_TABS.length} steps`}
              </span>
            </div>
            {/* Tabs — horizontally scrollable on small screens */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {ONBOARDING_TABS.map(({ id, label }, localIdx) => {
                const isActive = activeIndex === localIdx;
                const isDone   = localIdx < activeIndex;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveIndex(localIdx)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 sm:px-3 py-[7px] rounded-lg text-[12px] sm:text-[13px] font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                      isActive ? "bg-[#018e7e] text-white"
                      : isDone  ? "bg-white text-[#018e7e] border border-[#018e7e]/30"
                      : ctx.group === "onboarding" ? "bg-white/70 text-[#334155] border border-slate-200" : "text-slate-400 hover:bg-white/60"
                    )}
                  >
                    {isDone && !isActive && (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#018e7e] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider — horizontal on mobile, vertical on sm+ */}
          <div className="h-px w-full bg-slate-200 sm:hidden" />
          <div className="hidden sm:block w-px self-stretch bg-slate-200 shrink-0" />

          {/* Enrichment box */}
          <div className={cn(
            "flex flex-col min-w-0 transition-all duration-200 p-3 rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none sm:flex-1",
            ctx.group === "enrichment" ? "bg-amber-50" : "bg-white"
          )}>
            {/* Box header */}
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className={cn(
                "text-[9px] font-bold tracking-[0.15em] uppercase",
                ctx.group === "enrichment" ? "text-amber-600" : "text-slate-400"
              )}>
                Profile Enrichment
              </span>
              <span className={cn(
                "ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full",
                ctx.group === "enrichment" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
              )}>
                {ctx.group === "enrichment"
                  ? `Step ${activeIndex - ONBOARDING_TABS.length + 1} of ${ENRICHMENT_TABS.length}`
                  : `${ENRICHMENT_TABS.length} steps`}
              </span>
            </div>
            {/* Tabs — horizontally scrollable on small screens */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {ENRICHMENT_TABS.map(({ id, label }, localIdx) => {
                const globalIdx = ONBOARDING_TABS.length + localIdx;
                const isActive  = activeIndex === globalIdx;
                const isDone    = globalIdx < activeIndex;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveIndex(globalIdx)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 sm:px-3 py-[7px] rounded-lg text-[12px] sm:text-[13px] font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                      isActive ? "bg-amber-500 text-white"
                      : isDone  ? "bg-white text-amber-700 border border-amber-300/60"
                      : ctx.group === "enrichment" ? "bg-white/70 text-[#334155] border border-slate-200" : "text-slate-400 hover:bg-white/60"
                    )}
                  >
                    {isDone && !isActive && (
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active section label strip — within-group step counter */}
        <div className="flex items-center flex-wrap gap-1.5 mt-2 px-0.5">
          <span className={cn(
            "text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full",
            ctx.group === "onboarding" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          )}>
            {ctx.group === "onboarding" ? "Onboarding" : "Profile Enrichment"}
          </span>
          <span className="text-[9px] text-slate-400">·</span>
          <span className="text-[9px] font-semibold text-slate-500">{ctx.scoreImpact} Discovery Score</span>
          <span className="text-[9px] text-slate-400">·</span>
          <span className="text-[9px] text-slate-400">{withinGroupStep}</span>
        </div>
      </div>

      {/* ══ MAIN CONTENT — 70/30 split ══════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row gap-4 items-start mt-3">

        {/* LEFT: Form card */}
        <div
          className="flex-1 min-w-0 bg-white rounded-[16px] border border-[#E4E4E7]/60 flex flex-col"
          onInput={triggerAutoSave}
        >
          {/* Card header */}
          <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 border-b border-[#F3F4F6]">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                ctx.group === "onboarding"
                  ? "bg-green-50 border border-green-200"
                  : "bg-amber-50 border border-amber-200"
              )}>
                <activeTab.Icon className={cn("w-4 h-4", ctx.group === "onboarding" ? "text-[#018e7e]" : "text-amber-600")} />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-black leading-[26px]">
                  {activeTab.label}
                </h2>
                <p className="text-[13px] text-[#62748e] mt-0.5 leading-[20px]">
                  {activeTab.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div>
            {activeTab.id === "company"    && <CompanyProfile    onNext={goNext} isFirst viewAsCustomer={viewAsCustomer} />}
            {activeTab.id === "products"   && <Products          onNext={goNext} onBack={goBack} />}
            {activeTab.id === "terms"      && <TermsCondition    onNext={goNext} onBack={goBack} isLast={false} />}
            {activeTab.id === "licences"   && <LicencesCertifications onNext={goNext} onBack={goBack} />}
            {activeTab.id === "reactors"   && <Reactors          onNext={goNext} onBack={goBack} />}
            {activeTab.id === "equipments" && <Equipments        onNext={goNext} onBack={goBack} />}
            {activeTab.id === "ehs"        && <EHSFacility       onNext={goNext} onBack={goBack} />}
            {activeTab.id === "utilities"  && <Utilities         onNext={goNext} onBack={goBack} />}
          </div>

          {/* Footer */}
          <AutoSaveFooter
            status={saveStatus}
            lastSaved={lastSaved}
            onContinue={goNext}
            isLast={isLast}
            group={ctx.group}
          />
        </div>

        {/* RIGHT: Sticky context panel */}
        <div className="xl:sticky w-full xl:w-auto" style={{ top: stickyH, alignSelf: "flex-start" }}>
          <RightPanel activeIndex={activeIndex} />
        </div>
      </div>
    </div>
  );
}
