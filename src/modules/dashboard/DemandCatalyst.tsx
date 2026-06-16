"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Megaphone, Star, Package, Users, Globe, Target,
  ArrowRight, CheckCircle2, Circle, ChevronRight,
  ChevronLeft, Play, Search, Zap, TrendingUp, Award,
  AlertCircle, Check, Rocket, Building2, Activity,
  BarChart3, Layers, Radio, Sparkles, ShieldCheck,
  X, Eye, ChevronDown, Plus, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type DemoState = "state1" | "state2" | "state3" | "state4";

// ─── Mock product catalog data ────────────────────────────────────────────────

const CATALOG_PRODUCTS = [
  { id: 1, name: "Metformin HCl 99.5%",       cas: "1115-70-4",   industry: "Pharmaceutical API",    readiness: 92, selected: false, missing: [] },
  { id: 2, name: "Paracetamol DC Grade",        cas: "103-90-2",    industry: "Pharmaceutical API",    readiness: 85, selected: false, missing: ["MSDS", "Packaging"] },
  { id: 3, name: "Ascorbic Acid USP",           cas: "50-81-7",     industry: "Nutraceuticals",        readiness: 78, selected: false, missing: ["Target Countries"] },
  { id: 4, name: "Citric Acid Anhydrous",       cas: "77-92-9",     industry: "Food & Beverage",       readiness: 95, selected: false, missing: [] },
  { id: 5, name: "Ibuprofen Micronised",        cas: "15687-27-1",  industry: "Pharmaceutical API",    readiness: 61, selected: false, missing: ["MSDS", "Packaging", "Target Countries"] },
  { id: 6, name: "Caffeine Anhydrous EP",       cas: "58-08-2",     industry: "Nutraceuticals",        readiness: 88, selected: false, missing: [] },
  { id: 7, name: "Benzyl Alcohol NF",           cas: "100-51-6",    industry: "Specialty Chemicals",   readiness: 73, selected: false, missing: ["Packaging"] },
  { id: 8, name: "Acetylsalicylic Acid BP",     cas: "50-78-2",     industry: "Pharmaceutical API",    readiness: 90, selected: false, missing: [] },
];

const STATE4_SELECTED = [
  { id: 1, name: "Metformin HCl 99.5%",    industry: "Pharmaceutical API",  readiness: 92, campaignStatus: "Ready",           missing: [],                              includedInLaunch: true  },
  { id: 2, name: "Paracetamol DC Grade",   industry: "Pharmaceutical API",  readiness: 85, campaignStatus: "Needs Attention", missing: ["MSDS", "Packaging"],           includedInLaunch: false },
  { id: 6, name: "Caffeine Anhydrous EP",  industry: "Nutraceuticals",      readiness: 88, campaignStatus: "Ready",           missing: [],                              includedInLaunch: true  },
  { id: 8, name: "Acetylsalicylic Acid BP",industry: "Pharmaceutical API",  readiness: 90, campaignStatus: "Ready",           missing: [],                              includedInLaunch: true  },
  { id: 3, name: "Ascorbic Acid USP",      industry: "Nutraceuticals",      readiness: 78, campaignStatus: "Needs Attention", missing: ["Target Countries"],            includedInLaunch: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

// Demo state switcher (top-right, for demo purposes)
function DemoStateSwitcher({
  current,
  onChange,
}: {
  current: DemoState;
  onChange: (s: DemoState) => void;
}) {
  const states: { id: DemoState; label: string }[] = [
    { id: "state1", label: "State 1 · Day 0"       },
    { id: "state2", label: "State 2 · No Catalog"  },
    { id: "state3", label: "State 3 · No Stars"    },
    { id: "state4", label: "State 4 · Ready"       },
  ];

  return (
    <div className="flex items-center gap-1 bg-white border border-[#E2E5E3] rounded-lg p-1">
      {states.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            current === s.id
              ? "text-white"
              : "text-[#68747A] hover:bg-[#F9FAFB]"
          )}
          style={current === s.id ? { background: "linear-gradient(98.03deg,#016358 12.27%,#182133 110.8%)" } : undefined}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ─── Animated hero stepper ────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  {
    step: "01",
    icon: Star,
    title: "Select Star Products",
    desc: "Choose up to 5 products you want Synodo to actively market. These become your spotlight catalogue.",
    color: "#1F6F54",
    bg: "#DFF3EE",
  },
  {
    step: "02",
    icon: Megaphone,
    title: "Campaign Planning & Execution",
    desc: "Synodo's sales and marketing teams create targeted campaigns, reach buyers, and generate demand across global channels.",
    color: "#2F66D0",
    bg: "#EAF1FF",
  },
  {
    step: "03",
    icon: Target,
    title: "Receive Qualified Opportunities",
    desc: "Qualified buyer opportunities are delivered directly to you — no chasing leads, no cold outreach.",
    color: "#5B3BA8",
    bg: "#F1EDFF",
  },
];

function HeroStepper() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % 3), 3500);
    return () => clearInterval(t);
  }, []);

  const step = ONBOARDING_STEPS[active];
  const Icon = step.icon;

  return (
    <div className="bg-white border border-[#E2E5E3] rounded-xl overflow-hidden">
      {/* Step indicators */}
      <div className="flex border-b border-[#E2E5E3]">
        {ONBOARDING_STEPS.map((s, i) => {
          const SI = s.icon;
          const isActive = i === active;
          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "flex-1 flex items-center gap-2.5 px-4 py-3 transition-all text-left border-b-2",
                isActive ? "border-[#1F6F54] bg-[#F9FAFB]" : "border-transparent hover:bg-[#F9FAFB]"
              )}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: isActive ? s.bg : "#F3F4F6" }}
              >
                <SI size={13} style={{ color: isActive ? s.color : "#68747A" }} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xs font-medium truncate", isActive ? "text-[#171717]" : "text-[#68747A]")}>
                  Step {s.step}
                </p>
                <p className={cn("text-[11px] truncate", isActive ? "text-[#4B5563]" : "text-[#99A8AF]")}>
                  {s.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active step content */}
      <div className="p-5 flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: step.bg }}
        >
          <Icon size={20} style={{ color: step.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold tracking-widest" style={{ color: step.color }}>
              STEP {step.step}
            </span>
          </div>
          <p className="text-sm font-medium text-[#171717] mb-1">{step.title}</p>
          <p className="text-sm text-[#68747A] leading-relaxed">{step.desc}</p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 pb-4">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="rounded-full transition-all"
            style={{
              width: i === active ? 20 : 6,
              height: 6,
              background: i === active ? "#1F6F54" : "#D2D2D5",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── How It Works infographic ─────────────────────────────────────────────────

const HOW_IT_WORKS_STEPS = [
  { icon: Package,    label: "Product Catalog",      sub: "Your products",           color: "#68747A", bg: "#F3F4F6" },
  { icon: Star,       label: "Star Products",         sub: "Up to 5 selected",        color: "#1F6F54", bg: "#DFF3EE" },
  { icon: Layers,     label: "Campaign Planning",     sub: "Synodo team",             color: "#2F66D0", bg: "#EAF1FF" },
  { icon: Megaphone,  label: "Campaign Execution",    sub: "Multi-channel outreach",  color: "#D95C7A", bg: "#F3E6EA" },
  { icon: Search,     label: "Lead Finalization",     sub: "Buyer qualification",     color: "#9C5022", bg: "#FBF0C5" },
  { icon: Target,     label: "Opportunities",         sub: "Delivered to you",        color: "#5B3BA8", bg: "#F1EDFF" },
];

function HowItWorks() {
  return (
    <div className="bg-white border border-[#E2E5E3] rounded-xl p-5">
      <p className="text-[10px] font-bold tracking-widest text-[#68747A] mb-4">HOW DEMAND CATALYST WORKS</p>
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {HOW_IT_WORKS_STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2 min-w-[90px] flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: s.bg }}
                >
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-[#171717] leading-tight">{s.label}</p>
                  <p className="text-[10px] text-[#99A8AF] mt-0.5">{s.sub}</p>
                </div>
              </div>
              {i < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="flex-shrink-0 flex flex-col items-center pt-1">
                  <div
                    className="h-[2px] w-8"
                    style={{ background: "repeating-linear-gradient(90deg,#D2D2D5 0,#D2D2D5 4px,transparent 4px,transparent 8px)" }}
                  />
                  <ChevronRight size={10} className="text-[#D2D2D5] -mt-1.5" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Value proposition cards ──────────────────────────────────────────────────

const VALUE_CARDS = [
  {
    icon: Users,
    title: "Dedicated Sales Team",
    desc: "Human outreach from Synodo sales specialists who know your industry and your buyers.",
    color: "#1F6F54", bg: "#DFF3EE",
  },
  {
    icon: Radio,
    title: "Digital Marketing Engine",
    desc: "Multi-channel campaigns across relevant pharma, biotech, and specialty chemical markets.",
    color: "#2F66D0", bg: "#EAF1FF",
  },
  {
    icon: BarChart3,
    title: "Market Intelligence",
    desc: "Search demand signals, industry insights, and buyer intent data working for your products.",
    color: "#5B3BA8", bg: "#F1EDFF",
  },
  {
    icon: ShieldCheck,
    title: "Exclusive Opportunities",
    desc: "Qualified buyer opportunities delivered directly to you — with full context and next steps.",
    color: "#9C5022", bg: "#FBF0C5",
  },
];

function ValueCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {VALUE_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-white border border-[#E2E5E3] rounded-xl p-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: card.bg }}
            >
              <Icon size={16} style={{ color: card.color }} />
            </div>
            <p className="text-sm font-medium text-[#171717] mb-1.5">{card.title}</p>
            <p className="text-xs text-[#68747A] leading-relaxed">{card.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Explainer video section ──────────────────────────────────────────────────

function ExplainerVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="bg-white border border-[#E2E5E3] rounded-xl overflow-hidden">
      <div className="p-5 border-b border-[#E2E5E3]">
        <p className="text-[10px] font-bold tracking-widest text-[#68747A] mb-1">EXPLAINER</p>
        <p className="text-base font-medium text-[#171717]">See Demand Catalyst in Action</p>
        <p className="text-sm text-[#68747A] mt-1">
          Understand how Synodo&apos;s team generates demand, qualifies buyers, and delivers opportunities directly to you.
        </p>
      </div>
      <div
        className="relative bg-[#0a1a14] flex items-center justify-center cursor-pointer group"
        style={{ height: 240 }}
        onClick={() => setPlaying(!playing)}
      >
        {/* Video thumbnail overlay grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(255,255,255,0.08) 30px,rgba(255,255,255,0.08) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(255,255,255,0.08) 30px,rgba(255,255,255,0.08) 31px)"
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/30 bg-white/10 group-hover:bg-white/20 transition-all">
            <Play size={22} className="text-white ml-1" fill="white" />
          </div>
          <p className="text-white/60 text-xs">Demand Catalyst Overview · 3:42</p>
        </div>
        {/* Chapter markers */}
        <div className="absolute bottom-4 left-5 right-5">
          <div className="flex gap-4">
            {["How it works", "Marketing process", "Sales process", "Opportunity generation"].map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="text-white/40 text-[10px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Setup progress tracker ───────────────────────────────────────────────────

function SetupProgress({ step }: { step: number }) {
  const steps = [
    { label: "Demand Catalyst Access", done: true   },
    { label: "Product Catalog Added",  done: step >= 2 },
    { label: "Star Products Selected", done: step >= 3 },
    { label: "Campaign Ready",         done: step >= 4 },
  ];
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2.5">
          {s.done ? (
            <CheckCircle2 size={16} style={{ color: "#1F6F54" }} className="flex-shrink-0" />
          ) : (
            <Circle size={16} className="text-[#D2D2D5] flex-shrink-0" />
          )}
          <span className={cn("text-sm", s.done ? "text-[#171717] font-medium" : "text-[#99A8AF]")}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Readiness score badge ────────────────────────────────────────────────────

function ReadinessBadge({ score }: { score: number }) {
  const color = score >= 85 ? "#0F7614" : score >= 70 ? "#9C5022" : "#C30E1A";
  const bg    = score >= 85 ? "#B2F3B7" : score >= 70 ? "#FBF0C5" : "#FFEFEF";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color }}
    >
      {score}%
    </span>
  );
}

// ─── STATE 1 — Day 0 / First-time user ───────────────────────────────────────

function State1({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div className="bg-white border border-[#E2E5E3] rounded-xl p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider mb-4"
              style={{ background: "#DFF3EE", color: "#1F6F54" }}
            >
              <Sparkles size={10} />
              MANAGED B2B GROWTH SERVICE
            </div>
            <h1 className="text-2xl font-semibold text-[#171717] leading-tight mb-3">
              Turn Your Products Into<br />
              Qualified Global Opportunities
            </h1>
            <p className="text-sm text-[#68747A] leading-relaxed max-w-[520px] mb-5">
              Synodo&apos;s sales and marketing teams actively promote your selected products, generate buyer
              demand, and deliver exclusive opportunities directly to you.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onGetStarted}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: "linear-gradient(98.03deg,#016358 12.27%,#182133 110.8%)" }}
              >
                Get Started
                <ArrowRight size={14} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#68747A] border border-[#E2E5E3] hover:bg-[#F9FAFB] transition-all">
                <Play size={13} />
                Watch Demo
              </button>
            </div>
          </div>
          {/* Right summary card */}
          <div className="flex-shrink-0 w-[200px] bg-[#F9FAFB] border border-[#E2E5E3] rounded-xl p-4">
            <p className="text-[10px] font-bold tracking-widest text-[#68747A] mb-3">YOUR OVERVIEW</p>
            <div className="space-y-3">
              {[
                { label: "Campaigns Started",      value: "0"              },
                { label: "Star Products",          value: "0 / 5"          },
                { label: "Opportunities Generated",value: "0"              },
                { label: "Current Stage",          value: "Getting Started" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-[#99A8AF]">{item.label}</p>
                  <p className="text-sm font-medium text-[#171717]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <HeroStepper />

      {/* How it works */}
      <HowItWorks />

      {/* Value cards */}
      <ValueCards />

      {/* Video */}
      <ExplainerVideo />

      {/* Empty state */}
      <div className="bg-white border border-[#E2E5E3] rounded-xl p-8 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F3F4F6" }}>
          <Megaphone size={22} className="text-[#D2D2D5]" />
        </div>
        <p className="text-base font-medium text-[#171717] mb-2">No Campaign Started Yet</p>
        <p className="text-sm text-[#68747A] mb-5 max-w-[360px]">
          Complete the setup to launch your first Demand Catalyst campaign and start receiving qualified opportunities.
        </p>
        <button
          onClick={onGetStarted}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: "linear-gradient(98.03deg,#016358 12.27%,#182133 110.8%)" }}
        >
          Get Started
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── STATE 2 — No product catalog ────────────────────────────────────────────

function State2({ onGoToCatalog }: { onGoToCatalog: () => void }) {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Demand Catalyst Setup</h1>
          <p className="text-sm text-[#68747A] mt-0.5">Complete the steps below to launch your first campaign</p>
        </div>
      </div>

      {/* Main blocker card */}
      <div className="grid grid-cols-3 gap-4">
        {/* Blocker — spans 2 cols */}
        <div className="col-span-2 bg-white border border-[#E2E5E3] rounded-xl overflow-hidden">
          <div className="p-5 border-b border-[#E2E5E3]" style={{ background: "#FBF0C5" }}>
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} style={{ color: "#9C5022" }} />
              <p className="text-sm font-medium" style={{ color: "#9C5022" }}>Setup Blocked</p>
            </div>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "#FBF0C5" }}>
              <Package size={20} style={{ color: "#9C5022" }} />
            </div>
            <h2 className="text-lg font-semibold text-[#171717] mb-2">Product Catalog Required</h2>
            <p className="text-sm text-[#68747A] leading-relaxed mb-5">
              Before launching Demand Catalyst, you need products in your Product Catalog. Synodo&apos;s team
              uses your catalog to build campaigns, identify the right buyers, and generate qualified
              opportunities for your products.
            </p>

            {/* Benefits */}
            <div className="bg-[#F9FAFB] border border-[#E2E5E3] rounded-xl p-4 mb-5">
              <p className="text-[10px] font-bold tracking-widest text-[#68747A] mb-3">WHY THIS MATTERS</p>
              <div className="space-y-2.5">
                {[
                  "Campaign-ready products with complete technical specifications",
                  "Better lead quality through accurate product matching",
                  "Faster campaign launch with verified catalog data",
                ].map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} style={{ color: "#1F6F54" }} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#4B5563]">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onGoToCatalog}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: "linear-gradient(98.03deg,#016358 12.27%,#182133 110.8%)" }}
              >
                <Plus size={14} />
                Add Products
              </button>
              <button
                onClick={onGoToCatalog}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[#1F6F54] border-2 border-[#1F6F54] hover:bg-[#DFF3EE] transition-all"
              >
                Go To Product Catalog
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Setup progress — 1 col */}
        <div className="bg-white border border-[#E2E5E3] rounded-xl p-5">
          <p className="text-[10px] font-bold tracking-widest text-[#68747A] mb-4">SETUP PROGRESS</p>
          <SetupProgress step={1} />
          <div className="mt-5 pt-4 border-t border-[#E2E5E3]">
            <p className="text-[10px] text-[#99A8AF] mb-1">Completion</p>
            <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "25%", background: "#1F6F54" }} />
            </div>
            <p className="text-xs font-medium text-[#1F6F54] mt-1.5">25% complete</p>
          </div>
        </div>
      </div>

      {/* Contextual guidance */}
      <div className="bg-[#EAF1FF] border border-[#2F66D0]/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#2F66D0" }}>
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#171717] mb-1">What makes a great product catalog for Demand Catalyst?</p>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Products with complete technical data sheets, MSDS documentation, packaging specs, and defined
              target markets consistently generate 3× more qualified opportunities through Demand Catalyst campaigns.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works — still visible for orientation */}
      <HowItWorks />
    </div>
  );
}

// ─── STATE 3 — Catalog added, no star products ────────────────────────────────

function State3({ onContinue }: { onContinue: () => void }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((s) => s !== id));
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const slots = Array(5).fill(null).map((_, i) => {
    const pid = selectedIds[i];
    return pid ? CATALOG_PRODUCTS.find((p) => p.id === pid) : null;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Select Your Spotlight Five</h1>
          <p className="text-sm text-[#68747A] mt-0.5">Choose up to 5 products for Synodo to actively market</p>
        </div>
        <button
          onClick={onContinue}
          disabled={selectedIds.length === 0}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
            selectedIds.length > 0
              ? "text-white hover:brightness-110 active:scale-[0.98]"
              : "text-[#99A8AF] bg-[#F3F4F6] cursor-not-allowed"
          )}
          style={selectedIds.length > 0 ? { background: "linear-gradient(98.03deg,#016358 12.27%,#182133 110.8%)" } : undefined}
        >
          Continue
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Slot tracker */}
      <div className="bg-white border border-[#E2E5E3] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold tracking-widest text-[#68747A]">SELECTED PRODUCTS</p>
          <span className="text-sm font-medium text-[#1F6F54]">{selectedIds.length} / 5 Products</span>
        </div>
        <div className="flex gap-2">
          {slots.map((product, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-14 rounded-lg flex flex-col items-center justify-center border-2 transition-all",
                product
                  ? "border-[#1F6F54] bg-[#DFF3EE]"
                  : "border-dashed border-[#D2D2D5] bg-[#F9FAFB]"
              )}
            >
              {product ? (
                <>
                  <Star size={12} style={{ color: "#1F6F54" }} fill="#1F6F54" />
                  <p className="text-[9px] font-medium text-[#1F6F54] mt-0.5 text-center px-1 truncate w-full text-center">
                    {product.name.split(" ").slice(0, 2).join(" ")}
                  </p>
                </>
              ) : (
                <Circle size={14} className="text-[#D2D2D5]" />
              )}
            </div>
          ))}
        </div>
        {selectedIds.length === 5 && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <CheckCircle2 size={12} style={{ color: "#1F6F54" }} />
            <p className="text-xs text-[#1F6F54] font-medium">All 5 star products selected — ready to continue</p>
          </div>
        )}
      </div>

      {/* Product catalog table */}
      <div className="bg-white border border-[#E2E5E3] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E5E3]">
          <p className="text-sm font-medium text-[#171717]">Your Product Catalog</p>
          <button className="text-xs text-[#1F6F54] font-medium hover:underline flex items-center gap-1">
            View Full Catalog <ChevronRight size={12} />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E5E3]">
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase w-8"></th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Product</th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Industry</th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Campaign Readiness</th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {CATALOG_PRODUCTS.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              const isDisabled = !isSelected && selectedIds.length >= 5;
              return (
                <tr
                  key={product.id}
                  className={cn(
                    "border-b border-[#F3F4F6] transition-all",
                    isSelected ? "bg-[#F9FAFB]" : "hover:bg-[#F9FAFB]",
                    isDisabled ? "opacity-50" : ""
                  )}
                >
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border-2 cursor-pointer transition-all",
                        isSelected ? "border-[#1F6F54] bg-[#1F6F54]" : "border-[#D2D2D5] bg-white"
                      )}
                      onClick={() => !isDisabled && toggle(product.id)}
                    >
                      {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#171717]">{product.name}</p>
                    <p className="text-[10px] font-mono text-[#99A8AF] mt-0.5">{product.cas}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded">
                      {product.industry}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${product.readiness}%`,
                            background: product.readiness >= 85 ? "#1F6F54" : product.readiness >= 70 ? "#9C5022" : "#C30E1A",
                          }}
                        />
                      </div>
                      <ReadinessBadge score={product.readiness} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={isDisabled}
                      onClick={() => !isDisabled && toggle(product.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        isSelected
                          ? "border-[#C30E1A]/30 text-[#C30E1A] bg-[#FFEFEF] hover:bg-[#FFDFDF]"
                          : isDisabled
                          ? "border-[#D2D2D5] text-[#99A8AF] cursor-not-allowed"
                          : "border-[#1F6F54] text-[#1F6F54] hover:bg-[#DFF3EE]"
                      )}
                    >
                      {isSelected ? (
                        <><Minus size={10} />Remove</>
                      ) : (
                        <><Star size={10} />Select</>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── STATE 4 — Star products selected, ready to launch ───────────────────────

function State4() {
  const [launchSelection, setLaunchSelection] = useState<number[]>(
    STATE4_SELECTED.filter((p) => p.includedInLaunch).map((p) => p.id)
  );
  const [launched, setLaunched] = useState(false);

  const toggleLaunch = (id: number) => {
    setLaunchSelection((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const readyCount   = STATE4_SELECTED.filter((p) => p.campaignStatus === "Ready").length;
  const attentionCount = STATE4_SELECTED.filter((p) => p.campaignStatus === "Needs Attention").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Star Products Selected</h1>
          <p className="text-sm text-[#68747A] mt-0.5">Review campaign readiness and launch your first Demand Catalyst campaign</p>
        </div>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: "#DFF3EE", color: "#1F6F54" }}
        >
          <CheckCircle2 size={12} />
          Setup Complete
        </div>
      </div>

      {/* Campaign readiness summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Selected Products", value: STATE4_SELECTED.length, color: "#171717", bg: "#F3F4F6"   },
          { label: "Campaign Ready",    value: readyCount,             color: "#0F7614", bg: "#B2F3B7"   },
          { label: "Needs Attention",   value: attentionCount,         color: "#9C5022", bg: "#FBF0C5"   },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-[#E2E5E3] rounded-xl p-4">
            <p className="text-[10px] font-bold tracking-widest text-[#68747A] mb-2">{m.label.toUpperCase()}</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-semibold" style={{ color: m.color }}>{m.value}</span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: m.bg, color: m.color }}
              >
                of 5
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected products table */}
      <div className="bg-white border border-[#E2E5E3] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E2E5E3]">
          <p className="text-sm font-medium text-[#171717]">Selected Star Products</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E5E3] bg-[#F9FAFB]">
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Product</th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Industry</th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Readiness</th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Campaign Status</th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Missing</th>
              <th className="text-left text-[10px] font-bold text-[#68747A] tracking-widest px-4 py-3 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {STATE4_SELECTED.map((product) => (
              <tr key={product.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-all">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Star size={11} style={{ color: "#1F6F54" }} fill="#1F6F54" />
                    <div>
                      <p className="text-sm font-medium text-[#171717]">{product.name}</p>
                      <p className="text-[10px] text-[#99A8AF]">{product.industry}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-[#4B5563] bg-[#F3F4F6] px-2 py-0.5 rounded">{product.industry}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${product.readiness}%`,
                          background: product.readiness >= 85 ? "#1F6F54" : "#9C5022",
                        }}
                      />
                    </div>
                    <ReadinessBadge score={product.readiness} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  {product.campaignStatus === "Ready" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#B2F3B7] text-[#0F7614]">
                      <CheckCircle2 size={10} />
                      Campaign Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBF0C5] text-[#9C5022]">
                      <AlertCircle size={10} />
                      Needs Attention
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {product.missing.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.missing.map((m) => (
                        <span key={m} className="text-[10px] bg-[#FFEFEF] text-[#C30E1A] px-1.5 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#99A8AF]">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {product.missing.length > 0 ? (
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#9C5022]/30 text-[#9C5022] bg-[#FBF0C5] hover:bg-[#F7E6B8] transition-all">
                      Complete Details
                      <ChevronRight size={10} />
                    </button>
                  ) : (
                    <span className="text-xs text-[#1F6F54] font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Complete
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Launch Campaign section */}
      <div className="bg-white border border-[#E2E5E3] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E5E3]" style={{ background: "linear-gradient(98.03deg,#f0faf7 0%,#e8f0fb 100%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1F6F54" }}>
              <Rocket size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#171717]">Launch Demand Catalyst</p>
              <p className="text-xs text-[#68747A]">Choose which star products to include in this campaign launch</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {launched ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#DFF3EE" }}>
                <CheckCircle2 size={24} style={{ color: "#1F6F54" }} />
              </div>
              <p className="text-base font-medium text-[#171717] mb-1">Campaign Launched! 🎉</p>
              <p className="text-sm text-[#68747A] mb-4 max-w-[360px]">
                Synodo&apos;s team has been notified and will begin campaign planning within 24 hours.
                Your campaign will appear under <strong>Campaign Planning</strong>.
              </p>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "#DFF3EE", color: "#1F6F54" }}
              >
                <Activity size={11} />
                Moving to Campaign Planning →
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-5">
                {STATE4_SELECTED.map((product) => {
                  const isIncluded = launchSelection.includes(product.id);
                  return (
                    <label
                      key={product.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isIncluded ? "border-[#1F6F54] bg-[#F9FAFB]" : "border-[#E2E5E3] bg-white hover:bg-[#F9FAFB]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all",
                          isIncluded ? "border-[#1F6F54] bg-[#1F6F54]" : "border-[#D2D2D5] bg-white"
                        )}
                        onClick={() => toggleLaunch(product.id)}
                      >
                        {isIncluded && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#171717] truncate">{product.name}</p>
                          {product.campaignStatus === "Needs Attention" && (
                            <span className="text-[10px] bg-[#FBF0C5] text-[#9C5022] px-1.5 py-0.5 rounded flex-shrink-0">
                              Needs Attention
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#68747A]">{product.industry} · Readiness {product.readiness}%</p>
                      </div>
                      <ReadinessBadge score={product.readiness} />
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E2E5E3]">
                <p className="text-sm text-[#68747A]">
                  <span className="font-medium text-[#171717]">{launchSelection.length}</span> product{launchSelection.length !== 1 ? "s" : ""} selected for launch
                </p>
                <button
                  disabled={launchSelection.length === 0}
                  onClick={() => setLaunched(true)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                    launchSelection.length > 0
                      ? "text-white hover:brightness-110 active:scale-[0.98]"
                      : "text-[#99A8AF] bg-[#F3F4F6] cursor-not-allowed"
                  )}
                  style={launchSelection.length > 0 ? { background: "linear-gradient(98.03deg,#016358 12.27%,#182133 110.8%)" } : undefined}
                >
                  <Rocket size={14} />
                  Start Campaign
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DemandCatalyst() {
  const [demoState, setDemoState] = useState<DemoState>("state1");

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#E2E5E3]">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#016358,#182133)" }}
            >
              <Megaphone size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#171717] leading-tight">Demand Catalyst</h2>
              <p className="text-[10px] text-[#99A8AF]">Managed B2B Growth Service</p>
            </div>
          </div>

          {/* Demo state switcher */}
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-bold text-[#99A8AF] tracking-widest hidden lg:block">DEMO STATE</p>
            <DemoStateSwitcher current={demoState} onChange={setDemoState} />
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {demoState === "state1" && (
          <State1 onGetStarted={() => setDemoState("state2")} />
        )}
        {demoState === "state2" && (
          <State2 onGoToCatalog={() => setDemoState("state3")} />
        )}
        {demoState === "state3" && (
          <State3 onContinue={() => setDemoState("state4")} />
        )}
        {demoState === "state4" && (
          <State4 />
        )}
      </div>
    </div>
  );
}
