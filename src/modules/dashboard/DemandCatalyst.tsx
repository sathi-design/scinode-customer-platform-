"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── Shine button style (injected once) ──────────────────────────────────────
const SHINE_STYLE = `
@keyframes dc-shine {
  0%   { transform: translateX(-100%) skewX(-20deg); }
  100% { transform: translateX(250%)  skewX(-20deg); }
}
.dc-primary-btn {
  position: relative;
  overflow: hidden;
}
.dc-primary-btn::after {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
  animation: dc-shine 2.2s ease-in-out infinite;
  pointer-events: none;
}
`;
import {
  Megaphone, Star, Package, Users, Globe, Target,
  ArrowRight, CheckCircle2, Circle, ChevronRight,
  ChevronLeft, Play, Zap, TrendingUp, Award,
  AlertCircle, Check, Rocket, Activity, BarChart3,
  Layers, Radio, ShieldCheck, X, Plus, Minus,
  Sparkles, Crown, Lock, Database, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type DemoState = "state1" | "state2" | "state3" | "state4";

// ─── Mock data ────────────────────────────────────────────────────────────────

const CATALOG_PRODUCTS = [
  { id: 1, name: "Metformin HCl 99.5%",        cas: "1115-70-4",  industry: "Pharmaceutical API",  readiness: 92, missing: []                                      },
  { id: 2, name: "Paracetamol DC Grade",         cas: "103-90-2",   industry: "Pharmaceutical API",  readiness: 85, missing: ["MSDS", "Packaging"]                   },
  { id: 3, name: "Ascorbic Acid USP",            cas: "50-81-7",    industry: "Nutraceuticals",      readiness: 78, missing: ["Target Countries"]                    },
  { id: 4, name: "Citric Acid Anhydrous",        cas: "77-92-9",    industry: "Food & Beverage",     readiness: 95, missing: []                                      },
  { id: 5, name: "Ibuprofen Micronised",         cas: "15687-27-1", industry: "Pharmaceutical API",  readiness: 61, missing: ["MSDS", "Packaging", "Target Countries"] },
  { id: 6, name: "Caffeine Anhydrous EP",        cas: "58-08-2",    industry: "Nutraceuticals",      readiness: 88, missing: []                                      },
  { id: 7, name: "Benzyl Alcohol NF",            cas: "100-51-6",   industry: "Specialty Chemicals", readiness: 73, missing: ["Packaging"]                           },
  { id: 8, name: "Acetylsalicylic Acid BP",      cas: "50-78-2",    industry: "Pharmaceutical API",  readiness: 90, missing: []                                      },
];

const STATE4_PRODUCTS = [
  { id: 1, name: "Metformin HCl 99.5%",    industry: "Pharmaceutical API", readiness: 92, status: "ready",     missing: [],                              launch: true  },
  { id: 2, name: "Paracetamol DC Grade",   industry: "Pharmaceutical API", readiness: 85, status: "attention", missing: ["MSDS", "Packaging"],           launch: false },
  { id: 6, name: "Caffeine Anhydrous EP",  industry: "Nutraceuticals",     readiness: 88, status: "ready",     missing: [],                              launch: true  },
  { id: 8, name: "Acetylsalicylic Acid BP",industry: "Pharmaceutical API", readiness: 90, status: "ready",     missing: [],                              launch: true  },
  { id: 3, name: "Ascorbic Acid USP",      industry: "Nutraceuticals",     readiness: 78, status: "attention", missing: ["Target Countries"],            launch: false },
];

// ─── Demo state switcher ──────────────────────────────────────────────────────

function DemoStateSwitcher({ current, onChange }: { current: DemoState; onChange: (s: DemoState) => void }) {
  const options: { id: DemoState; label: string }[] = [
    { id: "state1", label: "State 1 · Day 0"      },
    { id: "state2", label: "State 2 · No Catalog" },
    { id: "state3", label: "State 3 · No Stars"   },
    { id: "state4", label: "State 4 · Ready"      },
  ];
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">DEMO</span>
      <div className="flex items-center gap-1 bg-white border border-[#e4e4e7] rounded-lg p-1">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-[11.5px] font-semibold transition-all",
              current === o.id ? "bg-[#020202] text-white" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

interface KpiData {
  campaignsStarted: number;
  starProducts: string;
  opportunities: number;
  stage: string;
  launched?: boolean;
}

function KpiCards({ data }: { data: KpiData }) {
  const cards = [
    {
      label: "Campaigns Started",
      value: data.campaignsStarted.toString(),
      sub: data.launched ? "Active now" : "None launched yet",
      icon: Megaphone,
      iconBg: "#f1f5f9",
      iconColor: "#64748b",
      valueBg: "transparent",
      valueColor: "#0f172a",
      subColor: "#94a3b8",
      border: "#e2e8f0",
    },
    {
      label: "Star Products",
      value: data.starProducts,
      sub: data.starProducts === "0 / 5" ? "Action required" : "Selected for campaign",
      icon: Star,
      iconBg: "#fef9c3",
      iconColor: "#ca8a04",
      valueBg: "transparent",
      valueColor: data.starProducts === "0 / 5" ? "#92400e" : "#0f172a",
      subColor: data.starProducts === "0 / 5" ? "#d97706" : "#94a3b8",
      border: data.starProducts === "0 / 5" ? "#fde68a" : "#e2e8f0",
    },
    {
      label: "Opportunities Generated",
      value: data.opportunities.toString(),
      sub: "Delivered by SCINODE",
      icon: Target,
      iconBg: "#ede9fe",
      iconColor: "#7c3aed",
      valueBg: "transparent",
      valueColor: data.opportunities > 0 ? "#5b21b6" : "#0f172a",
      subColor: "#94a3b8",
      border: "#e2e8f0",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-white rounded-2xl border p-4 flex flex-col gap-3 transition-all"
            style={{ borderColor: c.border }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">{c.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: c.iconBg }}>
                <Icon size={14} style={{ color: c.iconColor }} />
              </div>
            </div>
            <div>
              <p className="text-[22px] font-black leading-none" style={{ color: c.valueColor }}>{c.value}</p>
              <p className="text-[11px] mt-1 font-medium" style={{ color: c.subColor }}>{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Vertical Timeline (Right Panel) ─────────────────────────────────────────

const TIMELINE_STEPS = [
  { icon: Package,   label: "Product Catalog",       desc: "Add your products",           id: "catalog"   },
  { icon: Star,      label: "Star Product Selection", desc: "Choose up to 5 products",     id: "star"      },
  { icon: Layers,    label: "Campaign Planning",      desc: "SCINODE team prepares",        id: "planning"  },
  { icon: Megaphone, label: "Campaign Execution",     desc: "Multi-channel outreach",       id: "execution" },
  { icon: Target,    label: "Lead Finalization",      desc: "Buyer qualification",          id: "leads"     },
  { icon: Award,     label: "Opportunities",          desc: "Delivered directly to you",    id: "opps"      },
];

function VerticalTimeline({ activeStep }: { activeStep: string }) {
  return (
    <div className="flex flex-col gap-0">
      {TIMELINE_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = step.id === activeStep;
        const isDone   = TIMELINE_STEPS.findIndex(s => s.id === activeStep) > i;
        const isLast   = i === TIMELINE_STEPS.length - 1;
        return (
          <div key={step.id} className="flex gap-3">
            {/* Timeline axis */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shrink-0"
                style={
                  isActive
                    ? { background: "#1a5c3a", borderColor: "#1a5c3a" }
                    : isDone
                    ? { background: "#e3f5ec", borderColor: "#6ee7b7" }
                    : { background: "#f8fafc", borderColor: "#e2e8f0" }
                }
              >
                {isDone ? (
                  <Check size={12} style={{ color: "#1a5c3a" }} strokeWidth={3} />
                ) : (
                  <Icon size={13} style={{ color: isActive ? "#fff" : "#94a3b8" }} />
                )}
              </div>
              {!isLast && (
                <div
                  className="w-px flex-1 my-1"
                  style={{
                    background: isDone ? "#6ee7b7" : "#e2e8f0",
                    minHeight: 20,
                  }}
                />
              )}
            </div>
            {/* Step content */}
            <div className={cn("pb-4 min-w-0 flex-1", isLast && "pb-0")}>
              <p
                className="text-[13px] font-bold leading-tight"
                style={{ color: isActive ? "#0f172a" : isDone ? "#1a5c3a" : "#94a3b8" }}
              >
                {step.label}
              </p>
              <p
                className="text-[11.5px] mt-0.5 leading-snug"
                style={{ color: isActive ? "#475569" : isDone ? "#64748b" : "#cbd5e1" }}
              >
                {step.desc}
              </p>
              {isActive && (
                <span
                  className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-wider"
                  style={{ background: "#e3f5ec", color: "#1a5c3a" }}
                >
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  CURRENT
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Benefits Banner Card ─────────────────────────────────────────────────────

function DemandCatalystBanner({
  onLearnMore,
  highlighted,
}: {
  onLearnMore: () => void;
  highlighted: boolean;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300"
      style={{
        background: "linear-gradient(160deg,#0d2818 0%,#0a1e10 55%,#091510 100%)",
        border: highlighted
          ? "1.5px solid rgba(110,231,183,0.55)"
          : "1px solid rgba(110,231,183,0.18)",
        boxShadow: highlighted ? "0 0 0 3px rgba(110,231,183,0.12)" : undefined,
      }}
    >
      <div className="relative flex-1 px-5 pt-6 pb-5 flex flex-col gap-4 overflow-hidden">
        {/* Radial glows */}
        <div
          className="pointer-events-none absolute -bottom-10 -right-10 w-[180px] h-[180px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(42,203,131,0.22) 0%,transparent 70%)", filter: "blur(32px)" }}
        />
        <div
          className="pointer-events-none absolute top-0 -left-8 w-[140px] h-[140px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(26,92,58,0.35) 0%,transparent 70%)", filter: "blur(28px)" }}
        />

        {/* Badge */}
        <div className="relative z-10 self-start">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.12em] border"
            style={{ background: "rgba(42,203,131,0.15)", borderColor: "rgba(42,203,131,0.30)", color: "#6ee7b7" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            PREMIUM SERVICE
          </span>
        </div>

        {/* Heading */}
        <div className="relative z-10 flex flex-col gap-2">
          <h3
            className="text-[18px] font-bold leading-snug transition-colors duration-300"
            style={{ color: highlighted ? "#6ee7b7" : "#ffffff" }}
          >
            See How Demand Catalyst Helps You Grow
          </h3>
          <p
            className="text-[12.5px] leading-relaxed transition-colors duration-300"
            style={{ color: highlighted ? "rgba(110,231,183,0.70)" : "rgba(255,255,255,0.55)" }}
          >
            SCINODE&apos;s team works for you — generating demand, qualifying buyers, and delivering exclusive opportunities.
          </p>
        </div>

        {/* Bullet list */}
        <div className="relative z-10 flex flex-col gap-2">
          {[
            "Dedicated sales outreach team",
            "Multi-channel marketing campaigns",
            "Qualified lead delivery",
            "Zero business development effort",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(42,203,131,0.18)" }}
              >
                <CheckCircle2 size={9} style={{ color: "#6ee7b7" }} />
              </div>
              <span className="text-[11.5px] leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative z-10 pt-1">
          <button
            onClick={onLearnMore}
            className="w-full py-2.5 rounded-xl text-[#0d2818] text-[13px] font-bold flex items-center justify-center gap-2 hover:brightness-105 transition-all active:scale-[0.98]"
            style={{ background: "#6ee7b7" }}
          >
            How It Works <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-4 border-t"
        style={{ borderColor: "rgba(110,231,183,0.10)", background: "rgba(0,0,0,0.20)" }}
      >
        {[
          { value: "2,400+", label: "Verified Suppliers" },
          { value: "18K+",   label: "Projects Completed" },
          { value: "60+",    label: "Countries" },
        ].map((stat, i, arr) => (
          <React.Fragment key={stat.label}>
            <div className="flex flex-col">
              <span className="text-[18px] font-black text-white leading-none">{stat.value}</span>
              <span className="text-[10px] text-white/40 mt-0.5">{stat.label}</span>
            </div>
            {i < arr.length - 1 && <div className="w-px h-8 bg-white/10" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Benefits Modal ───────────────────────────────────────────────────────────

const MODAL_PILLARS = [
  {
    icon: Star,
    iconBg: "#fef9c3",
    iconColor: "#ca8a04",
    label: "01",
    labelBg: "#e3f5ec",
    labelColor: "#1a5c3a",
    title: "Select Star Products",
    intro: "Choose up to 5 products you want SCINODE to actively promote to qualified buyers.",
    bullets: [
      "Pick from your existing Product Catalog",
      "Products are reviewed for campaign readiness",
      "Incomplete products get guided completion support",
      "You stay in control — update your selection anytime",
    ],
    outcome: "Your spotlight products are locked in and campaign-ready.",
  },
  {
    icon: Megaphone,
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
    label: "02",
    labelBg: "#ede9fe",
    labelColor: "#7c3aed",
    title: "SCINODE Runs Campaigns",
    intro: "Our team handles campaign planning, execution, and lead qualification — entirely managed.",
    bullets: [
      "Dedicated sales specialists reach out to qualified buyers",
      "Digital campaigns run across pharma, biotech & chemical markets",
      "Market intelligence drives targeting — right buyer, right time",
      "Every lead is verified and assessed for genuine intent",
    ],
    outcome: "SCINODE's team does the work. You do none of the outreach.",
  },
  {
    icon: Target,
    iconBg: "#f0fdf4",
    iconColor: "#1a5c3a",
    label: "03",
    labelBg: "#e3f5ec",
    labelColor: "#1a5c3a",
    title: "Receive Opportunities",
    intro: "Qualified buyer opportunities are delivered directly to you with full context.",
    bullets: [
      "Verified buyer profile — company, role, intent",
      "Product match rationale and qualification notes",
      "Recommended next steps and engagement guidance",
      "Opportunities tracked end-to-end inside SCINODE",
    ],
    outcome: "Exclusive, qualified, context-rich — ready for you to act on.",
  },
];

function BenefitsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Dark header ── */}
        <div
          className="relative px-6 pt-6 pb-6"
          style={{ background: "linear-gradient(135deg,#0d2818,#0a1e10)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border border-white/20 text-white/60 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold mb-4"
            style={{ background: "rgba(26,92,58,0.50)", border: "1px solid rgba(110,231,183,0.25)", color: "#6ee7b7" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            HOW DEMAND CATALYST HELPS YOU GROW
          </div>
          <h2 className="text-white text-[22px] font-bold leading-tight mb-2">
            See How Demand Catalyst Helps You Grow
          </h2>
          <p className="text-white/60 text-[13px] leading-relaxed max-w-[560px]">
            Demand Catalyst is a fully managed B2B growth service. Select your products and SCINODE&apos;s sales and marketing teams do the rest — generating demand, qualifying buyers, and delivering exclusive opportunities directly to you.
          </p>

          {/* Stat strip inside header */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/10">
            {[
              { value: "2,400+", label: "Verified Suppliers" },
              { value: "60+",    label: "Countries Reached" },
              { value: "18K+",   label: "Projects Completed" },
              { value: "100%",   label: "Managed for You"   },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[18px] font-black text-white leading-none">{s.value}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-6 flex flex-col gap-5">

          {/* 3 pillar cards matching the context cards */}
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">HOW IT WORKS — IN DETAIL</p>

          <div className="flex flex-col gap-4">
            {MODAL_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="rounded-xl border border-[#e4e4e7] overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-start gap-4 p-5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                      style={{ background: pillar.labelBg, color: pillar.labelColor }}>
                      {pillar.label}
                    </div>
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: pillar.iconBg }}>
                        <Icon size={16} style={{ color: pillar.iconColor }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-slate-900 mb-0.5">{pillar.title}</p>
                        <p className="text-[12.5px] text-slate-500 leading-relaxed">{pillar.intro}</p>
                      </div>
                    </div>
                  </div>
                  {/* Bullets + outcome */}
                  <div className="p-5 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pillar.bullets.map((b, j) => (
                        <div key={j} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: "#e3f5ec" }}>
                            <Check size={9} style={{ color: "#1a5c3a" }} strokeWidth={3} />
                          </div>
                          <span className="text-[12.5px] text-slate-600 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg"
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                      <CheckCircle2 size={13} style={{ color: "#1a5c3a" }} />
                      <p className="text-[12px] font-semibold" style={{ color: "#1a5c3a" }}>{pillar.outcome}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Growth summary strip */}
          <div className="rounded-xl border border-[#e4e4e7] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">WHY SUPPLIERS CHOOSE DEMAND CATALYST</p>
              <h3 className="text-[14px] font-bold text-slate-900">Your Products. Our Effort. Your Growth.</h3>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: "👥", title: "Dedicated sales team",        desc: "Human outreach from SCINODE specialists who know your buyers."              },
                { icon: "📡", title: "Digital marketing engine",    desc: "Multi-channel campaigns across pharma, biotech & chemical markets."         },
                { icon: "📊", title: "Market intelligence",         desc: "Buyer intent signals and industry insights working for your products."       },
                { icon: "🏆", title: "Exclusive opportunities",     desc: "Qualified buyers delivered to you with full context and next steps."         },
                { icon: "⚡", title: "Zero BD effort",              desc: "No cold outreach, no chasing leads — SCINODE's team does the work."         },
                { icon: "🌍", title: "Global visibility",           desc: "Reach pharmaceutical buyers across 60+ countries through SCINODE's network." },
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#f3f4f6]" style={{ background: "#fafafa" }}>
                  <span className="text-[17px] shrink-0">{b.icon}</span>
                  <div>
                    <p className="text-[12px] font-bold text-slate-800 mb-0.5">{b.title}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              className="dc-primary-btn flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
            >
              Add Product <ArrowRight size={14} />
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#e4e4e7] text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function RightPanel({
  activeStep,
  onLearnMore,
  bannerHighlighted,
}: {
  activeStep: string;
  onLearnMore: () => void;
  bannerHighlighted: boolean;
}) {
  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">DEMAND CATALYST</p>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <div className="flex-1">
        <DemandCatalystBanner onLearnMore={onLearnMore} highlighted={bannerHighlighted} />
      </div>
    </div>
  );
}

// ─── Readiness badge ──────────────────────────────────────────────────────────

function ReadinessBadge({ score }: { score: number }) {
  const [bg, color] =
    score >= 85 ? ["#dcfce7", "#166534"] :
    score >= 70 ? ["#fef9c3", "#92400e"] :
                  ["#fee2e2", "#991b1b"];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: bg, color }}>
      {score}%
    </span>
  );
}

// ─── State 1 — Day 0 empty state (LEFT PANEL) ────────────────────────────────

function EmptyStatePanel({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">CAMPAIGN WORKSPACE</p>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Empty state card — stretches to fill */}
      <div className="flex-1 bg-white rounded-2xl border-2 border-dashed border-[#e4e4e7] py-14 px-8 flex flex-col items-center justify-center text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "#f0fdf4" }}
        >
          <Megaphone size={26} style={{ color: "#1a5c3a" }} />
        </div>
        <p className="text-[16px] font-bold text-slate-800 mb-2">No Campaign Started Yet</p>
        <p className="text-[13px] text-slate-400 max-w-[360px] leading-relaxed mb-6">
          Complete the setup to launch your first Demand Catalyst campaign and start receiving qualified buyer opportunities.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="dc-primary-btn flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
          >
            <Sparkles size={14} /> Add Product
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e4e4e7] text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all">
            <Play size={12} /> Watch Demo
          </button>
        </div>
      </div>

    </div>
  );
}

// ─── State 2 — No catalog (LEFT PANEL) ───────────────────────────────────────

// ─── State 2 — Full-width blocker card ───────────────────────────────────────

function NoCatalogCard({ onGoToCatalog }: { onGoToCatalog: () => void }) {
  const steps = [
    { label: "Demand Catalyst Access", done: true  },
    { label: "Product Catalog Added",  done: false },
    { label: "Star Products Selected", done: false },
    { label: "Campaign Ready",         done: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#fde68a] overflow-hidden">
      <div className="flex items-stretch">

        {/* LEFT — H1 + subtext + CTAs */}
        <div className="flex-1 px-10 py-5 flex flex-col justify-center gap-4">
          {/* Warning pill */}
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
            <AlertCircle size={12} style={{ color: "#d97706" }} />
            Setup Blocked — Action Required
          </div>

          {/* Icon + heading */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fef9c3" }}>
              <Package size={22} style={{ color: "#ca8a04" }} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-slate-900 leading-tight mb-2">
                Product Catalog Required
              </h2>
              <p className="text-[13.5px] text-slate-500 leading-relaxed" style={{ maxWidth: "100%" }}>
                Before launching Demand Catalyst, add products to your Product Catalog. SCINODE&apos;s sales and marketing team uses your catalog to build targeted campaigns, identify the right buyers, and generate qualified opportunities exclusively for your products.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToCatalog}
              className="dc-primary-btn flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
            >
              <Plus size={14} /> Add Products
            </button>
            <button
              onClick={onGoToCatalog}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[#1a5c3a] text-[#1a5c3a] text-[13px] font-semibold hover:bg-[#f0fdf4] transition-all"
            >
              Go To Product Catalog <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* VERTICAL SEPARATOR */}
        <div className="w-px bg-[#fde68a] self-stretch" />

        {/* RIGHT — Setup progress steps */}
        <div className="w-[260px] flex-shrink-0 px-6 py-7 flex flex-col justify-center gap-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">SETUP PROGRESS</p>
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={i} className="flex gap-3">
                {/* Icon + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: s.done ? "#e3f5ec" : "#f8fafc",
                      border: s.done ? "none" : "2px solid #e2e8f0",
                    }}>
                    {s.done
                      ? <Check size={11} style={{ color: "#1a5c3a" }} strokeWidth={3} />
                      : <Circle size={7} className="text-[#e2e8f0]" fill="#e2e8f0" />
                    }
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 my-1" style={{ background: s.done ? "#6ee7b7" : "#e2e8f0", minHeight: 20 }} />
                  )}
                </div>
                {/* Label */}
                <div className={cn("pb-4 min-w-0", isLast && "pb-0")}>
                  <p className={cn("text-[12.5px] font-semibold leading-tight", s.done ? "text-slate-800" : "text-slate-400")}>
                    {s.label}
                  </p>
                  {!s.done && i === 1 && (
                    <p className="text-[11px] text-amber-600 font-medium mt-0.5">Required next</p>
                  )}
                </div>
              </div>
            );
          })}
          {/* Progress bar */}
          <div className="mt-4 pt-4 border-t border-[#f3f4f6]">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] text-slate-400">Completion</p>
              <p className="text-[11px] font-bold" style={{ color: "#1a5c3a" }}>25%</p>
            </div>
            <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "25%", background: "#1a5c3a" }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── State 3 — Product selection (LEFT PANEL) ─────────────────────────────────

function ProductSelectionPanel({ onContinue }: { onContinue: (ids: number[]) => void }) {
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
    return pid ? CATALOG_PRODUCTS.find((p) => p.id === pid) ?? null : null;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Section label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">STAR PRODUCT SELECTION</p>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <button
          disabled={selectedIds.length === 0}
          onClick={() => onContinue(selectedIds)}
          className={cn(
            "ml-3 flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-bold transition-all",
            selectedIds.length > 0
              ? "text-white hover:brightness-110 active:scale-[0.98]"
              : "text-slate-400 bg-slate-100 cursor-not-allowed"
          )}
          style={selectedIds.length > 0 ? { background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" } : undefined}
        >
          Continue <ArrowRight size={13} />
        </button>
      </div>

      {/* Slot tracker */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[14px] font-bold text-slate-900">Select Your Spotlight Five Products</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Choose up to 5 products that SCINODE should actively market</p>
          </div>
          <span
            className="text-[13px] font-bold px-3 py-1.5 rounded-full"
            style={{
              background: selectedIds.length === 5 ? "#e3f5ec" : "#fef9c3",
              color: selectedIds.length === 5 ? "#1a5c3a" : "#92400e",
            }}
          >
            {selectedIds.length} / 5
          </span>
        </div>

        {/* Visual slots */}
        <div className="flex gap-2 mb-2">
          {slots.map((product, i) => (
            <div
              key={i}
              className="flex-1 h-[54px] rounded-xl border-2 flex flex-col items-center justify-center transition-all"
              style={{
                borderStyle: product ? "solid" : "dashed",
                borderColor: product ? "#1a5c3a" : "#e2e8f0",
                background: product ? "#f0fdf4" : "#f8fafc",
              }}
            >
              {product ? (
                <>
                  <Star size={11} style={{ color: "#1a5c3a" }} fill="#1a5c3a" />
                  <p className="text-[9px] font-semibold text-[#1a5c3a] mt-0.5 px-1 text-center leading-tight truncate w-full text-center">
                    {product.name.split(" ").slice(0, 2).join(" ")}
                  </p>
                </>
              ) : (
                <span className="text-[11px] text-slate-300 font-bold">{i + 1}</span>
              )}
            </div>
          ))}
        </div>
        {selectedIds.length === 5 && (
          <p className="text-[11.5px] font-semibold" style={{ color: "#1a5c3a" }}>
            ✓ All 5 star products selected — ready to continue
          </p>
        )}
      </div>

      {/* Catalog table */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6]">
          <p className="text-[13px] font-bold text-slate-800">Your Product Catalog</p>
          <button className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            View Full Catalog <ChevronRight size={13} />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              {["", "Product", "Industry", "Readiness", "Action"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 px-4 py-3 first:w-10">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATALOG_PRODUCTS.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              const isDisabled = !isSelected && selectedIds.length >= 5;
              return (
                <tr
                  key={p.id}
                  className={cn("border-b border-[#f9fafb] transition-all", isSelected ? "bg-[#f0fdf4]" : "hover:bg-[#f9fafb]", isDisabled && "opacity-40")}
                >
                  <td className="px-4 py-3">
                    <div
                      onClick={() => !isDisabled && toggle(p.id)}
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all",
                        isSelected ? "bg-[#1a5c3a] border-[#1a5c3a]" : "border-[#e2e8f0] bg-white",
                        isDisabled && "cursor-not-allowed"
                      )}
                    >
                      {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-slate-800">{p.name}</p>
                    <p className="text-[10.5px] font-mono text-slate-400 mt-0.5">CAS {p.cas}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11.5px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">{p.industry}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[#f3f4f6] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.readiness}%`,
                            background: p.readiness >= 85 ? "#1a5c3a" : p.readiness >= 70 ? "#ca8a04" : "#dc2626",
                          }}
                        />
                      </div>
                      <ReadinessBadge score={p.readiness} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={isDisabled}
                      onClick={() => !isDisabled && toggle(p.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all",
                        isSelected
                          ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                          : isDisabled
                          ? "border-[#e2e8f0] text-slate-300 cursor-not-allowed"
                          : "border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#f0fdf4]"
                      )}
                    >
                      {isSelected ? <><Minus size={10} /> Remove</> : <><Star size={10} /> Select</>}
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

// ─── State 4 — Launch Campaign (LEFT PANEL) ───────────────────────────────────

function LaunchPanel({ onLaunch }: { onLaunch: () => void }) {
  const [launchIds, setLaunchIds] = useState<number[]>(
    STATE4_PRODUCTS.filter((p) => p.launch).map((p) => p.id)
  );
  const [launched, setLaunched] = useState(false);

  const toggleLaunch = (id: number) => {
    setLaunchIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const readyCount     = STATE4_PRODUCTS.filter((p) => p.status === "ready").length;
  const attentionCount = STATE4_PRODUCTS.filter((p) => p.status === "attention").length;

  const handleStart = () => {
    setLaunched(true);
    onLaunch();
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Section label */}
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">CAMPAIGN WORKSPACE</p>
        <div className="flex-1 h-px bg-slate-100" />
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ background: "#e3f5ec", color: "#1a5c3a" }}
        >
          <CheckCircle2 size={10} /> Setup Complete
        </span>
      </div>

      {/* Readiness summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Selected Products", value: STATE4_PRODUCTS.length, bg: "#f8fafc",   color: "#0f172a"  },
          { label: "Campaign Ready",    value: readyCount,             bg: "#f0fdf4",   color: "#166534"  },
          { label: "Needs Attention",   value: attentionCount,         bg: "#fffbeb",   color: "#92400e"  },
        ].map((m) => (
          <div key={m.label} className="rounded-xl p-4 border border-[#e4e4e7]" style={{ background: m.bg }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">{m.label}</p>
            <p className="text-[28px] font-black leading-none" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#f3f4f6]">
          <p className="text-[13px] font-bold text-slate-800">Selected Star Products</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              {["Product", "Industry", "Readiness", "Status", "Missing", "Action"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STATE4_PRODUCTS.map((p) => (
              <tr key={p.id} className="border-b border-[#f9fafb] hover:bg-[#f9fafb] transition-all">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Star size={10} style={{ color: "#1a5c3a" }} fill="#1a5c3a" />
                    <div>
                      <p className="text-[12.5px] font-semibold text-slate-800">{p.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">{p.industry}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.readiness}%`, background: p.readiness >= 85 ? "#1a5c3a" : "#ca8a04" }} />
                    </div>
                    <ReadinessBadge score={p.readiness} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  {p.status === "ready" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#dcfce7] text-[#166534]">
                      <CheckCircle2 size={9} /> Campaign Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef9c3] text-[#92400e]">
                      <AlertCircle size={9} /> Needs Attention
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.missing.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.missing.map((m) => (
                        <span key={m} className="text-[10px] bg-[#fee2e2] text-[#991b1b] px-1.5 py-0.5 rounded">{m}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.missing.length > 0 ? (
                    <button className="text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border border-[#fde68a] text-[#92400e] bg-[#fffbeb] hover:bg-[#fef9c3] transition-all flex items-center gap-1">
                      Complete Details <ChevronRight size={10} />
                    </button>
                  ) : (
                    <span className="text-[11.5px] font-semibold text-[#1a5c3a] flex items-center gap-1">
                      <CheckCircle2 size={12} /> Complete
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Launch section */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
        <div
          className="px-5 py-4 border-b border-[#e4e4e7] flex items-center gap-3"
          style={{ background: "linear-gradient(98deg,#f0fdf4 0%,#e8f5f0 100%)" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#1a5c3a" }}>
            <Rocket size={15} className="text-white" />
          </div>
          <div>
            <p className="text-[13.5px] font-bold text-slate-900">Launch Demand Catalyst</p>
            <p className="text-[11.5px] text-slate-500">Choose which Star Products to include in this campaign launch</p>
          </div>
        </div>

        <div className="p-5">
          {launched ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#e3f5ec" }}>
                <CheckCircle2 size={26} style={{ color: "#1a5c3a" }} />
              </div>
              <p className="text-[15px] font-bold text-slate-800 mb-2">Campaign Launched! 🎉</p>
              <p className="text-[12.5px] text-slate-400 mb-4 max-w-[360px] leading-relaxed">
                SCINODE&apos;s team has been notified and will begin campaign planning within 24 hours.
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={{ background: "#e3f5ec", color: "#1a5c3a" }}
              >
                <Activity size={11} />
                Moving to Campaign Planning →
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 mb-5">
                {STATE4_PRODUCTS.map((p) => {
                  const included = launchIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                        included ? "border-[#1a5c3a] bg-[#f0fdf4]" : "border-[#e4e4e7] bg-white hover:bg-[#f9fafb]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                          included ? "bg-[#1a5c3a] border-[#1a5c3a]" : "border-[#e2e8f0] bg-white"
                        )}
                        onClick={() => toggleLaunch(p.id)}
                      >
                        {included && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-slate-800 truncate">{p.name}</p>
                          {p.status === "attention" && (
                            <span className="text-[10px] bg-[#fef9c3] text-[#92400e] px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                              Needs Attention
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{p.industry} · Readiness {p.readiness}%</p>
                      </div>
                      <ReadinessBadge score={p.readiness} />
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#f3f4f6]">
                <p className="text-[12.5px] text-slate-500">
                  <span className="font-bold text-slate-800">{launchIds.length}</span> product{launchIds.length !== 1 ? "s" : ""} selected for launch
                </p>
                <button
                  disabled={launchIds.length === 0}
                  onClick={handleStart}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all",
                    launchIds.length > 0
                      ? "text-white hover:brightness-110 active:scale-[0.98]"
                      : "text-slate-400 bg-slate-100 cursor-not-allowed"
                  )}
                  style={launchIds.length > 0 ? { background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" } : undefined}
                >
                  <Rocket size={14} /> Start Campaign
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DemandCatalyst() {
  const [demoState, setDemoState]       = useState<DemoState>("state1");
  const [modalOpen, setModalOpen]       = useState(false);
  const [bannerHighlighted, setBannerHighlighted] = useState(false);
  const [launched, setLaunched]         = useState(false);

  const openModal = () => {
    setBannerHighlighted(true);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setBannerHighlighted(false), 800);
  };

  // KPI data per state
  const kpiData: KpiData = (() => {
    if (demoState === "state4" && launched) {
      return { campaignsStarted: 1, starProducts: "3 / 5", opportunities: 0, stage: "Campaign Planning", launched: true };
    }
    if (demoState === "state4") {
      return { campaignsStarted: 0, starProducts: "5 / 5", opportunities: 0, stage: "Ready to Launch"  };
    }
    if (demoState === "state3") {
      return { campaignsStarted: 0, starProducts: "0 / 5", opportunities: 0, stage: "Select Products"  };
    }
    if (demoState === "state2") {
      return { campaignsStarted: 0, starProducts: "0 / 5", opportunities: 0, stage: "Getting Started"  };
    }
    return   { campaignsStarted: 0, starProducts: "0 / 5", opportunities: 0, stage: "Getting Started"  };
  })();

  // Active timeline step per state
  const activeStep = (() => {
    if (demoState === "state4" && launched) return "planning";
    if (demoState === "state4")             return "planning";
    if (demoState === "state3")             return "star";
    if (demoState === "state2")             return "catalog";
    return "catalog";
  })();

  // Reset launched when changing state
  useEffect(() => { setLaunched(false); }, [demoState]);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <style dangerouslySetInnerHTML={{ __html: SHINE_STYLE }} />
      {/* ── Page header ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#e4e4e7]">
        <div className="flex items-center justify-between px-6 py-3 max-w-[1300px] mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0d2818,#091510)" }}
            >
              <Megaphone size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-900 leading-tight">Demand Catalyst</p>
              <p className="text-[10.5px] text-slate-400">Managed B2B Growth Service</p>
            </div>
          </div>

          {/* Demo switcher */}
          <DemoStateSwitcher current={demoState} onChange={(s) => setDemoState(s)} />
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-[1300px] mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Hero */}
        <div className="flex items-start justify-between gap-8">
          {/* Left — heading + subtext */}
          <div className="max-w-[780px]">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest mb-3"
              style={{ background: "#e3f5ec", color: "#1a5c3a" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              MANAGED B2B GROWTH SERVICE
            </div>
            <h1 className="text-[26px] font-black text-slate-900 leading-tight mb-3 whitespace-nowrap">
              Turn Your Products Into Qualified Global Opportunities
            </h1>
            <p className="text-[14px] text-slate-500 leading-relaxed max-w-[680px]">
              SCINODE&apos;s sales and marketing teams actively promote your selected products, generate buyer demand, and deliver exclusive opportunities directly to you.
            </p>
          </div>

          {/* Right — CTAs */}
          <div className="flex-shrink-0 flex flex-row items-center gap-3 pt-1">
            <button
              onClick={() => demoState === "state1" && setDemoState("state2")}
              className="dc-primary-btn flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}
            >
              Add Product <ArrowRight size={14} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e4e4e7] text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-all">
              <Play size={12} /> Watch Demo
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <KpiCards data={kpiData} />

        {/* How It Works — horizontal flow */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">HOW DEMAND CATALYST WORKS</p>
          <div className="flex items-center overflow-x-auto pb-1">
            {[
              { icon: Package,   label: "Product Catalog",    sub: "Your products",          color: "#64748b", bg: "#f1f5f9" },
              { icon: Star,      label: "Star Products",       sub: "Up to 5 selected",       color: "#1a5c3a", bg: "#e3f5ec" },
              { icon: Layers,    label: "Campaign Planning",   sub: "SCINODE team prepares",  color: "#2563eb", bg: "#dbeafe" },
              { icon: Megaphone, label: "Campaign Execution",  sub: "Multi-channel outreach", color: "#9333ea", bg: "#ede9fe" },
              { icon: Target,    label: "Lead Finalization",   sub: "Buyer qualification",    color: "#ca8a04", bg: "#fef9c3" },
              { icon: Award,     label: "Opportunities",       sub: "Delivered to you",       color: "#7c3aed", bg: "#ede9fe" },
            ].map((s, i, arr) => {
              const Icon = s.icon;
              return (
                <React.Fragment key={s.label}>
                  <div className="flex flex-col items-center gap-2 min-w-[100px] flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                      <Icon size={16} style={{ color: s.color }} />
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] font-semibold text-slate-800 leading-tight">{s.label}</p>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">{s.sub}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-shrink-0 flex items-center pb-5">
                      <div className="w-6 h-px" style={{ background: "repeating-linear-gradient(90deg,#cbd5e1 0,#cbd5e1 3px,transparent 3px,transparent 7px)" }} />
                      <ChevronRight size={11} className="text-slate-300 -ml-1" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* State 2 — full-width blocker card above the layout */}
        {demoState === "state2" && (
          <NoCatalogCard onGoToCatalog={() => setDemoState("state3")} />
        )}

        {/* 70 / 30 layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-stretch">

          {/* LEFT — 70% */}
          <div className="lg:col-span-7 flex flex-col">
            {(demoState === "state1" || demoState === "state2") && (
              <EmptyStatePanel onGetStarted={() => setDemoState("state2")} />
            )}
            {demoState === "state3" && (
              <ProductSelectionPanel onContinue={() => setDemoState("state4")} />
            )}
            {demoState === "state4" && (
              <LaunchPanel onLaunch={() => setLaunched(true)} />
            )}
          </div>

          {/* RIGHT — 30% */}
          <div className="lg:col-span-3 flex flex-col">
            <RightPanel
              activeStep={activeStep}
              onLearnMore={openModal}
              bannerHighlighted={bannerHighlighted}
            />
          </div>
        </div>
      </div>

      {/* Benefits modal */}
      {modalOpen && <BenefitsModal onClose={closeModal} />}
    </div>
  );
}
