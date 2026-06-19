"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2, Package, Award, FlaskConical, Wrench,
  ShieldCheck, Zap, FileText,
  Check, ArrowRight, Loader2, ChevronDown, Eye, Pencil,
  TrendingUp, Unlock, Info,
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
  { id: "company",  label: "Company Profile",   Icon: Building2, subtitle: "Your company overview, manufacturing location, and business details visible to all buyers on the platform." },
  { id: "products", label: "Product Catalogue", Icon: Package,   subtitle: "Your product listings with CAS numbers, purity specs, and applications — the primary surface buyers use to discover you." },
  { id: "terms",    label: "Terms & Activation",Icon: FileText,  subtitle: "Accepting platform terms activates your account for buyer engagement — receiving RFQs, messages, and proposals." },
] as const;

const ENRICHMENT_TABS = [
  { id: "licences",   label: "Licences & Certifications",  Icon: Award,        subtitle: "Upload ISO, GMP, FDA, REACH, or other certifications — displayed as a verified trust signal to buyers." },
  { id: "reactors",   label: "Reactors & Capacities",      Icon: FlaskConical, subtitle: "Detail reactor types, material of construction, capacities, and production output for capability matching." },
  { id: "equipments", label: "Equipment & Infrastructure", Icon: Wrench,       subtitle: "List process equipment — distillation columns, dryers, centrifuges — to signal complex execution capability." },
  { id: "ehs",        label: "EHS Facility Details",       Icon: ShieldCheck,  subtitle: "Highlight ETP systems, fire safety, and compliance records required by international buyers." },
  { id: "utilities",  label: "Utilities",                  Icon: Zap,          subtitle: "Document chilling plants, boilers, HVAC, and nitrogen lines for scale-up project matching." },
] as const;

const TABS = [...ONBOARDING_TABS, ...ENRICHMENT_TABS];
type TabId      = (typeof TABS)[number]["id"];
type SaveStatus = "idle" | "saving" | "saved";

// ─── Context per tab ──────────────────────────────────────────────────────────
const TAB_CONTEXT: Record<TabId, {
  group: "onboarding" | "enrichment";
  scoreImpact: string;
  whatYouHave: string;
  whyItMatters: string;
  whatYouAchieve: string[];
}> = {
  company: {
    group: "onboarding",
    scoreImpact: "+10%",
    whatYouHave: "Company name, location, description, industry focus, and plant imagery.",
    whyItMatters: "Buyers validate manufacturing credibility and geographic sourcing fit as their first step. A complete company profile is often the deciding factor for initial shortlisting.",
    whatYouAchieve: ["Basic discoverability by 2,400+ active buyers", "Listed in the manufacturing supplier index", "Eligible for general sourcing enquiries"],
  },
  products: {
    group: "onboarding",
    scoreImpact: "+25%",
    whatYouHave: "Product name, CAS number, grade, purity, packaging, and available quantities.",
    whyItMatters: "Buyers search by product first. Your catalogue is your primary discovery surface — incomplete listings reduce match accuracy and RFQ volume significantly.",
    whatYouAchieve: ["Product-level RFQ matching with active buyer demand", "Enquiry notifications for each listed product", "Catalogue indexed in global buyer search"],
  },
  terms: {
    group: "onboarding",
    scoreImpact: "+35%",
    whatYouHave: "Platform participation terms — review and accept to activate your account.",
    whyItMatters: "Activated accounts are trusted, verified participants in the sourcing ecosystem. Buyers can only initiate contact with fully activated suppliers.",
    whatYouAchieve: ["Live RFQ delivery to your dashboard", "Read and respond to direct buyer messages", "Submit proposals on open manufacturing projects"],
  },
  licences: {
    group: "enrichment",
    scoreImpact: "+50%",
    whatYouHave: "ISO, GMP, FDA, REACH, or other audit certificates with expiry and verification.",
    whyItMatters: "Global buyers filter suppliers by certification readiness before shortlisting — especially for pharma, food-grade, and export projects. Missing certifications means missing these projects entirely.",
    whatYouAchieve: ["Access to regulated-industry buyers (pharma, nutraceutical, food-grade)", "Premium filter visibility in certification-required searches", "Verified compliance badge on your profile"],
  },
  reactors: {
    group: "enrichment",
    scoreImpact: "+65%",
    whatYouHave: "Reactor types, material of construction, vessel capacities (KL), working volumes, annual output.",
    whyItMatters: "Buyers evaluate reactor compatibility and production scale alignment before shortlisting manufacturing partners — especially for CMO and CDMO projects.",
    whatYouAchieve: ["Capability-based project matching for CMO/CDMO tenders", "Reactor-specific RFQ routing (glass-lined, SS, HDPE)", "Eligible for high-value multi-batch manufacturing contracts"],
  },
  equipments: {
    group: "enrichment",
    scoreImpact: "+78%",
    whatYouHave: "Distillation columns, dryers, centrifuges, filtration units, spray dryers, and specialty systems.",
    whyItMatters: "Detailed infrastructure data signals execution capability for complex chemistry. Buyers use this to assess whether you can handle their specific synthesis pathway.",
    whatYouAchieve: ["Custom synthesis project matching based on process fit", "Complex multi-step chemistry and specialty RFQs", "Higher proposal conversion on technical project briefs"],
  },
  ehs: {
    group: "enrichment",
    scoreImpact: "+90%",
    whatYouHave: "ETP systems, fire safety certifications, solvent recovery, hazardous material handling records.",
    whyItMatters: "International buyers increasingly require EHS compliance as a non-negotiable sourcing criterion, especially for regulated markets in the EU, US, and Japan.",
    whatYouAchieve: ["Export-grade project access for EU, US, and regulated markets", "International compliance-required tenders", "ESG-conscious buyer matching in premium sourcing programs"],
  },
  utilities: {
    group: "enrichment",
    scoreImpact: "+100%",
    whatYouHave: "Chilling plants, boilers, HVAC, nitrogen lines, compressed air, steam supply, and power reliability.",
    whyItMatters: "Utility infrastructure determines your ability to handle large-scale, continuous production runs. Buyers assess this for scale-up partnerships and volume manufacturing projects.",
    whatYouAchieve: ["Large-scale manufacturing contract eligibility", "Scale-up partnership opportunities with global buyers", "Full Discovery Score — maximum platform visibility"],
  },
};

// ─── Left sidebar ─────────────────────────────────────────────────────────────
function LeftSidebar({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const ctx = TAB_CONTEXT[TABS[activeIndex].id];

  const onboardingDone = Math.min(activeIndex, ONBOARDING_TABS.length);
  const enrichmentDone = Math.max(0, activeIndex - ONBOARDING_TABS.length);
  const onboardingPct  = Math.round((onboardingDone / ONBOARDING_TABS.length) * 100);
  const enrichmentPct  = Math.round((enrichmentDone / ENRICHMENT_TABS.length) * 100);
  const overallPct     = Math.round((activeIndex / (TABS.length - 1)) * 100);

  const [expandOnboarding, setExpandOnboarding] = useState(true);
  const [expandEnrichment, setExpandEnrichment] = useState(true);

  // Donut
  const r    = 22;
  const circ = 2 * Math.PI * r;
  const dash = (overallPct / 100) * circ;

  return (
    <div className="flex flex-col gap-2.5 w-full">

      {/* ── Discovery Score ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 px-3.5 py-3 flex items-center gap-3">
        {/* Mini donut */}
        <div className="relative shrink-0 w-12 h-12">
          <svg width="48" height="48" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
            <circle
              cx="28" cy="28" r={r}
              fill="none" stroke="#2ACB83" strokeWidth="6"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-black" style={{ color: "#018e7e" }}>{overallPct}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-0.5">Discovery Score</p>
          <div className="w-full h-[4px] bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${overallPct}%`, background: "linear-gradient(90deg,#2ACB83,#018e7e)" }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-tight">
            {overallPct === 0 ? "Fill your profile to get discovered" : `${ctx.scoreImpact} after this section`}
          </p>
        </div>
      </div>

      {/* ── Onboarding collapsible ────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setExpandOnboarding(v => !v)}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-slate-50/60 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#018e7e" }} />
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase flex-1 text-left" style={{ color: "#018e7e" }}>
            Onboarding
          </span>
          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(1,142,126,0.1)", color: "#018e7e" }}>
            {onboardingDone} / {ONBOARDING_TABS.length}
          </span>
          {/* Mini bar */}
          <div className="w-12 h-[3px] bg-slate-100 rounded-full overflow-hidden shrink-0">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${onboardingPct}%`, background: "#018e7e" }} />
          </div>
          <ChevronDown className={cn("w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200", expandOnboarding && "rotate-180")} />
        </button>

        {expandOnboarding && (
          <div className="border-t border-slate-100 px-3 pb-2.5 pt-1.5 flex flex-col gap-0.5">
            {ONBOARDING_TABS.map(({ id, label, Icon }, i) => {
              const isDone   = i < activeIndex;
              const isActive = i === activeIndex;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(i)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all text-left",
                    isActive ? "bg-[#018e7e] text-white"
                    : isDone  ? "text-[#018e7e] hover:bg-green-50"
                    : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                    isActive ? "bg-white/20" : isDone ? "bg-green-100" : "bg-slate-100"
                  )}>
                    {isDone
                      ? <Check className="w-2.5 h-2.5 text-[#018e7e]" strokeWidth={3} />
                      : <Icon className={cn("w-2.5 h-2.5", isActive ? "text-white" : "text-slate-400")} />
                    }
                  </span>
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && <ChevronDown className="w-3 h-3 rotate-[-90deg] opacity-60 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Enrichment collapsible ────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setExpandEnrichment(v => !v)}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-slate-50/60 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase flex-1 text-amber-600 text-left">
            Profile Enrichment
          </span>
          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
            {enrichmentDone} / {ENRICHMENT_TABS.length}
          </span>
          <div className="w-12 h-[3px] bg-slate-100 rounded-full overflow-hidden shrink-0">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${enrichmentPct}%`, background: "#d97706" }} />
          </div>
          <ChevronDown className={cn("w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200", expandEnrichment && "rotate-180")} />
        </button>

        {expandEnrichment && (
          <div className="border-t border-slate-100 px-3 pb-2.5 pt-1.5 flex flex-col gap-0.5">
            {ENRICHMENT_TABS.map(({ id, label, Icon }, i) => {
              const globalIdx = ONBOARDING_TABS.length + i;
              const isDone    = globalIdx < activeIndex;
              const isActive  = globalIdx === activeIndex;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(globalIdx)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all text-left",
                    isActive ? "bg-amber-500 text-white"
                    : isDone  ? "text-amber-700 hover:bg-amber-50"
                    : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                    isActive ? "bg-white/20" : isDone ? "bg-amber-100" : "bg-slate-100"
                  )}>
                    {isDone
                      ? <Check className="w-2.5 h-2.5 text-amber-600" strokeWidth={3} />
                      : <Icon className={cn("w-2.5 h-2.5", isActive ? "text-white" : "text-slate-400")} />
                    }
                  </span>
                  <span className="flex-1 truncate">{label}</span>
                  {isActive && <ChevronDown className="w-3 h-3 rotate-[-90deg] opacity-60 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section context ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Score impact */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(1,142,126,0.08)" }}>
            <TrendingUp className="w-3.5 h-3.5" style={{ color: "#018e7e" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-semibold">Score impact</p>
            <p className="text-[13px] font-black leading-tight" style={{ color: "#018e7e" }}>{ctx.scoreImpact} Discovery Score</p>
          </div>
        </div>

        {/* What you have */}
        <div className="px-3.5 py-2.5 border-b border-slate-100">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5 flex items-center gap-1">
            <Info className="w-3 h-3" /> What you fill in
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed">{ctx.whatYouHave}</p>
        </div>

        {/* Why it matters */}
        <div className="px-3.5 py-2.5 border-b border-slate-100" style={{ background: "rgba(1,142,126,0.02)" }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: "#018e7e" }}>
            Why this matters
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">{ctx.whyItMatters}</p>
        </div>

        {/* What you achieve */}
        <div className="px-3.5 py-2.5">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5 flex items-center gap-1">
            <Unlock className="w-3 h-3" /> What you unlock
          </p>
          <div className="flex flex-col gap-1.5">
            {ctx.whatYouAchieve.map((u, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-[1px]"
                  style={{ background: "rgba(1,142,126,0.1)", border: "1px solid rgba(1,142,126,0.25)" }}>
                  <Check className="w-2 h-2" style={{ color: "#018e7e" }} strokeWidth={3} />
                </div>
                <p className="text-[11px] text-slate-600 leading-snug flex-1">{u}</p>
              </div>
            ))}
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
  group,
}: {
  status: SaveStatus;
  lastSaved: string;
  onContinue: () => void;
  isLast: boolean;
  group: "onboarding" | "enrichment";
}) {
  const btnLabel = isLast ? "Finish Setup" : group === "onboarding" ? "Continue →" : "Save & Continue →";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-white rounded-b-xl">
      <div className="flex flex-col leading-tight">
        {status === "saving" ? (
          <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
            <Loader2 className="w-3 h-3 animate-spin text-slate-400" /> Autosaving…
          </span>
        ) : (
          <>
            <span className="text-[12px] text-slate-500">Changes are autosaved</span>
            {lastSaved && <span className="text-[10.5px] text-slate-400">Last saved: {lastSaved}</span>}
          </>
        )}
      </div>
      <button
        onClick={onContinue}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-medium transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ background: "linear-gradient(90deg,#1F6F54,#018e7e)" }}
      >
        {btnLabel} <ArrowRight className="w-3.5 h-3.5" />
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

  const [activeIndex,    setActiveIndex]    = useState(initialIndex);
  const [saveStatus,     setSaveStatus]     = useState<SaveStatus>("idle");
  const [lastSaved,      setLastSaved]      = useState("");
  const [viewAsCustomer, setViewAsCustomer] = useState(false);

  const saveTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const activeTab = TABS[activeIndex];
  const isLast    = activeIndex === TABS.length - 1;
  const ctx       = TAB_CONTEXT[activeTab.id];

  const formatTime = () => {
    const d    = new Date();
    const hrs  = d.getHours();
    const min  = String(d.getMinutes()).padStart(2, "0");
    const ampm = hrs >= 12 ? "pm" : "am";
    return `${hrs % 12 || 12}:${min}${ampm}`;
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

  return (
    <div className="flex flex-col min-h-full pb-10 -mt-4 md:-mt-6">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-[-16px] md:top-[-24px] z-30 pt-2 pb-3" style={{ background: "#f9fafb" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-slate-900 leading-tight tracking-tight">Profile</h1>
            <p className="text-[12.5px] text-slate-500 mt-0.5 hidden sm:block">
              Manage your supplier information, technical capabilities, and customer-facing profile visibility.
            </p>
          </div>

          {/* Edit / View toggle */}
          <div className="flex items-center rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0 mt-1">
            <button
              onClick={() => setViewAsCustomer(false)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-all whitespace-nowrap",
                !viewAsCustomer ? "bg-[#1F6F54] text-white hover:bg-[#185e46]" : "bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              <Pencil className="w-3 h-3" /> Edit your profile
            </button>
            <div className="w-px h-5 bg-slate-200 shrink-0" />
            <button
              onClick={() => setViewAsCustomer(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-all whitespace-nowrap",
                viewAsCustomer ? "bg-[#018e7e] text-white" : "bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              <Eye className="w-3 h-3" /> View as customer
            </button>
          </div>
        </div>
      </div>

      {/* ── 30 / 70 layout ───────────────────────────────────────────────────── */}
      <div className="flex gap-4 items-start mt-1">

        {/* LEFT 20% — sticky sidebar */}
        <div className="hidden xl:block w-[20%] flex-shrink-0 sticky top-16" style={{ alignSelf: "flex-start" }}>
          <LeftSidebar activeIndex={activeIndex} onSelect={setActiveIndex} />
        </div>

        {/* RIGHT 70% — form content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Mobile tab strip (visible below xl) */}
          <div className="xl:hidden flex items-center gap-1.5 flex-wrap">
            {TABS.map(({ id, label }, i) => {
              const isActive = i === activeIndex;
              const isDone   = i < activeIndex;
              const isEnrich = i >= ONBOARDING_TABS.length;
              return (
                <button
                  key={id}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border",
                    isActive
                      ? isEnrich ? "bg-amber-500 text-white border-amber-500" : "bg-[#018e7e] text-white border-[#018e7e]"
                      : isDone
                      ? isEnrich ? "text-amber-700 border-amber-200 bg-amber-50" : "text-[#018e7e] border-green-200 bg-green-50"
                      : "text-slate-500 border-slate-200 bg-white"
                  )}
                >
                  {isDone && !isActive && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Form card */}
          <div
            className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden"
            onInput={triggerAutoSave}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                ctx.group === "onboarding" ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
              )}>
                <activeTab.Icon className={cn("w-4 h-4", ctx.group === "onboarding" ? "text-[#018e7e]" : "text-amber-600")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-slate-900 leading-tight">{activeTab.label}</h2>
                  <span className={cn(
                    "text-[9.5px] font-bold px-1.5 py-0.5 rounded-full",
                    ctx.group === "onboarding"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  )}>
                    {ctx.scoreImpact}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">{activeTab.subtitle}</p>
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

          {/* Mobile context section */}
          <div className="xl:hidden bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-slate-100">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" style={{ color: "#018e7e" }} />
              <p className="text-[11px] font-bold" style={{ color: "#018e7e" }}>{ctx.scoreImpact} Discovery Score after this section</p>
            </div>
            <div className="px-3.5 py-2.5">
              <p className="text-[11px] text-slate-500 leading-relaxed">{ctx.whyItMatters}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
