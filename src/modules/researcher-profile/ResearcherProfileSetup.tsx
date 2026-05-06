"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  UserCircle2,
  Cpu,
  TrendingUp,
  ShieldCheck,
  CircleChevronDown,
  Check,
  ArrowRight,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useResearcherProfileStore } from "@/store/useResearcherProfileStore";
import { getStepCompletions, getProfileProgress } from "./types";

import { Step1Profile }    from "./steps/Step1Profile";
import { Step2Capabilities } from "./steps/Step2Capabilities";
import { Step3TrackRecord }  from "./steps/Step3TrackRecord";
import { Step4Compliance }   from "./steps/Step4Compliance";
import { RESEARCHER_TABS }   from "./constants";

// ─── Types ────────────────────────────────────────────────────────────────────
type SaveStatus = "idle" | "saving" | "saved";

// ─── Tab icons ────────────────────────────────────────────────────────────────
const TAB_ICONS = [UserCircle2, Cpu, TrendingUp, ShieldCheck] as const;

// ─── Donut chart ─────────────────────────────────────────────────────────────
function DonutChart({ pct }: { pct: number }) {
  const r             = 46;
  const cx            = 66;
  const cy            = 66;
  const circumference = 2 * Math.PI * r;
  const filled        = (pct / 100) * circumference;
  const gap           = circumference - filled;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 132, height: 132 }}>
      <svg width="132" height="132" className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e4e4e7" strokeWidth="10" />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke="#018e7e" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span
          className="text-[22px] font-bold text-[#09090b] leading-tight"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {Math.round(pct)}%
        </span>
        <span className="text-[10px] text-[#71717a] leading-[14px]">Profile<br />Complete</span>
      </div>
    </div>
  );
}

// ─── Vertical step tracker ───────────────────────────────────────────────────
function VerticalStepTracker({
  activeIndex,
  completions,
}: {
  activeIndex: number;
  completions: boolean[];
}) {
  return (
    <div className="flex flex-col">
      {RESEARCHER_TABS.map((tab, idx) => {
        const isActive = idx === activeIndex;
        const isDone   = completions[idx];
        const hasError = idx < activeIndex && !isDone; // visited but incomplete
        return (
          <div key={tab.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isDone    ? "border-[#10b981] bg-white"
                  : hasError ? "border-amber-400 bg-amber-50"
                  : isActive ? "border-[#1abc9c] bg-white shadow-[0_0_0_3px_rgba(26,188,156,0.15)]"
                  : "border-[#b3b7bd] bg-white",
                )}
              >
                {isDone ? (
                  <Check className="w-3 h-3 text-[#10b981]" strokeWidth={2.5} />
                ) : hasError ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                ) : (
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isActive ? "bg-[#1abc9c] opacity-70" : "bg-[#b3b7bd]",
                  )} />
                )}
              </div>
              {idx < RESEARCHER_TABS.length - 1 && (
                <div className={cn(
                  "w-[2px] h-5 mt-0.5 transition-colors duration-500",
                  isDone ? "bg-[#10b981]" : "bg-[#d1d5db]",
                )} />
              )}
            </div>
            <span
              className={cn(
                "text-[11px] font-semibold tracking-wide mt-[3px] leading-tight",
                isActive  ? "text-[#1abc9c]"
                : isDone  ? "text-[#10b981]"
                : hasError ? "text-amber-500"
                : "text-[#9ca3af]",
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

// ─── Right sidebar ────────────────────────────────────────────────────────────
function RightSidebar({
  activeIndex,
  pct,
  completions,
}: {
  activeIndex: number;
  pct: number;
  completions: boolean[];
}) {
  return (
    <div className="flex flex-col gap-3 w-full xl:w-[300px] flex-shrink-0">
      {/* Profile completion card */}
      <div className="bg-white rounded-[12px] p-5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)]">
        <div className="flex justify-center mb-4">
          <DonutChart pct={pct} />
        </div>

        <div className="mb-4">
          <p className="text-[16px] font-semibold text-black leading-[24px] mb-1">
            Complete your profile to get started!
          </p>
          <p className="text-[13px] text-[#62748e] leading-[20px]">
            A complete profile makes you discoverable to verified industry partners looking
            for your specific research expertise.
          </p>
        </div>

        <VerticalStepTracker activeIndex={activeIndex} completions={completions} />
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
              Detailed profiles receive 3× more collaboration requests from verified industry partners.
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
}: {
  status: SaveStatus;
  lastSaved: string;
}) {
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
            {lastSaved && (
              <span className="text-[11px] text-[#99a8af]">Last saved: {lastSaved}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Congratulations Modal ────────────────────────────────────────────────────
function CongratsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Card */}
      <div className="relative bg-white rounded-[20px] shadow-2xl p-8 max-w-[400px] w-full text-center animate-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#f0faf5] border-2 border-[#86efac] flex items-center justify-center mx-auto mb-5">
          <PartyPopper className="w-8 h-8 text-[#018E7E]" />
        </div>

        <h2
          className="text-[26px] font-semibold text-[#111] mb-3 tracking-tight"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Congratulations!
        </h2>

        <p className="text-[14px] text-[#64748b] leading-relaxed mb-2">
          You have successfully completed your profile.
        </p>
        <p className="text-[12px] text-[#9ca3af] leading-relaxed mb-6">
          Your profile is now at 99% — you can always return to add more details and
          strengthen your visibility.
        </p>

        {/* 99% pill */}
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
export function ResearcherProfileSetup() {
  const data    = useResearcherProfileStore((s) => s.data);
  const setData = useResearcherProfileStore((s) => s.setData);

  const [activeIndex, setActiveIndex] = useState(0);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved]     = useState("");
  const [stickyH, setStickyH]         = useState(148);
  const [showCongrats, setShowCongrats] = useState(false);

  const saveTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stickyRef  = useRef<HTMLDivElement>(null);

  // Measure sticky header height
  useEffect(() => {
    const measure = () => {
      if (stickyRef.current) setStickyH(stickyRef.current.offsetHeight + 16);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stickyRef.current) ro.observe(stickyRef.current);
    return () => ro.disconnect();
  }, []);

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

  const goNext = useCallback(() => {
    if (activeIndex < RESEARCHER_TABS.length - 1) {
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
    setData({ submitted: true });
    setShowCongrats(true);
  }, [setData]);

  // Derived
  const completions = getStepCompletions(data);
  const pct         = data.submitted ? 99 : getProfileProgress(data);
  const canSubmit   = completions.every(Boolean);
  const activeTab   = RESEARCHER_TABS[activeIndex];

  return (
    <div className="flex flex-col min-h-full pb-10 px-2 sm:px-0">

      {/* ══ STICKY HEADER ══════════════════════════════════════════════════ */}
      <div
        ref={stickyRef}
        className="sticky top-0 z-30 pb-3"
        style={{ background: "#f9fafb" }}
      >
        <div className="pt-4 pb-3">
          <h1
            className="text-[30px] font-semibold leading-[36px] tracking-[-0.225px] text-[#18181b]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Profile
          </h1>
          <p className="text-[15px] text-[#62748e] mt-0.5 leading-[24px]">
            Build your researcher profile to connect with verified industry partners and showcase your scientific expertise.
          </p>
        </div>

        {/* Tab bar */}
        <div
          className="flex items-center gap-0.5 flex-nowrap rounded-[12px] p-[5px] overflow-x-auto no-scrollbar shadow-[0_2px_8px_0_rgba(0,0,0,0.06)]"
          style={{ background: "#DFF3EE" }}
        >
          {RESEARCHER_TABS.map(({ id, label, step }, idx) => {
            const isActive = activeIndex === idx;
            const isDone   = completions[idx];
            const Icon     = TAB_ICONS[idx];
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

      {/* ══ MAIN — 70 / 30 ═══════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row gap-4 items-start mt-4">

        {/* LEFT: Form card */}
        <div
          className="flex-1 min-w-0 bg-white rounded-[16px] border border-[#E4E4E7]/60 flex flex-col"
          onInput={triggerAutoSave}
        >
          {/* Section header */}
          <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4 border-b border-[#F3F4F6]">
            <h2 className="text-[18px] font-semibold text-black leading-[28px]">
              {activeTab.label}
            </h2>
            <p className="text-[14px] text-[#62748e] mt-0.5 leading-[22px]">
              {activeTab.subtitle}
            </p>
          </div>

          {/* Step content */}
          {activeIndex === 0 && (
            <Step1Profile onNext={goNext} isFirst />
          )}
          {activeIndex === 1 && (
            <Step2Capabilities onNext={goNext} onBack={goBack} />
          )}
          {activeIndex === 2 && (
            <Step3TrackRecord onNext={goNext} onBack={goBack} />
          )}
          {activeIndex === 3 && (
            <Step4Compliance onBack={goBack} onSubmit={handleSubmit} canSubmit={canSubmit} />
          )}

          {/* Auto-save status strip (above step footer) */}
          <AutoSaveFooter status={saveStatus} lastSaved={lastSaved} />
        </div>

        {/* RIGHT: Sticky sidebar */}
        <div className="xl:sticky w-full xl:w-auto" style={{ top: stickyH, alignSelf: "flex-start" }}>
          <RightSidebar
            activeIndex={activeIndex}
            pct={pct}
            completions={completions}
          />
        </div>
      </div>

      {/* ══ CONGRATS MODAL ════════════════════════════════════════════════ */}
      <CongratsModal open={showCongrats} onClose={() => setShowCongrats(false)} />
    </div>
  );
}
