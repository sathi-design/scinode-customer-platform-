"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Megaphone, Star, Package, ArrowRight, ChevronRight,
  Plus, X, CheckCircle2, Crown, Zap, Check, Globe,
  Users, Target, BarChart3, ShieldCheck, Radio,
  Lock, Layers, AlertCircle, TrendingUp, Activity,
  MapPin, Send, Calendar, ChevronDown, ChevronUp, BarChart2,
  FileText, PhoneCall, Info, Upload, ArrowUpRight, Search,
  Rocket, Building2, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore } from "@/store/useProfileStore";
import type { Product } from "@/modules/profile/types";
import { DrawerBase } from "@/modules/profile/DrawerBase";
import { FormField, inputCls, selectCls, DropdownSelect, ChipGroup, PillInput, DrawerFooter } from "@/modules/profile/SharedUI";
import { Products as ProfileProductsTab, ProfileAddProductDrawer } from "@/modules/profile/tabs/Products";
import { INDUSTRIES, PRODUCT_GRADES, MOQ_UNITS, INVENTORY_UNITS } from "@/modules/profile/constants";

// ─── Demo product data ────────────────────────────────────────────────────────

const DEMO_PRODUCTS: Product[] = [
  { id: "dc-p1", name: "Triethyl Phosphate",    casNo: "78-40-0",    industry: "Flame Retardants",    grade: "Technical",      purity: "99.5", moq: "200", moqUnit: "kg", inventoryStatus: "In inventory",  availableQty: "1000", availableUnit: "kg", availableLocation: "GIDC, Gujarat",       crackedChemistry: true,  workedOnProduct: true  },
  { id: "dc-p2", name: "Triethyl Citrate",      casNo: "77-93-0",    industry: "Food Additives",      grade: "Food Grade",     purity: "99.5", moq: "100", moqUnit: "kg", inventoryStatus: "In inventory",  availableQty: "500",  availableUnit: "kg", availableLocation: "Ankleshwar, Gujarat", crackedChemistry: true,  workedOnProduct: true  },
  { id: "dc-p3", name: "Sodium Bromide",        casNo: "7647-15-6",  industry: "Water Treatment",     grade: "Industrial",     purity: "99.0", moq: "500", moqUnit: "kg", inventoryStatus: "Made to order", availableQty: "",     availableUnit: "kg", availableLocation: "",                   crackedChemistry: false, workedOnProduct: true  },
  { id: "dc-p6", name: "Tetrahydrofuran",       casNo: "109-99-9",   industry: "Specialty Chemicals", grade: "Anhydrous",  purity: "99.9", moq: "200", moqUnit: "kg", inventoryStatus: "In inventory",  availableQty: "40000", availableUnit: "kg", availableLocation: "GIDC, Gujarat",      crackedChemistry: true,  workedOnProduct: true  },
  { id: "dc-p4", name: "Ascorbic Acid USP",     casNo: "50-81-7",    industry: "Nutraceuticals",  grade: "USP Grade",      purity: "99.0", moq: "250", moqUnit: "kg", inventoryStatus: "In inventory",  availableQty: "800",  availableUnit: "kg", availableLocation: "Vadodara, Gujarat",   crackedChemistry: false, workedOnProduct: true  },
  { id: "dc-p5", name: "Caffeine Anhydrous EP", casNo: "58-08-2",    industry: "Nutraceuticals",  grade: "EP Grade",       purity: "99.5", moq: "50",  moqUnit: "kg", inventoryStatus: "In inventory",  availableQty: "200",  availableUnit: "kg", availableLocation: "Mumbai",              crackedChemistry: true,  workedOnProduct: true  },
];

// ─── Empty Campaign Products (used when campaign just started, no data yet) ────

const EMPTY_CAMPAIGN_PRODUCTS: CampaignProduct[] = [
  { id: "thf", name: "Tetrahydrofuran",   shortName: "THF",  cas: "109-99-9",  industry: "Specialty Chemicals", stage: "Setup for Demand", stageIndex: 1, health: 0, healthLevel: "Fair", leads: 0, mqls: 0, countries: [], dayActive: 0, totalDays: 90, dotColor: "#2ACB83", weeklyTrend: [0,0,0,0,0,0], actionRequired: "Complete Setup" },
  { id: "tep", name: "Triethyl Phosphate", shortName: "TEP", cas: "78-40-0",   industry: "Flame Retardants",   stage: "Setup for Demand", stageIndex: 1, health: 0, healthLevel: "Fair", leads: 0, mqls: 0, countries: [], dayActive: 0, totalDays: 90, dotColor: "#0077CC", weeklyTrend: [0,0,0,0,0,0], actionRequired: "Complete Setup" },
  { id: "tec", name: "Triethyl Citrate",   shortName: "TEC", cas: "77-93-0",   industry: "Food Additives",     stage: "Setup for Demand", stageIndex: 1, health: 0, healthLevel: "Fair", leads: 0, mqls: 0, countries: [], dayActive: 0, totalDays: 90, dotColor: "#6237C7", weeklyTrend: [0,0,0,0,0,0], actionRequired: "Complete Setup" },
  { id: "snb", name: "Sodium Bromide",     shortName: "NaBr", cas: "7647-15-6", industry: "Water Treatment",   stage: "Setup for Demand", stageIndex: 1, health: 0, healthLevel: "Fair", leads: 0, mqls: 0, countries: [], dayActive: 0, totalDays: 90, dotColor: "#f59e0b", weeklyTrend: [0,0,0,0,0,0], actionRequired: "Complete Setup" },
];

// ─── Demo scene ───────────────────────────────────────────────────────────────

type Scene = "day0" | "s1-3" | "s2-2" | "s2-5" | "s3-active" | "non-premium";

const SCENES: { id: Scene; label: string }[] = [
  { id: "day0",        label: "Day 0 — No Products"   },
  { id: "s1-3",        label: "4 Products, No Stars"  },
  { id: "non-premium", label: "Non-Premium User"      },
  { id: "s3-active",   label: "Active Campaign"       },
];

function sceneProducts(s: Scene): Product[] {
  if (s === "day0") return [];
  if (s === "s1-3") return DEMO_PRODUCTS.slice(0, 4);
  if (s === "s2-2") return DEMO_PRODUCTS.slice(0, 4);
  if (s === "non-premium") return DEMO_PRODUCTS.slice(0, 4);
  if (s === "s3-active") return DEMO_PRODUCTS;
  return DEMO_PRODUCTS;
}

function sceneStarIds(s: Scene): Set<string> {
  if (s === "s2-2") return new Set(["dc-p1", "dc-p2"]);
  if (s === "s2-5") return new Set(DEMO_PRODUCTS.map(p => p.id));
  if (s === "s3-active") return new Set(DEMO_PRODUCTS.map(p => p.id));
  return new Set();
}

// ─── Demo Scene Switcher (matches Deep Research style) ────────────────────────

function DcSceneSwitcher({ scene, onChange }: { scene: Scene; onChange: (s: Scene) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 whitespace-nowrap">DEMO</span>
      <div className="flex items-center gap-0.5 bg-white border border-[#e4e4e7] rounded-lg p-1">
        {SCENES.map(s => (
          <button key={s.id} onClick={() => onChange(s.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-[11.5px] font-semibold transition-all whitespace-nowrap",
              scene === s.id ? "bg-[#020202] text-white" : "text-slate-500 hover:text-slate-800"
            )}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Plan Banner (matches Deep Research plan banner exactly) ──────────────────

function PlanBanner({ starCount, productCount, onDismiss }: { starCount: number; productCount: number; onDismiss?: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-[10px] bg-[#0e0e0e] border"
      style={{ borderColor: "rgba(201,162,39,0.40)" }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(245,200,66,0.18)" }}>
          <Crown size={13} style={{ color: "#f5c842" }} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12.5px] font-semibold text-white">Free Plan Active</span>
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold"
            style={{ background: "rgba(42,203,131,0.18)", border: "1px solid rgba(110,231,183,0.22)", color: "#6ee7b7" }}>
            Demand Catalyst
          </span>
          <span className="text-[12px] text-white/40">
            Star products:{" "}
            <span style={{ color: "#f5c842" }}>{starCount} / 5</span>
            {productCount > 0 && (
              <> &nbsp;·&nbsp; {productCount} product{productCount !== 1 ? "s" : ""} in catalogue</>
            )}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:brightness-110 whitespace-nowrap"
          style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)", color: "#020202" }}>
          <Zap size={12} /> Upgrade to Premium
        </button>
        {onDismiss && (
          <button onClick={onDismiss} className="text-white/40 hover:text-white/80 transition-colors p-1">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Workspace Cards (matches Deep Research WorkspaceCards exactly) ───────────

const WORKSPACE_CARD_DATA = [
  {
    id: "catalogue",
    tag: "PRODUCT CATALOGUE",
    Icon: Package,
    iconBg: "#e3f5ec",
    iconColor: "#1a5c3a",
    title: "Add Your Products",
    description: "Add products to your catalogue — synced automatically with Profile → Product Catalogue. One source of truth across the platform.",
    features: ["Product Name & CAS", "Grade & Purity", "MOQ & Status", "Inventory Location"],
    cta: "Add Product",
  },
  {
    id: "stars",
    tag: "STAR PRODUCTS",
    Icon: Star,
    iconBg: "#fef9c3",
    iconColor: "#ca8a04",
    title: "Select Star Products",
    description: "Nominate up to 5 products from your catalogue for SCINODE to actively promote to qualified global buyers.",
    features: ["Up to 5 nominations", "Campaign readiness check", "Update anytime", "You stay in control"],
    cta: "Select Star Products",
    requiresProducts: true,
  },
];

function WorkspaceCards({
  hasProducts, onAddProduct, onSelectStars,
}: {
  hasProducts: boolean; onAddProduct: () => void; onSelectStars: () => void;
}) {
  const handlers = [onAddProduct, onSelectStars];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {WORKSPACE_CARD_DATA.map((w, idx) => {
        const locked = w.requiresProducts && !hasProducts;
        const Icon = w.Icon;
        return (
          <div key={w.id}
            className={cn(
              "bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200",
              locked
                ? "border-[#e4e4e7] opacity-60"
                : "cursor-pointer group border-[#e4e4e7] hover:border-[#1a5c3a] hover:shadow-[0_4px_20px_rgba(26,92,58,0.12)] hover:-translate-y-0.5"
            )}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-2">
                <span className="text-[9.5px] font-bold tracking-[0.14em] text-slate-400">{w.tag}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: w.iconBg }}>
                  <Icon size={20} style={{ color: w.iconColor }} />
                </div>
              </div>
              {locked ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center border shrink-0"
                  style={{ background: "rgba(148,163,184,0.08)", borderColor: "rgba(148,163,184,0.25)" }}>
                  <Lock size={12} className="text-slate-400" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 text-slate-300 group-hover:border-[#1a5c3a] group-hover:text-[#1a5c3a] transition-colors shrink-0">
                  <ArrowRight size={13} />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 mb-1.5 leading-tight">{w.title}</h3>
              <p className="text-[12.5px] text-slate-500 leading-relaxed">{w.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {w.features.map(f => (
                <span key={f} className="flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded"
                  style={{ background: "#f0fdf4", color: "#1a5c3a" }}>
                  <CheckCircle2 size={9} /> {f}
                </span>
              ))}
            </div>
            {locked ? (
              <p className="text-[11.5px] text-slate-400 mt-auto">Add products first to unlock star selection.</p>
            ) : (
              <button
                onClick={handlers[idx]}
                className="w-full py-2 rounded-lg text-[12.5px] font-bold text-white transition-all duration-200 hover:brightness-110 mt-auto"
                style={{ background: "#1F6F54" }}>
                {w.cta}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Demand Catalyst Right Panel (matches DeepResearchBannerCard exactly) ─────

function DemandCatalystPanel({ onHowItWorks }: { onHowItWorks: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{
        background: "linear-gradient(160deg,#0d2818 0%,#0a1e10 55%,#091510 100%)",
        border: "1px solid rgba(110,231,183,0.18)",
      }}>
      <div className="relative flex-1 px-5 pt-6 pb-5 flex flex-col gap-4 overflow-hidden">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -bottom-10 -right-10 w-[180px] h-[180px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(42,203,131,0.22) 0%,transparent 70%)", filter: "blur(32px)" }} />
        <div className="pointer-events-none absolute top-0 -left-8 w-[140px] h-[140px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(26,92,58,0.35) 0%,transparent 70%)", filter: "blur(28px)" }} />

        {/* NEW badge */}
        <div className="relative z-10 self-start">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.12em] border"
            style={{ background: "rgba(42,203,131,0.15)", borderColor: "rgba(42,203,131,0.30)", color: "#6ee7b7" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            NEW
          </span>
        </div>

        {/* Heading */}
        <div className="relative z-10 flex flex-col gap-2">
          <h3 className="text-white text-[18px] font-bold leading-snug">
            Accelerate Your Growth with Demand Catalyst
          </h3>
          <p className="text-white/55 text-[12.5px] leading-relaxed">
            SCINODE&apos;s sales team works for you — generating demand, qualifying buyers, and delivering exclusive opportunities.
          </p>
        </div>

        {/* Bullets */}
        <div className="relative z-10 flex flex-col gap-2">
          {[
            "Dedicated sales outreach team",
            "Multi-channel marketing campaigns",
            "Qualified lead delivery",
            "Zero business development effort",
          ].map(item => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(42,203,131,0.18)" }}>
                <CheckCircle2 size={9} style={{ color: "#6ee7b7" }} />
              </div>
              <span className="text-[12px] text-white/70 leading-snug">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative z-10 pt-1">
          <button onClick={onHowItWorks}
            className="w-full py-2.5 rounded-xl text-[#0d2818] text-[13px] font-bold flex items-center justify-center gap-2 hover:brightness-105 transition-all"
            style={{ background: "#6ee7b7" }}>
            How It Works <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 border-t"
        style={{ borderColor: "rgba(110,231,183,0.10)", background: "rgba(0,0,0,0.20)" }}>
        {[
          { value: "2,400+", label: "Verified Suppliers" },
          { value: "18K+",   label: "Projects Completed" },
          { value: "60+",    label: "Countries" },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <div className="flex flex-col">
              <span className="text-[17px] font-black text-white leading-none">{s.value}</span>
              <span className="text-[10px] text-white/40 mt-0.5">{s.label}</span>
            </div>
            {i < arr.length - 1 && <div className="w-px h-7 bg-white/10" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── How It Works Modal (matches Deep Research HowItWorksModal) ────────────────

const HOW_STEPS = [
  {
    n: "01", Icon: Package, iconBg: "#e3f5ec", iconColor: "#1a5c3a",
    title: "Add Products & Select Stars",
    intro: "First add products to your Product Catalogue, then nominate up to 5 as star products for SCINODE to promote.",
    bullets: [
      "Add products to your Product Catalogue",
      "Synced with Profile → Product Catalogue",
      "Nominate up to 5 as star products",
      "Campaign readiness review included",
    ],
    outcome: "Your star products are locked in and campaign-ready.",
  },
  {
    n: "02", Icon: Megaphone, iconBg: "#ede9fe", iconColor: "#7c3aed",
    title: "SCINODE Runs Campaigns",
    intro: "Our dedicated sales and marketing team handles everything — outreach, targeting, lead qualification — entirely managed.",
    bullets: [
      "Dedicated specialists reach qualified buyers",
      "Campaigns across pharma, biotech & chemicals",
      "Market intelligence drives targeting",
      "Every lead verified for genuine intent",
    ],
    outcome: "SCINODE does the BD work. You focus on fulfillment.",
  },
  {
    n: "03", Icon: Target, iconBg: "#f0fdf4", iconColor: "#1a5c3a",
    title: "Receive Verified Opportunities",
    intro: "Qualified buyer opportunities arrive in your dashboard with full context and recommended next steps.",
    bullets: [
      "Verified buyer profile — company & role",
      "Product match rationale and intent notes",
      "Recommended next steps and guidance",
      "Tracked end-to-end inside SCINODE",
    ],
    outcome: "Exclusive, qualified, context-rich — ready to act on.",
  },
];

const WHY_BENEFITS = [
  { icon: Users,       bg: "#e3f5ec", color: "#1a5c3a", title: "Dedicated Sales Team",    desc: "Human specialists who know your buyers reach out on your behalf." },
  { icon: Radio,       bg: "#ede9fe", color: "#7c3aed", title: "Multi-Channel Campaigns", desc: "Campaigns across pharma, biotech, and chemical markets worldwide."  },
  { icon: BarChart3,   bg: "#dbeafe", color: "#1d4ed8", title: "Campaign Analytics",      desc: "Track reach, engagement and opportunity delivery in real time."       },
  { icon: Target,      bg: "#fef9c3", color: "#ca8a04", title: "Qualified Lead Delivery", desc: "Verified buyers delivered with context, intent and next steps."       },
  { icon: ShieldCheck, bg: "#f0fdf4", color: "#1a5c3a", title: "SCINODE Shield",          desc: "Only intent-confirmed, verified buyers reach your dashboard."         },
  { icon: Globe,       bg: "#f1f5f9", color: "#64748b", title: "Global Buyer Network",    desc: "Access buyers across 60+ countries via SCINODE's established network." },
];

function HowItWorksModal({ onClose, onAddProduct }: {
  onClose: () => void; onAddProduct: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(5px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[860px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Dark header */}
        <div className="relative px-6 pt-6 pb-6" style={{ background: "linear-gradient(135deg,#0d2818,#0a1e10)" }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border border-white/20 text-white/60 hover:text-white transition-colors">
            <X size={13} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold mb-4"
            style={{ background: "rgba(26,92,58,0.50)", border: "1px solid rgba(110,231,183,0.25)", color: "#6ee7b7" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            HOW DEMAND CATALYST WORKS
          </div>
          <h2 className="text-white text-[22px] font-bold leading-tight mb-2">
            See How Demand Catalyst Works
          </h2>
          <p className="text-white/60 text-[13px] leading-relaxed max-w-[560px]">
            Select your products — SCINODE&apos;s team handles demand generation, buyer qualification, and opportunity delivery end to end.
          </p>
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-white/10">
            {[
              { value: "2,400+", label: "Verified Suppliers" },
              { value: "60+",    label: "Countries Reached"  },
              { value: "18K+",   label: "Projects Completed" },
              { value: "100%",   label: "Managed for You"    },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[17px] font-black text-white leading-none">{s.value}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">

          {/* Steps */}
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            HOW IT WORKS — IN DETAIL
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_STEPS.map(step => {
              const Icon = step.Icon;
              return (
                <div key={step.n} className="rounded-xl border border-[#e4e4e7] overflow-hidden">
                  <div className="flex items-start gap-3 p-4 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ background: "#e3f5ec", color: "#1a5c3a" }}>{step.n}</div>
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: step.iconBg }}>
                        <Icon size={14} style={{ color: step.iconColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-slate-900 leading-tight">{step.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.intro}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="grid grid-cols-1 gap-1.5">
                      {step.bullets.map(b => (
                        <div key={b} className="flex items-start gap-2">
                          <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: "#e3f5ec" }}>
                            <Check size={8} style={{ color: "#1a5c3a" }} strokeWidth={3} />
                          </div>
                          <span className="text-[11.5px] text-slate-600 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                      <CheckCircle2 size={12} style={{ color: "#1a5c3a" }} />
                      <p className="text-[11.5px] font-semibold" style={{ color: "#1a5c3a" }}>{step.outcome}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Why section */}
          <div className="rounded-xl border border-[#e4e4e7] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-0.5">
                WHY SUPPLIERS CHOOSE DEMAND CATALYST
              </p>
              <h3 className="text-[14px] font-bold text-slate-900">Your Products. Our Effort. Your Growth.</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WHY_BENEFITS.map(b => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#f3f4f6]"
                    style={{ background: "#fafafa" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: b.bg }}>
                      <Icon size={14} style={{ color: b.color }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800 mb-0.5">{b.title}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 pt-1">
            <button onClick={() => { onAddProduct(); onClose(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-bold hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
              Add Product <ArrowRight size={14} />
            </button>
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Product Drawer ───────────────────────────────────────────────────────

const EMPTY_FORM: Omit<Product, "id"> = {
  name: "", casNo: "", industry: "", grade: "", purity: "",
  moq: "", moqUnit: "kg", inventoryStatus: "Made to order",
  availableQty: "", availableUnit: "kg", availableLocation: "",
  crackedChemistry: false, workedOnProduct: false,
};

function AddProductDrawer({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (p: Product) => void;
}) {
  return (
    <DrawerBase open={open} onClose={onClose} title="Product Catalogue" width={940}>
      {/* Full Products tab — exact same UI, search, filters, DC demo, DC banner, table */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <ProfileProductsTab onNext={() => { onClose(); }} onBack={onClose} />
      </div>
    </DrawerBase>
  );
}

// ─── Star Slots Bar ───────────────────────────────────────────────────────────

function StarSlotsBar({ starCount, productCount, onStartCampaign, onAdd }: {
  starCount: number; productCount: number;
  onStartCampaign: () => void; onAdd: () => void;
}) {
  const MAX      = 5;
  const hasStars = starCount > 0;
  const maxed    = starCount >= MAX;

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] px-5 py-4 flex items-center gap-5 flex-wrap">
      <div className="flex items-center gap-1.5 shrink-0">
        {Array.from({ length: MAX }).map((_, i) => (
          <div key={i} className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
            i < starCount ? "bg-[#1a5c3a]"
              : i < productCount ? "border-2 border-dashed border-[#cbd5e1] bg-white"
                : "bg-[#f3f4f6] border border-[#e4e4e7]"
          )}>
            {i < starCount && <Star size={11} fill="white" className="text-white" />}
          </div>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        {!hasStars && (
          <>
            <p className="text-[13px] font-semibold text-slate-700">
              {productCount} product{productCount !== 1 ? "s" : ""} in your catalogue
            </p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Click ☆ on products below to nominate them as star products and start your campaign.
              {productCount < MAX && <> · <button onClick={onAdd} className="text-[#1a5c3a] font-semibold hover:underline">Add {MAX - productCount} more</button> to fill all 5 slots.</>}
            </p>
          </>
        )}
        {hasStars && !maxed && (
          <>
            <p className="text-[13px] font-semibold text-slate-700">
              {starCount} star product{starCount !== 1 ? "s" : ""} selected
              <span className="text-slate-400 font-normal"> · {MAX - starCount} slot{MAX - starCount !== 1 ? "s" : ""} remaining</span>
            </p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              {productCount < MAX
                ? <><button onClick={onAdd} className="text-[#1a5c3a] font-semibold hover:underline">Add {MAX - productCount} more products</button> to maximise your campaign reach.</>
                : "Click ☆ on more products to expand your campaign."}
            </p>
          </>
        )}
        {maxed && (
          <>
            <p className="text-[13px] font-semibold text-[#1a5c3a]">All 5 star products selected — campaign ready</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Click to start your Demand Chain.</p>
          </>
        )}
      </div>
      {hasStars && (
        <button onClick={onStartCampaign}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold shrink-0 transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
          Start Campaign with {starCount} Product{starCount !== 1 ? "s" : ""}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Products Table with Star Toggles ─────────────────────────────────────────

function ProductsTable({ products, starredIds, onToggleStar, onAdd }: {
  products: Product[]; starredIds: Set<string>;
  onToggleStar: (id: string) => void; onAdd: () => void;
}) {
  const canAddStar = starredIds.size < 5;
  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
        <div>
          <p className="text-[13px] font-bold text-slate-800">Your Products</p>
          <p className="text-[11.5px] text-slate-400 mt-0.5">
            {products.length} product{products.length !== 1 ? "s" : ""} · Click ☆ to nominate as a star product
          </p>
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e4e4e7] text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <Plus size={13} /> Add Product
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
            <th className="w-12 py-3 px-4 text-center">
              <Star size={11} className="text-slate-300 mx-auto" />
            </th>
            {["Product Name", "CAS Number", "Industry", "Grade", "Purity", "MOQ", "Status"].map(h => (
              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => {
            const isStarred = starredIds.has(p.id);
            const isInInv   = p.inventoryStatus === "In inventory";
            return (
              <tr key={p.id}
                className="border-b border-[#f9fafb] last:border-0 transition-colors hover:bg-[#fffbeb]/50"
                style={{ background: isStarred ? "#fffbeb" : idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => onToggleStar(p.id)}
                    disabled={!isStarred && !canAddStar}
                    className="transition-transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isStarred ? "Remove star" : canAddStar ? "Nominate as star product" : "Maximum 5 stars reached"}>
                    <Star size={17} fill={isStarred ? "#f59e0b" : "none"}
                      className={isStarred ? "text-[#f59e0b]" : "text-slate-300 hover:text-[#f59e0b]"} />
                  </button>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {isStarred && <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] flex-shrink-0" />}
                    <p className="text-[13px] font-semibold text-slate-900">{p.name}</p>
                  </div>
                </td>
                <td className="py-3 px-4"><span className="text-[12px] text-slate-500 font-mono">{p.casNo || "—"}</span></td>
                <td className="py-3 px-4">
                  <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded"
                    style={{ background: "#f0fdf4", color: "#1a5c3a" }}>{p.industry || "—"}</span>
                </td>
                <td className="py-3 px-4"><span className="text-[12px] text-slate-500">{p.grade || "—"}</span></td>
                <td className="py-3 px-4"><span className="text-[12px] text-slate-500">{p.purity ? `${p.purity}%` : "—"}</span></td>
                <td className="py-3 px-4"><span className="text-[12px] text-slate-500">{p.moq ? `${p.moq} ${p.moqUnit}` : "—"}</span></td>
                <td className="py-3 px-4">
                  <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full",
                    isInInv ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#4b5563]")}>
                    {isInInv ? "In Inventory" : "Made to Order"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Campaign Started Panel ───────────────────────────────────────────────────

function CampaignStartedPanel({ starredIds, products }: { starredIds: Set<string>; products: Product[] }) {
  const starred = products.filter(p => starredIds.has(p.id));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border"
        style={{ background: "#f0fdf4", borderColor: "rgba(42,203,131,0.30)" }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
          <CheckCircle2 size={20} className="text-white" />
        </div>
        <div>
          <p className="text-[14.5px] font-bold" style={{ color: "#1a5c3a" }}>
            Demand Chain started with {starred.length} star product{starred.length !== 1 ? "s" : ""} 🎉
          </p>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            SCINODE&apos;s team has been notified and will begin campaign planning within 24 hours.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
          <p className="text-[12.5px] font-bold text-slate-700">Star Products in Campaign</p>
        </div>
        {starred.map((p, i) => (
          <div key={p.id}
            className={cn("flex items-center gap-3 px-5 py-3.5 border-b border-[#f9fafb] last:border-0",
              i % 2 === 0 ? "bg-white" : "bg-[#fafafa]")}>
            <Star size={15} fill="#f59e0b" className="text-[#f59e0b] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800">{p.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{p.industry} · {p.casNo}</p>
            </div>
            <span className="flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded shrink-0"
              style={{ background: "#f0fdf4", color: "#1a5c3a" }}>
              <CheckCircle2 size={9} /> In Campaign
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAMPAIGN COMMAND CENTER — s3-active scene
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Campaign data ────────────────────────────────────────────────────────────

type CampaignStage = "Setup for Demand" | "Execution Planning" | "Demand Generation" | "Opportunities Pipeline";
type HealthLevel   = "Strong" | "Fair" | "Weak";

interface CampaignProduct {
  id: string;
  name: string;
  shortName: string;
  cas: string;
  industry: string;
  stage: CampaignStage;
  stageIndex: number; // 1–4
  health: number;
  healthLevel: HealthLevel;
  leads: number;
  mqls: number;
  countries: string[];
  dayActive: number;
  totalDays: number;
  actionRequired?: string;
  dotColor: string;
  weeklyTrend?: number[];
}

const ACTIVE_CAMPAIGN_PRODUCTS: CampaignProduct[] = [
  {
    id: "thf",
    name: "Tetrahydrofuran",
    shortName: "THF",
    cas: "109-99-9",
    industry: "Specialty Chemicals",
    stage: "Setup for Demand",
    stageIndex: 1,
    health: 0,
    healthLevel: "Fair",
    leads: 0,
    mqls: 0,
    countries: [],
    dayActive: 2,
    totalDays: 90,
    actionRequired: "Complete Setup",
    dotColor: "#2ACB83",
    weeklyTrend: [0, 0, 0, 0, 0, 0],
  },
  {
    id: "tep",
    name: "Triethyl Phosphate",
    shortName: "TEP",
    cas: "78-40-0",
    industry: "Flame Retardants",
    stage: "Execution Planning",
    stageIndex: 2,
    health: 64,
    healthLevel: "Fair",
    leads: 6,
    mqls: 38,
    countries: ["🇫🇷 France", "🇮🇳 India"],
    dayActive: 12,
    totalDays: 90,
    dotColor: "#0077CC",
    weeklyTrend: [0, 1, 2, 1, 1, 1],
  },
  {
    id: "tec",
    name: "Triethyl Citrate",
    shortName: "TEC",
    cas: "77-93-0",
    industry: "Food Additives",
    stage: "Opportunities Pipeline",
    stageIndex: 4,
    health: 88,
    healthLevel: "Strong",
    leads: 36,
    mqls: 207,
    countries: ["🇯🇵 Japan", "🇦🇪 UAE", "🇩🇪 Germany"],
    dayActive: 46,
    totalDays: 90,
    dotColor: "#6237C7",
    weeklyTrend: [4, 5, 7, 8, 11, 13],
  },
  {
    id: "snb",
    name: "Sodium Bromide",
    shortName: "NaBr",
    cas: "7647-15-6",
    industry: "Water Treatment",
    stage: "Setup for Demand",
    stageIndex: 1,
    health: 91,
    healthLevel: "Strong",
    leads: 52,
    mqls: 180,
    countries: ["🇩🇪 Germany", "🇺🇸 USA", "🇯🇵 Japan"],
    dayActive: 71,
    totalDays: 90,
    dotColor: "#f59e0b",
    weeklyTrend: [5, 7, 9, 11, 10, 10],
  },
];

const STAGES: CampaignStage[] = ["Setup for Demand", "Execution Planning", "Demand Generation", "Opportunities Pipeline"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STAGE_META: Record<CampaignStage, { bg: string; color: string; icon: string }> = {
  "Setup for Demand":  { bg: "#f3f4f6", color: "#4b5563", icon: "⚙️" },
  "Execution Planning": { bg: "#dbeafe", color: "#1d4ed8", icon: "🔍" },
  "Demand Generation": { bg: "#dcfce7", color: "#166534", icon: "📡" },
  "Opportunities Pipeline":     { bg: "#ede9fe", color: "#6d28d9", icon: "🎯" },
};

function stagePill(stage: CampaignStage, size: "sm" | "md" = "sm") {
  const s = STAGE_META[stage];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-semibold",
      size === "md" ? "px-2.5 py-1 text-[12px]" : "px-2 py-0.5 text-[11px]"
    )} style={{ background: s.bg, color: s.color }}>
      {stage}
    </span>
  );
}

function healthColor(h: number) {
  if (h >= 80) return "#166534";
  if (h >= 65) return "#1d4ed8";
  return "#b45309";
}

function healthBg(h: number) {
  if (h >= 80) return "#dcfce7";
  if (h >= 65) return "#dbeafe";
  return "#fef3c7";
}

function healthBar(h: number) {
  const color = h >= 80 ? "#2ACB83" : h >= 65 ? "#0077CC" : "#f59e0b";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${h}%`, background: color }} />
      </div>
      <span className="text-[12px] font-bold" style={{ color: healthColor(h) }}>{h}</span>
    </div>
  );
}

// ─── Stage Stepper ────────────────────────────────────────────────────────────

function StageNode({ n, label, state }: { n: number; label: string; state: "done" | "active" | "pending" }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all",
        state === "done"   ? "bg-[#1a5c3a] border-[#1a5c3a] text-white"
        : state === "active" ? "bg-white border-[#2ACB83] text-[#1a5c3a] shadow-[0_0_0_3px_rgba(42,203,131,0.18)]"
        : "bg-slate-50 border-slate-200 text-slate-300"
      )}>
        {state === "done" ? <Check size={13} strokeWidth={3} /> : n}
      </div>
      <span className={cn(
        "text-[10px] text-center leading-tight whitespace-nowrap",
        state === "done"   ? "text-[#1a5c3a] font-semibold"
        : state === "active" ? "text-slate-900 font-bold"
        : "text-slate-400"
      )}>{label}</span>
    </div>
  );
}

function StageLine({ done }: { done: boolean }) {
  return (
    <div className="flex-1 h-0.5 rounded-full" style={{ marginTop: "-20px", background: done ? "#2ACB83" : "#e5e7eb" }} />
  );
}

function StageStepper({ stageIndex }: { stageIndex: number }) {
  return (
    <div className="flex items-start gap-0">
      {STAGES.map((s, i) => {
        const state: "done" | "active" | "pending" =
          i + 1 < stageIndex ? "done" : i + 1 === stageIndex ? "active" : "pending";
        return (
          <React.Fragment key={s}>
            <StageNode n={i + 1} label={s} state={state} />
            {i < STAGES.length - 1 && <StageLine done={i + 1 < stageIndex} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}


// ─── Setup for Demand View (Stage 1) ─────────────────────────────────────────

function SetupForDemandView({ product }: { product: CampaignProduct }) {
  const [completeness] = useState(100);
  const sections = [
    { label: "Identity",             pct: 45, color: "#1a5c3a",  fields: ["Product Name", "CAS Number", "Industry", "Grade", "Purity", "MOQ"] },
    { label: "Commercial Readiness", pct: 30, color: "#0077CC",  fields: ["Availability", "Production Capacity", "Price", "Packaging", "Lead Time", "Incoterms"] },
    { label: "Documents",            pct: 25, color: "#6237C7",  fields: ["COA (required)", "MSDS (optional)", "TDS (optional)", "Compliance Certs"] },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Info strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl px-4 py-3 border" style={{ background: "#dbeafe", borderColor: "#bfdbfe" }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-1.5 text-[#1d4ed8]">What Happens Next</p>
          <p className="text-[12px] text-slate-700 leading-relaxed">Once submitted, SCINODE reviews your product and builds a market opportunity plan within <strong>3–5 business days</strong>.</p>
        </div>
        <div className="rounded-xl px-4 py-3 border" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-1.5 text-[#166534]">What We Need From You</p>
          <p className="text-[12px] text-slate-700 leading-relaxed">Complete all mandatory fields below. Optional fields increase your product&apos;s discovery score and buyer match rate.</p>
        </div>
        <div className="rounded-xl px-4 py-3 border" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-1.5 text-[#166534]">Autosave Active</p>
          <p className="text-[12px] text-slate-700 leading-relaxed">Changes are saved automatically. You can keep editing until you <strong>submit for SCINODE review</strong>.</p>
        </div>
      </div>

      {/* Product completeness sidebar + form */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: completeness gauge */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Product Completeness</p>
          {/* Donut */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="#2ACB83" strokeWidth="8"
                  strokeDasharray={`${Math.round((completeness / 100) * 201)} 201`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[16px] font-black text-slate-900 leading-none">{completeness}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "#dcfce7", color: "#166534" }}>Strong</span>
          </div>
          {/* Section bars */}
          <div className="flex flex-col gap-3">
            {sections.map(s => (
              <div key={s.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-700">{s.label}</span>
                  <span className="text-[11px] text-slate-400">{s.pct}/45</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "100%", background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            Mandatory fields → ~85. Add optionals (MSDS/TDS, extra certs, unique capabilities) to reach Strong.
          </p>
        </div>

        {/* Right: form panels */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Identity */}
          <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#e3f5ec" }}>
                  <Package size={12} style={{ color: "#1a5c3a" }} />
                </div>
                <p className="text-[13px] font-bold text-slate-800">Identity</p>
              </div>
              <span className="text-[10.5px] font-bold text-[#1a5c3a]">45% · all mandatory</span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Product Name</label>
                <input readOnly value={product.name}
                  className="w-full rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2ACB83]" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">CAS Number</label>
                <input readOnly value={product.cas}
                  className="w-full rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] font-mono text-slate-900 bg-slate-50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Industry</label>
                <div className="rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] text-slate-900 bg-slate-50">{product.industry}</div>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Grade</label>
                <div className="rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] text-slate-900 bg-slate-50">Anhydrous</div>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Purity (%)</label>
                <input readOnly defaultValue="99.9"
                  className="w-full rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] text-slate-900 bg-slate-50 focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">MOQ (Minimum Order Quantity)</label>
                <div className="flex gap-2">
                  <input readOnly defaultValue="200"
                    className="flex-1 rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] text-slate-900 bg-slate-50 focus:outline-none" />
                  <div className="rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] text-slate-700 bg-slate-50">kg</div>
                </div>
              </div>
            </div>
          </div>

          {/* Commercial Readiness */}
          <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#dbeafe" }}>
                  <TrendingUp size={12} style={{ color: "#1d4ed8" }} />
                </div>
                <p className="text-[13px] font-bold text-slate-800">Commercial Readiness</p>
              </div>
              <span className="text-[10.5px] font-bold text-[#1d4ed8]">30%</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {/* Availability toggle */}
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-2">Commercial Availability</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Made to Order", sub: "Produced on demand" },
                    { label: "In Inventory",  sub: "Ready stock available" },
                  ].map((opt, i) => (
                    <div key={opt.label}
                      className={cn(
                        "rounded-lg border-2 px-4 py-3 cursor-pointer transition-all",
                        i === 0 ? "border-[#1a5c3a] bg-[#f0fdf4]" : "border-[#e4e4e7] bg-white"
                      )}>
                      <p className="text-[12.5px] font-bold text-slate-800">{opt.label}</p>
                      <p className="text-[11px] text-slate-400">{opt.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Production Capacity</label>
                  <div className="flex gap-2">
                    <input readOnly defaultValue="40"
                      className="flex-1 rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] bg-slate-50 focus:outline-none" />
                    <div className="rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] bg-slate-50 text-slate-600">MT</div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Price</label>
                  <input readOnly defaultValue="₹190/kg"
                    className="w-full rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] bg-slate-50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Lead Time</label>
                  <input readOnly defaultValue="3–4 weeks"
                    className="w-full rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] bg-slate-50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Incoterms</label>
                  <div className="rounded-lg border border-[#e4e4e7] px-3 py-2 text-[13px] bg-slate-50 text-slate-700">FOB</div>
                </div>
              </div>
              {/* Unique capabilities */}
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-2">Unique Capabilities <span className="font-normal text-slate-400">optional</span></label>
                <div className="flex gap-2 flex-wrap">
                  {["GMP route", "Low metal residue", "Custom packaging", "Cold chain", "FSSC 22000", "Halal certified"].map((c, i) => (
                    <span key={c}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[11.5px] font-medium border cursor-pointer transition-all",
                        i < 3 ? "border-[#1a5c3a] bg-[#f0fdf4] text-[#1a5c3a]" : "border-[#e4e4e7] bg-white text-slate-500 hover:border-slate-400"
                      )}>{c}</span>
                  ))}
                </div>
              </div>
              {/* Target Countries */}
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Target Countries <span className="font-normal text-slate-400">drives certificate recommendations</span></label>
                <div className="flex gap-2 flex-wrap">
                  {["🇩🇪 Germany", "🇫🇷 France", "🇺🇸 USA", "🇯🇵 Japan", "🇦🇪 UAE", "🇸🇦 Saudi Arabia", "🇮🇳 India", "🇸🇬 Singapore"].map((c, i) => (
                    <span key={c}
                      className={cn(
                        "px-3 py-1 rounded-full text-[11.5px] font-medium border cursor-pointer transition-all",
                        i < 5 ? "border-[#1a5c3a] bg-[#f0fdf4] text-[#1a5c3a]" : "border-[#e4e4e7] bg-white text-slate-500 hover:border-slate-400"
                      )}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6]" style={{ background: "#f9fafb" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#ede9fe" }}>
                  <FileText size={12} style={{ color: "#6d28d9" }} />
                </div>
                <p className="text-[13px] font-bold text-slate-800">Documents</p>
              </div>
              <span className="text-[10.5px] font-bold text-[#6d28d9]">25%</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-3">A · Product-Level Documents</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "COA", required: true,  uploaded: true  },
                    { label: "MSDS", required: false, uploaded: true  },
                    { label: "TDS",  required: false, uploaded: true  },
                  ].map(d => (
                    <div key={d.label}
                      className="rounded-xl border-2 px-4 py-3 flex flex-col gap-1"
                      style={{ borderColor: d.uploaded ? "#bbf7d0" : "#e4e4e7", background: d.uploaded ? "#f0fdf4" : "#fafafa" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-slate-800">{d.label}</span>
                        {d.required && (
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">Required</span>
                        )}
                        {!d.required && (
                          <span className="text-[9px] font-medium text-slate-400 uppercase">optional</span>
                        )}
                      </div>
                      {d.uploaded && (
                        <div className="flex items-center gap-1 text-[11px] text-[#166534] font-medium">
                          <Check size={11} strokeWidth={3} /> Uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">B · Compliance Certificates <span className="font-normal text-slate-300">(≥1 required)</span></p>
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#e4e4e7] text-[11px] text-slate-600 hover:bg-slate-50">
                    <Globe size={10} /> Recommended for my markets
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { name: "REACH Registration", authority: "ECHA", scope: "Product" },
                    { name: "ISO 9001",            authority: "BIS",  scope: "Plant" },
                  ].map(cert => (
                    <div key={cert.name} className="grid grid-cols-5 gap-2 items-center">
                      <input readOnly value={cert.name}
                        className="col-span-2 rounded-lg border border-[#e4e4e7] px-3 py-2 text-[12.5px] bg-slate-50 focus:outline-none" />
                      <input readOnly value={cert.authority}
                        className="rounded-lg border border-[#e4e4e7] px-3 py-2 text-[12.5px] bg-slate-50 focus:outline-none" />
                      <div className="flex gap-1">
                        {["Product", "Plant"].map((s, si) => (
                          <span key={s}
                            className={cn(
                              "flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer",
                              cert.scope === s ? "border-[#1a5c3a] bg-[#1a5c3a] text-white" : "border-[#e4e4e7] text-slate-500 hover:bg-slate-50"
                            )}>{s}</span>
                        ))}
                      </div>
                      <button className="flex items-center justify-center h-8 w-8 rounded-lg border border-[#e4e4e7] text-slate-300 hover:text-red-400 hover:border-red-200 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <button className="mt-1 flex items-center gap-1.5 text-[12px] text-[#1a5c3a] font-semibold hover:underline">
                    <Plus size={13} /> Add Another Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl border border-[#e4e4e7] bg-white">
            <p className="text-[12px] text-slate-400">Changes autosave · You can keep editing until you Accept the plan in Stage 2</p>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold hover:brightness-110 transition-all"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#0d3d26)" }}>
              Continue to Map the Market <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Demand Generation View (Stage 3) ─────────────────────────────────────────

function DemandGenerationView({ product }: { product: CampaignProduct }) {
  const [weekTab, setWeekTab] = useState<"all" | "w1" | "w2" | "w3">("w1");

  return (
    <div className="flex flex-col gap-4">
      {/* Info strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { bg: "#dbeafe", border: "#bfdbfe", label: "EXPECTED FIRST SIGNALS", labelColor: "#1d4ed8",
            text: "Enquiries typically begin in 2–4 weeks once your campaign goes live." },
          { bg: "#f0fdf4", border: "#bbf7d0", label: "WHAT WE NEED FROM YOU", labelColor: "#166534",
            text: "• Respond to enquiries within 24h\n• Dispatch samples within 5 days" },
          { bg: "#ede9fe", border: "#ddd6fe", label: "HONESTY IS THE PLAN", labelColor: "#6d28d9",
            text: "We say expected first signals, never guaranteed leads." },
        ].map(b => (
          <div key={b.label} className="rounded-xl px-4 py-3 border"
            style={{ background: b.bg, borderColor: b.border }}>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-1.5"
              style={{ color: b.labelColor }}>{b.label}</p>
            <p className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line">{b.text}</p>
          </div>
        ))}
      </div>

      {/* Week tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          {([["all", "All"], ["w1", "Week 1"], ["w2", "Week 2"], ["w3", "Week 3"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setWeekTab(id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition-all",
                weekTab === id ? "bg-[#020202] border-[#020202] text-white" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
              )}>{label}</button>
          ))}
        </div>
        <span className="text-[11.5px] text-slate-400">
          Showing <strong className="text-slate-700">Week 1</strong> · All sums every week
        </span>
      </div>

      {/* Two-engine split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Sales Engine */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#f3f4f6]">
            <Users size={16} className="text-[#1a5c3a]" />
            <p className="text-[13px] font-bold text-slate-800">Sales Engine</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="rounded-xl px-5 py-4" style={{ background: "#020202" }}>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.1em] mb-1">Sales Reachout</p>
              <p className="text-[30px] font-black text-[#2ACB83] leading-none">31</p>
              <p className="text-[11px] text-white/40 mt-1">buyers contacted</p>
              <p className="text-[10.5px] text-white/30 mt-0.5">2 sales captains deployed · 3 meetings booked</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Sales Force", val: "2", sub: "deployed" }, { label: "Meetings", val: "3", sub: "booked" }].map(m => (
                <div key={m.label} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em]">{m.label}</p>
                  <p className="text-[20px] font-black text-slate-900">{m.val}</p>
                  <p className="text-[10px] text-slate-400">{m.sub}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-2">Reachout Bifurcation</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-2">By Geography</p>
                  {[["🇩🇪 Germany","45%"],["🇺🇸 USA","29%"],["🇯🇵 Japan","16%"],["🇮🇳 India","10%"]].map(([c,p]) => (
                    <div key={c} className="flex justify-between text-[10.5px] py-0.5">
                      <span className="text-slate-600">{c}</span>
                      <strong className="text-slate-800">{p}</strong>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-2">By Company Size</p>
                  {[["Small","19%","#2ACB83"],["Mid Size","35%","#0077CC"],["Enterprise","46%","#6237C7"]].map(([c,p,color]) => (
                    <div key={c} className="flex justify-between text-[10.5px] py-0.5">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />{c}
                      </span>
                      <strong className="text-slate-800">{p}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Leads from Sales Engine</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#dcfce7", color: "#166534" }}>1 total</span>
              </div>
              <div className="rounded-xl border border-[#e4e4e7] p-4 bg-[#fafafa]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-semibold">🇩🇪 Germany</span>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#fef3c7", color: "#b45309" }}>Awaiting Proposal</span>
                </div>
                <div className="flex gap-4 text-[11px] mb-3">
                  <span className="text-slate-400">Quantity <strong className="text-slate-700 block">8 MT</strong></span>
                  <span className="text-slate-400">Date <strong className="text-slate-700 block">Jun 2, 2026</strong></span>
                  <span className="text-slate-400">Source <strong className="text-slate-700 block">Sales Engine</strong></span>
                </div>
                <button className="w-full py-2 rounded-lg text-[12px] font-bold text-white"
                  style={{ background: "#1a5c3a" }}>Send Proposal</button>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Engine */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#f3f4f6]">
            <Activity size={16} className="text-[#0077CC]" />
            <p className="text-[13px] font-bold text-slate-800">Digital Engine</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: "#b45309" }}>Paid Channels</p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f3f4f6]">
                      {["Channel","Clicks","MQL","Leads"].map(h => (
                        <th key={h} className="text-left text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 pb-1.5 pr-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[11.5px]">
                    {[["Website","520","18","2"],["Scinode","240","13","3"],["Other","110","3","0"]].map(r => (
                      <tr key={r[0]} className="border-b border-[#f9fafb] last:border-0">
                        <td className="py-1.5 text-slate-500 pr-2">{r[0]}</td>
                        <td className="py-1.5 text-slate-600 pr-2">{r[1]}</td>
                        <td className="py-1.5 text-slate-600 pr-2">{r[2]}</td>
                        <td className="py-1.5 font-bold text-slate-800">{r[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: "#0077CC" }}>Organic Channels</p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f3f4f6]">
                      {["Channel","Clicks","MQL","Leads"].map(h => (
                        <th key={h} className="text-left text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400 pb-1.5 pr-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[11.5px]">
                    {[["LinkedIn","360","9","1"],["Google","610","12","1"],["Others","130","2","0"]].map(r => (
                      <tr key={r[0]} className="border-b border-[#f9fafb] last:border-0">
                        <td className="py-1.5 text-slate-500 pr-2">{r[0]}</td>
                        <td className="py-1.5 text-slate-600 pr-2">{r[1]}</td>
                        <td className="py-1.5 text-slate-600 pr-2">{r[2]}</td>
                        <td className="py-1.5 font-bold text-slate-800">{r[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Total Clicks", val: "1,970" }, { label: "Total MQLs", val: "57" }].map(m => (
                <div key={m.label} className="rounded-xl px-4 py-3" style={{ background: "#020202" }}>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.08em]">{m.label}</p>
                  <p className="text-[22px] font-black text-[#2ACB83]">{m.val}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Leads from Digital Engine</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#dcfce7", color: "#166534" }}>1 total</span>
              </div>
              <div className="rounded-xl border border-[#e4e4e7] p-4 bg-[#fafafa]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-semibold">🇯🇵 Japan</span>
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#dbeafe", color: "#1d4ed8" }}>Sample Requested</span>
                </div>
                <div className="flex gap-4 text-[11px] mb-3">
                  <span className="text-slate-400">Quantity <strong className="text-slate-700 block">5 MT</strong></span>
                  <span className="text-slate-400">Date <strong className="text-slate-700 block">Jun 4, 2026</strong></span>
                  <span className="text-slate-400">Via <strong className="text-slate-700 block">Google Ads</strong></span>
                </div>
                <button className="w-full py-2 rounded-lg text-[12px] font-medium border border-[#e4e4e7] text-slate-600 hover:bg-slate-50 transition-colors">
                  Dispatch Sample
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Opportunity Scan View (Stage 2) ─────────────────────────────────────────

function OpportunityScanView({ product }: { product: CampaignProduct }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Info strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl px-4 py-3 border" style={{ background: "#dbeafe", borderColor: "#bfdbfe" }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-1.5 text-[#1d4ed8]">Expected First Signals</p>
          <p className="text-[12px] text-slate-700 leading-relaxed">Enquiries typically begin in <strong>2–4 weeks</strong> once your campaign goes live.</p>
        </div>
        <div className="rounded-xl px-4 py-3 border" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-1.5 text-[#166534]">What We Need From You</p>
          <p className="text-[12px] text-slate-700 leading-relaxed">• Respond within <strong>24h</strong><br />• Dispatch samples within <strong>5 days</strong></p>
        </div>
        <div className="rounded-xl px-4 py-3 border" style={{ background: "#fef3c7", borderColor: "#fde68a" }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-1.5 text-[#b45309]">Campaign Paused</p>
          <p className="text-[12px] text-slate-700 leading-relaxed">Your market plan is ready. <strong>Accept to start demand generation.</strong></p>
        </div>
      </div>

      {/* Accept plan bar */}
      <div className="rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: "#f9fafb", borderColor: "rgba(42,203,131,0.30)" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "#dcfce7", color: "#166534" }}>● Plan Published</span>
          <span className="text-[12.5px] text-slate-500">You can still edit Stage 1 details until you Accept the plan.</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#e4e4e7] text-[12.5px] text-slate-600 hover:bg-slate-50 transition-colors">
            <PhoneCall size={13} /> Schedule a Call
          </button>
          <button className="px-5 py-2 rounded-lg text-[12.5px] font-bold text-white"
            style={{ background: "#1a5c3a" }}>Accept Plan</button>
        </div>
      </div>

      {/* Market verdict + search volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5">
          <p className="text-[13px] font-bold text-slate-800 mb-0.5">Market Verdict by Country</p>
          <p className="text-[11.5px] text-slate-400 mb-4">Our read on demand strength in each of your target markets</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { flag: "🇩🇪", name: "Germany", verdict: "Strong Demand", bg: "#dcfce7", color: "#166534" },
              { flag: "🇮🇳", name: "India",   verdict: "Emerging",      bg: "#dbeafe", color: "#1d4ed8" },
              { flag: "🇫🇷", name: "France",  verdict: "Emerging",      bg: "#dbeafe", color: "#1d4ed8" },
              { flag: "🇦🇪", name: "UAE",     verdict: "Weak Demand",   bg: "#fef3c7", color: "#b45309" },
            ].map(m => (
              <div key={m.name} className="flex items-center justify-between rounded-xl border border-[#f3f4f6] px-3 py-2.5 bg-slate-50">
                <span className="text-[12.5px] font-medium text-slate-700">{m.flag} {m.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: m.bg, color: m.color }}>{m.verdict}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-2">Present Search Volume</p>
            <p className="text-[26px] font-black text-slate-900 leading-none">1,240 <span className="text-[16px] font-semibold">monthly searches</span></p>
            <p className="text-[12px] font-semibold mt-1" style={{ color: "#2ACB83" }}>↑ 18% vs prior 90 days</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex-1">
            <p className="text-[13px] font-bold text-slate-800 mb-3">Market Signals</p>
            {[
              "Three EU distributors posted RFQs for flame-retardant intermediates this quarter.",
              "A Japanese trading house is actively sourcing alternatives to a single-origin China supply.",
              "US specialty-chem buyers are shifting toward REACH-ready Indian suppliers.",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#2ACB83" }} />
                <p className="text-[12px] text-slate-600 leading-snug">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel mix */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5">
        <p className="text-[13px] font-bold text-slate-800 mb-0.5">Recommended Channel Mix</p>
        <p className="text-[11.5px] text-slate-400 mb-4">How SCINODE will reach buyers for this product</p>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Paid Channels", color: "#b45309", chips: ["Website", "Scinode", "Other"] },
            { label: "Organic Channels", color: "#0077CC", chips: ["LinkedIn", "Google", "Others"] },
          ].map(g => (
            <div key={g.label}>
              <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] mb-2" style={{ color: g.color }}>{g.label}</p>
              <div className="flex gap-2 flex-wrap">
                {g.chips.map(c => (
                  <span key={c} className="px-3 py-1 rounded-lg border border-[#e4e4e7] text-[12px] text-slate-600 bg-slate-50">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Opportunities Pipeline View (Stage 4) ───────────────────────────────────

// Opportunity project cards — exclusive, matched for TEC's profile
const OPP_PIPELINE_PROJECTS = [
  {
    id: 201,
    image: "https://images.unsplash.com/photo-1563890523851-3e1fc9d4be3b?w=600&q=80",
    industry: "Food & Beverage",
    title: "Triethyl Citrate Supply for Beverage Additive Formulation",
    qty: "12–15 MT/mo",
    flag: "🇩🇪", country: "Germany",
    postedDate: "Jun 4, 2026",
    matchLabel: "Matched specifically for your manufacturing profile",
  },
  {
    id: 202,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
    industry: "Pharmaceuticals",
    title: "TEC as Plasticiser in Pharmaceutical Film Coating",
    qty: "5–8 MT/mo",
    flag: "🇯🇵", country: "Japan",
    postedDate: "Jun 7, 2026",
    matchLabel: "Matched specifically for your manufacturing profile",
  },
  {
    id: 203,
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80",
    industry: "Specialty Chemicals",
    title: "Industrial Grade TEC for UAE Polymer Compounding",
    qty: "8–10 MT/qtr",
    flag: "🇦🇪", country: "UAE",
    postedDate: "Jun 9, 2026",
    matchLabel: "Matched specifically for your manufacturing profile",
  },
];

// Country opportunity counts (right panel)
const OPP_COUNTRY_DATA = [
  { flag: "🇩🇪", name: "Germany", count: 19, color: "#f59e0b",  mapPctX: 52.7, mapPctY: 24.0 },
  { flag: "🇯🇵", name: "Japan",   count: 11, color: "#0077CC",  mapPctX: 86.5, mapPctY: 32.0 },
  { flag: "🇦🇪", name: "UAE",     count: 6,  color: "#6237C7",  mapPctX: 63.0, mapPctY: 40.0 },
];

function OpportunitiesPipelineView({ product, onStageClick }: { product: CampaignProduct; onStageClick?: (s: CampaignStage) => void }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5">

      {/* Stage hero + timeline */}
      <StageHeroCard
        product={product}
        stageLabel="Opportunities Pipeline"
        stageNum="Stage 4 of 4"
        headline="Buyers Are Being Delivered to You"
        subtext="Exclusive matched opportunities are ready — review each enquiry and submit your proposal to begin negotiation."
        statusDot="#2ACB83"
        statusText="Leads Incoming"
        metrics={[
          { label: "Total Opportunities", value: "36" },
          { label: "Proposals Sent",      value: "14" },
          { label: "Won",                 value: "3"  },
        ]}
        ctaLabel="Schedule a Call"
        onStageClick={onStageClick}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Opportunities", value: "36", sub: "qualified buyer enquiries", col: "#1F6F54" },
          { label: "Proposals Sent",      value: "14", sub: "4 awaiting response",       col: "#0077CC" },
          { label: "In Negotiation",      value: "7",  sub: "active discussions",        col: "#f59e0b" },
          { label: "Won",                 value: "3",  sub: "orders confirmed",           col: "#1F6F54" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-[#e4e4e7] bg-white px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2 text-slate-400">{k.label}</p>
            <p className="text-[26px] font-black leading-none" style={{ color: k.col }}>{k.value}</p>
            <p className="text-[11px] mt-1 text-slate-400">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* 70 / 30 — Opportunity cards left, Country map right */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "60% 40%" }}>

        {/* LEFT 70% — Opportunity project cards */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-slate-900">Matched Opportunities</p>
              <p className="text-[12px] text-slate-400 mt-0.5">Exclusive buyer enquiries matched to your product — submit a proposal to proceed</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold"
              style={{ background: "rgba(42,203,131,0.12)", color: "#1a5c3a", border: "1px solid rgba(42,203,131,0.25)" }}>
              ● {OPP_PIPELINE_PROJECTS.length} new
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {OPP_PIPELINE_PROJECTS.map(proj => (
              <div key={proj.id}
                className="group relative cursor-pointer h-full"
                onClick={() => router.push(`/dashboard/projects/${proj.id}`)}>

                {/* Hover gradient border */}
                <div className="absolute -inset-[1.5px] rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg,#1F6F54 0%,#2ACB83 40%,#1F6F54 70%,#2dd194 100%)", backgroundSize: "300% 300%" }} />

                {/* Card body */}
                <div className="relative bg-white rounded-[12px] p-[10px] flex flex-col overflow-hidden h-full shadow-[0px_4px_6px_0px_rgba(0,0,0,0.08)] group-hover:shadow-[0px_16px_32px_rgba(31,111,84,0.15)] group-hover:pb-12 transition-[box-shadow,padding] duration-300">

                  {/* Image */}
                  <div className="relative overflow-hidden rounded-[10px] h-[148px] bg-slate-100 flex-shrink-0 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proj.image} alt={proj.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
                    <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
                      style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.50) 0%,transparent 100%)" }} />

                    {/* Exclusive pill only — as per new card spec */}
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center gap-1 px-2 py-[3px] rounded-full text-[9px] font-bold"
                        style={{ background: "linear-gradient(135deg,#111,#1a1400)", color: "#f5c842", border: "1px solid #c9a22766", backdropFilter: "blur(4px)" }}>
                        <span style={{ fontSize: 9 }}>⭐</span> Exclusive
                      </div>
                    </div>
                  </div>

                  {/* Industry pill */}
                  <div className="mb-2">
                    <span className="inline-flex items-center px-[9px] py-[2px] rounded-full bg-[#e3f4ff] text-[#171717] text-[11.5px] font-medium leading-[22px]">
                      {proj.industry}
                    </span>
                  </div>

                  {/* Project name */}
                  <h3 className="font-semibold text-[14px] leading-snug text-black line-clamp-2 mb-2">{proj.title}</h3>
                  <p className="text-[10.5px] italic text-[#1F6F54]/70 leading-snug mb-2">{proj.matchLabel}</p>

                  {/* Meta rows */}
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] leading-none">{proj.flag}</span>
                      <span className="text-[11.5px] text-[#353535] font-medium">{proj.country}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">📦</span>
                      <span className="text-[11.5px] text-[#353535]">Qty: <strong>{proj.qty}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">🗓</span>
                      <span className="text-[11px] text-slate-400">Posted {proj.postedDate}</span>
                    </div>
                  </div>

                  {/* Hover CTA — Submit Proposal */}
                  <div className="absolute bottom-3 left-[10px] right-[10px] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/dashboard/projects/${proj.id}`); }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-[8px] text-[12px] font-bold text-white transition-colors"
                      style={{ background: "#1F6F54" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#185C45")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#1F6F54")}>
                      Submit Proposal <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT 30% — Country opportunity map */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-[#f3f4f6]">
            <p className="text-[13px] font-bold text-slate-900">Opportunities by Country</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">Where enquiries are coming from</p>
          </div>

          {/* Country list */}
          <div className="px-4 py-3 flex flex-col gap-3">
            {OPP_COUNTRY_DATA.map(c => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] leading-none">{c.flag}</span>
                  <span className="text-[12.5px] font-semibold text-slate-700 flex-1">{c.name}</span>
                  <span className="text-[13px] font-extrabold" style={{ color: c.color }}>{c.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#f3f4f6] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((c.count / OPP_COUNTRY_DATA[0].count) * 100)}%`, background: c.color }} />
                </div>
                <p className="text-[10px] text-slate-400">{c.count} opportunities</p>
              </div>
            ))}
          </div>

          {/* World map — flush, fills the rest of the card */}
          <div className="flex-1 relative overflow-hidden bg-[#f8fafc]" style={{ minHeight: 160 }}>
            <p className="absolute top-3 left-4 z-10 text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Geographic Distribution
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/world-map.svg" alt="world map"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.55, filter: "brightness(0) saturate(100%) invert(80%) sepia(5%) saturate(300%) hue-rotate(180deg) brightness(108%)" }} />
            <div className="absolute inset-y-0 left-0 w-4 z-10"
              style={{ background: "linear-gradient(to right,#f8fafc,transparent)" }} />
            {OPP_COUNTRY_DATA.map(c => (
              <div key={c.name} className="absolute z-20 flex flex-col items-center"
                style={{ left: `${c.mapPctX}%`, top: `${c.mapPctY}%`, transform: "translate(-50%,-50%)" }}>
                <div className="absolute rounded-full animate-ping"
                  style={{ width: 22, height: 22, background: c.color, opacity: 0.15 }} />
                <div className="absolute rounded-full"
                  style={{ width: 16, height: 16, background: c.color, opacity: 0.20 }} />
                <div className="relative rounded-full"
                  style={{ width: 10, height: 10, background: c.color, border: "2px solid white", boxShadow: `0 0 6px ${c.color}60` }} />
                <div className="absolute rounded-lg px-1.5 py-0.5 shadow-md whitespace-nowrap"
                  style={{ top: 13, background: "white", border: `1px solid ${c.color}30` }}>
                  <p className="text-[8.5px] font-bold text-slate-700">{c.name}</p>
                  <p className="text-[8px] font-extrabold" style={{ color: c.color }}>{c.count} opps</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVE CAMPAIGN PAGE — FINAL DESIGN
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Module-level campaign constants ──────────────────────────────────────────

const STAR_PRODUCT_NAMES  = ACTIVE_CAMPAIGN_PRODUCTS.map(p => p.name);
const RUNNING_PRODUCTS_AC = ACTIVE_CAMPAIGN_PRODUCTS.filter(p => p.stageIndex > 1);
const TOTAL_STAR_SLOTS    = 5;
const AVAILABLE_SLOTS_AC  = TOTAL_STAR_SLOTS - ACTIVE_CAMPAIGN_PRODUCTS.length;
const AC_TOTAL_LEADS      = RUNNING_PRODUCTS_AC.reduce((s, p) => s + p.leads, 0);
const AC_TOTAL_MQLS       = RUNNING_PRODUCTS_AC.reduce((s, p) => s + p.mqls, 0);

// ─── Info Tooltip ─────────────────────────────────────────────────────────────

function InfoTooltip({ items }: { items: string[] }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info size={13} className="text-slate-400 cursor-help ml-0.5" />
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[210px]"
          style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.20))" }}>
          <div className="bg-[#0f172a] rounded-xl p-4">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/40 mb-2.5">
              Star Products Selected
            </p>
            {items.map(item => (
              <div key={item} className="flex items-center gap-2 mb-2 last:mb-0">
                <Star size={10} fill="#f59e0b" className="text-[#f59e0b] shrink-0" />
                <span className="text-[12px] text-white/85">{item}</span>
              </div>
            ))}
          </div>
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#0f172a] mx-auto" />
        </div>
      )}
    </span>
  );
}

// ─── CSS animations for Active Campaign page ──────────────────────────────────

const AC_STYLES = `
@keyframes dc-active-glow {
  0%, 100% { border-color: rgba(42,203,131,0.22); box-shadow: 0 0 0 0 rgba(42,203,131,0); }
  50%       { border-color: rgba(42,203,131,0.55); box-shadow: 0 0 14px rgba(42,203,131,0.14); }
}
@keyframes dc-pill-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.45; transform: scale(0.7); }
}
@keyframes dc-stage-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dc-line-sweep {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes dc-beep {
  0%   { box-shadow: 0 0 0 0 rgba(31,111,84,0.55); }
  40%  { box-shadow: 0 0 0 5px rgba(31,111,84,0); }
  100% { box-shadow: 0 0 0 0 rgba(31,111,84,0); }
}
.dc-running-card     { animation: dc-active-glow 2.6s ease-in-out infinite; }
.dc-pill-dot         { animation: dc-pill-dot 1.6s ease-in-out infinite; }
.dc-stage-in-1       { animation: dc-stage-in 0.38s ease-out 0.08s both; }
.dc-stage-in-2       { animation: dc-stage-in 0.38s ease-out 0.18s both; }
.dc-stage-in-3       { animation: dc-stage-in 0.38s ease-out 0.28s both; }
.dc-stage-in-4       { animation: dc-stage-in 0.38s ease-out 0.38s both; }
.dc-line-sweep       { transform-origin: left center; animation: dc-line-sweep 0.9s ease-out 0.10s both; }
.dc-beep             { animation: dc-beep 2.4s ease-out infinite; }
`;

// ─── Section Header (no number badge) ────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-[15px] font-bold text-slate-900">{title}</p>
      {sub && <span className="text-[11.5px] text-slate-400">· {sub}</span>}
    </div>
  );
}

// ─── Campaign Overview Section ────────────────────────────────────────────────

function CampaignOverviewSection({ onAddProduct, products: overrideProducts, emptyMode }: { onAddProduct: () => void; products?: CampaignProduct[]; emptyMode?: boolean }) {
  const products = overrideProducts ?? ACTIVE_CAMPAIGN_PRODUCTS;
  const availableSlots = TOTAL_STAR_SLOTS - products.length;
  const productNames = products.map(p => p.name);
  const runningProducts = emptyMode ? [] : products.filter(p => p.stageIndex > 1);
  const totalEnquiries = emptyMode ? 0 : products.reduce((s, p) => s + p.mqls, 0);
  const totalOpportunities = emptyMode ? 0 : products.reduce((s, p) => s + p.leads, 0);
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="Campaign Overview" sub={emptyMode ? "Campaign just started" : "Live performance snapshot"} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LEFT — Star Products card */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Star Products</p>
            <Star size={14} fill="#f59e0b" className="text-[#f59e0b]" />
          </div>
          {/* Big number */}
          <div className="flex items-end gap-1 mb-4">
            <span className="text-[42px] font-black text-slate-900 leading-none">
              {products.length}
            </span>
            <span className="text-[18px] font-bold text-slate-300 mb-2">/ {TOTAL_STAR_SLOTS}</span>
          </div>
          {/* Product indicator dots */}
          <div className="flex items-end gap-3 mb-4">
            {products.map(p => (
              <div key={p.id} className="relative group/dot flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: TIMELINE_STAGE_COLORS[p.stageIndex - 1] ?? "#1F6F54" }} />
                <span className="text-[8px] font-mono text-slate-400 leading-tight text-center">{p.cas}</span>
                {/* Hover tooltip */}
                <span className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold text-white opacity-0 group-hover/dot:opacity-100 transition-opacity z-50 shadow-lg"
                  style={{ background: "#1a1a1a" }}>
                  {p.name}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: "#1a1a1a" }} />
                </span>
              </div>
            ))}
            {Array.from({ length: availableSlots }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-slate-300" />
                <span className="text-[8px] text-slate-300">Empty</span>
              </div>
            ))}
          </div>
          {/* Subtle add nudge */}
          {availableSlots > 0 && (
            <button onClick={onAddProduct}
              className="flex items-center gap-1.5 text-[11.5px] text-slate-400 hover:text-[#1a5c3a] transition-colors group">
              <Plus size={12} className="group-hover:text-[#1a5c3a]" />
              <span>{availableSlots} slot{availableSlots !== 1 ? "s" : ""} remaining</span>
              <span className="text-[#1a5c3a] font-semibold group-hover:underline">Add product →</span>
            </button>
          )}
        </div>

        {/* RIGHT — Running Campaigns grouped card */}
        <div className="dc-running-card bg-white rounded-2xl border p-5" style={{ borderColor: emptyMode ? "#e4e4e7" : "rgba(42,203,131,0.22)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Running Campaigns</p>
            {emptyMode ? (
              <span className="flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#fef9c3", color: "#92400e" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                Setting up
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#dcfce7", color: "#166534" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ACB83] animate-pulse" />
                All active
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#f3f4f6] h-full">
            {[
              { label: "Campaigns",         value: String(runningProducts.length), sub: emptyMode ? "Starting soon" : "Active now",    green: false },
              { label: "Total Enquiries",   value: String(totalEnquiries),         sub: emptyMode ? "Awaiting data"  : "↑ 12 this week", green: !emptyMode },
              { label: "Total Opportunities", value: String(totalOpportunities),   sub: "Across campaigns",                              green: false },
            ].map(m => (
              <div key={m.label} className="px-4 first:pl-0 last:pr-0 flex flex-col justify-center py-2">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1.5">{m.label}</p>
                <p className="text-[30px] font-black text-slate-900 leading-none">{m.value}</p>
                <p className={cn("text-[11px] mt-1.5", m.green ? "text-[#166534] font-semibold" : "text-slate-400")}>
                  {m.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Animated Stage Pill (for table rows) ────────────────────────────────────

// Muted pill colours — less saturated so table feels quieter
const PILL_MUTED: Record<CampaignStage, { bg: string; color: string; dot: string }> = {
  "Setup for Demand":       { bg: "#f1f5f9", color: "#64748b", dot: "#1F6F54" },
  "Execution Planning":     { bg: "#f1f5f9", color: "#64748b", dot: "#0e7a72" },
  "Demand Generation":      { bg: "#f1f5f9", color: "#64748b", dot: "#1265a0" },
  "Opportunities Pipeline": { bg: "#f1f5f9", color: "#64748b", dot: "#1a4fa8" },
};

const STAGE_HINTS: Record<CampaignStage, string> = {
  "Setup for Demand":      "Add your product specs and docs to unlock the next stage.\nExecution Planning begins once your profile is complete.",
  "Execution Planning":    "Your Scimplify team is crafting your go-to-market strategy.\nExpect your campaign plan within 3–5 business days.",
  "Demand Generation":     "Your campaigns are live and reaching qualified global buyers.\nLeads will appear in your pipeline as interest grows.",
  "Opportunities Pipeline":"Verified buyer enquiries are being routed to you now.\nReview and respond to each opportunity to close deals.",
};

function AnimatedStagePill({ stage }: { stage: CampaignStage }) {
  const s = PILL_MUTED[stage];
  const isSetup = stage === "Setup for Demand";
  const hint = STAGE_HINTS[stage];
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium w-full"
      style={{ background: s.bg, color: s.color }}>
      {!isSetup && (
        <span className="dc-pill-dot w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      )}
      <span className="flex-1">{stage}</span>
      <span className="relative group/hint shrink-0">
        <Info size={11} className="opacity-50 hover:opacity-100 transition-opacity cursor-default" style={{ color: s.color }} />
        <span className="pointer-events-none absolute bottom-full right-0 mb-2 w-[210px] rounded-lg px-3 py-2.5 text-[11px] leading-[1.55] font-medium text-white opacity-0 group-hover/hint:opacity-100 transition-opacity duration-150 z-50 whitespace-pre-line shadow-xl"
          style={{ background: "#1a1a1a" }}>
          {hint}
          <span className="absolute top-full right-3 border-4 border-transparent" style={{ borderTopColor: "#1a1a1a" }} />
        </span>
      </span>
    </span>
  );
}

// ─── Compact Campaign Timeline (animated) ────────────────────────────────────

const STAGE_EXPLAINER = [
  { stage: "Setup for Demand"  as CampaignStage, icon: Package,   desc: "Docs & product info"        },
  { stage: "Execution Planning" as CampaignStage, icon: MapPin,    desc: "Strategy prepared"          },
  { stage: "Demand Generation" as CampaignStage, icon: Megaphone, desc: "Campaigns go live"           },
  { stage: "Opportunities Pipeline"     as CampaignStage, icon: Target,    desc: "Buyers delivered to you"     },
];

// find highest stage across all products (for progress line)
const MAX_STAGE_INDEX = Math.max(...ACTIVE_CAMPAIGN_PRODUCTS.map(p => p.stageIndex));

function CampaignTimelineStrip({ onViewDetails, products: overrideProducts }: { onViewDetails?: (id: string) => void; products?: CampaignProduct[] }) {
  const products = overrideProducts ?? ACTIVE_CAMPAIGN_PRODUCTS;
  const maxStageIndex = Math.max(...products.map(p => p.stageIndex));
  const [openStage, setOpenStage] = useState<CampaignStage | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Group products by stage — supports multiple products per stage
  const productsByStage = products.reduce<Partial<Record<CampaignStage, CampaignProduct[]>>>((acc, p) => {
    const stage = p.stage as CampaignStage;
    acc[stage] = [...(acc[stage] ?? []), p];
    return acc;
  }, {});

  // Close popover on outside click
  useEffect(() => {
    if (!openStage) return;
    const handler = (e: MouseEvent) => {
      if (stripRef.current && !stripRef.current.contains(e.target as Node)) setOpenStage(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openStage]);

  return (
    <div className="px-6 pt-5 pb-6" ref={stripRef}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
          Product Campaign Journey — 4 Stages
        </p>
        <p className="text-[9.5px] text-slate-400 italic">Click a completed stage to view its data</p>
      </div>
      <div className="relative flex items-start">

        {/* Track */}
        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 rounded-full bg-slate-100 z-0 overflow-hidden">
          <div className="h-full rounded-full dc-line-sweep"
            style={{
              background: "linear-gradient(90deg,#2ACB83,#0077CC)",
              width: `${((maxStageIndex - 1) / 3) * 100}%`,
            }} />
        </div>

        {STAGE_EXPLAINER.map((s, i) => {
          const Icon         = s.icon;
          const meta         = STAGE_META[s.stage];
          const filled       = i + 1 <= maxStageIndex;
          const active       = i + 1 === maxStageIndex;
          const isCompleted  = filled && !active;
          const stageProds   = productsByStage[s.stage as CampaignStage] ?? [];
          const clickable    = isCompleted && stageProds.length > 0 && !!onViewDetails;
          const isOpen       = openStage === s.stage;
          const multiProduct = stageProds.length > 1;
          const delayClass   = `dc-stage-in-${i + 1}` as string;

          const handleClick = () => {
            if (!clickable) return;
            if (multiProduct) {
              setOpenStage(isOpen ? null : s.stage as CampaignStage);
            } else {
              onViewDetails!(stageProds[0].id);
            }
          };

          const nodeContent = (
            <>
              {/* Icon circle */}
              <div className="relative">
                {active && (
                  <div className="dc-beacon-ring absolute rounded-full border-2"
                    style={{ inset: "-5px", borderColor: "#1a5c3a" }} />
                )}
                {clickable && (
                  <div className="absolute inset-0 rounded-full ring-2 ring-[#2ACB83]/40 ring-offset-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-150",
                  filled    ? "border-transparent" : "border-slate-200 bg-white",
                  active    ? "shadow-[0_0_0_4px_rgba(42,203,131,0.15)]" : "",
                  clickable ? "group-hover:scale-110" : "",
                )}
                  style={filled ? { background: meta.bg, borderColor: "transparent" } : {}}>
                  <Icon size={14} style={{ color: filled ? meta.color : "#cbd5e1" }} />
                </div>
                {/* Badge showing product count when >1 in this stage */}
                {multiProduct && isCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0077CC] flex items-center justify-center border border-white">
                    <span className="text-[8px] font-black text-white">{stageProds.length}</span>
                  </div>
                )}
              </div>

              {/* Stage label */}
              <div className="text-center px-1">
                <p className={cn(
                  "text-[11px] font-bold leading-snug transition-colors",
                  filled ? "text-slate-800" : "text-slate-400",
                  clickable ? "group-hover:text-[#1a5c3a]" : "",
                )}>{s.stage}</p>
                <p className={cn(
                  "text-[10px] mt-0.5 leading-snug",
                  active ? "text-[#166534] font-semibold" : "text-slate-400",
                )}>{s.desc}</p>
                {clickable && (
                  <p className="text-[9px] font-semibold text-[#2ACB83] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {multiProduct ? `${stageProds.length} products ↓` : `${stageProds[0].shortName} →`}
                  </p>
                )}
              </div>

              {/* Multi-product popover */}
              {isOpen && multiProduct && (
                <div
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-52 bg-white rounded-xl border border-[#e4e4e7] shadow-xl overflow-hidden"
                  onClick={e => e.stopPropagation()}>
                  <div className="px-3 py-2 border-b border-[#f3f4f6] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{stageProds.length} Products in this stage</span>
                    <button onClick={() => setOpenStage(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                  {stageProds.map(p => (
                    <button key={p.id}
                      onClick={() => { setOpenStage(null); onViewDetails!(p.id); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f0fdf4] transition-colors text-left border-b border-[#f9fafb] last:border-0 group/item">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.dotColor }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 truncate group-hover/item:text-[#1a5c3a]">{p.shortName ?? p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.cas}</p>
                      </div>
                      <ChevronRight size={12} className="text-slate-300 group-hover/item:text-[#2ACB83] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          );

          return clickable ? (
            <button
              key={s.stage}
              title={multiProduct ? `${stageProds.length} products in ${s.stage} — click to pick` : `View ${s.stage} — ${stageProds[0].name}`}
              onClick={handleClick}
              className={cn("group flex flex-col items-center gap-2 flex-1 min-w-0 relative z-10 cursor-pointer", delayClass)}>
              {nodeContent}
            </button>
          ) : (
            <div key={s.stage} className={cn("flex flex-col items-center gap-2 flex-1 min-w-0 relative z-10", delayClass)}>
              {nodeContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Product Status Table ─────────────────────────────────────────────────────

// ─── Per-product compact mini timeline ───────────────────────────────────────
const STAGE_LABELS = ["Setup", "Planning", "Generation", "Pipeline"] as const;

const TIMELINE_STAGE_COLORS = ["#1F6F54", "#0e7a72", "#1265a0", "#1a4fa8"];
const TIMELINE_MUTED = "#e4e4e7";

function MiniTimeline({ stageIndex }: { stageIndex: number }) {
  return (
    <div className="flex items-center mt-2.5 w-[220px]">
      {[1, 2, 3, 4].map((s, i) => {
        const done   = s < stageIndex;
        const active = s === stageIndex;
        const color  = TIMELINE_STAGE_COLORS[i];
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-[9px] h-[9px] rounded-full border transition-all duration-200 shrink-0",
                  active ? "dc-beep" : "",
                  !done && !active ? "border-[#d1d5db] bg-white" : "",
                )}
                style={done || active ? { background: color, borderColor: "transparent" } : {}}
              />
              <span className="absolute top-[13px] text-[8px] font-medium whitespace-nowrap"
                style={{ color: active ? color : done ? "#94a3b8" : "#cbd5e1" }}>
                {STAGE_LABELS[i]}
              </span>
            </div>
            {i < 3 && (
              <div className="h-[2px] flex-1 mx-[1px] rounded-full"
                style={{ background: done ? TIMELINE_STAGE_COLORS[i] : TIMELINE_MUTED }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProductStatusTable({ onViewDetails, products: overrideProducts }: { onViewDetails: (id: string) => void; products?: CampaignProduct[] }) {
  const products = overrideProducts ?? ACTIVE_CAMPAIGN_PRODUCTS;
  const [showTimelines, setShowTimelines] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <SectionHeader title="Product Campaign Status" />
        <button
          onClick={() => setShowTimelines(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all border border-[#e4e4e7]">
          {showTimelines ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {showTimelines ? "Hide timelines" : "Show timelines"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f9fafb" }} className="border-b border-[#f3f4f6]">
                {["Product", "Campaign Journey", "Total Enquiries", "Total Opportunities", "Active Markets", "Last Activity", ""].map(h => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const isSetup = p.stageIndex === 1;
                return (
                  <tr key={p.id}
                    className={cn(
                      "border-b border-[#f9fafb] last:border-0 transition-colors hover:bg-[#f0fdf4]/40",
                      i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    )}>
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TIMELINE_STAGE_COLORS[p.stageIndex - 1] ?? "#1F6F54" }} />
                        <div>
                          <p className="text-[13px] font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">CAS {p.cas} · {p.industry}</p>
                        </div>
                      </div>
                    </td>
                    {/* Stage + per-product mini timeline */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <AnimatedStagePill stage={p.stage} />
                        {showTimelines && <MiniTimeline stageIndex={p.stageIndex} />}
                        {showTimelines && <div className="h-3" />}
                      </div>
                    </td>
                    {/* MQLs */}
                    <td className="px-5 py-4">
                      <span className="text-[15px] font-bold text-slate-700">
                        {isSetup ? "—" : p.mqls}
                      </span>
                    </td>
                    {/* Leads */}
                    <td className="px-5 py-4">
                      <span className="text-[20px] font-black leading-none"
                        style={{ color: isSetup ? "#cbd5e1" : "#1F6F54" }}>
                        {isSetup ? "—" : p.leads}
                      </span>
                    </td>
                    {/* Markets */}
                    <td className="px-5 py-4">
                      {isSetup ? (
                        <span className="text-[11.5px] text-slate-400 italic">Setup in progress</span>
                      ) : (
                        <div className="flex gap-1.5 flex-wrap">
                          {p.countries.slice(0, 3).map(c => (
                            <span key={c}
                              className="text-[10.5px] bg-slate-100 text-slate-600 rounded-md px-1.5 py-0.5 font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    {/* Last Activity */}
                    <td className="px-5 py-4">
                      <span className="text-[12px] text-slate-400">
                        {isSetup ? "Setup started"
                          : p.id === "thf" ? "2 hours ago"
                          : p.id === "tep" ? "Yesterday"
                          : "30 min ago"}
                      </span>
                    </td>
                    {/* CTA */}
                    <td className="px-5 py-4">
                      <button onClick={() => onViewDetails(p.id)}
                        className="px-4 py-2 rounded-xl text-[12px] font-bold border-2 border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#1a5c3a] hover:text-white transition-all whitespace-nowrap">
                        View Details →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 02b — WEEKLY OPPORTUNITIES
// ═══════════════════════════════════════════════════════════════════════════════

const WO_PRODUCTS = [
  { id: "all", label: "All Products" },
  { id: "thf", label: "Tetrahydrofuran" },
  { id: "tep", label: "Triethyl Phosphate" },
  { id: "tec", label: "Triethyl Citrate" },
];

// Weekly line data per product (6 weeks)
const WO_WEEKLY: Record<string, number[]> = {
  all: [3, 5, 8, 11, 14, 22],
  thf: [2, 3, 5,  6,  5,  3],
  tep: [0, 1, 2,  1,  1,  1],
  tec: [2, 2, 4,  7, 10, 13],
};

// Per-week country breakdown for tooltip
const WO_WEEK_COUNTRIES: Record<string, { flag: string; name: string; count: number; color: string }[][]> = {
  all: [
    [{ flag:"🇩🇪", name:"Germany", count:2, color:"#f59e0b" }, { flag:"🇯🇵", name:"Japan", count:1, color:"#0077CC" }],
    [{ flag:"🇩🇪", name:"Germany", count:2, color:"#f59e0b" }, { flag:"🇯🇵", name:"Japan", count:2, color:"#0077CC" }, { flag:"🇺🇸", name:"United States", count:1, color:"#ef4444" }],
    [{ flag:"🇩🇪", name:"Germany", count:3, color:"#f59e0b" }, { flag:"🇯🇵", name:"Japan", count:3, color:"#0077CC" }, { flag:"🇺🇸", name:"United States", count:2, color:"#ef4444" }],
    [{ flag:"🇩🇪", name:"Germany", count:4, color:"#f59e0b" }, { flag:"🇯🇵", name:"Japan", count:4, color:"#0077CC" }, { flag:"🇺🇸", name:"United States", count:3, color:"#ef4444" }],
    [{ flag:"🇩🇪", name:"Germany", count:6, color:"#f59e0b" }, { flag:"🇯🇵", name:"Japan", count:5, color:"#0077CC" }, { flag:"🇺🇸", name:"United States", count:3, color:"#ef4444" }],
    [{ flag:"🇩🇪", name:"Germany", count:9, color:"#f59e0b" }, { flag:"🇯🇵", name:"Japan", count:7, color:"#0077CC" }, { flag:"🇺🇸", name:"United States", count:6, color:"#ef4444" }],
  ],
  thf: [
    [{ flag:"🇩🇪", name:"Germany", count:2, color:"#f59e0b" }],
    [{ flag:"🇩🇪", name:"Germany", count:2, color:"#f59e0b" }, { flag:"🇺🇸", name:"United States", count:1, color:"#ef4444" }],
    [{ flag:"🇩🇪", name:"Germany", count:3, color:"#f59e0b" }, { flag:"🇺🇸", name:"United States", count:2, color:"#ef4444" }],
    [{ flag:"🇩🇪", name:"Germany", count:4, color:"#f59e0b" }, { flag:"🇺🇸", name:"United States", count:2, color:"#ef4444" }],
    [{ flag:"🇩🇪", name:"Germany", count:3, color:"#f59e0b" }, { flag:"🇺🇸", name:"United States", count:2, color:"#ef4444" }],
    [{ flag:"🇩🇪", name:"Germany", count:2, color:"#f59e0b" }, { flag:"🇯🇵", name:"Japan", count:1, color:"#0077CC" }],
  ],
  tep: [
    [],
    [{ flag:"🇫🇷", name:"France", count:1, color:"#6237C7" }],
    [{ flag:"🇫🇷", name:"France", count:1, color:"#6237C7" }, { flag:"🇮🇳", name:"India", count:1, color:"#ef4444" }],
    [{ flag:"🇫🇷", name:"France", count:1, color:"#6237C7" }],
    [{ flag:"🇫🇷", name:"France", count:1, color:"#6237C7" }],
    [{ flag:"🇫🇷", name:"France", count:1, color:"#6237C7" }],
  ],
  tec: [
    [{ flag:"🇯🇵", name:"Japan", count:2, color:"#0077CC" }],
    [{ flag:"🇯🇵", name:"Japan", count:2, color:"#0077CC" }],
    [{ flag:"🇯🇵", name:"Japan", count:2, color:"#0077CC" }, { flag:"🇦🇪", name:"UAE", count:2, color:"#f59e0b" }],
    [{ flag:"🇯🇵", name:"Japan", count:3, color:"#0077CC" }, { flag:"🇦🇪", name:"UAE", count:3, color:"#f59e0b" }, { flag:"🇩🇪", name:"Germany", count:1, color:"#2ACB83" }],
    [{ flag:"🇯🇵", name:"Japan", count:5, color:"#0077CC" }, { flag:"🇦🇪", name:"UAE", count:3, color:"#f59e0b" }, { flag:"🇩🇪", name:"Germany", count:2, color:"#2ACB83" }],
    [{ flag:"🇯🇵", name:"Japan", count:7, color:"#0077CC" }, { flag:"🇦🇪", name:"UAE", count:4, color:"#f59e0b" }, { flag:"🇩🇪", name:"Germany", count:2, color:"#2ACB83" }],
  ],
};

// Top countries — mapPctX/mapPctY are % positions on the 1404×600 world-map.svg
const WO_TOP_COUNTRIES: Record<string, { flag: string; name: string; count: number; color: string; mapPctX: number; mapPctY: number }[]> = {
  all: [
    { flag:"🇩🇪", name:"Germany",       count:14, color:"#f59e0b", mapPctX:52.7, mapPctY:24.0 },
    { flag:"🇺🇸", name:"United States", count:11, color:"#ef4444", mapPctX:20.0, mapPctY:34.0 },
    { flag:"🇯🇵", name:"Japan",         count:8,  color:"#0077CC", mapPctX:86.5, mapPctY:32.0 },
  ],
  thf: [
    { flag:"🇩🇪", name:"Germany",       count:12, color:"#f59e0b", mapPctX:52.7, mapPctY:24.0 },
    { flag:"🇺🇸", name:"United States", count:8,  color:"#ef4444", mapPctX:20.0, mapPctY:34.0 },
    { flag:"🇯🇵", name:"Japan",         count:4,  color:"#0077CC", mapPctX:86.5, mapPctY:32.0 },
  ],
  tep: [
    { flag:"🇫🇷", name:"France", count:4, color:"#6237C7", mapPctX:50.5, mapPctY:26.0 },
    { flag:"🇮🇳", name:"India",  count:2, color:"#ef4444", mapPctX:68.0, mapPctY:44.0 },
  ],
  tec: [
    { flag:"🇯🇵", name:"Japan",   count:19, color:"#0077CC", mapPctX:86.5, mapPctY:32.0 },
    { flag:"🇦🇪", name:"UAE",     count:11, color:"#f59e0b", mapPctX:63.0, mapPctY:40.0 },
    { flag:"🇩🇪", name:"Germany", count:6,  color:"#2ACB83", mapPctX:52.7, mapPctY:24.0 },
  ],
};

const WO_TOTAL: Record<string, number> = { all: 63, thf: 24, tep: 6, tec: 36 };

const WO_CONTINENTS = [
  "M 70 55 C 82 42 158 38 212 50 L 238 76 L 248 118 L 242 162 L 210 188 L 178 196 L 148 184 L 112 162 L 82 140 L 58 108 L 52 78 Z",
  "M 158 202 L 212 196 L 238 218 L 234 258 L 200 268 L 168 256 L 152 234 L 148 210 Z",
  "M 318 48 C 334 38 402 38 418 52 L 428 70 L 422 90 L 396 100 L 358 92 L 328 76 L 316 64 Z",
  "M 318 106 C 342 98 404 94 428 108 L 448 136 L 444 202 L 416 242 L 380 252 L 346 236 L 322 200 L 308 158 L 304 128 Z",
  "M 426 40 C 462 28 592 28 658 48 L 688 74 L 682 122 L 652 158 L 580 172 L 508 166 L 458 146 L 426 118 L 416 80 Z",
  "M 564 192 C 586 180 648 180 664 194 L 670 222 L 644 240 L 598 242 L 566 228 Z",
];

function WeeklyOpportunitiesSection({ emptyMode }: { emptyMode?: boolean }) {
  const [productId, setProductId]           = useState("all");
  const [hoveredIdx, setHoveredIdx]         = useState<number | null>(null);
  const [tooltipPos, setTooltipPos]         = useState<{ x: number; y: number } | null>(null);
  const svgRef                              = useRef<SVGSVGElement>(null);

  const EMPTY_WEEKLY = [0, 0, 0, 0, 0, 0];
  const weekly   = emptyMode ? EMPTY_WEEKLY : (WO_WEEKLY[productId]  ?? WO_WEEKLY.all);
  const total    = emptyMode ? 0            : (WO_TOTAL[productId]   ?? WO_TOTAL.all);
  const countries = emptyMode ? []          : (WO_TOP_COUNTRIES[productId] ?? WO_TOP_COUNTRIES.all);
  const productLabel = WO_PRODUCTS.find(p => p.id === productId)?.label ?? "All Products";

  const W = 900; const H = 200;
  const padT = 16; const padB = 28; const padL = 32; const padR = 16;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxV   = Math.max(...weekly, 1);
  const gridMax = Math.ceil(maxV / 5) * 5;
  const gridLines = 4;

  const pts = weekly.map((v, i) => ({
    x: padL + (i / (weekly.length - 1)) * chartW,
    y: padT + chartH - (v / gridMax) * chartH,
    v,
  }));

  const linePath = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const cx = (pts[i - 1].x + p.x) / 2;
    return `C ${cx} ${pts[i - 1].y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }).join(" ");

  const fillPath = `${linePath} L ${pts[pts.length - 1].x} ${padT + chartH} L ${pts[0].x} ${padT + chartH} Z`;
  const weekLabels = ["Week 1","Week 2","Week 3","Week 4","Week 5","Week 6"];

  const handlePointEnter = (i: number, e: React.MouseEvent<SVGCircleElement>) => {
    setHoveredIdx(i);
    if (svgRef.current) {
      const rect  = svgRef.current.getBoundingClientRect();
      const svgW  = rect.width;
      const scaleX = svgW / W;
      const scaleY = rect.height / H;
      setTooltipPos({ x: pts[i].x * scaleX, y: pts[i].y * scaleY });
    }
  };

  const tooltipCountries = hoveredIdx !== null ? (WO_WEEK_COUNTRIES[productId]?.[hoveredIdx] ?? []) : [];
  const tooltipTotal     = hoveredIdx !== null ? weekly[hoveredIdx] : null;

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="Weekly Opportunities" sub="Opportunities generated week by week" />

      {/* Outer 70 / 30 grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>

        {/* ── LEFT 70% — Chart on top, Countries + Map as bottom row ── */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-visible flex flex-col">

          {/* ── TOP: Line chart ── */}
          <div className="px-4 pt-4 pb-2 border-b border-[#f3f4f6]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[14px] font-bold text-slate-900">Weekly Opportunities</p>
                <p className="text-[12px] text-slate-400 mt-0.5">{productLabel} · <span className="font-semibold text-slate-600">{total} total</span></p>
              </div>
              <select
                value={productId}
                onChange={e => { setProductId(e.target.value); setHoveredIdx(null); }}
                className="px-4 py-2 rounded-xl border border-[#e4e4e7] text-[12.5px] font-semibold text-slate-700 bg-white outline-none focus:border-[#2ACB83] cursor-pointer"
                style={{ appearance: "auto" }}>
                {WO_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="relative">
              <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
                className="w-full overflow-visible"
                onMouseLeave={() => { setHoveredIdx(null); setTooltipPos(null); }}>
                <defs>
                  <linearGradient id="woGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2ACB83" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#2ACB83" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {Array.from({ length: gridLines + 1 }).map((_, gi) => {
                  const y   = padT + (gi / gridLines) * chartH;
                  const val = Math.round(gridMax * (1 - gi / gridLines));
                  return (
                    <g key={gi}>
                      <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="8" fill="#cbd5e1" fontWeight="500">{val}</text>
                    </g>
                  );
                })}
                {hoveredIdx !== null && (
                  <line x1={pts[hoveredIdx].x} x2={pts[hoveredIdx].x}
                    y1={padT} y2={padT + chartH}
                    stroke="#2ACB83" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
                )}
                <path d={fillPath} fill="url(#woGrad)" />
                <path d={linePath} fill="none" stroke="#1a5c3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => {
                  const isHov  = hoveredIdx === i;
                  const isLast = i === pts.length - 1;
                  return (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y}
                        r={isHov ? 7 : isLast ? 5.5 : 3.5}
                        fill={isHov || isLast ? "#1a5c3a" : "white"}
                        stroke="#1a5c3a" strokeWidth={isHov || isLast ? 0 : 1.8}
                        style={{ cursor: "pointer", transition: "r 120ms ease" }}
                        onMouseEnter={e => handlePointEnter(i, e)} />
                      {isLast && !isHov && (
                        <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#1a5c3a" strokeWidth="1" opacity="0.3" />
                      )}
                      <text x={p.x} y={p.y - 10} textAnchor="middle"
                        fontSize={isHov ? "10" : isLast ? "9.5" : "8"}
                        fill={isHov || isLast ? "#1a5c3a" : "#94a3b8"}
                        fontWeight={isHov || isLast ? "800" : "500"}>{p.v}</text>
                      <text x={p.x} y={H - 7} textAnchor="middle" fontSize="8.5"
                        fill={isHov || isLast ? "#1a5c3a" : "#94a3b8"}
                        fontWeight={isHov || isLast ? "700" : "400"}>{weekLabels[i]}</text>
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip */}
              {hoveredIdx !== null && tooltipPos && (
                <div className="pointer-events-none absolute z-30"
                  style={{ left: tooltipPos.x, top: tooltipPos.y - 14, transform: "translate(-50%, -100%)" }}>
                  <div className="rounded-2xl px-4 py-3.5 shadow-2xl"
                    style={{ minWidth: 190, background: "#0b1f14", border: "1px solid rgba(42,203,131,0.22)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ACB83] animate-pulse" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2ACB83]">{weekLabels[hoveredIdx]}</p>
                    </div>
                    <p className="text-[26px] font-black text-white leading-none">
                      {tooltipTotal}
                      <span className="text-[12px] font-medium text-slate-400 ml-1.5">opportunities</span>
                    </p>
                    {tooltipCountries.length > 0 && (
                      <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.08] pt-3">
                        {tooltipCountries.map(c => (
                          <div key={c.name} className="flex items-center gap-2.5">
                            <span className="text-[15px] leading-none">{c.flag}</span>
                            <span className="text-[11.5px] text-slate-300 flex-1">{c.name}</span>
                            <span className="text-[12.5px] font-extrabold" style={{ color: c.color }}>{c.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-[7px]"
                      style={{ width:0, height:0, borderLeft:"7px solid transparent",
                        borderRight:"7px solid transparent", borderTop:"7px solid #0b1f14" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── BOTTOM ROW: Country cards | separator | World map flush ── */}
          <div className="flex" style={{ minHeight: 220 }}>

            {/* Country list — padded column */}
            <div className="flex flex-col gap-2.5 shrink-0 p-5 border-r border-[#f3f4f6]" style={{ width: 260 }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">Top Countries</p>
              {countries.map(c => (
                <div key={c.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f8fffe] transition-all group">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[20px] shrink-0 border border-[#f3f4f6]"
                    style={{ background: `${c.color}12` }}>
                    {c.flag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[12.5px] font-semibold text-slate-800 truncate">{c.name}</p>
                      <p className="text-[14px] font-extrabold ml-2 shrink-0" style={{ color: c.color }}>{c.count}</p>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-[#f3f4f6] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((c.count / countries[0].count) * 100)}%`, background: c.color }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{c.count} opportunities</p>
                  </div>
                </div>
              ))}
            </div>

            {/* World map — fills the rest of the card flush, no inner container */}
            <div className="flex-1 relative overflow-hidden rounded-br-2xl bg-[#f8fafc]">
              {/* Section label */}
              <div className="absolute top-4 left-5 z-10 flex items-center gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Geographic Distribution</p>
              </div>

              {/* Real world map — fills flush */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/world-map.svg" alt="world map"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.55, filter: "brightness(0) saturate(100%) invert(80%) sepia(5%) saturate(300%) hue-rotate(180deg) brightness(108%)" }} />

              {/* Gradient fade on left edge to blend with separator */}
              <div className="absolute inset-y-0 left-0 w-8 z-10"
                style={{ background: "linear-gradient(to right, #f8fafc, transparent)" }} />

              {/* Marker overlays */}
              {countries.map(c => (
                <div key={c.name}
                  className="absolute z-20 flex flex-col items-center"
                  style={{ left: `${c.mapPctX}%`, top: `${c.mapPctY}%`, transform: "translate(-50%,-50%)" }}>
                  {/* Pulse ring */}
                  <div className="absolute rounded-full animate-ping"
                    style={{ width: 26, height: 26, background: c.color, opacity: 0.15 }} />
                  {/* Outer glow */}
                  <div className="absolute rounded-full"
                    style={{ width: 18, height: 18, background: c.color, opacity: 0.20 }} />
                  {/* Solid dot */}
                  <div className="relative rounded-full shadow-lg"
                    style={{ width: 12, height: 12, background: c.color, border: "2.5px solid white", boxShadow: `0 0 8px ${c.color}60` }} />
                  {/* Label pill */}
                  <div className="absolute rounded-xl shadow-lg px-2 py-1 whitespace-nowrap"
                    style={{ top: 16, background: "white", border: `1px solid ${c.color}30`, boxShadow: `0 4px 12px rgba(0,0,0,0.10)` }}>
                    <p className="text-[9.5px] font-bold text-slate-700 leading-tight">{c.name}</p>
                    <p className="text-[9px] font-extrabold leading-tight" style={{ color: c.color }}>{c.count} opportunities</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── RIGHT 30% — Demand Catalyst panel ── */}
        <DemandCatalystPanel onHowItWorks={() => setShowModal(true)} />

      </div>

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} onAddProduct={() => setShowModal(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 03 — OPPORTUNITIES  (master-detail, replaces WeeklyLeads + OpsByProduct)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Data ─────────────────────────────────────────────────────────────────────

const OPP_WEEKLY: Record<string, number[]> = {
  all: [4, 6, 9, 11, 14, 22],
  thf: [2, 3, 5,  6,  5,  3],
  tep: [0, 1, 2,  1,  1,  1],
  tec: [2, 2, 4,  7, 10, 13],
};

const OPP_PRODUCT: Record<string, {
  total:    number;
  thisWeek: number;
  countries: { flag: string; name: string; count: number; pct: number }[];
  pipeline?: { proposals: number; negotiation: number; won: number };
  actionNeeded?: true;
}> = {
  all: {
    total: 66, thisWeek: 22,
    countries: [
      { flag: "🇯🇵", name: "Japan",   count: 23, pct: 100 },
      { flag: "🇩🇪", name: "Germany", count: 18, pct: 78  },
      { flag: "🇦🇪", name: "UAE",     count: 11, pct: 48  },
      { flag: "🇺🇸", name: "USA",     count: 8,  pct: 35  },
      { flag: "🇫🇷", name: "France",  count: 4,  pct: 17  },
      { flag: "🇮🇳", name: "India",   count: 2,  pct: 9   },
    ],
  },
  thf: {
    total: 24, thisWeek: 3,
    countries: [
      { flag: "🇩🇪", name: "Germany", count: 12, pct: 100 },
      { flag: "🇺🇸", name: "USA",     count: 8,  pct: 67  },
      { flag: "🇯🇵", name: "Japan",   count: 4,  pct: 33  },
    ],
    pipeline: { proposals: 14, negotiation: 7, won: 3 },
  },
  tep: {
    total: 6, thisWeek: 1, actionNeeded: true,
    countries: [
      { flag: "🇫🇷", name: "France", count: 4, pct: 100 },
      { flag: "🇮🇳", name: "India",  count: 2, pct: 50  },
    ],
  },
  tec: {
    total: 36, thisWeek: 13,
    countries: [
      { flag: "🇯🇵", name: "Japan",   count: 19, pct: 100 },
      { flag: "🇦🇪", name: "UAE",     count: 11, pct: 58  },
      { flag: "🇩🇪", name: "Germany", count: 6,  pct: 32  },
    ],
    pipeline: { proposals: 14, negotiation: 7, won: 15 },
  },
};

// Buyer enquiry cards per product
const BUYER_CARDS: Record<string, {
  flag: string; company: string; country: string;
  qty: string; date: string;
  type: "Capability" | "Catalogue";
  status: "Proposal" | "Negotiation" | "Won";
}[]> = {
  thf: [
    { flag:"🇩🇪", company:"Brenntag SE",          country:"Germany", qty:"8 MT",  date:"Jun 9, 2026",  type:"Capability", status:"Proposal"    },
    { flag:"🇺🇸", company:"Univar Solutions",      country:"USA",     qty:"12 MT", date:"Jun 11, 2026", type:"Catalogue",  status:"Won"         },
    { flag:"🇯🇵", company:"Sumitomo Chemical",     country:"Japan",   qty:"5 MT",  date:"Jun 12, 2026", type:"Capability", status:"Negotiation" },
    { flag:"🇮🇳", company:"Deepak Nitrite Ltd.",   country:"India",   qty:"15 MT", date:"Jun 13, 2026", type:"Capability", status:"Proposal"    },
    { flag:"🇫🇷", company:"Arkema France",         country:"France",  qty:"6 MT",  date:"Jun 14, 2026", type:"Catalogue",  status:"Proposal"    },
    { flag:"🇦🇪", company:"Gulf Speciality Chem.", country:"UAE",     qty:"4 MT",  date:"Jun 15, 2026", type:"Capability", status:"Won"         },
  ],
  tep: [
    { flag:"🇫🇷", company:"Solvay SA",             country:"France",  qty:"4 MT",  date:"Jun 8, 2026",  type:"Capability", status:"Proposal"    },
    { flag:"🇮🇳", company:"Lanxess India",          country:"India",   qty:"2 MT",  date:"Jun 10, 2026", type:"Catalogue",  status:"Proposal"    },
  ],
  tec: [
    { flag:"🇯🇵", company:"Nippon Chemical Corp.", country:"Japan",   qty:"19 MT", date:"Jun 4, 2026",  type:"Capability", status:"Won"         },
    { flag:"🇦🇪", company:"BASF Middle East",       country:"UAE",     qty:"11 MT", date:"Jun 7, 2026",  type:"Catalogue",  status:"Negotiation" },
    { flag:"🇩🇪", company:"BASF Distribution GmbH",country:"Germany", qty:"6 MT",  date:"Jun 9, 2026",  type:"Capability", status:"Proposal"    },
    { flag:"🇺🇸", company:"Eastman Chemical",       country:"USA",     qty:"5 MT",  date:"Jun 11, 2026", type:"Catalogue",  status:"Won"         },
  ],
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  Proposal:    { bg: "#dbeafe", color: "#1d4ed8" },
  Negotiation: { bg: "#fef3c7", color: "#b45309" },
  Won:         { bg: "#dcfce7", color: "#166534" },
};

// ─── Weekly Opportunity Line Chart (full-width, prominent) ───────────────────

const WEEK_LABELS = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

function OpportunityLineChart({ data, color, thisWeek }: {
  data: number[]; color: string; thisWeek: number;
}) {
  const W = 600; const H = 140;
  const padT = 14; const padB = 30; const padL = 36; const padR = 14;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxV   = Math.max(...data, 1);
  const gridLines = 4;

  const pts = data.map((v, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - (v / maxV) * chartH,
    v,
  }));

  const linePath = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const cx = (pts[i - 1].x + p.x) / 2;
    return `C ${cx} ${pts[i - 1].y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }).join(" ");

  const fillPath = `${linePath} L ${pts[pts.length - 1].x} ${padT + chartH} L ${pts[0].x} ${padT + chartH} Z`;
  const gradId = `olg-${color.replace("#", "")}`;

  return (
    <div className="relative">
      {/* This week badge top-right */}
      <div className="absolute top-0 right-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
        style={{ background: "#f0fdf4" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#2ACB83] animate-pulse" />
        <span className="text-[11px] font-bold" style={{ color: "#166534" }}>+{thisWeek} this week</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 150 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines + Y labels */}
        {Array.from({ length: gridLines + 1 }).map((_, gi) => {
          const y = padT + (gi / gridLines) * chartH;
          const val = Math.round(maxV * (1 - gi / gridLines));
          return (
            <g key={gi}>
              <line x1={padL} x2={W - padR} y1={y} y2={y}
                stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 5} y={y + 3.5} textAnchor="end"
                fontSize="8" fill="#cbd5e1" fontWeight="500">
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={fillPath} fill={`url(#${gradId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points + value labels */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          return (
            <g key={i}>
              {/* Value label above point */}
              <text x={p.x} y={p.y - 7} textAnchor="middle"
                fontSize={isLast ? "9.5" : "8"} fill={isLast ? color : "#94a3b8"}
                fontWeight={isLast ? "800" : "500"}>
                {p.v}
              </text>
              {/* Circle */}
              <circle cx={p.x} cy={p.y}
                r={isLast ? 5.5 : 3.5}
                fill={isLast ? color : "white"}
                stroke={color}
                strokeWidth={isLast ? 0 : 1.8} />
              {/* Pulse ring on last point */}
              {isLast && (
                <circle cx={p.x} cy={p.y} r="9"
                  fill="none" stroke={color} strokeWidth="1" opacity="0.35" />
              )}
              {/* X axis labels */}
              <text x={p.x} y={H - 7} textAnchor="middle"
                fontSize="8.5"
                fill={isLast ? color : "#94a3b8"}
                fontWeight={isLast ? "700" : "400"}>
                {WEEK_LABELS[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Country demand number tiles ──────────────────────────────────────────────

function CountryTiles({ countries, color, max = 6 }: {
  countries: typeof OPP_PRODUCT["all"]["countries"]; color: string; max?: number;
}) {
  const shown = countries.slice(0, max);
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(shown.length, 6)}, 1fr)` }}>
      {shown.map(c => (
        <div key={c.name}
          className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl p-3 border border-[#f3f4f6] hover:border-slate-200 transition-colors">
          <span className="text-[22px] leading-none">{c.flag}</span>
          <span className="text-[22px] font-black text-slate-900 leading-none" style={{ color }}>{c.count}</span>
          <span className="text-[9.5px] text-slate-400 font-medium text-center leading-tight">{c.name}</span>
          <div className="w-full h-1 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${c.pct}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pipeline Funnel Row ──────────────────────────────────────────────────────

function PipelineFunnel({ total, pipeline, color }: {
  total: number;
  pipeline: { proposals: number; negotiation: number; won: number };
  color: string;
}) {
  const steps = [
    { label: "Opportunities received", count: total,                  pct: 100,                                              col: "#94a3b8", bg: "#f8fafc" },
    { label: "Proposals sent",         count: pipeline.proposals,    pct: Math.round((pipeline.proposals / total) * 100),   col: color,     bg: "#f0fdf4" },
    { label: "In negotiation",         count: pipeline.negotiation,  pct: Math.round((pipeline.negotiation / total) * 100), col: "#0077CC", bg: "#eff6ff" },
    { label: "Won",                    count: pipeline.won,          pct: Math.round((pipeline.won / total) * 100),         col: "#f59e0b", bg: "#fffbeb" },
  ];
  return (
    <div className="flex items-stretch gap-0 rounded-xl overflow-hidden border border-[#f3f4f6]">
      {steps.map((s, i) => (
        <div key={s.label}
          className="flex-1 flex flex-col items-center justify-center py-3.5 px-2 text-center relative"
          style={{ background: s.bg }}>
          {/* separator arrow */}
          {i > 0 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 z-10
              bg-white border border-[#e4e4e7] rounded-full flex items-center justify-center">
              <ChevronRight size={9} className="text-slate-300" />
            </div>
          )}
          <p className="text-[24px] font-black leading-none" style={{ color: s.col }}>{s.count}</p>
          <p className="text-[9.5px] text-slate-400 mt-1.5 font-medium leading-tight">{s.label}</p>
          <p className="text-[9px] font-bold mt-1" style={{ color: s.col }}>{s.pct}%</p>
        </div>
      ))}
    </div>
  );
}

// ─── Left: Product Selector Panel ────────────────────────────────────────────

function ProductSelectorPanel({
  selectedId, onSelect,
}: { selectedId: string; onSelect: (id: string) => void }) {
  const allData = OPP_PRODUCT.all;
  return (
    <div className="w-[210px] shrink-0 flex flex-col border-r border-[#f3f4f6]">
      {/* All Products */}
      <button onClick={() => onSelect("all")}
        className={cn(
          "flex items-center justify-between px-4 py-4 border-b border-[#f3f4f6] text-left transition-colors",
          selectedId === "all"
            ? "bg-[#f0fdf4] border-l-2 border-l-[#2ACB83]"
            : "hover:bg-slate-50"
        )}>
        <div className="min-w-0">
          <p className="text-[12.5px] font-bold text-slate-800">All Products</p>
          <p className="text-[10.5px] text-slate-400 mt-0.5">{RUNNING_PRODUCTS_AC.length} active campaigns</p>
        </div>
        <div className="text-right ml-3 shrink-0">
          <p className="text-[22px] font-black text-slate-900 leading-none">{allData.total}</p>
          <p className="text-[9px] text-slate-400">total opps</p>
        </div>
      </button>

      {/* Per-product rows */}
      {RUNNING_PRODUCTS_AC.map(p => {
        const d   = OPP_PRODUCT[p.id];
        const sel = selectedId === p.id;
        return (
          <button key={p.id} onClick={() => onSelect(p.id)}
            className={cn(
              "flex items-start justify-between px-4 py-4 border-b border-[#f3f4f6] last:border-0 text-left transition-all relative",
              sel ? "bg-[#f0fdf4]" : "hover:bg-slate-50"
            )}>
            {/* Active indicator bar */}
            {sel && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                style={{ background: p.dotColor }} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.dotColor }} />
                <p className="text-[12px] font-bold text-slate-800 leading-snug truncate">{p.name}</p>
              </div>
              <span className="ml-3.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-medium"
                style={{ background: PILL_MUTED[p.stage].bg, color: PILL_MUTED[p.stage].color }}>
                {p.stage}
              </span>
              {d?.actionNeeded && (
                <p className="ml-3.5 text-[9.5px] font-bold text-[#b45309] flex items-center gap-1 mt-1">
                  <AlertCircle size={8} /> Action needed
                </p>
              )}
            </div>
            <div className="text-right ml-2 shrink-0">
              <p className="text-[20px] font-black leading-none" style={{ color: p.dotColor }}>{d?.total}</p>
              <p className="text-[8.5px] text-slate-400">opportunities</p>
              {d?.thisWeek != null && (
                <p className="text-[8.5px] font-bold mt-0.5" style={{ color: "#166534" }}>+{d.thisWeek} wk</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Right: Opportunity Detail Content ───────────────────────────────────────

function OpportunityDetailContent({
  selectedId, onViewEnquiries,
}: { selectedId: string; onViewEnquiries: () => void }) {
  const data    = OPP_PRODUCT[selectedId];
  const weekly  = OPP_WEEKLY[selectedId] ?? OPP_WEEKLY.all;
  const isAll   = selectedId === "all";
  const product = isAll ? null : RUNNING_PRODUCTS_AC.find(p => p.id === selectedId);
  const color   = product?.dotColor ?? "#2ACB83";
  const label   = isAll ? "All Products" : (product?.name ?? "");

  if (!data) return null;

  return (
    <div className="flex-1 min-w-0 p-6 flex flex-col gap-5 overflow-y-auto">

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {!isAll && (
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                Active Campaign
              </span>
              {product && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-medium"
                  style={{ background: PILL_MUTED[product.stage].bg, color: PILL_MUTED[product.stage].color }}>
                  {product.stage}
                </span>
              )}
            </div>
          )}
          <h3 className="text-[20px] font-black text-slate-900">{label}</h3>
        </div>
        {data.actionNeeded && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0"
            style={{ background: "#fef3c7", borderColor: "#fde68a" }}>
            <AlertCircle size={13} style={{ color: "#b45309" }} />
            <span className="text-[11.5px] font-bold" style={{ color: "#b45309" }}>Action needed</span>
          </div>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Opportunities", value: String(data.total), sub: "Qualified buyer enquiries", col: "#0f172a" },
          { label: "Added This Week",     value: `+${data.thisWeek}`, sub: "vs last week",              col: "#166534" },
          { label: "Countries Reached",   value: String(data.countries.length), sub: "Active markets",  col: color     },
        ].map(k => (
          <div key={k.label} className="bg-slate-50 rounded-xl px-4 py-3 border border-[#f3f4f6]">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">{k.label}</p>
            <p className="text-[28px] font-black leading-none" style={{ color: k.col }}>{k.value}</p>
            <p className="text-[10px] text-slate-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Weekly line chart — full width, prominent */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
          Weekly Opportunity Trend
        </p>
        <div className="bg-slate-50 rounded-xl px-4 pt-3 pb-1 border border-[#f3f4f6]">
          <OpportunityLineChart data={weekly} color={color} thisWeek={data.thisWeek} />
        </div>
      </div>

      {/* Demand by Country — number tiles */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
          Demand by Country
        </p>
        <CountryTiles countries={data.countries} color={color} max={isAll ? 6 : 6} />
      </div>

      {/* Pipeline funnel — product-specific only */}
      {data.pipeline && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Enquiry Pipeline
            </p>
            <span className="text-[11px] text-slate-400">
              Out of <strong className="text-slate-700">{data.total}</strong> received
            </span>
          </div>
          <PipelineFunnel total={data.total} pipeline={data.pipeline} color={color} />
        </div>
      )}

      {/* Action / CTA */}
      <div className="mt-auto pt-2">
        {data.actionNeeded ? (
          <button className="w-full py-3 rounded-xl text-[13px] font-bold text-white hover:brightness-110 transition-all"
            style={{ background: "#1a5c3a" }}>
            Accept Market Plan — Resume Campaign →
          </button>
        ) : isAll ? (
          <p className="text-[12px] text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-xl">
            ← Select a product to view buyer enquiries
          </p>
        ) : (
          <button onClick={onViewEnquiries}
            className="w-full py-3.5 rounded-xl text-[13.5px] font-bold border-2 border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#1a5c3a] hover:text-white transition-all">
            View {data.total} buyer enquiries →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Buyer Enquiry Table Row ──────────────────────────────────────────────────

function BuyerEnquiryRow({
  card, index,
}: { card: typeof BUYER_CARDS["thf"][0]; index: number }) {
  const ss = STATUS_BADGE[card.status];
  const [expanded, setExpanded] = useState(false);

  const statusActions: Record<string, string> = {
    Proposal:    "Send Proposal",
    Negotiation: "Continue Negotiation",
    Won:         "View Agreement",
  };

  return (
    <>
      <tr
        className={cn(
          "border-b border-[#f9fafb] transition-colors hover:bg-[#f0fdf4]/40 cursor-pointer",
          index % 2 === 0 ? "bg-white" : "bg-[#fafafa]",
          expanded && "bg-[#f0fdf4]/60"
        )}
        onClick={() => setExpanded(e => !e)}>
        {/* # */}
        <td className="pl-5 py-3.5 text-[11px] text-slate-400 font-mono w-8">{index + 1}</td>
        {/* Company */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] shrink-0"
              style={{ background: "#f0fdf4" }}>
              {card.flag}
            </div>
            <div>
              <p className="text-[12.5px] font-bold text-slate-900">{card.company}</p>
              <p className="text-[10.5px] text-slate-400">{card.country}</p>
            </div>
          </div>
        </td>
        {/* Quantity */}
        <td className="px-4 py-3.5">
          <span className="text-[13px] font-bold text-slate-700">{card.qty}</span>
        </td>
        {/* Date */}
        <td className="px-4 py-3.5">
          <span className="text-[12px] text-slate-500">{card.date}</span>
        </td>
        {/* Type */}
        <td className="px-4 py-3.5">
          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: card.type === "Capability" ? "#f0fdf4" : "#eff6ff",
                     color:      card.type === "Capability" ? "#166534"  : "#1d4ed8" }}>
            {card.type}
          </span>
        </td>
        {/* Status */}
        <td className="px-4 py-3.5">
          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: ss.bg, color: ss.color }}>
            {card.status}
          </span>
        </td>
        {/* CTA */}
        <td className="px-4 py-3.5 text-right">
          <button
            onClick={e => { e.stopPropagation(); }}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all hover:brightness-110"
            style={{ background: "#1a5c3a" }}>
            {statusActions[card.status]}
          </button>
        </td>
        {/* Expand chevron */}
        <td className="pr-4 py-3.5 w-6">
          <ChevronRight size={13} className={cn(
            "text-slate-300 transition-transform",
            expanded ? "rotate-90" : ""
          )} />
        </td>
      </tr>
      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-[#f0fdf4]/40">
          <td colSpan={8} className="px-8 py-4">
            <div className="flex items-start gap-8">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Enquiry Type</p>
                <p className="text-[12.5px] font-semibold text-slate-700">{card.type} Enquiry</p>
              </div>
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Country</p>
                <p className="text-[12.5px] font-semibold text-slate-700">{card.flag} {card.country}</p>
              </div>
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Quantity Requested</p>
                <p className="text-[12.5px] font-semibold text-slate-700">{card.qty}</p>
              </div>
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Received</p>
                <p className="text-[12.5px] font-semibold text-slate-700">{card.date}</p>
              </div>
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 mb-1">Pipeline Stage</p>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: ss.bg, color: ss.color }}>{card.status}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg text-[11.5px] font-bold border border-[#1a5c3a] text-[#1a5c3a] hover:bg-[#f0fdf4] transition-all">
                  View Details
                </button>
                <button className="px-4 py-2 rounded-lg text-[11.5px] font-bold text-white transition-all hover:brightness-110"
                  style={{ background: "#1a5c3a" }}>
                  {statusActions[card.status]}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Buyer Enquiries Table (inline expansion below section) ──────────────────

function BuyerEnquiriesView({
  productId, onBack,
}: { productId: string; onBack: () => void }) {
  const [statusFilter, setStatusFilter] = useState<"All" | "Proposal" | "Negotiation" | "Won">("All");
  const product  = RUNNING_PRODUCTS_AC.find(p => p.id === productId);
  const allCards = BUYER_CARDS[productId] ?? [];
  const color    = product?.dotColor ?? "#2ACB83";

  const shown = statusFilter === "All" ? allCards : allCards.filter(c => c.status === statusFilter);

  const counts = {
    Proposal:    allCards.filter(c => c.status === "Proposal").length,
    Negotiation: allCards.filter(c => c.status === "Negotiation").length,
    Won:         allCards.filter(c => c.status === "Won").length,
  };

  const pipelineData = OPP_PRODUCT[productId];

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden"
      id="buyer-enquiries-view">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]"
        style={{ background: "#f9fafb" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-[#1a5c3a] transition-colors font-medium border border-slate-200 px-3 py-1.5 rounded-lg hover:border-[#1a5c3a] bg-white">
            <ChevronRight size={13} className="rotate-180" /> Back
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            {product && <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />}
            <div>
              <p className="text-[13.5px] font-bold text-slate-900">
                {product?.name ?? "All"} — Buyer Enquiries
              </p>
              <p className="text-[11px] text-slate-400">
                {allCards.length} total · qualified buyer enquiries delivered by SCINODE
              </p>
            </div>
          </div>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-1.5">
          {(["All", "Proposal", "Negotiation", "Won"] as const).map(s => {
            const cnt = s === "All" ? allCards.length : counts[s];
            const activeColors: Record<string, { bg: string; text: string }> = {
              All:         { bg: "#1a5c3a", text: "white" },
              Proposal:    { bg: "#f0fdf4", text: "#166534" },
              Negotiation: { bg: "#eff6ff", text: "#1d4ed8" },
              Won:         { bg: "#fffbeb", text: "#b45309" },
            };
            const ac = activeColors[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold border transition-all",
                  statusFilter === s
                    ? "border-transparent"
                    : "bg-white border-[#e4e4e7] text-slate-500 hover:border-slate-300"
                )}
                style={statusFilter === s ? { background: ac.bg, color: ac.text, border: "1.5px solid transparent" } : {}}>
                {s}
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  statusFilter === s ? "bg-black/10" : "bg-slate-100 text-slate-500"
                )}>{cnt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini pipeline summary strip */}
      {pipelineData?.pipeline && (
        <div className="px-5 py-3 border-b border-[#f9fafb] flex items-center gap-6 bg-[#fafafa]">
          <span className="text-[10.5px] text-slate-400 font-medium">Pipeline summary:</span>
          {[
            { label: `${pipelineData.total} received`,             dot: "#94a3b8" },
            { label: `${pipelineData.pipeline.proposals} proposals sent`,    dot: color },
            { label: `${pipelineData.pipeline.negotiation} in negotiation`,  dot: "#0077CC" },
            { label: `${pipelineData.pipeline.won} won 🏆`,                 dot: "#f59e0b" },
          ].map((s, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      {shown.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#f9fafb" }} className="border-b border-[#f3f4f6]">
                {["#", "Buyer Company", "Quantity", "Date Received", "Enquiry Type", "Status", "Action", ""].map(h => (
                  <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 px-4 py-3 whitespace-nowrap first:pl-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((card, i) => (
                <BuyerEnquiryRow key={i} card={card} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Target size={20} className="text-slate-300" />
          </div>
          <p className="text-[13px] font-semibold text-slate-400">No {statusFilter} enquiries</p>
        </div>
      )}

      {/* Footer */}
      {shown.length > 0 && (
        <div className="px-5 py-3.5 border-t border-[#f3f4f6] flex items-center justify-between bg-[#fafafa]">
          <p className="text-[11.5px] text-slate-400">
            Showing {shown.length} of {allCards.length} enquiries
          </p>
          <button className="text-[11.5px] font-bold text-[#1a5c3a] hover:underline">
            Export all →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Master Section Component ─────────────────────────────────────────────────

function OpportunitiesSection() {
  const [selectedId, setSelectedId]        = useState("all");
  const [enquiriesProductId, setEnquiries] = useState<string | null>(null);
  const totalOpps                          = OPP_PRODUCT.all.total;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setEnquiries(null);
  };

  const handleViewEnquiries = () => {
    setEnquiries(selectedId);
    setTimeout(() => {
      document.getElementById("buyer-enquiries-view")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <SectionHeader title="Opportunities by Product" sub="Qualified buyer enquiries per campaign" />
        <span className="text-[12px] text-slate-400 font-medium">{totalOpps} total</span>
      </div>

      {/* Master-detail panel */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden flex"
        style={{ minHeight: 520 }}>
        <ProductSelectorPanel selectedId={selectedId} onSelect={handleSelect} />
        <OpportunityDetailContent
          selectedId={selectedId}
          onViewEnquiries={handleViewEnquiries}
        />
      </div>

      {/* Inline buyer enquiries table — expands below on CTA click */}
      {enquiriesProductId && (
        <BuyerEnquiriesView
          productId={enquiriesProductId}
          onBack={() => setEnquiries(null)}
        />
      )}
    </div>
  );
}

// ─── Performance Detail — Channel Mix Pie ─────────────────────────────────────

const CHANNEL_BY_PRODUCT: Record<string, { label: string; pct: number; color: string }[]> = {
  thf: [
    { label: "Website",       pct: 35, color: "#2ACB83" },
    { label: "SCINODE",       pct: 25, color: "#1a5c3a" },
    { label: "LinkedIn",      pct: 20, color: "#0077CC" },
    { label: "Google",        pct: 15, color: "#f59e0b" },
    { label: "Others",        pct: 5,  color: "#94a3b8" },
  ],
  tep: [
    { label: "LinkedIn",      pct: 40, color: "#0077CC" },
    { label: "Google",        pct: 30, color: "#f59e0b" },
    { label: "Website",       pct: 20, color: "#2ACB83" },
    { label: "Others",        pct: 10, color: "#94a3b8" },
  ],
  tec: [
    { label: "SCINODE",       pct: 30, color: "#1a5c3a" },
    { label: "Google",        pct: 25, color: "#f59e0b" },
    { label: "LinkedIn",      pct: 25, color: "#0077CC" },
    { label: "Website",       pct: 15, color: "#2ACB83" },
    { label: "Others",        pct: 5,  color: "#94a3b8" },
  ],
  snb: [
    { label: "SCINODE",       pct: 50, color: "#1a5c3a" },
    { label: "Website",       pct: 30, color: "#2ACB83" },
    { label: "Others",        pct: 20, color: "#94a3b8" },
  ],
};

function ChannelMixPieChart({ productId }: { productId: string }) {
  const slices = CHANNEL_BY_PRODUCT[productId] ?? CHANNEL_BY_PRODUCT.thf;
  const r = 38; const cx = 52; const cy = 52; const circ = 2 * Math.PI * r;
  const gap = 1.8;
  let offset = 0;
  const rendered = slices.map(s => {
    const len = Math.max((s.pct / 100) * circ - gap, 0);
    const item = { ...s, offset, len };
    offset += len + gap;
    return item;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-bold text-slate-800">Channel Mix</p>
        <p className="text-[11.5px] text-slate-400 mt-0.5">Where buyers are discovering you</p>
      </div>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 104 104" className="w-24 h-24 shrink-0 -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="12" />
          {rendered.map(s => (
            <circle key={s.label} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="12"
              strokeDasharray={`${s.len} ${circ - s.len}`}
              strokeDashoffset={-s.offset} />
          ))}
        </svg>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {slices.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-[11.5px] text-slate-600 flex-1 truncate">{s.label}</span>
              <span className="text-[12px] font-bold text-slate-800">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Performance Detail — Lead Source (Line + Bar) ────────────────────────────

const LEAD_SOURCE_BY_PRODUCT: Record<string, {
  weekly: number[];
  sources: { label: string; pct: number; color: string }[];
}> = {
  thf: {
    weekly: [2, 3, 5, 6, 5, 3],
    sources: [
      { label: "Sales Engine", pct: 60, color: "#2ACB83" },
      { label: "Paid Digital", pct: 28, color: "#0077CC" },
      { label: "Organic",      pct: 12, color: "#6237C7" },
    ],
  },
  tep: {
    weekly: [0, 1, 2, 1, 1, 1],
    sources: [
      { label: "Paid Digital", pct: 55, color: "#0077CC" },
      { label: "Organic",      pct: 30, color: "#6237C7" },
      { label: "Sales Engine", pct: 15, color: "#2ACB83" },
    ],
  },
  tec: {
    weekly: [2, 2, 4, 7, 10, 13],
    sources: [
      { label: "Sales Engine", pct: 40, color: "#2ACB83" },
      { label: "Organic",      pct: 35, color: "#6237C7" },
      { label: "Paid Digital", pct: 25, color: "#0077CC" },
    ],
  },
  snb: {
    weekly: [0, 0, 0, 0, 0, 0],
    sources: [{ label: "No data yet", pct: 100, color: "#e2e8f0" }],
  },
};

function LeadSourceChart({ productId }: { productId: string }) {
  const data = LEAD_SOURCE_BY_PRODUCT[productId] ?? LEAD_SOURCE_BY_PRODUCT.thf;
  const W = 260; const H = 80; const pad = 10;
  const maxV = Math.max(...data.weekly, 1);
  const pts = data.weekly.map((v, i) => ({
    x: pad + (i / (data.weekly.length - 1)) * (W - pad * 2),
    y: H - pad - ((v / maxV) * (H - pad * 2)),
  }));
  const linePath = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
  }).join(" ");
  const fillPath = `${linePath} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-bold text-slate-800">Lead Sources</p>
        <p className="text-[11.5px] text-slate-400 mt-0.5">Weekly trend + source breakdown</p>
      </div>

      {/* Line chart */}
      <div>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-2">Weekly Leads</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 72 }}>
          <defs>
            <linearGradient id="lsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2ACB83" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2ACB83" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#lsGrad)" />
          <path d={linePath} fill="none" stroke="#2ACB83" strokeWidth="2" strokeLinecap="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={i === pts.length - 1 ? 4 : 2.5}
              fill={i === pts.length - 1 ? "#2ACB83" : "white"}
              stroke="#2ACB83"
              strokeWidth={i === pts.length - 1 ? 2 : 1.5} />
          ))}
        </svg>
        <div className="flex justify-between mt-1">
          {weeks.map((w, i) => (
            <span key={w} className={cn("text-[9px]",
              i === weeks.length - 1 ? "text-[#1a5c3a] font-bold" : "text-slate-300")}>{w}</span>
          ))}
        </div>
      </div>

      {/* Bars by source */}
      <div>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-2">By Source</p>
        <div className="flex flex-col gap-2.5">
          {data.sources.map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[11.5px] text-slate-600 w-24 shrink-0">{s.label}</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 w-8 text-right shrink-0">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Performance Detail — Country Demand Stats ────────────────────────────────

const COUNTRY_BY_PRODUCT: Record<string, {
  flag: string; name: string; leads: number; strength: "Strong" | "Emerging" | "Weak"; trend: number; pct: number;
}[]> = {
  thf: [
    { flag: "🇩🇪", name: "Germany", leads: 12, strength: "Strong",   trend: 6, pct: 100 },
    { flag: "🇺🇸", name: "USA",     leads: 8,  strength: "Strong",   trend: 3, pct: 67  },
    { flag: "🇯🇵", name: "Japan",   leads: 4,  strength: "Emerging", trend: 1, pct: 33  },
  ],
  tep: [
    { flag: "🇫🇷", name: "France",  leads: 4,  strength: "Emerging", trend: 2, pct: 100 },
    { flag: "🇮🇳", name: "India",   leads: 2,  strength: "Emerging", trend: 0, pct: 50  },
  ],
  tec: [
    { flag: "🇯🇵", name: "Japan",   leads: 19, strength: "Strong",   trend: 8, pct: 100 },
    { flag: "🇦🇪", name: "UAE",     leads: 11, strength: "Strong",   trend: 4, pct: 58  },
    { flag: "🇩🇪", name: "Germany", leads: 6,  strength: "Emerging", trend: 2, pct: 32  },
  ],
  snb: [],
};

const STRENGTH_STYLE: Record<string, { bg: string; color: string }> = {
  Strong:   { bg: "#dcfce7", color: "#166534" },
  Emerging: { bg: "#dbeafe", color: "#1d4ed8" },
  Weak:     { bg: "#fef3c7", color: "#b45309" },
};

function CountryDemandStats({ productId }: { productId: string }) {
  const countries = COUNTRY_BY_PRODUCT[productId] ?? [];

  if (countries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <Globe size={28} className="text-slate-200" />
        <p className="text-[12.5px] font-semibold text-slate-400">No market data yet</p>
        <p className="text-[11px] text-slate-300 text-center">Demand data will appear once the campaign launches</p>
      </div>
    );
  }

  const top = countries.slice(0, 3);
  const rest = countries.slice(3);

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5 flex flex-col gap-4">
      <div>
        <p className="text-[13px] font-bold text-slate-800">Market Demand</p>
        <p className="text-[11.5px] text-slate-400 mt-0.5">Countries responding to your campaign</p>
      </div>

      {/* Hero cards — top 3 */}
      <div className={cn("grid gap-3", top.length === 1 ? "grid-cols-1" : top.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {top.map((c, i) => {
          const ss = STRENGTH_STYLE[c.strength];
          return (
            <div key={c.name}
              className="rounded-xl border border-[#e4e4e7] p-3 flex flex-col gap-2 relative overflow-hidden">
              {i === 0 && (
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "#2ACB83" }} />
              )}
              <span className="text-[22px] leading-none">{c.flag}</span>
              <div>
                <p className="text-[12px] font-bold text-slate-800 leading-tight">{c.name}</p>
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: ss.bg, color: ss.color }}>{c.strength}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-black text-slate-900 leading-none">{c.leads}</span>
                <span className="text-[9.5px] text-slate-400">sales reach out</span>
                {c.trend > 0 && (
                  <span className="text-[9.5px] font-bold ml-auto" style={{ color: "#166534" }}>↑{c.trend}</span>
                )}
              </div>
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: "#2ACB83" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact rows for rest */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 border-t border-[#f3f4f6]">
          {rest.map(c => {
            const ss = STRENGTH_STYLE[c.strength];
            return (
              <div key={c.name} className="flex items-center gap-2.5">
                <span className="text-[14px] leading-none shrink-0">{c.flag}</span>
                <span className="text-[12px] text-slate-700 font-medium w-16 shrink-0">{c.name}</span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: ss.bg, color: ss.color }}>{c.strength}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: "#60a5fa" }} />
                </div>
                <span className="text-[11.5px] font-bold text-slate-700 shrink-0">{c.leads}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Performance Detail Panel ─────────────────────────────────────────────────

function PerformanceDetailPanel({
  defaultProductId, onClose,
}: {
  defaultProductId: string; onClose: () => void;
}) {
  const runningProducts = ACTIVE_CAMPAIGN_PRODUCTS.filter(p => p.stageIndex > 1);
  const initId = runningProducts.find(p => p.id === defaultProductId)?.id ?? runningProducts[0]?.id ?? "";
  const [productId, setProductId] = useState(initId);
  const selected = runningProducts.find(p => p.id === productId);

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionHeader title="Consolidated Performance" sub="Live campaign data" />
        <div className="flex items-center gap-3 shrink-0">
          {/* Product dropdown */}
          <div className="relative">
            <select value={productId} onChange={e => setProductId(e.target.value)}
              className="appearance-none bg-white border-2 border-[#1a5c3a] rounded-xl pl-4 pr-9 py-2 text-[12.5px] font-bold text-[#1a5c3a] cursor-pointer focus:outline-none hover:bg-[#f0fdf4] transition-colors">
              {runningProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1a5c3a] pointer-events-none" />
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[#e4e4e7] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-400 transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Product context strip */}
      {selected && (
        <div className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-[#e4e4e7] flex-wrap">
          <Star size={14} fill="#f59e0b" className="text-[#f59e0b] shrink-0" />
          <span className="text-[13px] font-bold text-slate-900">{selected.name}</span>
          <span className="text-[11px] font-mono text-slate-400">CAS {selected.cas}</span>
          {stagePill(selected.stage)}
          <span className="text-[11px] text-slate-400">Day {selected.dayActive} / {selected.totalDays}</span>
          <div className="flex-1 min-w-[100px] h-1 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full" style={{
              width: `${Math.round((selected.dayActive / selected.totalDays) * 100)}%`,
              background: selected.dotColor,
            }} />
          </div>
        </div>
      )}

      {/* Action alert for blocked products */}
      {selected?.actionRequired && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border"
          style={{ background: "#fef3c7", borderColor: "#fde68a" }}>
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle size={16} style={{ color: "#b45309" }} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold" style={{ color: "#92400e" }}>Action Required — Campaign Paused</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Accept the Market Opportunity Plan to resume demand generation for this product.</p>
            </div>
          </div>
          <button className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold text-white whitespace-nowrap"
            style={{ background: "#1a5c3a" }}>Accept Plan →</button>
        </div>
      )}

      {/* 3-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChannelMixPieChart productId={productId} />
        <LeadSourceChart productId={productId} />
        <CountryDemandStats productId={productId} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL SCREEN — full-page view on "View Details →" click  (NEW)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Detail stage stepper (ref image 2 style — ✓ done, number active, beeping) ─

const DETAIL_STAGES_DEF: { key: CampaignStage; label: string }[] = [
  { key: "Setup for Demand",  label: "Setup for Demand"  },
  { key: "Execution Planning", label: "Execution Planning" },
  { key: "Demand Generation", label: "Demand Generation" },
  { key: "Opportunities Pipeline", label: "Opportunities Pipeline" },
];

// ─── Shared: 3 info cards shown on every detail screen ───────────────────────

function DetailInfoCards() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        {
          icon: "📊", label: "EXPECTED FIRST SIGNALS",
          body: <>Enquiries typically begin in <strong>2–4 weeks</strong> once your campaign goes live.</>,
          bg: "#f9fafb", border: "#e4e4e7",
        },
        {
          icon: "🙏", label: "WHAT WE NEED FROM YOU",
          body: <ul className="list-disc list-inside text-[12px]"><li>Respond to enquiries within <strong>24h</strong></li><li>Dispatch samples within <strong>5 days</strong></li></ul>,
          bg: "#f9fafb", border: "#e4e4e7",
        },
        {
          icon: "✏️", label: "HONESTY IS THE PLAN",
          body: <>We say <em>expected first signals</em>, never guaranteed leads.</>,
          bg: "#f0fdf4", border: "#bbf7d0",
        },
      ].map(c => (
        <div key={c.label} className="rounded-xl px-4 py-3.5 border"
          style={{ background: c.bg, borderColor: c.border }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2">
            {c.icon} {c.label}
          </p>
          <div className="text-[12.5px] text-slate-600 leading-relaxed">{c.body}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Shared: Campaign Journey Stepper (ref image 2 style) ─────────────────────

function DetailStageStepper({ activeStage, noCard = false, onStageClick }: {
  activeStage: CampaignStage;
  noCard?: boolean;
  onStageClick?: (stage: CampaignStage) => void;
}) {
  const activeStageIndex = STAGE_EXPLAINER.findIndex(s => s.stage === activeStage) + 1;

  const inner = (
    <>
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400 mb-5">
        Product Campaign Journey — 4 Stages
      </p>
      <div className="relative flex items-start">
        {/* Track */}
        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 rounded-full bg-slate-100 z-0 overflow-hidden">
          <div className="h-full rounded-full dc-line-sweep"
            style={{
              background: "linear-gradient(90deg,#2ACB83,#0077CC)",
              width: `${((activeStageIndex - 1) / 3) * 100}%`,
            }} />
        </div>

        {STAGE_EXPLAINER.map((s, i) => {
          const Icon        = s.icon;
          const meta        = STAGE_META[s.stage];
          const filled      = i + 1 <= activeStageIndex;
          const active      = i + 1 === activeStageIndex;
          const isCompleted = filled && !active;
          const clickable   = filled && !!onStageClick; // both completed AND active stages are clickable

          const content = (
            <>
              {/* Icon circle */}
              <div className="relative">
                {active && (
                  <div className="dc-beacon-ring absolute rounded-full border-2"
                    style={{ inset: "-5px", borderColor: "#1a5c3a" }} />
                )}
                {clickable && (
                  <div className="absolute inset-0 rounded-full ring-2 ring-[#2ACB83]/40 ring-offset-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-150",
                  filled  ? "border-transparent" : "border-slate-200 bg-white",
                  active  ? "dc-active-stage shadow-[0_0_0_4px_rgba(42,203,131,0.15)]" : "",
                  clickable ? "group-hover:scale-110" : "",
                )}
                  style={filled ? { background: meta.bg, borderColor: "transparent" } : {}}>
                  <Icon size={14} style={{ color: filled ? meta.color : "#cbd5e1" }} />
                </div>
              </div>

              {/* Stage label */}
              <div className="text-center px-1">
                <p className={cn(
                  "text-[11px] font-bold leading-snug transition-colors",
                  filled ? "text-slate-800" : "text-slate-400",
                  clickable ? "group-hover:text-[#1a5c3a]" : "",
                )}>{s.stage}</p>
                <p className={cn(
                  "text-[10px] mt-0.5 leading-snug",
                  active ? "text-[#166534] font-semibold" : "text-slate-400",
                )}>{s.desc}</p>
                {clickable && (
                  <p className={cn("text-[9px] font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                    active ? "text-[#1a5c3a]" : "text-[#2ACB83]")}>
                    {active ? "Current stage" : "View →"}
                  </p>
                )}
              </div>
            </>
          );

          return clickable ? (
            <button
              key={s.stage}
              title={`View ${s.stage}`}
              onClick={() => onStageClick!(s.stage)}
              className={cn("group flex flex-col items-center gap-2 flex-1 min-w-0 relative z-10", `dc-stage-in-${i + 1}`)}>
              {content}
            </button>
          ) : (
            <div key={s.stage}
              className={cn("flex flex-col items-center gap-2 flex-1 min-w-0 relative z-10", `dc-stage-in-${i + 1}`)}>
              {content}
            </div>
          );
        })}
      </div>
    </>
  );

  if (noCard) return <div className="px-6 pt-4 pb-5">{inner}</div>;
  return <div className="bg-white rounded-2xl border border-[#e4e4e7] px-6 pt-5 pb-6">{inner}</div>;
}

// ─── Shared Stage Hero Card ───────────────────────────────────────────────────

function StageHeroCard({ product, stageLabel, stageNum, headline, subtext, statusDot, statusText, metrics, ctaLabel, onCtaClick, onStageClick }: {
  product: CampaignProduct;
  stageLabel: string;
  stageNum: string;
  headline: string;
  subtext: string;
  statusDot: string;
  statusText: string;
  metrics: { label: string; value: string }[];
  ctaLabel: string;
  onCtaClick?: () => void;
  onStageClick?: (stage: CampaignStage) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
      {/* Hero row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
        {/* Left: stage label + headline + product meta */}
        <div className="px-6 py-5 border-b lg:border-b-0 lg:border-r border-[#f3f4f6]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#0077CC]">{stageLabel}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">{stageNum}</span>
          </div>
          <h2 className="text-[20px] font-black text-slate-900 leading-snug mb-1">{headline}</h2>
          <p className="text-[12.5px] text-slate-500 mb-4">{subtext}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Product",  value: product.name     },
              { label: "CAS",      value: product.cas      },
              { label: "Industry", value: product.industry },
              { label: "Duration", value: "90 Days"        },
            ].map(item => (
              <div key={item.label}>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-0.5">{item.label}</p>
                <p className="text-[12.5px] font-bold text-slate-900 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Right: status + CTA only */}
        <div className="px-5 py-5 flex flex-col gap-4 justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusDot }} />
            <span className="text-[12px] font-bold"
              style={{ color: statusDot === "#2ACB83" ? "#166534" : statusDot === "#f59e0b" ? "#92400e" : "#0c4a6e" }}>
              {statusText}
            </span>
          </div>
          <button onClick={onCtaClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2ACB83] text-[#020202] text-[13px] font-bold hover:brightness-105 transition-all mt-auto">
            <PhoneCall size={14} /> {ctaLabel}
          </button>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-[#f3f4f6]" />

      {/* Timeline — same animated stepper, no outer card */}
      <DetailStageStepper activeStage={product.stage as CampaignStage} noCard onStageClick={onStageClick} />
    </div>
  );
}

// ─── Screen A: Setup for Demand (THF) ── ref image 1 ─────────────────────────

// Pre-populated THF data (sourced from Profile → Product Catalogue)
const THF_FORM_PREFILLED = {
  name:       "Tetrahydrofuran",
  cas:        "109-99-9",
  industry:   "Specialty Chemicals",
  grade:      "Anhydrous",
  purity:     "99.9",
  moq:        "200",
  moqUnit:    "kg",
  availability: "In Inventory" as "In Inventory" | "Made to Order",
  capacity:   "40",
  capacityUnit: "MT",
  price:      "1,200",
  packaging:  "25 L drums",
  leadTime:   "3-4 weeks",
  incoterms:  "FOB",
  capabilities: ["GMP route", "Low metal residue", "Custom packaging"],
  countries:  ["Germany", "Japan", "United States"],
  coa:   true,
  msds:  true,
  tds:   true,
  certs: [{ name: "ISO 9001", authority: "Bureau Veritas", scope: "Plant" as const }],
};

// ─── Full world country list with flags ──────────────────────────────────────
const ALL_WORLD_COUNTRIES = [
  { flag:"🇦🇫", name:"Afghanistan" },    { flag:"🇦🇱", name:"Albania" },
  { flag:"🇩🇿", name:"Algeria" },        { flag:"🇦🇷", name:"Argentina" },
  { flag:"🇦🇺", name:"Australia" },      { flag:"🇦🇹", name:"Austria" },
  { flag:"🇧🇭", name:"Bahrain" },        { flag:"🇧🇩", name:"Bangladesh" },
  { flag:"🇧🇪", name:"Belgium" },        { flag:"🇧🇷", name:"Brazil" },
  { flag:"🇨🇦", name:"Canada" },         { flag:"🇨🇱", name:"Chile" },
  { flag:"🇨🇳", name:"China" },          { flag:"🇨🇴", name:"Colombia" },
  { flag:"🇨🇿", name:"Czech Republic" }, { flag:"🇩🇰", name:"Denmark" },
  { flag:"🇪🇬", name:"Egypt" },          { flag:"🇫🇮", name:"Finland" },
  { flag:"🇫🇷", name:"France" },         { flag:"🇩🇪", name:"Germany" },
  { flag:"🇬🇭", name:"Ghana" },          { flag:"🇬🇷", name:"Greece" },
  { flag:"🇭🇰", name:"Hong Kong" },      { flag:"🇭🇺", name:"Hungary" },
  { flag:"🇮🇳", name:"India" },          { flag:"🇮🇩", name:"Indonesia" },
  { flag:"🇮🇷", name:"Iran" },           { flag:"🇮🇶", name:"Iraq" },
  { flag:"🇮🇪", name:"Ireland" },        { flag:"🇮🇱", name:"Israel" },
  { flag:"🇮🇹", name:"Italy" },          { flag:"🇯🇵", name:"Japan" },
  { flag:"🇯🇴", name:"Jordan" },         { flag:"🇰🇿", name:"Kazakhstan" },
  { flag:"🇰🇪", name:"Kenya" },          { flag:"🇰🇷", name:"South Korea" },
  { flag:"🇰🇼", name:"Kuwait" },         { flag:"🇲🇾", name:"Malaysia" },
  { flag:"🇲🇽", name:"Mexico" },         { flag:"🇲🇦", name:"Morocco" },
  { flag:"🇳🇱", name:"Netherlands" },    { flag:"🇳🇿", name:"New Zealand" },
  { flag:"🇳🇬", name:"Nigeria" },        { flag:"🇳🇴", name:"Norway" },
  { flag:"🇴🇲", name:"Oman" },           { flag:"🇵🇰", name:"Pakistan" },
  { flag:"🇵🇭", name:"Philippines" },    { flag:"🇵🇱", name:"Poland" },
  { flag:"🇵🇹", name:"Portugal" },       { flag:"🇶🇦", name:"Qatar" },
  { flag:"🇷🇴", name:"Romania" },        { flag:"🇷🇺", name:"Russia" },
  { flag:"🇸🇦", name:"Saudi Arabia" },   { flag:"🇸🇬", name:"Singapore" },
  { flag:"🇿🇦", name:"South Africa" },   { flag:"🇪🇸", name:"Spain" },
  { flag:"🇸🇪", name:"Sweden" },         { flag:"🇨🇭", name:"Switzerland" },
  { flag:"🇹🇼", name:"Taiwan" },         { flag:"🇹🇭", name:"Thailand" },
  { flag:"🇹🇷", name:"Turkey" },         { flag:"🇺🇦", name:"Ukraine" },
  { flag:"🇦🇪", name:"UAE" },            { flag:"🇬🇧", name:"United Kingdom" },
  { flag:"🇺🇸", name:"United States" },  { flag:"🇻🇳", name:"Vietnam" },
];

// ─── Multi-select country dropdown — portal-based to escape overflow-hidden ──
function CountryMultiSelect({
  selected, onChange,
}: { selected: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [dropRect, setDropRect] = useState<DOMRect | null>(null);
  const triggerRef            = useRef<HTMLButtonElement>(null);
  const dropRef               = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropRef.current   && !dropRef.current.contains(e.target as Node)
      ) { setOpen(false); setQuery(""); }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const openDropdown = () => {
    if (triggerRef.current) setDropRect(triggerRef.current.getBoundingClientRect());
    setOpen(o => !o);
  };

  // Recompute position on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => { if (triggerRef.current) setDropRect(triggerRef.current.getBoundingClientRect()); };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open]);

  const filtered = ALL_WORLD_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );
  const toggle   = (name: string) =>
    onChange(selected.includes(name) ? selected.filter(x => x !== name) : [...selected, name]);
  const removeAll = () => onChange([]);
  const selectedCountries = ALL_WORLD_COUNTRIES.filter(c => selected.includes(c.name));

  const dropdown = open && dropRect ? createPortal(
    <div ref={dropRef}
      style={{
        position: "fixed",
        top:   dropRect.bottom + 4,
        left:  dropRect.left,
        width: dropRect.width,
        zIndex: 9999,
      }}>
      <div className="bg-white border border-[#cbd5e1] rounded-[6px] shadow-2xl overflow-hidden">
        {/* Search */}
        <div className="px-3 py-2.5 border-b border-[#f3f4f6] flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#9ca3af] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search countries…"
            className="flex-1 text-sm outline-none placeholder:text-[#9ca3af] text-[#020202] bg-transparent" />
          {query && (
            <button type="button" onClick={() => setQuery("")}
              className="text-[#9ca3af] hover:text-[#353535]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {/* Options */}
        <div className="max-h-60 overflow-y-auto">
          {filtered.length === 0
            ? <p className="text-sm text-[#9ca3af] px-3 py-4 text-center">No countries found</p>
            : filtered.map(c => {
              const isSel = selected.includes(c.name);
              return (
                <button key={c.name} type="button" onClick={() => toggle(c.name)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left border-b border-[#f9fafb] last:border-0 transition-colors",
                    isSel ? "bg-[#f0faf5] text-[#1F6F54]" : "text-[#353535] hover:bg-[#f0faf5]"
                  )}>
                  <span className="text-base leading-none w-5 shrink-0">{c.flag}</span>
                  <span className={cn("flex-1", isSel && "font-medium")}>{c.name}</span>
                  {isSel && <Check className="w-3.5 h-3.5 text-[#1F6F54] shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })}
        </div>
        {/* Footer */}
        {selected.length > 0 && (
          <div className="px-3 py-2 border-t border-[#f3f4f6] flex items-center justify-between bg-[#fafafa]">
            <span className="text-xs text-[#9ca3af]">{selected.length} selected</span>
            <button type="button" onClick={removeAll}
              className="text-xs font-medium text-[#dc2626] hover:underline">Clear all</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Trigger */}
      <button ref={triggerRef} type="button" onClick={openDropdown}
        className={cn(inputCls, "flex items-center justify-between bg-white cursor-pointer",
          open && "ring-2 ring-[#1F6F54]/30 border-[#1F6F54]")}>
        <span className={cn("text-sm flex-1 text-left", selected.length === 0 && "text-[#9ca3af]")}>
          {selected.length === 0
            ? "Select target countries…"
            : `${selected.length} countr${selected.length === 1 ? "y" : "ies"} selected`}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-[#94a3b8] ml-2 flex-shrink-0 transition-transform duration-150", open && "rotate-180")} />
      </button>

      {dropdown}

      {/* Selected pills */}
      {selectedCountries.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {selectedCountries.map(c => (
            <span key={c.name}
              className="flex items-center gap-1.5 bg-[#e6f4ef] text-[#1F6F54] text-xs font-medium px-2.5 py-1 rounded-full">
              <span className="text-[13px] leading-none">{c.flag}</span>
              {c.name}
              <button type="button" onClick={() => toggle(c.name)} className="hover:text-[#185C45] ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SetupForDemandDetail({ product, onStageClick, onSubmitComplete }: { product: CampaignProduct; onStageClick?: (s: CampaignStage) => void; onSubmitComplete?: () => void }) {
  const { products: profileProducts } = useProfileStore();
  const [submitted, setSubmitted]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm]               = useState({ ...THF_FORM_PREFILLED });
  const [newCert, setNewCert]         = useState({ name: "", authority: "" });
  const [docFiles, setDocFiles]       = useState<Record<string, { name: string; size: number; type: string; url: string }>>({});

  const allCapabilities = ["GMP route", "Low metal residue", "Custom packaging", "Cold chain", "FSSC 22000", "Halal certified"];
  const allCountries    = ["Germany 🇩🇪", "France 🇫🇷", "USA 🇺🇸", "Japan 🇯🇵", "UAE 🇦🇪", "Saudi Arabia 🇸🇦", "India 🇮🇳", "Singapore 🇸🇬"];

  const toggleCap     = (c: string) => setForm(f => ({
    ...f, capabilities: f.capabilities.includes(c)
      ? f.capabilities.filter(x => x !== c)
      : [...f.capabilities, c],
  }));
  const toggleCountry = (c: string) => setForm(f => ({
    ...f, countries: f.countries.includes(c)
      ? f.countries.filter(x => x !== c)
      : [...f.countries, c],
  }));

  // Completeness: identity 45, commercial 30, documents 25
  const identScore = [form.name, form.cas, form.industry, form.grade, form.purity, form.moq].filter(Boolean).length;
  const commScore  = [form.availability, form.capacity, form.price, form.packaging, form.leadTime, form.incoterms].filter(Boolean).length + (form.countries.length > 0 ? 1 : 0);
  const docScore   = [form.coa, form.msds, form.tds].filter(Boolean).length + (form.certs.length > 0 ? 1 : 0);
  const pct        = Math.min(100, Math.round(((identScore / 6) * 45) + ((commScore / 7) * 30) + ((docScore / 4) * 25)));
  const level      = pct >= 80 ? "Strong" : pct >= 50 ? "Good" : "Weak";

  const [activeSection, setActiveSection] = useState<"identity" | "commercial" | "documents">("identity");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const identityRef    = useRef<HTMLDivElement>(null);
  const commercialRef  = useRef<HTMLDivElement>(null);
  const documentsRef   = useRef<HTMLDivElement>(null);

  // Per-tab missing mandatory fields (only shown after submit attempt)
  const missingByTab = {
    identity: [
      !form.name        && "Product Name",
      !form.cas         && "CAS Number",
      !form.industry    && "Industry",
      !form.grade       && "Grade",
      !form.purity      && "Purity (%)",
      !form.moq         && "MOQ",
    ].filter(Boolean) as string[],
    commercial: [
      !form.availability  && "Commercial Availability",
      !form.capacity      && "Production Capacity",
      !form.price         && "Price",
      !form.packaging     && "Packaging",
      !form.leadTime      && "Lead Time",
      !form.incoterms     && "Incoterms",
    ].filter(Boolean) as string[],
    documents: [
      !form.coa               && "COA (Certificate of Analysis)",
      form.certs.length === 0 && "At least 1 Compliance Certificate",
    ].filter(Boolean) as string[],
  };
  const totalMissing = missingByTab.identity.length + missingByTab.commercial.length + missingByTab.documents.length;

  const scrollTo = (section: "identity" | "commercial" | "documents") => {
    setActiveSection(section);
    const ref = section === "identity" ? identityRef : section === "commercial" ? commercialRef : documentsRef;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navItems = [
    { id: "identity"   as const, label: "Identity",             icon: "🪪", done: identScore === 6 },
    { id: "commercial" as const, label: "Commercial Readiness", icon: "📦", done: commScore >= 6   },
    { id: "documents"  as const, label: "Documents & Certs",    icon: "📄", done: docScore >= 3    },
  ];

  // Success overlay — auto-dismisses after 2.8s then navigates to Execution Planning
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
        <style>{`
          @keyframes sfd-pop { 0%{opacity:0;transform:scale(0.85)} 60%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
          @keyframes sfd-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
          @keyframes sfd-bar { 0%{width:100%} 100%{width:0%} }
          .sfd-card { animation: sfd-pop 0.42s cubic-bezier(0.22,1,0.36,1) both; }
          .sfd-ring { animation: sfd-ring 1.4s ease-out infinite; }
          .sfd-bar  { animation: sfd-bar 2.8s linear forwards; }
        `}</style>
        <div className="sfd-card bg-white rounded-3xl shadow-2xl flex flex-col items-center gap-5 px-10 py-10 max-w-sm w-full text-center">
          {/* Icon with pulse ring */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="sfd-ring absolute inset-0 rounded-full border-2 border-[#2ACB83]" />
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#1a5c3a,#2ACB83)" }}>
              <CheckCircle2 size={34} style={{ color: "white" }} />
            </div>
          </div>
          <div>
            <h3 className="text-[22px] font-black text-slate-900 mb-1">Setup Submitted!</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              SCINODE is now reviewing your product details.<br />
              Taking you to Execution Planning…
            </p>
          </div>
          {/* Auto-dismiss countdown bar */}
          <div className="w-full h-1 rounded-full bg-[#f0fdf4] overflow-hidden">
            <div className="sfd-bar h-full rounded-full" style={{ background: "#2ACB83" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StageHeroCard
        product={product}
        stageLabel="Setup for Demand"
        stageNum="Stage 1 of 4"
        headline="Complete Your Product Information"
        subtext="Help SCINODE understand your product so we can build the best campaign for you."
        statusDot="#f59e0b"
        statusText="Setup in Progress"
        metrics={[
          { label: "Profile Completeness", value: `${pct}%`      },
          { label: "Documents Added",      value: docScore > 0 ? `${docScore} / 4` : "0 / 4" },
          { label: "Next Step",            value: "Submit Setup"  },
        ]}
        ctaLabel="Schedule a Call"
        onStageClick={onStageClick}
      />
    <div className="grid lg:grid-cols-10 gap-6">
      {/* LEFT — sidebar (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-3 sticky top-6 self-start">

        {/* Discovery Score card */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-5">
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative shrink-0">
              <svg viewBox="0 0 80 80" className="w-16 h-16">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#f3f4f6" strokeWidth="7" />
                <circle cx="40" cy="40" r="30" fill="none"
                  stroke={pct >= 80 ? "#2ACB83" : pct >= 50 ? "#f59e0b" : "#2ACB83"}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 188} 188`}
                  strokeDashoffset="47"
                  style={{ transition: "stroke-dasharray 0.7s ease" }} />
                <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0f172a">{pct}%</text>
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#2ACB83] border-2 border-white" />
            </div>
            {/* Text */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">Discovery Score</p>
              <p className="text-[11px] text-slate-400 leading-snug">Fill your profile to get discovered</p>
            </div>
          </div>
        </div>

        {/* Nav card */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
          <div className="flex flex-col">
            {navItems.map((item) => {
              const isActive  = activeSection === item.id;
              const missing   = missingByTab[item.id];
              const hasErrors = submitAttempted && missing.length > 0;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-[#f9fafb] last:border-0",
                    isActive ? "bg-[#1a5c3a] text-white" : "hover:bg-[#f9fafb] text-slate-600"
                  )}>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-[14px] shrink-0",
                    isActive ? "bg-white/15" : "bg-[#f3f4f6]"
                  )}>
                    {item.icon}
                  </div>
                  <span className={cn("text-[12.5px] font-semibold flex-1", isActive ? "text-white" : "text-slate-700")}>
                    {item.label}
                  </span>
                  {hasErrors && (
                    <span className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[9px] font-black shrink-0 mr-1"
                      style={{ width: 18, height: 18, fontSize: 9 }}>
                      {missing.length}
                    </span>
                  )}
                  <ChevronRight size={13} className={isActive ? "text-white/60" : "text-slate-300"} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation summary — always visible, updates live */}
        {totalMissing > 0 ? (
          <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border-b border-red-100">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 text-white text-[10px] font-black">!</div>
              <div>
                <p className="text-[12px] font-bold text-red-700">Missing required fields</p>
                <p className="text-[10.5px] text-red-400">{totalMissing} field{totalMissing > 1 ? "s" : ""} need{totalMissing === 1 ? "s" : ""} attention</p>
              </div>
            </div>

            {/* Per-tab breakdown */}
            <div className="flex flex-col">
              {(["identity", "commercial", "documents"] as const).map((tab, ti) => {
                const missing = missingByTab[tab];
                if (missing.length === 0) return null;
                const nav = navItems.find(n => n.id === tab)!;
                return (
                  <div key={tab} className={cn("px-4 py-3", ti > 0 && "border-t border-[#f9fafb]")}>
                    {/* Tab label — clickable to jump */}
                    <button type="button" onClick={() => scrollTo(tab)}
                      className="flex items-center gap-2 mb-2 group w-full text-left">
                      <span className="text-[13px] leading-none">{nav.icon}</span>
                      <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#1F6F54] transition-colors flex-1">
                        {nav.label}
                      </span>
                      <ChevronRight size={11} className="text-slate-300 group-hover:text-[#1F6F54] transition-colors shrink-0" />
                    </button>
                    {/* Missing fields list */}
                    <div className="flex flex-col gap-1.5">
                      {missing.map(field => (
                        <div key={field} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-[4px]" />
                          <span className="text-[11px] text-red-500 leading-snug">{field}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-[#f0faf5] rounded-2xl border border-[#bbf7d0]">
            <CheckCircle2 size={16} className="text-[#1F6F54] shrink-0" />
            <p className="text-[12px] font-semibold text-[#1F6F54]">All required fields complete!</p>
          </div>
        )}

      </div>

      {/* RIGHT — form (7 cols) — only active section shown */}
      <div className="lg:col-span-7 flex flex-col gap-5">

        {/* ── Identity ── */}
        {activeSection === "identity" && (
          <div ref={identityRef} className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6]">
              <div className="flex items-center gap-2">
                <span className="text-base">🪪</span>
                <span className="text-sm font-semibold text-[#020202]">Identity</span>
              </div>
              <span className="text-[11px] font-bold text-[#166534]">45% · all mandatory</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {/* Product Name */}
              <FormField label={<>Product Name <span className="text-red-500">*</span></>}>
                <input className={inputCls} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Tetrahydrofuran" />
              </FormField>

              {/* CAS + Industry */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label={<>CAS Number <span className="text-red-500">*</span></>}>
                  <input className={inputCls} value={form.cas}
                    onChange={e => setForm(f => ({ ...f, cas: e.target.value }))}
                    placeholder="e.g. 109-99-9" />
                </FormField>
                <FormField label={<>Industry <span className="text-red-500">*</span></>}>
                  <DropdownSelect value={form.industry}
                    onChange={v => setForm(f => ({ ...f, industry: v }))}
                    options={INDUSTRIES} placeholder="Select industry" />
                </FormField>
              </div>

              {/* Grade + Purity */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label={<>Grade <span className="text-red-500">*</span></>}>
                  <DropdownSelect value={form.grade}
                    onChange={v => setForm(f => ({ ...f, grade: v }))}
                    options={PRODUCT_GRADES} placeholder="Select grade" />
                </FormField>
                <FormField label={<>Purity (%) <span className="text-red-500">*</span></>}>
                  <input className={inputCls} type="number" min="0" max="100" step="0.01"
                    value={form.purity}
                    onChange={e => setForm(f => ({ ...f, purity: e.target.value }))}
                    placeholder="e.g. 99.9" />
                </FormField>
              </div>

              {/* MOQ */}
              <FormField label={<>MOQ (Minimum Order Quantity) <span className="text-red-500">*</span></>}>
                <div className="flex gap-2">
                  <input className={inputCls + " flex-1 min-w-0"} value={form.moq}
                    onChange={e => setForm(f => ({ ...f, moq: e.target.value }))}
                    placeholder="e.g. 200" />
                  <DropdownSelect value={form.moqUnit}
                    onChange={v => setForm(f => ({ ...f, moqUnit: v }))}
                    options={MOQ_UNITS} className="w-[90px] flex-shrink-0" />
                </div>
              </FormField>
            </div>
          </div>
        )}

        {/* ── Commercial Readiness ── */}
        {activeSection === "commercial" && (
          <div ref={commercialRef} className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6]">
              <div className="flex items-center gap-2">
                <span className="text-base">📦</span>
                <span className="text-sm font-semibold text-[#020202]">Commercial Readiness</span>
              </div>
              <span className="text-[11px] font-bold text-[#0077CC]">30%</span>
            </div>
            <div className="p-5 flex flex-col gap-4">

              {/* Commercial Availability */}
              <FormField label={<>Commercial Availability <span className="text-red-500">*</span></>}>
                <div className="flex rounded-[6px] overflow-hidden border border-[#cbd5e1] w-fit">
                  {(["Made to Order", "In Inventory"] as const).map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setForm(f => ({ ...f, availability: opt }))}
                      className={cn("px-5 py-2 text-sm font-medium transition-colors",
                        form.availability === opt
                          ? "bg-[#1F6F54] text-white"
                          : "bg-white text-[#71717a] hover:bg-[#f7f7f7]")}>
                      {opt}
                    </button>
                  ))}
                </div>
              </FormField>

              {/* Production Capacity + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label={<>Production Capacity <span className="text-red-500">*</span></>}>
                  <input className={inputCls} value={form.capacity}
                    onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                    placeholder="e.g. 500" />
                </FormField>
                <FormField label={<>Unit <span className="text-red-500">*</span></>}>
                  <DropdownSelect value={form.capacityUnit}
                    onChange={v => setForm(f => ({ ...f, capacityUnit: v }))}
                    options={INVENTORY_UNITS} placeholder="Select unit" />
                </FormField>
              </div>

              {/* Price + Packaging */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label={<>Price <span className="text-red-500">*</span></>}>
                  <input className={inputCls} value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. $12/kg" />
                </FormField>
                <FormField label={<>Packaging <span className="text-red-500">*</span></>}>
                  <input className={inputCls} value={form.packaging}
                    onChange={e => setForm(f => ({ ...f, packaging: e.target.value }))}
                    placeholder="e.g. 25 kg HDPE drums" />
                </FormField>
              </div>

              {/* Lead Time + Incoterms */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label={<>Lead Time <span className="text-red-500">*</span></>}>
                  <input className={inputCls} value={form.leadTime}
                    onChange={e => setForm(f => ({ ...f, leadTime: e.target.value }))}
                    placeholder="e.g. 2–3 weeks" />
                </FormField>
                <FormField label={<>Incoterms <span className="text-red-500">*</span></>}>
                  <DropdownSelect value={form.incoterms}
                    onChange={v => setForm(f => ({ ...f, incoterms: v }))}
                    options={["FOB", "CIF", "EXW", "DDP", "FCA"]}
                    placeholder="Select incoterm" />
                </FormField>
              </div>

              {/* Unique Capabilities — PillInput (same as Profile module) */}
              <FormField label={<>Unique Capabilities <span className="text-red-500">*</span></>}
                hint="Type a capability and press Enter to add it as a pill.">
                <PillInput
                  pills={form.capabilities}
                  onChange={caps => setForm(f => ({ ...f, capabilities: caps }))}
                  placeholder="e.g. GMP route, Cold chain…" />
              </FormField>

              {/* Target Countries — multi-select dropdown with pills */}
              <FormField label={<>Target Countries <span className="text-xs text-[#9ca3af] font-normal">(drives certificate recommendations)</span></>}>
                <CountryMultiSelect
                  selected={form.countries}
                  onChange={ctrs => setForm(f => ({ ...f, countries: ctrs }))} />
              </FormField>

            </div>
          </div>
        )}

        {/* Documents section — single card with separators */}
        {activeSection === "documents" && <div ref={documentsRef} className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6]">
            <div className="flex items-center gap-2">
              <span className="text-base">📄</span>
              <span className="text-sm font-semibold text-[#020202]">Documents & Certificates</span>
            </div>
            <span className="text-[11px] font-bold text-[#6237C7]">25%</span>
          </div>

          {/* ── Section A: Product-Level Documents ── */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">A</span>
              <div className="flex-1 h-px bg-[#f3f4f6]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">Product-Level Documents</span>
              <div className="flex-1 h-px bg-[#f3f4f6]" />
            </div>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: "coa",  label: "COA",  fullLabel: "Certificate of Analysis", badge: "REQUIRED", accept: ".pdf,.doc,.docx" },
                  { key: "msds", label: "MSDS", fullLabel: "Material Safety Data Sheet", badge: "OPTIONAL", accept: ".pdf,.doc,.docx" },
                  { key: "tds",  label: "TDS",  fullLabel: "Technical Data Sheet",      badge: "OPTIONAL", accept: ".pdf,.doc,.docx" },
                ] as const).map(d => {
                  const fileKey = d.key as "coa" | "msds" | "tds";
                  const uploaded = docFiles[fileKey];
                  const inputId  = `doc-upload-${d.key}`;
                  return (
                    <div key={d.key}
                      className={cn(
                        "relative rounded-[8px] border-2 transition-all duration-150 overflow-hidden",
                        uploaded ? "border-[#1F6F54] bg-[#f0faf5]" : "border-dashed border-[#cbd5e1] bg-white hover:border-[#1F6F54]/60 hover:bg-[#fafffe]"
                      )}>

                      {/* Hidden file input */}
                      <input id={inputId} type="file" accept={d.accept} className="sr-only"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setDocFiles(prev => ({ ...prev, [fileKey]: { name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file) } }));
                          setForm(f => ({ ...f, [fileKey]: true }));
                          e.target.value = "";
                        }} />

                      {uploaded ? (
                        /* ── Uploaded thumbnail ── */
                        <div className="p-3 flex flex-col gap-2">
                          {/* Header row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded",
                                d.badge === "REQUIRED" ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#e6f4ef] text-[#1F6F54]")}>
                                {d.badge}
                              </span>
                            </div>
                            <button type="button"
                              onClick={() => { setDocFiles(prev => { const n = { ...prev }; delete n[fileKey]; return n; }); setForm(f => ({ ...f, [fileKey]: false })); }}
                              className="text-[#9ca3af] hover:text-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* File thumbnail */}
                          <div className="flex flex-col items-center gap-2 py-2">
                            <div className="w-10 h-12 rounded-[4px] flex items-center justify-center shadow-sm"
                              style={{ background: uploaded.type === "application/pdf" ? "#fff1f1" : "#eff6ff", border: "1px solid #e5e7eb" }}>
                              <FileText size={20} className={uploaded.type === "application/pdf" ? "text-red-500" : "text-blue-500"} />
                            </div>
                            <div className="text-center min-w-0 w-full">
                              <p className="text-[10.5px] font-semibold text-[#020202] truncate px-1">{uploaded.name}</p>
                              <p className="text-[9.5px] text-[#9ca3af] mt-0.5">{(uploaded.size / 1024).toFixed(0)} KB</p>
                            </div>
                          </div>
                          {/* Uploaded status + replace */}
                          <div className="flex items-center justify-between border-t border-[#d1fae5] pt-2">
                            <span className="text-[10px] text-[#1F6F54] font-semibold flex items-center gap-1">
                              <CheckCircle2 size={11} /> Uploaded
                            </span>
                            <label htmlFor={inputId}
                              className="text-[10px] text-[#1F6F54] font-medium cursor-pointer hover:underline">
                              Replace
                            </label>
                          </div>
                        </div>
                      ) : (
                        /* ── Empty upload state ── */
                        <label htmlFor={inputId} className="flex flex-col items-center gap-2.5 px-3 pt-4 pb-3.5 cursor-pointer w-full">
                          {/* Upload icon */}
                          <div className="w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center">
                            <Upload size={16} className="text-[#9ca3af]" />
                          </div>
                          {/* Doc label + badge */}
                          <div className="text-center">
                            <div className="flex items-center gap-1.5 justify-center mb-0.5">
                              <span className="text-[13px] font-bold text-[#020202]">{d.label}</span>
                              <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded",
                                d.badge === "REQUIRED" ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#f3f4f6] text-[#9ca3af]")}>
                                {d.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#9ca3af] leading-tight">{d.fullLabel}</p>
                          </div>
                          {/* CTA */}
                          <span className="text-[11px] font-semibold text-[#1F6F54] border border-[#1F6F54]/30 px-3 py-1 rounded-full hover:bg-[#f0faf5] transition-colors">
                            Upload file
                          </span>
                          <p className="text-[9.5px] text-[#9ca3af]">PDF, DOC up to 10 MB</p>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>

          {/* ── Separator ── */}
          <div className="h-px bg-[#f3f4f6] mx-5" />

          {/* ── Section B: Compliance Certificates ── */}
          <div className="px-5 pt-5 pb-5">
            {/* Section B header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">B</span>
              <div className="flex-1 h-px bg-[#f3f4f6]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                Compliance Certificates
                <span className="text-[#dc2626] normal-case font-normal ml-1">(×1 required)</span>
              </span>
              <div className="flex-1 h-px bg-[#f3f4f6]" />
              <button type="button"
                className="text-[10.5px] font-medium text-[#1F6F54] border border-[#1F6F54]/40 px-2.5 py-1 rounded-[6px] hover:bg-[#f0faf5] transition-colors whitespace-nowrap ml-2">
                ⊞ Recommended for my markets
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {form.certs.map((cert, ci) => (
                <div key={ci} className="flex items-center gap-2 p-3 rounded-[8px] border border-[#e4e4e7] hover:border-[#1F6F54]/30 transition-colors">
                  <input value={cert.name}
                    onChange={e => setForm(f => ({ ...f, certs: f.certs.map((c, i) => i === ci ? { ...c, name: e.target.value } : c) }))}
                    placeholder="Certificate Name"
                    className={inputCls + " flex-1"} />
                  <input value={cert.authority}
                    onChange={e => setForm(f => ({ ...f, certs: f.certs.map((c, i) => i === ci ? { ...c, authority: e.target.value } : c) }))}
                    placeholder="Issuing Authority"
                    className={inputCls + " flex-1"} />
                  <div className="flex rounded-[6px] overflow-hidden border border-[#cbd5e1] shrink-0">
                    {(["Product", "Plant"] as const).map(s => (
                      <button key={s} type="button"
                        onClick={() => setForm(f => ({ ...f, certs: f.certs.map((c, i) => i === ci ? { ...c, scope: s } : c) }))}
                        className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                          cert.scope === s ? "bg-[#1F6F54] text-white" : "bg-white text-[#71717a] hover:bg-[#f7f7f7]")}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, certs: f.certs.filter((_, i) => i !== ci) }))}
                    className="shrink-0 text-[#9ca3af] hover:text-red-500 transition-colors ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button"
                onClick={() => setForm(f => ({ ...f, certs: [...f.certs, { name: "", authority: "", scope: "Product" as const }] }))}
                className="flex items-center justify-center gap-2 text-sm text-[#9ca3af] hover:text-[#1F6F54] border border-dashed border-[#cbd5e1] hover:border-[#1F6F54]/50 rounded-[6px] py-2.5 transition-colors">
                <Plus className="w-4 h-4" /> Add Another Certificate
              </button>
            </div>
          </div>

        </div>}

        {/* Footer CTA — always visible */}
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-[#e4e4e7]">
          <p className="text-[11.5px] text-slate-400">Changes autosave · You can keep editing until you Accept the plan in Stage 2</p>
          <button onClick={() => {
            setSubmitAttempted(true);
            if (totalMissing === 0) {
              setShowSuccess(true);
              setTimeout(() => { setShowSuccess(false); setSubmitted(true); onSubmitComplete?.(); }, 2800);
            }
          }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-110"
            style={{ background: "#1F6F54" }}>
            Continue to Map the Market <ChevronRight size={15} />
          </button>
        </div>

      </div>
    </div>
    </div>
  );
}

// ─── Channel Pie Chart Card ───────────────────────────────────────────────────

function ChannelPieChart({
  title, totalPct, slices, channels,
}: {
  title: string;
  totalPct: number;
  slices: { pct: number; color: string }[];
  channels: { name: string; pct: number; purpose: string; reach: string; color: string }[];
}) {
  return (
    <div className="bg-[#f9fafb] rounded-xl border border-[#e4e4e7] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-bold text-slate-800">{title}</p>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-[#e4e4e7] text-slate-600">
          {totalPct}% of budget
        </span>
      </div>
      <div className="flex items-center gap-5 mb-4">
        <MiniPieChart slices={slices} size={100} />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {channels.map(c => (
            <div key={c.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
              <span className="text-[11px] text-slate-600 flex-1 truncate">{c.name}</span>
              <span className="text-[11.5px] font-black text-slate-800">{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {channels.map(c => (
          <div key={c.name} className="rounded-lg bg-white border border-[#f3f4f6] px-3 py-2.5">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-[11.5px] font-bold text-slate-700">{c.name}</span>
              </div>
              <span className="text-[10.5px] font-bold text-slate-500">{c.pct}%</span>
            </div>
            <p className="text-[10.5px] text-slate-500 pl-3.5 leading-snug">{c.purpose}</p>
            <p className="text-[10px] font-semibold pl-3.5 mt-0.5" style={{ color: "#0077CC" }}>{c.reach}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen B: Execution Planning — Strategy Report (TEP) ────────────────────

function ExecutionPlanningDetail({ product, onStageClick, planReadyOverride }: { product: CampaignProduct; onStageClick?: (s: CampaignStage) => void; planReadyOverride?: boolean }) {
  const [planReady, setPlanReady] = useState(planReadyOverride ?? false);
  const [timeframe, setTimeframe] = useState<"Weekly" | "Monthly">("Weekly");
  const [showTip, setShowTip] = useState(false);

  const metrics = {
    Weekly:  { searchVol: "287",   trend: "+18%", period: "vs last week"     },
    Monthly: { searchVol: "1,240", trend: "+18%", period: "vs prior 90 days" },
  };
  const m = metrics[timeframe];

  const ORGANIC_CHANNELS = [
    { name: "SCINODE Platform",  color: "#2ACB83" },
    { name: "Scimplify Website", color: "#0077CC" },
    { name: "Other",             color: "#6237C7" },
  ];
  const PAID_CHANNELS = [
    { name: "Google Ads",   color: "#0077CC" },
    { name: "LinkedIn Ads", color: "#6237C7" },
    { name: "Meta Ads",     color: "#E36389" },
    { name: "Others",       color: "#94a3b8" },
  ];
  const OFFLINE_TEAM = [
    { initials: "CS", bg: "#e8fbf2", color: "#1a5c3a", role: "Campaign Strategist"          },
    { initials: "DG", bg: "#e6f3fb", color: "#0077CC", role: "Demand Generation Specialist" },
    { initials: "MR", bg: "#ede8fb", color: "#6237C7", role: "Market Research Specialist"   },
    { initials: "BA", bg: "#fef9c3", color: "#854d0e", role: "Business Analyst"             },
  ];

  const COUNTRIES = [
    { flag: "🇩🇪", country: "Germany", demand: "Strong Demand",   demandBg: "#dcfce7", demandColor: "#166534",
      summary: "Consistent demand signals and strong market potential from EU chemical distributors."    },
    { flag: "🇺🇸", country: "USA",     demand: "Emerging Demand", demandBg: "#fef9c3", demandColor: "#854d0e",
      summary: "Increasing search activity from REACH-compliant buyers in the specialty chemicals sector." },
    { flag: "🇯🇵", country: "Japan",   demand: "Emerging Demand", demandBg: "#fef9c3", demandColor: "#854d0e",
      summary: "Growing market interest as trading houses diversify away from single-origin China supply." },
  ];

  const SPECIALISTS = [
    { initials: "CS", role: "Campaign Strategist",          bg: "#e8fbf2", color: "#1a5c3a" },
    { initials: "DG", role: "Demand Generation Specialist", bg: "#e6f3fb", color: "#0077CC" },
    { initials: "MR", role: "Market Research Specialist",   bg: "#ede8fb", color: "#6237C7" },
  ];

  const CERT_READINESS = [
    { cert: "COA (Certificate of Analysis)",     status: "available" as const },
    { cert: "MSDS (Safety Data Sheet)",          status: "available" as const },
    { cert: "TDS (Technical Data Sheet)",        status: "available" as const },
    { cert: "ISO 9001 Certification",            status: "available" as const },
    { cert: "REACH Compliance",                  status: "missing"   as const },
    { cert: "FDA Registration",                  status: "missing"   as const },
  ];

  if (!planReady) {
    return (
      <div className="flex flex-col gap-5">
        <style>{`
          @keyframes ep-spin { to { transform: rotate(360deg); } }
          @keyframes ep-pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.35} }
          .ep-spinner { animation: ep-spin 1.6s linear infinite; }
          .ep-dot1 { animation: ep-pulse-dot 1.4s ease-in-out 0s infinite; }
          .ep-dot2 { animation: ep-pulse-dot 1.4s ease-in-out 0.25s infinite; }
          .ep-dot3 { animation: ep-pulse-dot 1.4s ease-in-out 0.5s infinite; }
        `}</style>

        {/* Hero card — plan in progress */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
            {/* Left */}
            <div className="px-6 py-5 border-b lg:border-b-0 lg:border-r border-[#f3f4f6]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#0077CC]">Execution Planning</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">Stage 2 of 4</span>
              </div>
              <h2 className="text-[20px] font-black text-slate-900 leading-snug mb-1">Your Market Plan is Being Prepared</h2>
              <p className="text-[12.5px] text-slate-500 mb-4">
                SCINODE's team is analysing global demand signals and building a personalised execution plan for your product.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Product",   value: product.name     },
                  { label: "CAS",       value: product.cas      },
                  { label: "Industry",  value: product.industry },
                  { label: "ETA",       value: "2–3 Business Days" },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-0.5">{item.label}</p>
                    <p className="text-[12.5px] font-bold text-slate-900 truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Right — status */}
            <div className="px-5 py-5 flex flex-col gap-3 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11.5px] font-bold text-amber-700">Plan in Progress</span>
                </div>
                {[
                  { label: "Status",          value: "Under Review"   },
                  { label: "Assigned Team",   value: "3 Specialists"  },
                  { label: "Plan Confidence", value: "Being Assessed" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-1.5 border-b border-[#f9fafb] last:border-0">
                    <span className="text-[12px] text-slate-500">{item.label}</span>
                    <span className="text-[12px] font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#1a5c3a] text-[13px] font-bold hover:brightness-95 transition-all">
                <PhoneCall size={14} /> Schedule a Call
              </button>
            </div>
          </div>
          <div className="border-t border-[#f3f4f6]" />
          <DetailStageStepper activeStage={product.stage as CampaignStage} noCard onStageClick={onStageClick} />
        </div>

        {/* Progress steps */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-black text-slate-900">What's happening right now</h3>
              <p className="text-[12px] text-slate-400 mt-0.5">Our team works on each step in sequence</p>
            </div>
            {/* Spinner */}
            <div className="w-8 h-8 rounded-full border-2 border-[#e4e4e7] border-t-[#2ACB83] ep-spinner" />
          </div>

          <div className="flex flex-col gap-0">
            {[
              { icon: "🔍", title: "Market Signal Analysis",     desc: "Scanning global demand data and trade signals for your product category.",  done: true  },
              { icon: "🌍", title: "Target Market Identification", desc: "Identifying high-potential countries based on RFQ patterns and buyer activity.", done: true  },
              { icon: "📊", title: "Channel Strategy Design",     desc: "Deciding the right mix of offline sales and digital outreach for your market.", done: false },
              { icon: "👥", title: "Team Assignment",             desc: "Assigning campaign specialists and sales captains to your product.",           done: false },
              { icon: "📋", title: "Plan Finalisation",           desc: "Compiling all insights into your market execution plan for review.",           done: false },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 pb-5 last:pb-0 relative">
                {/* Connector line */}
                {i < 4 && (
                  <div className="absolute left-[19px] top-[38px] bottom-0 w-px"
                    style={{ background: step.done ? "#2ACB83" : "#e4e4e7" }} />
                )}
                {/* Icon circle */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base
                  ${step.done ? "bg-[#e8fbf2] border-2 border-[#2ACB83]" : "bg-[#f9fafb] border-2 border-[#e4e4e7]"}`}>
                  {step.done ? <CheckCircle2 size={16} style={{ color: "#2ACB83" }} /> : <span>{step.icon}</span>}
                </div>
                <div className="pt-1.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-[13px] font-bold ${step.done ? "text-slate-900" : "text-slate-400"}`}>{step.title}</p>
                    {step.done
                      ? <span className="text-[10px] font-bold text-[#1a5c3a] bg-[#e8fbf2] px-2 py-0.5 rounded-full">Done</span>
                      : i === 2
                        ? <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <span className="ep-dot1 w-1 h-1 rounded-full bg-amber-500 inline-block" />
                            <span className="ep-dot2 w-1 h-1 rounded-full bg-amber-500 inline-block" />
                            <span className="ep-dot3 w-1 h-1 rounded-full bg-amber-500 inline-block" />
                            &nbsp;In Progress
                          </span>
                        : <span className="text-[10px] font-bold text-slate-400 bg-[#f3f4f6] px-2 py-0.5 rounded-full">Pending</span>
                    }
                  </div>
                  <p className={`text-[12px] leading-relaxed ${step.done ? "text-slate-500" : "text-slate-300"}`}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "📅", title: "When will it be ready?",    body: "Your plan will appear here within 2–3 business days. You'll be notified once it's live." },
            { icon: "🙋", title: "Can you still make changes?", body: "Yes — you can update Stage 1 details anytime before you accept the plan in Stage 2." },
            { icon: "📞", title: "Want to talk it through?",   body: "Schedule a call with our campaign team if you have questions while you wait." },
          ].map(card => (
            <div key={card.title} className="bg-white rounded-xl border border-[#e4e4e7] p-4">
              <div className="text-xl mb-2">{card.icon}</div>
              <p className="text-[12.5px] font-bold text-slate-900 mb-1">{card.title}</p>
              <p className="text-[12px] text-slate-500 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>

        {/* Demo CTA */}
        <div className="flex items-center justify-between bg-[#0e0e0e] rounded-xl px-5 py-4 border border-[rgba(201,162,39,0.35)]">
          <div className="flex items-center gap-3">
            <span className="text-[18px]">🎬</span>
            <div>
              <p className="text-[12.5px] font-bold text-white">Demo Mode</p>
              <p className="text-[11.5px] text-slate-400">See what the plan looks like once SCINODE publishes it</p>
            </div>
          </div>
          <button
            onClick={() => setPlanReady(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-bold text-[#020202] transition-all hover:brightness-110"
            style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}>
            Preview Plan →
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">


      {/* SECTION 1 — Hero + Timeline combined */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">

        {/* Hero row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
          {/* Left: heading + product info */}
          <div className="px-6 py-5 border-b lg:border-b-0 lg:border-r border-[#f3f4f6]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#0077CC]">Execution Planning</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">Stage 2 of 4</span>
            </div>
            <h2 className="text-[20px] font-black text-slate-900 leading-snug mb-1">
              Your Demand Generation Strategy is Ready
            </h2>
            <p className="text-[12.5px] text-slate-500 mb-4">
              SCINODE analyzed global market signals and built a personalized execution plan for your product.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Product",  value: product.name     },
                { label: "CAS",      value: product.cas      },
                { label: "Industry", value: product.industry },
                { label: "Duration", value: "90 Days"        },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-0.5">{item.label}</p>
                  <p className="text-[12.5px] font-bold text-slate-900 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Right: plan status + CTA */}
          <div className="px-5 py-5 flex flex-col gap-3 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#2ACB83] animate-pulse" />
                <span className="text-[11.5px] font-bold text-[#166534]">Execution Plan Ready</span>
              </div>
              {[
                { label: "Target Countries",  value: "3 Markets"  },
                { label: "Estimated Window",  value: "8–12 Weeks" },
                { label: "Market Confidence", value: "High"       },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-[#f9fafb] last:border-0">
                  <span className="text-[12px] text-slate-500">{item.label}</span>
                  <span className="text-[12px] font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2ACB83] text-[#020202] text-[13px] font-bold hover:brightness-105 transition-all">
              <PhoneCall size={14} /> Schedule a Call
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-[#f3f4f6]" />

        {/* Animated timeline — same component, no card wrapper */}
        <DetailStageStepper activeStage={product.stage as CampaignStage} noCard onStageClick={onStageClick} />

      </div>

      {/* SECTION 2 — Market Opportunity Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Market Opportunity Snapshot</p>
          <div className="flex items-center gap-0.5 bg-[#f3f4f6] rounded-lg p-1">
            {(["Weekly", "Monthly"] as const).map(t => (
              <button key={t} onClick={() => setTimeframe(t)}
                className="px-3 py-1.5 rounded-md text-[11.5px] font-semibold transition-all"
                style={timeframe === t ? { background: "#020202", color: "white" } : { color: "#6B7280" }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-[#e8fbf2]">
              <TrendingUp size={16} style={{ color: "#1a5c3a" }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Search Volume</p>
            <p className="text-[20px] font-black text-slate-900 leading-tight">{m.searchVol}</p>
            <p className="text-[11px] font-semibold mt-1 text-[#166534]">{m.trend} {m.period}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-[#f0fdf4]">
              <Globe size={16} style={{ color: "#1a5c3a" }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Target Markets</p>
            <p className="text-[20px] font-black text-slate-900 leading-tight">3 Countries</p>
            <p className="text-[11px] font-semibold mt-1 text-slate-400">Germany · USA · Japan</p>
          </div>
          <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-[#ede8fb]">
              <Target size={16} style={{ color: "#6237C7" }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-1">Recommended Strategy</p>
            <p className="text-[16px] font-black text-slate-900 leading-tight">Offline + Digital</p>
            <p className="text-[11px] font-semibold mt-1 text-[#6237C7]">SCINODE Recommended</p>
          </div>
        </div>
      </div>

      {/* SECTION 3 — Country Analysis (simplified) */}
      <div>
        <p className="text-[15px] font-bold text-slate-900 mb-0.5">Country Demand Analysis</p>
        <p className="text-[12px] text-slate-400 mb-3">Demand intelligence across your selected target markets</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {COUNTRIES.map(c => (
            <div key={c.country} className="bg-white rounded-xl border border-[#e4e4e7] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[26px] leading-none">{c.flag}</span>
                  <span className="text-[15px] font-black text-slate-900">{c.country}</span>
                </div>
                <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: c.demandBg, color: c.demandColor }}>{c.demand}</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">{c.summary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3b — Market Signals */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <div>
            <p className="text-[14px] font-bold text-slate-900">Market Signals</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Live intelligence on buyer activity, certifications, and competitive landscape</p>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3">

          {/* Top-performing countries */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#f9fafb] border border-[#e4e4e7]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[#f3f4f6]">
                <Globe size={13} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Top Performing Markets</p>
                <p className="text-[12.5px] text-slate-700 leading-relaxed">
                  Germany leads demand for flame-retardant intermediates — 3 EU distributors posted RFQs this quarter. Japan shows strong uptick as trading houses diversify away from single-origin China supply.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {["🇩🇪 Germany", "🇯🇵 Japan", "🇺🇸 USA"].map(c => (
                    <span key={c} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-[#e4e4e7] text-slate-600">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Must-have certifications */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#f9fafb] border border-[#e4e4e7]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[#f3f4f6]">
                <ShieldCheck size={13} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Must-Have Certifications</p>
                <p className="text-[12.5px] text-slate-700 leading-relaxed">
                  REACH registration is mandatory to sell to EU chemical buyers. US specialty-chem buyers are shifting toward REACH-ready Indian suppliers — this is now a deal-qualifier, not a nice-to-have.
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {[
                    { label: "REACH (EU)", status: "missing" },
                    { label: "ISO 9001", status: "available" },
                    { label: "FDA (USA)", status: "missing" },
                  ].map(cert => (
                    <span key={cert.label} className="text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 bg-white border border-[#e4e4e7] text-slate-600">
                      {cert.status === "available" ? <Check size={9} strokeWidth={3} className="text-slate-400" /> : <AlertCircle size={9} className="text-slate-400" />}
                      {cert.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Country-wise buyers vs competitors */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#f9fafb] border border-[#e4e4e7]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[#f3f4f6]">
                <Users size={13} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Buyers vs Competitors</p>
                <p className="text-[12.5px] text-slate-700 leading-relaxed">
                  In Germany, 14 verified buyers are active vs 6 competing Indian suppliers — strong opportunity gap. In Japan, buyer intent is high but only 2 REACH-compliant Indian suppliers are present.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  {[
                    { country: "🇩🇪 Germany", buyers: 14, competitors: 6 },
                    { country: "🇺🇸 USA",     buyers: 9,  competitors: 11 },
                    { country: "🇯🇵 Japan",   buyers: 7,  competitors: 2 },
                  ].map(row => (
                    <div key={row.country} className="flex flex-col gap-1 px-3 py-2 rounded-lg bg-white border border-[#e4e4e7]">
                      <p className="text-[11px] font-semibold text-slate-600">{row.country}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] text-slate-500">Buyers <span className="font-black text-slate-800">{row.buyers}</span></span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10.5px] text-slate-500">Competitors <span className="font-black text-slate-800">{row.competitors}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product trend */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#f9fafb] border border-[#e4e4e7]">
            <div className="flex items-start gap-3 w-full">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[#f3f4f6]">
                <TrendingUp size={13} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Product Trend</p>
                <p className="text-[12.5px] text-slate-700 leading-relaxed">
                  Triethyl Phosphate (TEP) search volume is up 34% over the last 90 days globally, driven by flame-retardant regulations tightening in EU and APAC markets. Expect accelerated buyer activity in Q3.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-[#e4e4e7] text-slate-600">
                    +34% Search Volume
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-[#e4e4e7] text-slate-600">
                    EU Reg. Tightening
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 4+5 — Recommended Channel Mix (unified card per sketch) */}
      <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
          <div>
            <p className="text-[14px] font-bold text-slate-900">Recommended Channel Mix</p>
            <p className="text-[12px] text-slate-400 mt-0.5">How SCINODE will generate demand for your product</p>
          </div>
        </div>

        {/* Body: left pie | right panels */}
        <div className="grid grid-cols-[260px_1fr]">

          {/* LEFT — Pie + stats */}
          <div className="relative flex flex-col items-center justify-center gap-5 p-6 border-r border-[#f3f4f6]">
            {/* Info icon top-right */}
            <div className="absolute top-3 right-3"
              onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center border border-[#e4e4e7] cursor-help bg-white">
                <Info size={11} className="text-slate-400" />
              </div>
              {showTip && (
                <div className="absolute left-8 top-0 z-[100] w-[272px] bg-[#020202] rounded-xl p-4">
                  <p className="text-[11px] font-bold text-white/90 mb-2">How are these percentages calculated?</p>
                  <p className="text-[11px] text-white/60 leading-relaxed mb-3">Calculated using search volume, market demand, buyer activity, channel effectiveness, and historical campaign performance.</p>
                  <p className="text-[9.5px] font-bold text-white/40 uppercase tracking-[0.1em] mb-1">Search Volume</p>
                  <p className="text-[11px] text-white/60 leading-relaxed">How frequently buyers search for products similar to yours within selected markets.</p>
                  <div className="absolute top-2 -left-1.5 w-3 h-3 bg-[#020202] rotate-45" />
                </div>
              )}
            </div>

            <MiniPieChart slices={[{ pct: 70, color: "#2ACB83" }, { pct: 30, color: "#0077CC" }]} size={200} />

            {/* Stats stacked below pie */}
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex flex-col items-center">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Digital Contribution</p>
                <p className="text-[28px] font-black text-[#0077CC] leading-tight">30%</p>
              </div>
              <div className="w-full h-px bg-[#f3f4f6]" />
              <div className="flex flex-col items-center">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Offline Team Deployed</p>
                <p className="text-[28px] font-black text-[#2ACB83] leading-tight">70%</p>
              </div>
            </div>
          </div>

          {/* RIGHT — two rows */}
          <div className="flex flex-col">

            {/* TOP — Digital: Organic box | Paid box */}
            <div className="p-5 border-b border-[#f3f4f6]">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">Digital</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#f3f4f6] rounded-xl p-3 bg-[#fafafa]">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#6237C7]" />
                    <p className="text-[11.5px] font-bold text-slate-700">Organic</p>
                  </div>
                  {ORGANIC_CHANNELS.map(c => (
                    <p key={c.name} className="flex items-center gap-2 text-[12px] text-slate-600 mb-1.5 last:mb-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                      {c.name}
                    </p>
                  ))}
                </div>
                <div className="border border-[#f3f4f6] rounded-xl p-3 bg-[#fafafa]">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
                    <p className="text-[11.5px] font-bold text-slate-700">Paid</p>
                  </div>
                  {PAID_CHANNELS.map(c => (
                    <p key={c.name} className="flex items-center gap-2 text-[12px] text-slate-600 mb-1.5 last:mb-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                      {c.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM — Offline Team | Activities */}
            <div className="grid grid-cols-[1fr_auto] p-5 gap-5">
              <div>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">Offline Sales Team</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2.5 shrink-0">
                    {OFFLINE_TEAM.slice(0, 3).map((sp, i) => (
                      <div key={sp.initials}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[11.5px] font-bold ring-2 ring-white"
                        style={{ background: sp.bg, color: sp.color, zIndex: 3 - i }}>
                        {sp.initials}
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold bg-slate-100 text-slate-500 ring-2 ring-white z-0">+1</div>
                  </div>
                  <div>
                    <p className="text-[12.5px] font-bold text-slate-800">Offline Team</p>
                    <p className="text-[11px] text-slate-400">4 people actively working</p>
                  </div>
                </div>
                {/* Country specialist cards */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { flag: "🇩🇪", country: "Germany", role: "EU Distributor Outreach",  members: 3 },
                    { flag: "🇯🇵", country: "Japan",   role: "Asia-Pacific Outreach",    members: 2 },
                    { flag: "🇺🇸", country: "USA",     role: "North America Outreach",   members: 2 },
                  ].map(c => (
                    <div key={c.country} className="rounded-xl border border-[#e4e4e7] p-4 flex flex-col gap-3 bg-white">
                      <div className="flex items-start gap-3">
                        <span className="text-[28px] leading-none shrink-0">{c.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 leading-tight">{c.country}</p>
                          <p className="text-[11.5px] text-slate-400 mt-0.5">{c.role}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#dcfce7] text-[#166534] w-fit">✓ {c.members} members Assigned</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center mt-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e4e4e7] text-[11.5px] font-medium text-slate-500 bg-white hover:bg-[#f9fafb] transition-colors">
                    <ChevronDown size={13} /> View All Countries
                  </button>
                </div>
              </div>
              <div className="border-l border-[#f3f4f6] pl-5">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2.5">Activities</p>
                {["Cold Calling", "Email Outreach", "Distributor Outreach", "Trade Network Prospecting", "Event Participation", "Physical Meetings", "Buyer Qualification"].map(act => (
                  <div key={act} className="flex items-center gap-1.5 mb-1.5 last:mb-0">
                    <CheckCircle2 size={11} style={{ color: "#2ACB83" }} className="shrink-0" />
                    <span className="text-[11.5px] text-slate-600 whitespace-nowrap">{act}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>


    </div>
  );
}

// ─── Sales Funnel Component ───────────────────────────────────────────────────

function SalesFunnel({ stages }: { stages: { label: string; value: number; sub: string; color: string }[] }) {
  const max = stages[0]?.value || 1;
  return (
    <div className="flex flex-col gap-3">
      {stages.map((s, i) => (
        <div key={s.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-semibold text-slate-700">{s.label}</span>
            <span className="text-[22px] font-black" style={{ color: s.color }}>{s.value.toLocaleString()}</span>
          </div>
          <div className="relative h-9 rounded-lg bg-[#f9fafb] border border-[#f3f4f6] overflow-hidden">
            <div className="h-full rounded-lg transition-all duration-700"
              style={{ width: `${Math.max(6, (s.value / max) * 100)}%`, background: `${s.color}20` }} />
            <span className="absolute inset-y-0 left-3 flex items-center text-[11px] text-slate-400">{s.sub}</span>
          </div>
          {i < stages.length - 1 && (
            <div className="flex justify-center my-0.5">
              <ChevronDown size={14} className="text-slate-300" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Demand World Map ─────────────────────────────────────────────────────────

function DemandWorldMap({ week }: { week: string }) {
  const continents = [
    "M 70 55 C 82 42 158 38 212 50 L 238 76 L 248 118 L 242 162 L 210 188 L 178 196 L 148 184 L 112 162 L 82 140 L 58 108 L 52 78 Z",
    "M 158 202 L 212 196 L 238 218 L 234 258 L 200 268 L 168 256 L 152 234 L 148 210 Z",
    "M 318 48 C 334 38 402 38 418 52 L 428 70 L 422 90 L 396 100 L 358 92 L 328 76 L 316 64 Z",
    "M 318 106 C 342 98 404 94 428 108 L 448 136 L 444 202 L 416 242 L 380 252 L 346 236 L 322 200 L 308 158 L 304 128 Z",
    "M 426 40 C 462 28 592 28 658 48 L 688 74 L 682 122 L 652 158 L 580 172 L 508 166 L 458 146 L 426 118 L 416 80 Z",
    "M 564 192 C 586 180 648 180 664 194 L 670 222 L 644 240 L 598 242 L 566 228 Z",
  ];
  const byWeek: Record<string, { x: number; y: number; label: string; leads: number; opps: number; color: string }[]> = {
    "All":    [{ x: 374, y: 66, label: "Germany", leads: 6,  opps: 3, color: "#2ACB83" }, { x: 645, y: 106, label: "Japan", leads: 5,  opps: 2, color: "#0077CC" }, { x: 150, y: 128, label: "USA", leads: 4,  opps: 2, color: "#6237C7" }, { x: 466, y: 143, label: "UAE", leads: 3, opps: 1, color: "#f59e0b" }],
    "Week 1": [{ x: 374, y: 66, label: "Germany", leads: 1,  opps: 1, color: "#2ACB83" }, { x: 645, y: 106, label: "Japan", leads: 1,  opps: 1, color: "#0077CC" }],
    "Week 2": [{ x: 374, y: 66, label: "Germany", leads: 2,  opps: 1, color: "#2ACB83" }, { x: 645, y: 106, label: "Japan", leads: 2,  opps: 1, color: "#0077CC" }, { x: 466, y: 143, label: "UAE", leads: 1, opps: 1, color: "#f59e0b" }, { x: 150, y: 128, label: "USA", leads: 1, opps: 0, color: "#6237C7" }],
    "Week 3": [{ x: 374, y: 66, label: "Germany", leads: 3,  opps: 2, color: "#2ACB83" }, { x: 645, y: 106, label: "Japan", leads: 3,  opps: 2, color: "#0077CC" }, { x: 466, y: 143, label: "UAE", leads: 2, opps: 1, color: "#f59e0b" }, { x: 150, y: 128, label: "USA", leads: 2, opps: 1, color: "#6237C7" }, { x: 507, y: 147, label: "India", leads: 1, opps: 0, color: "#FD4923" }],
  };
  const markers = byWeek[week] ?? byWeek["Week 1"];
  const maxLeads = Math.max(...markers.map(m => m.leads), 1);
  return (
    <div className="w-full rounded-xl border border-[#f3f4f6] overflow-hidden bg-[#f9fafb]" style={{ height: 190 }}>
      <svg viewBox="0 0 700 260" className="w-full h-full">
        {[0,1,2,3].map(i => <line key={`h${i}`} x1={0} y1={i * 65 + 10} x2={700} y2={i * 65 + 10} stroke="#e5e7eb" strokeWidth={0.5} />)}
        {[0,1,2,3,4,5,6,7].map(i => <line key={`v${i}`} x1={i * 88 + 12} y1={0} x2={i * 88 + 12} y2={260} stroke="#e5e7eb" strokeWidth={0.5} />)}
        {continents.map((d, i) => <path key={i} d={d} fill="#e5e7eb" stroke="#d1d5db" strokeWidth={0.5} />)}
        {markers.map(m => {
          const r = 8 + (m.leads / maxLeads) * 18;
          return (
            <g key={m.label} transform={`translate(${m.x},${m.y})`}>
              <circle r={r + 5} fill={m.color} opacity={0.1} />
              <circle r={r}     fill={m.color} opacity={0.25} />
              <circle r={6}     fill={m.color} />
              <rect x={r + 4} y={-14} width={72} height={28} rx={4} fill="white" stroke={m.color} strokeWidth={0.8} opacity={0.94} />
              <text x={r + 40} y={-3}  textAnchor="middle" style={{ font: "bold 8.5px sans-serif", fill: "#374151" }}>{m.label}</text>
              <text x={r + 40} y={9}   textAnchor="middle" style={{ font: "8px sans-serif", fill: "#6B7280" }}>{m.leads} leads · {m.opps} opps</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Campaign Health Gauge ────────────────────────────────────────────────────

function CampaignHealthGauge({ score, level }: { score: number; level: HealthLevel }) {
  const cx = 88, cy = 88, r = 68;
  const scoreColor = score >= 80 ? "#2ACB83" : score >= 65 ? "#0077CC" : "#f59e0b";
  function pXY(angleDeg: number) {
    const rad = angleDeg * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const gaugeAngle = 180 - score * 1.8;
  const s = pXY(180); const e = pXY(gaugeAngle);
  const swept = 180 - gaugeAngle;
  const fillPath = `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${swept > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  return (
    <svg viewBox="0 0 176 100" style={{ width: 180, height: 104 }}>
      <path d={trackPath} fill="none" stroke="#f3f4f6" strokeWidth={15} strokeLinecap="butt" />
      <path d={fillPath}  fill="none" stroke={scoreColor} strokeWidth={15} strokeLinecap="round" />
      <text x={cx} y={cy - 8}  textAnchor="middle" style={{ font: "bold 28px sans-serif",  fill: "#020202"    }}>{score}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" style={{ font: "bold 11px sans-serif",  fill: scoreColor   }}>{level}</text>
    </svg>
  );
}

// ─── Screen C: Demand Generation — Campaign Execution (TEC) ──────────────────

const TEC_WEEK_DATA: Record<string, {
  salesReachout: number; salesCaptains: number; meetings: number;
  geoBreakdown: { label: string; flag: string; pct: number }[];
  sizeBreakdown: { label: string; pct: number; color: string }[];
  salesLeads: { flag: string; country: string; qty: string; date: string }[];
  paidChannels: { ch: string; clicks: number; mql: number; leads: number }[];
  organicChannels: { ch: string; clicks: number; mql: number; leads: number }[];
  totalClicks: number; totalMqls: number;
  digitalLeads: { flag: string; country: string; qty: string; date: string }[];
}> = {
  "Week 1": {
    salesReachout: 31, salesCaptains: 2, meetings: 3,
    geoBreakdown: [
      { label: "Germany", flag: "🇩🇪", pct: 45 }, { label: "USA", flag: "🇺🇸", pct: 29 },
      { label: "Japan",   flag: "🇯🇵", pct: 16 }, { label: "India", flag: "🇮🇳", pct: 10 },
    ],
    sizeBreakdown: [
      { label: "Small",      pct: 19, color: "#2ACB83" },
      { label: "Mid Size",   pct: 35, color: "#0077CC" },
      { label: "Enterprise", pct: 45, color: "#1a5c3a" },
    ],
    salesLeads: [{ flag: "🇩🇪", country: "Germany", qty: "8 MT",  date: "Jun 2, 2026"  }],
    paidChannels:    [{ ch: "Website", clicks: 520, mql: 18, leads: 2 }, { ch: "Scinode", clicks: 240, mql: 13, leads: 3 }, { ch: "Other", clicks: 110, mql: 3, leads: 0 }],
    organicChannels: [{ ch: "LinkedIn", clicks: 360, mql: 9, leads: 1 }, { ch: "Google", clicks: 610, mql: 12, leads: 1 }, { ch: "Others", clicks: 130, mql: 2, leads: 0 }],
    totalClicks: 1970, totalMqls: 57,
    digitalLeads: [{ flag: "🇯🇵", country: "Japan", qty: "5 MT", date: "Jun 4, 2026" }],
  },
  "Week 2": {
    salesReachout: 48, salesCaptains: 2, meetings: 5,
    geoBreakdown: [
      { label: "Japan",   flag: "🇯🇵", pct: 38 }, { label: "Germany", flag: "🇩🇪", pct: 30 },
      { label: "UAE",     flag: "🇦🇪", pct: 20 }, { label: "USA", flag: "🇺🇸", pct: 12 },
    ],
    sizeBreakdown: [
      { label: "Small",      pct: 12, color: "#2ACB83" },
      { label: "Mid Size",   pct: 40, color: "#0077CC" },
      { label: "Enterprise", pct: 48, color: "#1a5c3a" },
    ],
    salesLeads: [
      { flag: "🇯🇵", country: "Japan",   qty: "10 MT", date: "Jun 8, 2026" },
      { flag: "🇩🇪", country: "Germany", qty: "5 MT",  date: "Jun 9, 2026" },
    ],
    paidChannels:    [{ ch: "Website", clicks: 680, mql: 24, leads: 3 }, { ch: "Scinode", clicks: 310, mql: 18, leads: 4 }, { ch: "Other", clicks: 140, mql: 4, leads: 1 }],
    organicChannels: [{ ch: "LinkedIn", clicks: 420, mql: 12, leads: 2 }, { ch: "Google", clicks: 740, mql: 16, leads: 2 }, { ch: "Others", clicks: 160, mql: 3, leads: 0 }],
    totalClicks: 2450, totalMqls: 77,
    digitalLeads: [
      { flag: "🇦🇪", country: "UAE",  qty: "7 MT", date: "Jun 10, 2026" },
      { flag: "🇺🇸", country: "USA", qty: "4 MT", date: "Jun 11, 2026" },
    ],
  },
  "Week 3": {
    salesReachout: 62, salesCaptains: 3, meetings: 8,
    geoBreakdown: [
      { label: "Japan",   flag: "🇯🇵", pct: 42 }, { label: "UAE",     flag: "🇦🇪", pct: 28 },
      { label: "Germany", flag: "🇩🇪", pct: 18 }, { label: "India",  flag: "🇮🇳", pct: 12 },
    ],
    sizeBreakdown: [
      { label: "Small",      pct: 10, color: "#2ACB83" },
      { label: "Mid Size",   pct: 38, color: "#0077CC" },
      { label: "Enterprise", pct: 52, color: "#1a5c3a" },
    ],
    salesLeads: [
      { flag: "🇯🇵", country: "Japan",   qty: "15 MT", date: "Jun 12, 2026" },
      { flag: "🇦🇪", country: "UAE",    qty: "9 MT",  date: "Jun 13, 2026" },
      { flag: "🇩🇪", country: "Germany", qty: "6 MT",  date: "Jun 14, 2026" },
    ],
    paidChannels:    [{ ch: "Website", clicks: 850, mql: 32, leads: 5 }, { ch: "Scinode", clicks: 420, mql: 26, leads: 6 }, { ch: "Other", clicks: 180, mql: 6, leads: 1 }],
    organicChannels: [{ ch: "LinkedIn", clicks: 560, mql: 18, leads: 3 }, { ch: "Google", clicks: 890, mql: 22, leads: 3 }, { ch: "Others", clicks: 200, mql: 5, leads: 1 }],
    totalClicks: 3100, totalMqls: 109,
    digitalLeads: [
      { flag: "🇯🇵", country: "Japan",   qty: "12 MT", date: "Jun 15, 2026" },
      { flag: "🇦🇪", country: "UAE",    qty: "8 MT",  date: "Jun 15, 2026" },
      { flag: "🇮🇳", country: "India",  qty: "3 MT",  date: "Jun 14, 2026" },
    ],
  },
};

// Aggregate for "All"
const TEC_ALL = Object.values(TEC_WEEK_DATA).reduce((acc, w) => ({
  salesReachout:   acc.salesReachout + w.salesReachout,
  salesCaptains:   Math.max(acc.salesCaptains, w.salesCaptains),
  meetings:        acc.meetings + w.meetings,
  geoBreakdown:    w.geoBreakdown,
  sizeBreakdown:   w.sizeBreakdown,
  salesLeads:      [...acc.salesLeads, ...w.salesLeads],
  paidChannels:    acc.paidChannels.map((c, i) => ({ ch: c.ch, clicks: c.clicks + w.paidChannels[i].clicks, mql: c.mql + w.paidChannels[i].mql, leads: c.leads + w.paidChannels[i].leads })),
  organicChannels: acc.organicChannels.map((c, i) => ({ ch: c.ch, clicks: c.clicks + w.organicChannels[i].clicks, mql: c.mql + w.organicChannels[i].mql, leads: c.leads + w.organicChannels[i].leads })),
  totalClicks:     acc.totalClicks + w.totalClicks,
  totalMqls:       acc.totalMqls + w.totalMqls,
  digitalLeads:    [...acc.digitalLeads, ...w.digitalLeads],
}), {
  salesReachout: 0, salesCaptains: 0, meetings: 0,
  geoBreakdown: TEC_WEEK_DATA["Week 1"].geoBreakdown,
  sizeBreakdown: TEC_WEEK_DATA["Week 1"].sizeBreakdown,
  salesLeads: [] as typeof TEC_WEEK_DATA["Week 1"]["salesLeads"],
  paidChannels: [{ ch: "Website", clicks: 0, mql: 0, leads: 0 }, { ch: "Scinode", clicks: 0, mql: 0, leads: 0 }, { ch: "Other", clicks: 0, mql: 0, leads: 0 }],
  organicChannels: [{ ch: "LinkedIn", clicks: 0, mql: 0, leads: 0 }, { ch: "Google", clicks: 0, mql: 0, leads: 0 }, { ch: "Others", clicks: 0, mql: 0, leads: 0 }],
  totalClicks: 0, totalMqls: 0,
  digitalLeads: [] as typeof TEC_WEEK_DATA["Week 1"]["digitalLeads"],
});

// Simple SVG pie chart
function MiniPieChart({ slices, size = 88 }: { slices: { pct: number; color: string }[]; size?: number }) {
  const cx = size / 2; const cy = size / 2; const r = size * 0.38;
  let cumPct = 0;
  const paths = slices.map(s => {
    const start = (cumPct / 100) * 360 - 90;
    cumPct += s.pct;
    const end   = (cumPct / 100) * 360 - 90;
    const laf   = s.pct > 50 ? 1 : 0;
    const sx = cx + r * Math.cos((start * Math.PI) / 180);
    const sy = cy + r * Math.sin((start * Math.PI) / 180);
    const ex = cx + r * Math.cos((end   * Math.PI) / 180);
    const ey = cy + r * Math.sin((end   * Math.PI) / 180);
    return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${laf} 1 ${ex} ${ey} Z`;
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {paths.map((d, i) => <path key={i} d={d} fill={slices[i].color} />)}
    </svg>
  );
}

// ─── Proper Funnel Chart ─────────────────────────────────────────────────────

function ProperFunnel({ stages }: {
  stages: { label: string; value: number; activities: string[]; color: string; accentBg: string }[];
}) {
  const max = stages[0]?.value || 1;
  const widths = [100, 64, 38];
  return (
    <div className="flex flex-col items-center gap-0 py-2">
      {stages.map((s, i) => {
        const convRate = i > 0 && stages[i - 1].value > 0
          ? ((s.value / stages[i - 1].value) * 100).toFixed(1)
          : null;
        return (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center w-full">
              {/* Funnel bar */}
              <div className="relative flex items-center justify-between px-4"
                style={{
                  width: `${widths[i]}%`,
                  height: 52,
                  background: s.accentBg,
                  border: `1.5px solid ${s.color}30`,
                  borderRadius: i === 0 ? "8px 8px 0 0" : i === stages.length - 1 ? "0 0 8px 8px" : "0",
                  borderTop: i > 0 ? "none" : undefined,
                }}>
                <div>
                  <p className="text-[11px] font-bold text-slate-700 leading-tight">{s.label}</p>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {s.activities.slice(0, 2).map(a => (
                      <span key={a} className="text-[9px] text-slate-400 leading-tight">{a}</span>
                    ))}
                  </div>
                </div>
                <span className="text-[22px] font-black leading-none shrink-0" style={{ color: s.color }}>
                  {s.value.toLocaleString()}
                </span>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Digital Engine Panel (master-detail) ─────────────────────────────────────

type DigitalMetric = "clicks" | "enquiries" | "opps";

function DigitalEnginePanel({ data, digitalOpps, allOrganicClicks, allPaidClicks, allOrganicLeads, allPaidLeads, allOrganicOpps, allPaidOpps, hasData = true }: {
  data: typeof TEC_ALL;
  digitalOpps: number;
  allOrganicClicks: number; allPaidClicks: number;
  allOrganicLeads: number;  allPaidLeads: number;
  allOrganicOpps: number;   allPaidOpps: number;
  hasData?: boolean;
}) {
  const [active, setActive] = useState<DigitalMetric>("clicks");

  const totalClicks   = allOrganicClicks + allPaidClicks;
  const totalEnqs     = allOrganicLeads  + allPaidLeads;
  const totalOpps     = allOrganicOpps   + allPaidOpps;

  const cards = [
    {
      id: "clicks"    as DigitalMetric,
      n: "01",
      label: "Total Clicks",
      value: totalClicks.toLocaleString(),
      unit: "Campaign Clicks",
      color: "#1a5c3a",
      accentBg: "#f0fdf4",
      accentBorder: "#bbf7d0",
      tags: ["Website", "Scinode", "Google Ads", "LinkedIn Ads"],
    },
    {
      id: "enquiries" as DigitalMetric,
      n: "02",
      label: "Total Enquiries",
      value: totalEnqs,
      unit: "Raw Enquiries",
      color: "#0077CC",
      accentBg: "#eff8ff",
      accentBorder: "#bfdbfe",
      tags: ["Inbound Leads", "Campaign Responses", "Intent Signals"],
    },
    {
      id: "opps"      as DigitalMetric,
      n: "03",
      label: "Total Exclusive Opps",
      value: totalOpps,
      unit: "Qualified Opps",
      color: "#6237C7",
      accentBg: "#f5f3ff",
      accentBorder: "#ddd6fe",
      tags: ["MQL Verified", "High Intent", "Proposal Ready"],
    },
  ];

  // Organic vs Paid slices for each metric
  const organicPct = (o: number, p: number) => Math.round((o / Math.max(1, o + p)) * 100);
  const paidPct    = (o: number, p: number) => 100 - organicPct(o, p);

  // organicChannels data = Website/Scinode/Other (Organic)
  // paidChannels data    = LinkedIn/Google/Others (Paid)
  const pieByMetric: Record<DigitalMetric, { label: string; pct: number; color: string; raw: number; unit: string }[]> = {
    clicks:    [
      { label: "Organic", pct: organicPct(allPaidClicks, allOrganicClicks),    color: "#C8E89A", raw: allPaidClicks,    unit: "clicks" },
      { label: "Paid",    pct: paidPct(allPaidClicks, allOrganicClicks),        color: "#1a5c3a", raw: allOrganicClicks, unit: "clicks" },
    ],
    enquiries: [
      { label: "Organic", pct: organicPct(allPaidLeads, allOrganicLeads),    color: "#C8E89A", raw: allPaidLeads,    unit: "enquiries" },
      { label: "Paid",    pct: paidPct(allPaidLeads, allOrganicLeads),        color: "#1a5c3a", raw: allOrganicLeads, unit: "enquiries" },
    ],
    opps:      [
      { label: "Organic", pct: organicPct(allPaidOpps, allOrganicOpps),    color: "#C8E89A", raw: allPaidOpps,    unit: "opportunities" },
      { label: "Paid",    pct: paidPct(allPaidOpps, allOrganicOpps),        color: "#1a5c3a", raw: allOrganicOpps, unit: "opportunities" },
    ],
  };

  // Per-channel rows for right panel detail
  const channelsByMetric: Record<DigitalMetric, { group: string; color: string; rows: { ch: string; val: number }[] }[]> = {
    clicks: [
      { group: "Organic", color: "#C8E89A", rows: data.paidChannels.map(r => ({ ch: r.ch, val: r.clicks })) },
      { group: "Paid",    color: "#1a5c3a", rows: data.organicChannels.map(r => ({ ch: r.ch, val: r.clicks })) },
    ],
    enquiries: [
      { group: "Organic", color: "#C8E89A", rows: data.paidChannels.map(r => ({ ch: r.ch, val: r.leads })) },
      { group: "Paid",    color: "#1a5c3a", rows: data.organicChannels.map(r => ({ ch: r.ch, val: r.leads })) },
    ],
    opps: [
      { group: "Organic", color: "#C8E89A", rows: data.paidChannels.map(r => ({ ch: r.ch, val: r.leads > 0 ? Math.max(1, Math.round(r.leads * 0.4)) : 0 })) },
      { group: "Paid",    color: "#1a5c3a", rows: data.organicChannels.map(r => ({ ch: r.ch, val: r.leads > 0 ? Math.max(1, Math.round(r.leads * 0.4)) : 0 })) },
    ],
  };

  const activeCard    = cards.find(c => c.id === active)!;
  const activePie     = pieByMetric[active];
  const activeChans   = channelsByMetric[active];

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f3f4f6]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#e6f3fb]">
          <Activity size={15} style={{ color: "#0077CC" }} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-slate-800">Digital Engine</p>
          <p className="text-[11px] text-slate-400">Digital demand generation</p>
        </div>
      </div>

      {/* Body: left cards + right panel */}
      {!hasData && <EngineEmptyState icon={<Activity size={22} className="text-slate-400" />} label="Digital Engine" />}
      {hasData && <div className="grid grid-cols-[260px_1fr] items-stretch">

        {/* LEFT — 3 metric cards */}
        <div className="flex flex-col border-r border-[#f3f4f6] self-stretch">
          {cards.map((c, i) => {
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn(
                  "text-left px-5 py-5 flex flex-col gap-2 border-b border-[#f3f4f6] last:border-b-0 transition-all",
                  isActive ? "bg-[#f9fafb]" : "hover:bg-[#fafafa]"
                )}
                style={isActive ? { borderLeft: `3px solid ${c.color}` } : { borderLeft: "3px solid transparent" }}>
                <div className="flex items-center justify-end">
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#2ACB83] animate-pulse" />}
                </div>
                <p className={cn("text-[12.5px] font-bold leading-tight", isActive ? "text-slate-900" : "text-slate-600")}>{c.label}</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[28px] font-black leading-none" style={{ color: c.color }}>{c.value}</span>
                  <span className="text-[10.5px] text-slate-400 font-medium">{c.unit}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {c.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[9.5px] text-slate-400 bg-[#f3f4f6] rounded px-1.5 py-0.5">{t}</span>
                  ))}
                  {c.tags.length > 2 && <span className="text-[9.5px] text-slate-400">+{c.tags.length - 2}</span>}
                </div>
                {i < cards.length - 1 && (
                  <div className="flex justify-center pt-1">
                    <ChevronDown size={13} className="text-slate-300" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT — Organic vs Paid pie + channel breakdown */}
        <div className="p-6 bg-[#f9fafb] flex flex-col gap-5">

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: activeCard.color }} />
            <p className="text-[12px] font-bold text-slate-800">
              {active === "clicks"    ? `Organic vs Paid — ${totalClicks.toLocaleString()} Total Clicks`
             : active === "enquiries" ? `Organic vs Paid — ${totalEnqs} Total Enquiries`
             :                          `Organic vs Paid — ${totalOpps} Total Opportunities`}
            </p>
          </div>

          {/* Organic vs Paid pie chart */}
          <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
            <p className="text-[11.5px] font-bold text-slate-700 mb-0.5">
              {active === "clicks" ? "Clicks by Source Type" : active === "enquiries" ? "Enquiries by Source Type" : "Opportunities by Source Type"}
            </p>
            <p className="text-[10.5px] text-slate-400 mb-4">Split between organic and paid digital channels</p>
            <div className="flex items-center gap-4">
              <MiniPieChart slices={activePie.map(s => ({ pct: s.pct, color: s.color }))} size={96} />
              <div className="flex flex-col gap-2.5 flex-1">
                {activePie.map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-slate-600 flex-1">{s.label} ({s.pct}%)</span>
                    <span className="text-[12px] font-bold text-slate-800">{s.raw.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">{s.unit}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Per-channel breakdown */}
          <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
            <p className="text-[11.5px] font-bold text-slate-700 mb-0.5">Channel Breakdown</p>
            <p className="text-[10.5px] text-slate-400 mb-4">Each bar shows channel share out of its group total</p>
            {(() => {
              const unitLabel = active === "clicks" ? "clicks" : active === "enquiries" ? "enquiries" : "opps";
              return (
                <div className="flex flex-col gap-4">
                  {activeChans.map(group => {
                    const groupTotal = group.rows.reduce((s, r) => s + r.val, 0);
                    return (
                    <div key={group.group}>
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[9.5px] font-bold uppercase tracking-[0.1em]"
                          style={{ color: group.color === "#C8E89A" ? "#52B87A" : group.color }}>
                          {group.group} Channels
                        </p>
                        <span className="text-[10px] text-slate-400">{groupTotal.toLocaleString()} {unitLabel}</span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {group.rows.map(r => {
                          const barPct = groupTotal > 0 ? (r.val / groupTotal) * 100 : 0;
                          return (
                            <div key={r.ch} className="flex items-center gap-2.5">
                              <span className="text-[11px] text-slate-600 w-[72px] shrink-0">{r.ch}</span>
                              <div className="flex-1 h-2 rounded-full bg-[#f3f4f6] overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${barPct}%`, background: group.color === "#C8E89A" ? "#52B87A" : group.color }} />
                              </div>
                              <span className="text-[11.5px] font-bold text-slate-800 w-[52px] text-right shrink-0">
                                {r.val.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400 w-[80px] shrink-0">
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

        </div>
      </div>}
    </div>
  );
}

// ─── Engine Empty State ─────────────────────────────────────────────────────

function EngineEmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#f3f4f6]">
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-bold text-slate-700">No Breakdown Data Yet</p>
        <p className="text-[11.5px] text-slate-400 max-w-[260px] leading-relaxed">
          Once the {label} begins generating activity, the breakdown will appear here.
        </p>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e4e4e7] bg-[#f9fafb]">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-[0.08em]">Awaiting Data</span>
      </div>
    </div>
  );
}

// ─── Offline Engine Panel (master-detail) ─────────────────────────────────────

type OfflineStage = "reach" | "meetings" | "opps";

function OfflineEnginePanel({ data, salesOpps, hasData = true }: {
  data: typeof TEC_ALL;
  salesOpps: number;
  hasData?: boolean;
}) {
  const [active, setActive] = useState<OfflineStage>("reach");

  const stages = [
    {
      id: "reach" as OfflineStage,
      n: "01",
      label: "Sales Reach Out",
      value: data.salesReachout,
      unit: "Buyers Reached",
      color: "#1a5c3a",
      accentBg: "#f0fdf4",
      accentBorder: "#bbf7d0",
      tags: ["Cold Calling", "Email Outreach", "Distributor Outreach", "Trade Events", "Physical Meetings"],
    },
    {
      id: "meetings" as OfflineStage,
      n: "02",
      label: "Meetings Conducted",
      value: data.meetings,
      unit: "Meetings Held",
      color: "#0077CC",
      accentBg: "#eff8ff",
      accentBorder: "#bfdbfe",
      tags: ["Video Calls", "Discovery Meetings", "Buyer Qualification"],
    },
    {
      id: "opps" as OfflineStage,
      n: "03",
      label: "Exclusive Opportunities",
      value: salesOpps,
      unit: "Qualified Opps",
      color: "#6237C7",
      accentBg: "#f5f3ff",
      accentBorder: "#ddd6fe",
      tags: ["Qualified Buyer", "Proposal Ready", "High Intent"],
    },
  ];

  const geoData = [
    { flag: "🇩🇪", label: "Germany", pct: 45, color: "#C8E89A" },
    { flag: "🇺🇸", label: "USA",     pct: 29, color: "#52B87A" },
    { flag: "🇯🇵", label: "Japan",   pct: 16, color: "#2E7D52" },
    { flag: "🇮🇳", label: "India",   pct: 10, color: "#1A4A30" },
  ];
  const sizeData = [
    { label: "Enterprise",     pct: 45, color: "#C8E89A" },
    { label: "Mid-Market",     pct: 35, color: "#52B87A" },
    { label: "Small Business", pct: 20, color: "#1A5C3A" },
  ];

  const activeStage = stages.find(s => s.id === active)!;

  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f3f4f6]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#e8fbf2]">
          <Users size={15} style={{ color: "#1a5c3a" }} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-slate-800">Offline Engine</p>
          <p className="text-[11px] text-slate-400">Human-led outreach &amp; engagement</p>
        </div>
      </div>

      {/* Body: left cards + right panel */}
      {!hasData && <EngineEmptyState icon={<Users size={22} className="text-slate-400" />} label="Offline Engine" />}
      {hasData && <div className="grid grid-cols-[260px_1fr] items-stretch">

        {/* LEFT — 3 stage cards */}
        <div className="flex flex-col border-r border-[#f3f4f6] self-stretch">
          {stages.map((s, i) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "text-left px-5 py-5 flex flex-col gap-2 border-b border-[#f3f4f6] last:border-b-0 transition-all",
                  isActive ? "bg-[#f9fafb]" : "hover:bg-[#fafafa]"
                )}
                style={isActive ? { borderLeft: `3px solid ${s.color}` } : { borderLeft: "3px solid transparent" }}>
                <div className="flex items-center justify-end">
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#2ACB83] animate-pulse" />}
                </div>
                <p className={cn("text-[12.5px] font-bold leading-tight", isActive ? "text-slate-900" : "text-slate-600")}>{s.label}</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[28px] font-black leading-none" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-[10.5px] text-slate-400 font-medium">{s.unit}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {s.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[9.5px] text-slate-400 bg-[#f3f4f6] rounded px-1.5 py-0.5">{t}</span>
                  ))}
                  {s.tags.length > 2 && <span className="text-[9.5px] text-slate-400">+{s.tags.length - 2}</span>}
                </div>
                {/* Funnel connector */}
                {i < stages.length - 1 && (
                  <div className="flex justify-center pt-1">
                    <ChevronDown size={13} className="text-slate-300" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* RIGHT — intelligence panel */}
        <div className="p-6 bg-[#f9fafb] flex flex-col gap-5">

          {/* Panel heading */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: activeStage.color }} />
            <p className="text-[12px] font-bold text-slate-800">
              {active === "reach"    ? `Breakdown of ${data.salesReachout} Buyers Reached`
             : active === "meetings" ? `Breakdown of ${data.meetings} Meetings Conducted`
             : `Breakdown of ${salesOpps} Exclusive Opportunities`}
            </p>
          </div>

          {active === "reach" && (
            <div className="flex flex-col gap-4">
              {/* Geography */}
              <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
                <p className="text-[11.5px] font-bold text-slate-700 mb-0.5">Buyer Geography Distribution</p>
                <p className="text-[10.5px] text-slate-400 mb-4">Geographic distribution of all buyers contacted</p>
                <div className="flex items-center gap-4">
                  <MiniPieChart slices={geoData.map(g => ({ pct: g.pct, color: g.color }))} size={96} />
                  <div className="flex flex-col gap-2.5 flex-1">
                    {geoData.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: r.color }} />
                        <span className="text-[11px] text-slate-600 flex-1">{r.flag} {r.label}</span>
                        <span className="text-[12px] font-bold text-slate-800">{Math.round(data.salesReachout * r.pct / 100)} <span className="text-[10px] font-normal text-slate-400">sales reach out</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Company Size */}
              <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
                <p className="text-[11.5px] font-bold text-slate-700 mb-0.5">Company Size Distribution</p>
                <p className="text-[10.5px] text-slate-400 mb-4">Breakdown of reached buyers by company size</p>
                <div className="flex items-center gap-4">
                  <MiniPieChart slices={sizeData.map(s => ({ pct: s.pct, color: s.color }))} size={96} />
                  <div className="flex flex-col gap-2.5 flex-1">
                    {sizeData.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: r.color }} />
                        <span className="text-[11px] text-slate-600 flex-1">{r.label}</span>
                        <span className="text-[12px] font-bold text-slate-800">{Math.round(data.salesReachout * r.pct / 100)} <span className="text-[10px] font-normal text-slate-400">sales reach out</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "meetings" && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
                <p className="text-[11.5px] font-bold text-slate-700 mb-0.5">Buyer Geography Distribution</p>
                <p className="text-[10.5px] text-slate-400 mb-4">Geographic distribution of meetings conducted</p>
                <div className="flex items-center gap-4">
                  <MiniPieChart slices={geoData.map(g => ({ pct: g.pct, color: g.color }))} size={96} />
                  <div className="flex flex-col gap-2.5 flex-1">
                    {geoData.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: r.color }} />
                        <span className="text-[11px] text-slate-600 flex-1">{r.flag} {r.label}</span>
                        <span className="text-[12px] font-bold text-slate-800">{Math.max(0, Math.round(data.meetings * r.pct / 100))} <span className="text-[10px] font-normal text-slate-400">meetings</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
                <p className="text-[11.5px] font-bold text-slate-700 mb-0.5">Company Size Distribution</p>
                <p className="text-[10.5px] text-slate-400 mb-4">Breakdown of meetings by company size</p>
                <div className="flex items-center gap-4">
                  <MiniPieChart slices={sizeData.map(s => ({ pct: s.pct, color: s.color }))} size={96} />
                  <div className="flex flex-col gap-2.5 flex-1">
                    {sizeData.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: r.color }} />
                        <span className="text-[11px] text-slate-600 flex-1">{r.label}</span>
                        <span className="text-[12px] font-bold text-slate-800">{Math.max(0, Math.round(data.meetings * r.pct / 100))} <span className="text-[10px] font-normal text-slate-400">meetings</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "opps" && (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
                <p className="text-[11.5px] font-bold text-slate-700 mb-0.5">Buyer Geography Distribution</p>
                <p className="text-[10.5px] text-slate-400 mb-4">Geographic distribution of exclusive opportunities</p>
                <div className="flex items-center gap-4">
                  <MiniPieChart slices={geoData.map(g => ({ pct: g.pct, color: g.color }))} size={96} />
                  <div className="flex flex-col gap-2.5 flex-1">
                    {geoData.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: r.color }} />
                        <span className="text-[11px] text-slate-600 flex-1">{r.flag} {r.label}</span>
                        <span className="text-[12px] font-bold text-slate-800">{Math.max(0, Math.round(salesOpps * r.pct / 100))} <span className="text-[10px] font-normal text-slate-400">opportunities</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#e4e4e7] p-4">
                <p className="text-[11.5px] font-bold text-slate-700 mb-0.5">Company Size Distribution</p>
                <p className="text-[10.5px] text-slate-400 mb-4">Breakdown of opportunities by company size</p>
                <div className="flex items-center gap-4">
                  <MiniPieChart slices={sizeData.map(s => ({ pct: s.pct, color: s.color }))} size={96} />
                  <div className="flex flex-col gap-2.5 flex-1">
                    {sizeData.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: r.color }} />
                        <span className="text-[11px] text-slate-600 flex-1">{r.label}</span>
                        <span className="text-[12px] font-bold text-slate-800">{Math.max(0, Math.round(salesOpps * r.pct / 100))} <span className="text-[10px] font-normal text-slate-400">opportunities</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>}
    </div>
  );
}

function DemandGenerationDetail({ product, onStageClick }: { product: CampaignProduct; onStageClick?: (s: CampaignStage) => void }) {
  const [allTime, setAllTime]   = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");
  const [enginesHaveData, setEnginesHaveData] = useState(false);

  const hasCustomRange = !allTime && fromDate && toDate;
  const data = hasCustomRange ? TEC_WEEK_DATA["Week 2"] : TEC_ALL;

  const salesOpps   = Math.max(1, data.salesLeads.length);
  const digitalOpps = Math.max(1, data.digitalLeads.length);

  // Channel performance totals
  const allOrganicClicks = data.organicChannels.reduce((s, r) => s + r.clicks, 0);
  const allOrganicLeads  = data.organicChannels.reduce((s, r) => s + r.leads, 0);
  const allOrganicMqls   = data.organicChannels.reduce((s, r) => s + r.mql, 0);
  const allOrganicOpps   = data.organicChannels.reduce((s, r) => s + (r.leads > 0 ? Math.max(1, Math.round(r.leads * 0.4)) : 0), 0);
  const allPaidClicks    = data.paidChannels.reduce((s, r) => s + r.clicks, 0);
  const allPaidLeads     = data.paidChannels.reduce((s, r) => s + r.leads, 0);
  const allPaidMqls      = data.paidChannels.reduce((s, r) => s + r.mql, 0);
  const allPaidOpps      = data.paidChannels.reduce((s, r) => s + (r.leads > 0 ? Math.max(1, Math.round(r.leads * 0.4)) : 0), 0);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero Card (same layout as Execution Planning) ── */}
      <StageHeroCard
        product={product}
        stageLabel="Demand Generation"
        stageNum="Stage 3 of 4"
        headline="Your Campaign is Live"
        subtext="SCINODE is actively running campaigns and generating qualified buyer opportunities for your product."
        statusDot="#2ACB83"
        statusText="Campaign Running"
        metrics={[
          { label: "Markets Active",    value: "3 Markets"      },
          { label: "Campaign Day",      value: "Day 46 of 90"   },
          { label: "Total Opps",        value: `${salesOpps + digitalOpps}` },
        ]}
        ctaLabel="Schedule a Call"
        onStageClick={onStageClick}
      />

      {/* ── SECTION 1: Campaign Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Card 1 — Campaign Status */}
        <div className="bg-white rounded-xl border border-[#e4e4e7] p-4 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Campaign Status</p>
          <div className="flex items-baseline gap-2">
            <p className="text-[24px] font-black text-[#166534] leading-none">Running</p>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#166534]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ACB83] animate-pulse shrink-0" /> Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Day {product.dayActive} of 90</p>
        </div>

        {/* Card 2 — Markets Active */}
        <div className="bg-white rounded-xl border border-[#e4e4e7] p-4 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Markets Active</p>
          <p className="text-[24px] font-black text-[#020202] leading-none">3 <span className="text-[13px] font-semibold text-slate-500">Active Markets</span></p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[{ f: "🇩🇪", c: "Germany" }, { f: "🇯🇵", c: "Japan" }, { f: "🇺🇸", c: "USA" }].map(m => (
              <span key={m.c} className="text-[10.5px] font-medium text-slate-600 flex items-center gap-0.5">
                <span>{m.f}</span> {m.c}
              </span>
            ))}
          </div>
        </div>

        {/* Card 3 — Total Opportunities */}
        <div className="bg-white rounded-xl border border-[#e4e4e7] p-4 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Total Opportunities</p>
          <div className="flex items-baseline gap-2">
            <p className="text-[32px] font-black text-[#020202] leading-none">{salesOpps + digitalOpps}</p>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a5c3a] shrink-0" />
              Sales <span className="font-bold text-slate-800">{salesOpps}</span>
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0077CC] shrink-0" />
              Digital <span className="font-bold text-slate-800">{digitalOpps}</span>
            </span>
          </div>
        </div>

      </div>

      {/* ── SECTION 2: Global Date Filter ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 shrink-0">Date Range</span>
        {/* All Time toggle */}
        <button
          onClick={() => { setAllTime(true); setFromDate(""); setToDate(""); }}
          className="px-3.5 py-2 rounded-lg text-[12px] font-semibold border transition-all"
          style={allTime
            ? { background: "#020202", color: "white", borderColor: "#020202" }
            : { background: "white", color: "#6B7280", borderColor: "#e4e4e7" }}>
          All Time
        </button>
        {/* Date range inputs */}
        <div className="flex items-center gap-2 bg-white border border-[#e4e4e7] rounded-lg px-3 py-1.5">
          <Calendar size={12} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={fromDate}
            onChange={e => { setFromDate(e.target.value); setAllTime(false); }}
            className="text-[12px] text-slate-700 bg-transparent outline-none border-none w-[120px]"
          />
          <span className="text-slate-300 text-[12px]">→</span>
          <input
            type="date"
            value={toDate}
            onChange={e => { setToDate(e.target.value); setAllTime(false); }}
            className="text-[12px] text-slate-700 bg-transparent outline-none border-none w-[120px]"
          />
        </div>
      </div>

      {/* ── Admin Demo Toggle ── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa]">
        <div className="flex-1">
          <p className="text-[11px] font-bold text-slate-600">Engine Breakdown Data</p>
          <p className="text-[10px] text-slate-400">Toggle between empty state and live breakdown view</p>
        </div>
        <button
          onClick={() => setEnginesHaveData(v => !v)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-semibold border transition-all"
          style={enginesHaveData
            ? { background: "#1a5c3a", color: "white", borderColor: "#1a5c3a" }
            : { background: "white", color: "#6B7280", borderColor: "#e4e4e7" }}>
          <span className={`w-1.5 h-1.5 rounded-full ${enginesHaveData ? "bg-[#2ACB83]" : "bg-slate-300"}`} />
          {enginesHaveData ? "Data Entered" : "No Data Yet"}
        </button>
      </div>

      {/* ── SECTION 3: Offline Engine — Master-Detail Layout ── */}
      <OfflineEnginePanel data={data} salesOpps={salesOpps} hasData={enginesHaveData} />

      {/* ── Digital Engine ── */}
      <DigitalEnginePanel
        data={data}
        digitalOpps={digitalOpps}
        allOrganicClicks={allOrganicClicks}
        allPaidClicks={allPaidClicks}
        allOrganicLeads={allOrganicLeads}
        allPaidLeads={allPaidLeads}
        allOrganicOpps={allOrganicOpps}
        allPaidOpps={allPaidOpps}
        hasData={enginesHaveData}
      />

    </div>
  );
}

// ─── Product Detail Screen ────────────────────────────────────────────────────

function ProductDetailScreen({
  product, onBack, onNavigateToStage,
}: { product: CampaignProduct; onBack: () => void; onNavigateToStage?: (stage: CampaignStage) => void }) {
  // Track which stage is being viewed — defaults to the product's actual stage
  const [viewingStage, setViewingStage] = useState<CampaignStage>(product.stage);

  const scrollTop = () =>
    setTimeout(() => document.querySelector("main.flex-1")?.scrollTo({ top: 0, behavior: "smooth" }), 30);

  // Local stage navigation — stays on this product, just changes the visible content
  const handleStageClick = (stage: CampaignStage) => {
    setViewingStage(stage);
    scrollTop();
  };

  const isViewingCurrent = viewingStage === product.stage;
  const stageIdx = STAGES.indexOf(viewingStage) + 1;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-[1300px] mx-auto px-6 py-6 flex flex-col gap-5">

        {/* Back link */}
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 hover:text-[#1a5c3a] transition-colors">
            <ChevronRight size={14} className="rotate-180" />
            Back to Overview
          </button>

          {/* Breadcrumb trail when viewing a past stage */}
          {!isViewingCurrent && (
            <>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-[12px] text-slate-400">{product.name}</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-700">
                Viewing: Stage {stageIdx} — {viewingStage}
              </span>
              <button
                onClick={() => { setViewingStage(product.stage); scrollTop(); }}
                className="flex items-center gap-1 text-[11.5px] font-semibold text-[#1a5c3a] hover:underline ml-1">
                Jump to Current Stage →
              </button>
            </>
          )}
        </div>

        {/* Stage tab pills — quick stage switcher */}
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#e4e4e7] px-4 py-2.5 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 shrink-0 mr-1">Stages</span>
          {STAGES.map((stage, i) => {
            const idx       = i + 1;
            const isActive  = viewingStage === stage;
            const isReached = idx <= product.stageIndex;
            const isCurrent = product.stage === stage;
            return (
              <button key={stage}
                onClick={() => handleStageClick(stage)}
                disabled={!isReached}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold transition-all whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-[#1a5c3a] text-white shadow-sm"
                    : isReached
                      ? "bg-[#f0fdf4] text-[#1a5c3a] hover:bg-[#dcfce7] border border-[#bbf7d0]"
                      : "bg-[#f9fafb] text-slate-300 cursor-not-allowed border border-[#f3f4f6]"
                )}>
                {isReached && !isActive && <Check size={11} strokeWidth={2.5} />}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                {!isReached && <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0 text-[9px] flex items-center justify-center font-black text-slate-400">{idx}</span>}
                Stage {idx} · {stage}
                {isCurrent && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ACB83] animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Stage content — always passes the real product (stage 4 for TEC),
            so DetailStageStepper always shows all prior stages as completed & clickable */}
        {viewingStage === "Setup for Demand"       && <SetupForDemandDetail    product={product} onStageClick={handleStageClick} onSubmitComplete={() => handleStageClick("Execution Planning")} />}
        {viewingStage === "Execution Planning"      && <ExecutionPlanningDetail product={product} onStageClick={handleStageClick} />}
        {viewingStage === "Demand Generation"       && <DemandGenerationDetail  product={product} onStageClick={handleStageClick} />}
        {viewingStage === "Opportunities Pipeline"  && <OpportunitiesPipelineView product={product} onStageClick={handleStageClick} />}

        <DetailInfoCards />

      </div>
    </div>
  );
}

// ─── Active Campaign Page ─────────────────────────────────────────────────────

function ActiveCampaignPage({ scene, onSceneChange, emptyMode }: { scene: Scene; onSceneChange: (s: Scene) => void; emptyMode?: boolean }) {
  const [viewingProduct, setViewingProduct]  = useState<CampaignProduct | null>(null);
  const [addProductOpen, setAddProductOpen]  = useState(false);
  const { addProduct }                        = useProfileStore();
  const acProducts = emptyMode ? EMPTY_CAMPAIGN_PRODUCTS : ACTIVE_CAMPAIGN_PRODUCTS;

  const handleViewDetails = (id: string) => {
    const p = acProducts.find(x => x.id === id);
    if (p) {
      setViewingProduct(p);
      // Scroll to top
      setTimeout(() => {
        document.querySelector("main.flex-1")?.scrollTo({ top: 0, behavior: "smooth" });
      }, 30);
    }
  };

  // If a product detail is being viewed, render the full-screen detail
  const handleNavigateToStage = (stage: CampaignStage) => {
    const p = acProducts.find(x => x.stage === stage);
    if (p) {
      setViewingProduct(p);
      document.querySelector("main.flex-1")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (viewingProduct) {
    return (
      <>
        <style>{AC_STYLES}</style>
        <ProductDetailScreen
          product={viewingProduct}
          onBack={() => setViewingProduct(null)}
          onNavigateToStage={handleNavigateToStage}
        />
        <AddProductDrawer
          open={addProductOpen}
          onClose={() => setAddProductOpen(false)}
          onSave={p => addProduct(p)}
        />
      </>
    );
  }

  return (
    <>
    <style>{AC_STYLES}</style>
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="max-w-[1300px] mx-auto px-6 py-6 flex flex-col gap-6">

        {/* Page header */}
        <div>
          <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-400 mb-4">
            <span>Dashboard</span>
            <ChevronRight size={13} />
            <span className="text-slate-700 font-medium">Demand Catalyst</span>
          </nav>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-[26px] font-black text-slate-900 leading-tight">Demand Catalyst</h1>
              <p className="text-[14px] text-slate-500 mt-1.5 max-w-[560px] leading-relaxed">
                The operating system for industrial demand generation — pick star products, run targeted campaigns, and convert global leads.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold border mt-1 shrink-0"
              style={emptyMode
                ? { background: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.30)", color: "#92400e" }
                : { background: "rgba(42,203,131,0.12)", borderColor: "rgba(42,203,131,0.30)", color: "#1a5c3a" }}>
              ● {emptyMode ? "Setting up campaigns" : `${RUNNING_PRODUCTS_AC.length} campaigns active`}
            </span>
          </div>
        </div>

        {/* Demo switcher */}
        <DcSceneSwitcher scene={scene} onChange={onSceneChange} />

        {/* 01 — Campaign Overview */}
        <CampaignOverviewSection onAddProduct={() => setAddProductOpen(true)} products={acProducts} emptyMode={emptyMode} />

        {/* 02 — Product Campaign Status */}
        <ProductStatusTable onViewDetails={handleViewDetails} products={acProducts} />

        {/* 02b — Weekly Opportunities */}
        <WeeklyOpportunitiesSection emptyMode={emptyMode} />


      </div>

      <AddProductDrawer
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onSave={p => addProduct(p)}
      />
    </div>
    </>
  );
}

// ─── Premium Upgrade Modal ────────────────────────────────────────────────────

function DcPremiumModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative bg-[#141414] rounded-2xl w-full max-w-[960px] max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-[22px] font-black text-white leading-tight">Expand Beyond Your Existing Buyer Network</h2>
          <p className="text-[13px] text-slate-400 mt-1.5">Global opportunities · Market intelligence · Priority access</p>
        </div>

        {/* Two-column cards */}
        <div className="px-6 pb-8 grid grid-cols-2 gap-4">

          {/* LEFT — Free / Access Partner */}
          <div className="bg-[#1e1e1e] rounded-xl p-6 flex flex-col gap-5" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <Rocket size={16} className="text-slate-300" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">Access Partner</p>
                  <p className="text-[11.5px] text-slate-400">Free forever · No expiry</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide"
                style={{ background: "rgba(255,255,255,0.08)", color: "#94a3b8" }}>CURRENT PLAN</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[40px] font-black text-white leading-none">Free</span>
                <span className="text-[13px] text-slate-400">always</span>
              </div>
              <p className="text-[12.5px] text-slate-400">Start generating demand beyond your network.</p>
            </div>

            <button disabled
              className="w-full py-3 rounded-xl text-[13px] font-bold text-slate-400 cursor-default"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Current Plan
            </button>

            <div className="flex flex-col gap-2.5">
              {[
                "Profile visible to verified buyers",
                "Submit up to 2 proposals",
                "All Open Projects — full detail pages",
                "5 Market Pulse quick snapshots",
                "1 in-depth MI report request",
                "Standard email support",
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(42,203,131,0.15)" }}>
                    <Check size={9} className="text-[#2ACB83]" />
                  </div>
                  <span className="text-[12.5px] text-slate-300">{f}</span>
                </div>
              ))}
              {["Exclusive Projects", "Research Vault", "QA/QC & Compliance"].map(f => (
                <div key={f} className="flex items-center gap-2.5 opacity-40">
                  <Crown size={13} className="text-[#f5c842] shrink-0" />
                  <span className="text-[12.5px] text-slate-400">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Priority Partner */}
          <div className="rounded-xl p-6 flex flex-col gap-5"
            style={{ background: "linear-gradient(160deg,#1a1400 0%,#1c1200 50%,#141000 100%)", border: "1px solid rgba(245,200,66,0.25)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,200,66,0.12)" }}>
                  <Zap size={16} className="text-[#f5c842]" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">Priority Partner</p>
                  <p className="text-[11.5px] text-slate-400">Full Access to Manufacturing Intelligence</p>
                </div>
              </div>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide"
                style={{ background: "rgba(245,200,66,0.15)", color: "#f5c842" }}>
                <Star size={9} fill="#f5c842" /> RECOMMENDED
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[40px] font-black text-white leading-none">Custom Pricing</span>
              </div>
              <p className="text-[12.5px] text-slate-400">For manufacturers seeking deeper market access, consistent high-value demand, and end-to-end business enablement.</p>
            </div>

            {/* 3 stat tiles */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: TrendingUp, val: "3×",   label: "leads"             },
                { icon: BarChart2,  val: "10×",  label: "deeper Product MI" },
                { icon: Clock,      val: "24 hr", label: "priority support"  },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 py-3 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Icon size={13} className="text-[#f5c842]" />
                  <span className="text-[18px] font-black text-white leading-none">{val}</span>
                  <span className="text-[10px] text-slate-400 text-center leading-snug">{label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-2">
              <button className="py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)", color: "#0a0800" }}>
                <Zap size={13} /> Upgrade to Premium
              </button>
              <button className="py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#e2e8f0" }}>
                <Building2 size={13} /> Talk to Sales
              </button>
            </div>

            {/* Feature list */}
            <div className="flex flex-col gap-2.5">
              {[
                "Unlimited proposal submissions",
                "Open + Exclusive project access",
                "Unlimited Market Pulse Quick Snapshots",
                "Up to 10 in-depth Product MI reports / year",
                "Lead Generation for catalogue products",
                "Research Vault — up to 20 compounds",
                "Research Module — Receive R&D project opportunities + expertise",
              ].map(f => (
                <div key={f} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(245,200,66,0.15)" }}>
                    <Check size={9} className="text-[#f5c842]" />
                  </div>
                  <span className="text-[12.5px] text-slate-300 leading-snug">{f}</span>
                </div>
              ))}
            </div>

            {/* Footer muted items */}
            <div className="flex flex-col gap-1.5 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {["QA/QC as a Service", "Compliance as a Service", "Priority support — WhatsApp, email & 1-on-1"].map(f => (
                <p key={f} className="text-[11.5px] italic" style={{ color: "rgba(255,255,255,0.30)" }}>{f}</p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DemandCatalyst() {
  const { addProduct } = useProfileStore();

  const [scene, setScene]                     = useState<Scene>("day0");
  const [bannerOpen, setBannerOpen]           = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [addProductOpen, setAddProductOpen]   = useState(false);
  const [starredIds, setStarredIds]           = useState<Set<string>>(new Set());
  const [campaignStarted, setCampaignStarted] = useState(false);

  const isNonPremium = scene === "non-premium";

  const displayProducts = sceneProducts(scene);

  useEffect(() => {
    setStarredIds(new Set(sceneStarIds(scene)));
    setCampaignStarted(false);
  }, [scene]);

  // Active campaign scene is fully self-contained — render separately
  if (scene === "s3-active") {
    return <ActiveCampaignPage scene={scene} onSceneChange={setScene} />;
  }

  // Campaign just started — show empty active campaign page
  if (campaignStarted) {
    return <ActiveCampaignPage scene={scene} onSceneChange={s => { setScene(s); setCampaignStarted(false); }} emptyMode />;
  }

  const handleToggleStar = (id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < 5) { next.add(id); }
      return next;
    });
  };

  const view: "empty" | "products" | "campaign" =
    campaignStarted               ? "campaign"
    : displayProducts.length === 0 ? "empty"
    : "products";

  // Top-right CTA label + action
  const [ctaLabel, ctaAction]: [string, () => void] =
    view === "campaign"     ? ["View Campaign Status", () => {}]
    : view === "empty"      ? ["Add Product →", () => setAddProductOpen(true)]
    : starredIds.size > 0   ? [`Start Campaign`, () => isNonPremium ? setShowPremiumModal(true) : setCampaignStarted(true)]
                            : ["Select Star Products →", () => {}];

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── Page body ── */}
      <div className="max-w-[1300px] mx-auto px-6 py-6 flex flex-col gap-5">

        {/* Breadcrumb + H1 + CTA (matches Deep Research layout) */}
        <div>
          <nav className="flex items-center gap-1.5 text-[12.5px] text-slate-400 mb-4">
            <span>Dashboard</span>
            <ChevronRight size={13} />
            <span className="text-slate-700 font-medium">Demand Catalyst</span>
          </nav>
          <div className="flex items-start justify-between gap-8">
            <div>
              <h1 className="text-[26px] font-black text-slate-900 leading-tight">Demand Catalyst</h1>
              <p className="text-[14px] text-slate-500 leading-relaxed max-w-[600px] mt-1.5">
                Select up to 5 star products for SCINODE to promote — generating buyer demand and delivering qualified opportunities directly to you.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 mt-1">
              {/* Plan info controls */}
              <div className="flex items-center gap-2">
                {!bannerOpen && (
                  <span className="text-[11px] text-slate-400">Plan info hidden.</span>
                )}
                <button
                  onClick={() => setBannerOpen(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors hover:bg-amber-50"
                  style={{ color: "#c9a227", borderColor: "rgba(201,162,39,0.40)" }}
                >
                  <Crown size={11} /> {bannerOpen ? "Plan info" : "Show plan info"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan banner — collapsible, hidden on Day 0 */}
        {scene !== "day0" && bannerOpen && (
          <PlanBanner starCount={starredIds.size} productCount={displayProducts.length} onDismiss={() => setBannerOpen(false)} />
        )}

        {/* Demo switcher */}
        <DcSceneSwitcher scene={scene} onChange={s => { setScene(s); setBannerOpen(true); }} />

        {/* ── 70 / 30 grid (matches Deep Research lg:grid-cols-10) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">

          {/* LEFT 70% — Campaign Workspace */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">CAMPAIGN WORKSPACE</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Day 0: workspace cards */}
            {view === "empty" && (
              <WorkspaceCards
                hasProducts={false}
                onAddProduct={() => setAddProductOpen(true)}
                onSelectStars={() => {}}
              />
            )}

            {/* Has products: star slots + products table */}
            {view === "products" && (
              <>
                <StarSlotsBar
                  starCount={starredIds.size}
                  productCount={displayProducts.length}
                  onStartCampaign={() => isNonPremium ? setShowPremiumModal(true) : setCampaignStarted(true)}
                  onAdd={() => setAddProductOpen(true)}
                />
                <ProductsTable
                  products={displayProducts}
                  starredIds={starredIds}
                  onToggleStar={handleToggleStar}
                  onAdd={() => setAddProductOpen(true)}
                />
              </>
            )}

            {/* Campaign started */}
            {view === "campaign" && (
              <CampaignStartedPanel starredIds={starredIds} products={displayProducts} />
            )}
          </div>

          {/* RIGHT 30% — Demand Catalyst panel */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">DEMAND CATALYST</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <DemandCatalystPanel onHowItWorks={() => setShowModal(true)} />
          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      {showModal && (
        <HowItWorksModal
          onClose={() => setShowModal(false)}
          onAddProduct={() => setAddProductOpen(true)}
        />
      )}

      {showPremiumModal && (
        <DcPremiumModal onClose={() => setShowPremiumModal(false)} />
      )}

      {/* Add Product Drawer */}
      <AddProductDrawer
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onSave={p => addProduct(p)}
      />
    </div>
  );
}
