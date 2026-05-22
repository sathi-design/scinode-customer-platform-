"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Globe, TrendingUp, BarChart2, Users, ShieldAlert, Rocket,
  Search, X, Check, ChevronDown, Zap, FileText, Clock,
  Download, ExternalLink, Crown, Lock, AlertTriangle,
  CheckCircle2, Send, RefreshCw, ChevronRight, Activity,
  Building2, MapPin, Calendar, Layers, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Demo states ───────────────────────────────────────────────────────────────
type PlanState =
  | "free-active"
  | "free-limit"
  | "premium-active"
  | "premium-intel-limit";

// ─── Data ─────────────────────────────────────────────────────────────────────
const DEMO_PLAN_CONFIG: Record<PlanState, { label: string; desc: string }> = {
  "free-active":        { label: "Free — Active",         desc: "2/5 snapshots used, 0/1 intel used" },
  "free-limit":         { label: "Free — Limit Reached",  desc: "5/5 snapshots, 1/1 intel exhausted" },
  "premium-active":     { label: "Premium — Active",       desc: "3/10 detailed intel used" },
  "premium-intel-limit":{ label: "Premium — Intel Limit", desc: "10/10 detailed intel exhausted" },
};

const PRODUCTS = [
  { name: "Paracetamol",           cas: "103-90-2" },
  { name: "Para Aminophenol",      cas: "123-30-8" },
  { name: "Para Nitro Compound",   cas: "100-01-6" },
  { name: "Ibuprofen",             cas: "15687-27-1" },
  { name: "Ascorbic Acid",         cas: "50-81-7" },
  { name: "Citric Acid",           cas: "77-92-9" },
  { name: "Sodium Carbonate",      cas: "497-19-8" },
  { name: "Lithium Sulphate",      cas: "10102-25-7" },
  { name: "Acetylsalicylic Acid",  cas: "50-78-2" },
  { name: "Caffeine",              cas: "58-08-2" },
  { name: "Metformin HCl",         cas: "1115-70-4" },
  { name: "Benzyl Alcohol",        cas: "100-51-6" },
];

const INTEL_CARDS = [
  {
    id: "market-trade",
    icon: Globe,
    label: "Market & Trade",
    desc: "Understand how your product moves across global trade markets.",
    bullets: [
      "Import and export trends",
      "Top trading countries",
      "Key supplier and buyer regions",
      "Trade volume movements",
      "Emerging market opportunities",
    ],
  },
  {
    id: "pricing-trends",
    icon: TrendingUp,
    label: "Pricing Trends",
    desc: "Track pricing patterns and market fluctuations.",
    bullets: [
      "Historical price movements",
      "Regional pricing comparisons",
      "Pricing volatility indicators",
      "Market-driven cost factors",
      "Industry benchmark pricing",
    ],
  },
  {
    id: "demand-insights",
    icon: BarChart2,
    label: "Demand Insights",
    desc: "Identify where and how demand is evolving.",
    bullets: [
      "High-demand industries",
      "Growing application areas",
      "Demand growth regions",
      "Seasonal demand patterns",
      "Buyer interest signals",
    ],
  },
  {
    id: "competitor-signals",
    icon: Users,
    label: "Competitor Signals",
    desc: "Analyze market activity and competitive positioning.",
    bullets: [
      "Key market participants",
      "Competitor activity trends",
      "Supplier landscape overview",
      "Expansion and sourcing signals",
      "Competitive market observations",
    ],
  },
  {
    id: "regulation-risk",
    icon: ShieldAlert,
    label: "Regulation & Risk",
    desc: "Stay informed about compliance and market risk factors.",
    bullets: [
      "Regulatory considerations",
      "Import/export restrictions",
      "Compliance requirements",
      "Risk alerts and barriers",
      "Region-specific regulations",
    ],
  },
  {
    id: "go-to-market",
    icon: Rocket,
    label: "Go-To-Market Analysis",
    desc: "Evaluate market entry and expansion opportunities.",
    bullets: [
      "Recommended target regions",
      "Potential buyer segments",
      "Channel opportunities",
      "Market entry considerations",
      "Strategic growth observations",
    ],
  },
] as const;

type IntelId = (typeof INTEL_CARDS)[number]["id"];

const REPORT_HISTORY: {
  id: number; product: string; cas: string; type: string;
  date: string; status: string; intelIds: IntelId[];
}[] = [
  { id: 1, product: "Paracetamol",      cas: "103-90-2",   type: "Quick Snapshot", date: "21 May 2026", status: "ready",       intelIds: ["market-trade","pricing-trends","demand-insights"] },
  { id: 2, product: "Paracetamol",      cas: "103-90-2",   type: "Detailed Intel", date: "19 May 2026", status: "intel-ready", intelIds: ["market-trade","pricing-trends","demand-insights","competitor-signals","regulation-risk","go-to-market"] },
  { id: 3, product: "Ascorbic Acid",    cas: "50-81-7",    type: "Quick Snapshot", date: "17 May 2026", status: "ready",       intelIds: ["pricing-trends","demand-insights","go-to-market"] },
  { id: 4, product: "Lithium Sulphate", cas: "10102-25-7", type: "Detailed Intel", date: "15 May 2026", status: "processing",  intelIds: [] },
  { id: 5, product: "Ibuprofen",        cas: "15687-27-1", type: "Quick Snapshot", date: "12 May 2026", status: "ready",       intelIds: ["market-trade","competitor-signals","regulation-risk"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    "ready":         { label: "Snapshot Ready",   cls: "bg-[#E8FBF2] text-[#0F7614]" },
    "intel-ready":   { label: "Intel Ready",       cls: "bg-[#EDE8FB] text-[#6237C7]" },
    "processing":    { label: "Intel Processing",  cls: "bg-[#FBF0C5] text-[#9C5022]" },
    "requested":     { label: "Intel Requested",   cls: "bg-[#E6F3FB] text-[#0077CC]" },
  };
  const s = map[status] ?? { label: status, cls: "bg-[#F3F4F6] text-[#4B5563]" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium", s.cls)}>
      {s.label}
    </span>
  );
}

// ─── Plan usage banner ────────────────────────────────────────────────────────
function PlanBanner({
  plan,
  onUpgrade,
}: {
  plan: PlanState;
  onUpgrade: () => void;
}) {
  if (plan === "free-active") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-[10px] bg-[#0e0e0e] border border-[#c9a227]/40">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(201,162,39,0.40)" }}>
            <Crown size={13} style={{ color: "#f5c842" }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[12.5px] font-semibold text-white">Free Plan Active</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-[#020202]"
                style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}>
                Market Pulse
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[11.5px] text-white/60">
                Snapshots: <span className="text-[#f5c842] font-semibold">2 / 5</span> used
              </span>
              <span className="text-white/20 text-[11px]">·</span>
              <span className="text-[11.5px] text-white/60">
                Detailed Intel: <span className="text-[#f5c842] font-semibold">0 / 1</span> used
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[12px] font-bold text-[#020202] whitespace-nowrap transition-all hover:brightness-110"
          style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}
        >
          <Zap size={12} /> Upgrade to Premium
        </button>
      </div>
    );
  }

  if (plan === "free-limit") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-[10px] bg-[#0e0e0e] border border-red-800/50">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-red-900/40 border border-red-700/40 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={13} className="text-red-400" />
          </div>
          <div>
            <span className="text-[12.5px] font-semibold text-white block mb-0.5">Free Usage Limit Reached</span>
            <p className="text-[11.5px] text-white/55 leading-[17px] max-w-[460px]">
              You've used all available free Market Pulse credits. Upgrade to Premium for unlimited snapshots and 10 detailed intelligence reports annually.
            </p>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[12px] font-bold text-[#020202] whitespace-nowrap transition-all hover:brightness-110"
          style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}
        >
          <Zap size={12} /> Upgrade to Premium
        </button>
      </div>
    );
  }

  if (plan === "premium-active") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-[10px] bg-[#0e0e0e] border border-[#c9a227]/40">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(201,162,39,0.40)" }}>
            <Crown size={13} style={{ color: "#f5c842" }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[12.5px] font-semibold text-white">Premium Access Active</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-[#020202]"
                style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}>
                Market Pulse
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[11.5px] text-white/60">
                Quick Snapshots: <span className="text-[#f5c842] font-semibold">Unlimited</span>
              </span>
              <span className="text-white/20 text-[11px]">·</span>
              <span className="text-[11.5px] text-white/60">
                Detailed Intel: <span className="text-[#f5c842] font-semibold">3 / 10</span> used
              </span>
            </div>
          </div>
        </div>
        <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[12px] font-semibold text-white/70 whitespace-nowrap border border-white/15 hover:border-white/30 transition-all">
          Manage Plan
        </button>
      </div>
    );
  }

  // premium-intel-limit
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-[10px] bg-[#0e0e0e] border border-[#c9a227]/40">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: "rgba(245,200,66,0.12)", border: "1px solid rgba(201,162,39,0.40)" }}>
          <Crown size={13} style={{ color: "#f5c842" }} />
        </div>
        <div>
          <span className="text-[12.5px] font-semibold text-white block mb-0.5">Detailed Intelligence Limit Reached</span>
          <p className="text-[11.5px] text-white/55 leading-[17px]">
            You've used all 10 annual detailed intelligence requests. Quick Snapshots remain unlimited.
          </p>
        </div>
      </div>
      <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[12px] font-bold text-[#020202] whitespace-nowrap transition-all hover:brightness-110"
        style={{ background: "linear-gradient(90deg,#f5c842,#c9a227)" }}>
        Contact Team
      </button>
    </div>
  );
}

// ─── Intel Area card ──────────────────────────────────────────────────────────
function IntelCard({
  card,
  selected,
  locked,
  onToggle,
}: {
  card: (typeof INTEL_CARDS)[number];
  selected: boolean;
  locked: boolean;
  onToggle: () => void;
}) {
  const Icon = card.icon;
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onToggle}
      className={cn(
        "relative text-left w-full rounded-[14px] border p-4 flex flex-col gap-3 transition-all duration-150",
        locked
          ? "opacity-50 cursor-not-allowed bg-[#F9FAFB] border-[#B3B7BD]/30"
          : selected
          ? "bg-white border-[#2ACB83] shadow-[0_0_0_2px_rgba(42,203,131,0.15)] cursor-pointer"
          : "bg-[#F9FAFB] border-[#B3B7BD]/40 hover:border-[#2ACB83]/50 hover:bg-white cursor-pointer",
      )}
    >
      {/* Selected checkmark */}
      {selected && !locked && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2ACB83] flex items-center justify-center">
          <Check size={11} className="text-white" strokeWidth={2.5} />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "w-9 h-9 rounded-[10px] flex items-center justify-center",
        selected ? "bg-[#E8FBF2]" : "bg-[#F3F4F6]",
      )}>
        <Icon size={18} className={selected ? "text-[#1F6F54]" : "text-[#6B7280]"} />
      </div>

      {/* Heading + desc */}
      <div>
        <p className={cn("text-[14px] font-semibold leading-tight", selected ? "text-[#1F6F54]" : "text-[#020202]")}>
          {card.label}
        </p>
        <p className="text-[12px] text-[#6B7280] mt-0.5 leading-[17px] line-clamp-2">
          {card.desc}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#F3F4F6]" />

      {/* Bullets */}
      <ul className="flex flex-col gap-1.5">
        {card.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0",
              selected ? "bg-[#2ACB83]" : "bg-[#9CA3AF]",
            )} />
            <span className="text-[12px] text-[#4B5563] leading-[18px]">{b}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

// ─── Snapshot report ──────────────────────────────────────────────────────────
function SnapshotReport({
  product,
  cas,
  intelIds,
}: {
  product: string;
  cas: string;
  intelIds: IntelId[];
}) {
  const now = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }) + " at " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const intelMap = Object.fromEntries(INTEL_CARDS.map((c) => [c.id, c.label]));
  const sections = intelIds.length > 0 ? intelIds : ["market-trade", "pricing-trends", "demand-insights"] as IntelId[];

  return (
    <div className="flex flex-col gap-0 rounded-[14px] overflow-hidden border border-[#B3B7BD]/40">

      {/* ── Report header ── */}
      <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #1F6F54 100%)" }}>
        <p className="text-[10px] font-bold tracking-[0.18em] text-white/50 uppercase mb-2">
          Scinode Market Intelligence
        </p>
        <h1 className="text-[22px] font-bold text-white leading-tight mb-3 capitalize">
          {product}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {cas && (
            <span className="flex items-center gap-1.5 text-[12px] text-white/65">
              <Layers size={12} /> CAS: {cas}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[12px] text-white/65">
            <Globe size={12} /> Global
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-white/65">
            <Clock size={12} /> Last 12 months
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-white/65">
            <FileText size={12} /> {sections.length} sections
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-white/65">
            <Calendar size={12} /> {now}
          </span>
        </div>
        {/* Intel tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {sections.map((id) => (
            <span key={id} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/75 border border-white/15">
              {intelMap[id] ?? id}
            </span>
          ))}
        </div>
      </div>

      {/* ── Report body ── */}
      <div className="bg-white flex flex-col divide-y divide-[#F3F4F6]">

        {/* Executive Summary */}
        <div className="px-6 py-5">
          <p className="text-[10px] font-bold tracking-[0.14em] text-[#6B7280] uppercase mb-3">
            Executive Summary
          </p>
          <p className="text-[13.5px] text-[#020202] leading-[22px]">
            The global <span className="font-semibold capitalize">{product}</span> market remains moderately active with
            sustained demand from pharmaceutical, nutraceutical, and industrial segments. Over the last 12 months,
            global trade volumes have shown resilience despite supply-chain disruptions, with key production hubs in
            Asia maintaining output. Pricing has stabilized following a period of volatility driven by raw material
            fluctuations and logistics costs. Buyer interest signals are strong in North America and Western Europe,
            while emerging demand from Southeast Asia and the Middle East presents new growth vectors. Regulatory
            compliance requirements continue to intensify, particularly in EU and US markets, necessitating
            proactive documentation from suppliers entering these regions.
          </p>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: "Market Outlook",    value: "Positive",  color: "#0F7614", bg: "#E8FBF2" },
              { label: "Demand Momentum",   value: "Growing",   color: "#0077CC", bg: "#E6F3FB" },
              { label: "Price Stability",   value: "Moderate",  color: "#9C5022", bg: "#FBF0C5" },
              { label: "Buyer Activity",    value: "High",      color: "#6237C7", bg: "#EDE8FB" },
            ].map((k) => (
              <div key={k.label} className="rounded-[10px] px-3 py-2.5" style={{ background: k.bg }}>
                <p className="text-[10px] text-[#6B7280] font-medium mb-0.5">{k.label}</p>
                <p className="text-[14px] font-bold" style={{ color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sections rendered based on selection ── */}
        {(sections.includes("market-trade") || sections.includes("market-trade" as IntelId)) && (
          <ReportSection
            title="Market & Trade Analysis"
            left={{
              heading: "Top Import Regions",
              bullets: [
                "United States leads global imports at ~28% share",
                "Germany and France drive EU demand, combined ~18%",
                "India emerging as high-growth import market (+14% YoY)",
                "Japan maintains stable procurement volumes",
                "Brazil showing accelerated import growth",
              ],
            }}
            right={{
              heading: "Export & Trade Flow",
              bullets: [
                "China dominates global export supply at ~42% share",
                "India expanding export capacity with new GMP certifications",
                "European exports concentrated in high-purity grades",
                "Southeast Asia gaining share in intermediates export",
                "Middle East positioned as regional re-export hub",
              ],
            }}
          />
        )}

        {(sections.includes("pricing-trends")) && (
          <ReportSection
            title="Pricing Trends"
            left={{
              heading: "Price Trend",
              bullets: [
                "Current pricing range: USD 1,200–1,800 / MT depending on grade",
                "Prices declined ~15% from Q2 2025 peaks due to oversupply",
                "Modest recovery of 5–8% observed in Q1 2026",
                "Spot market remains volatile relative to contract pricing",
                "Key driver: upstream raw material costs and freight rates",
              ],
            }}
            right={{
              heading: "Regional Benchmarks",
              bullets: [
                "European pricing 12–18% premium over Asian spot rates",
                "US market commanded highest regional prices in 2025",
                "Indian export pricing competitive for pharma-grade material",
                "Contract pricing locked 6–9 months in advance, preferred",
                "Currency fluctuation adding ±3–5% effective price variance",
              ],
            }}
          />
        )}

        {(sections.includes("demand-insights")) && (
          <ReportSection
            title="Demand Insights"
            left={{
              heading: "Demand Hotspots",
              bullets: [
                "Pharmaceutical API synthesis driving 45% of global demand",
                "Nutraceuticals and food additives growing at 8.2% CAGR",
                "Industrial applications stable, limited growth expected",
                "Animal health sector showing 6% YoY demand increase",
                "Personal care formulators emerging as new demand segment",
              ],
            }}
            right={{
              heading: "Buyer Intent Signals",
              bullets: [
                "Strong RFQ activity from US specialty pharma companies",
                "EU CDMO buyers seeking reliable long-term supply partners",
                "Indian generic manufacturers actively sourcing competitively",
                "Korean buyers prioritising quality-certified vendors",
                "Buyer preference shifting to audited supplier relationships",
              ],
            }}
          />
        )}

        {(sections.includes("competitor-signals")) && (
          <ReportSection
            title="Competitor Landscape"
            left={{
              heading: "Major Suppliers",
              bullets: [
                "Top 5 suppliers control approximately 60% of global capacity",
                "Chinese manufacturers dominate volume-grade supply",
                "Indian suppliers gaining traction in pharmaceutical applications",
                "European producers hold premium positioning in regulated markets",
                "Recent M&A activity consolidating mid-tier suppliers",
              ],
            }}
            right={{
              heading: "Market Dynamics",
              bullets: [
                "New capacity additions announced in India and SE Asia",
                "European suppliers investing in sustainability certification",
                "Smaller suppliers under pressure from pricing competition",
                "Vertical integration trend among large API manufacturers",
                "Supplier audits and GMP requirements raising entry barriers",
              ],
            }}
          />
        )}

        {(sections.includes("regulation-risk")) && (
          <ReportSection
            title="Regulation & Risk"
            left={{
              heading: "Compliance Overview",
              bullets: [
                "US FDA and EU EMA GMP compliance mandatory for pharma export",
                "REACH registration required for EU chemical imports",
                "China tightening environmental compliance affecting exports",
                "Import duty changes in key markets affecting landed cost",
                "Documentation burden increasing for cross-border shipments",
              ],
            }}
            right={{
              heading: "Risk Indicators",
              bullets: [
                "Geopolitical tensions affecting Asia-Pacific supply routes",
                "Single-source dependency risk for critical intermediates",
                "Currency volatility impact on long-term contract viability",
                "Raw material scarcity signals from upstream suppliers",
                "Environmental regulation risk in primary production regions",
              ],
            }}
          />
        )}

        {(sections.includes("go-to-market")) && (
          <ReportSection
            title="Go-To-Market Recommendations"
            left={{
              heading: "Priority Target Markets",
              bullets: [
                "North America: highest price realization, strong RFQ activity",
                "Western Europe: premium buyers, strong GMP compliance culture",
                "Japan & Korea: stable volumes, relationship-driven procurement",
                "Southeast Asia: fast-growing, competitive pricing important",
                "Middle East: emerging demand, limited supplier competition",
              ],
            }}
            right={{
              heading: "Strategic Actions",
              bullets: [
                "Obtain US FDA / EU GMP certification to access premium tiers",
                "Engage in Scinode Exclusive Projects for direct buyer access",
                "Develop product datasheets targeting pharma-grade specifications",
                "Build multi-year supply agreements with tier-1 CDMO buyers",
                "Position on sustainability and traceability as differentiators",
              ],
            }}
          />
        )}

      </div>
    </div>
  );
}

function ReportSection({
  title,
  left,
  right,
}: {
  title: string;
  left: { heading: string; bullets: string[] };
  right: { heading: string; bullets: string[] };
}) {
  return (
    <div className="px-6 py-5">
      <p className="text-[10px] font-bold tracking-[0.14em] text-[#6B7280] uppercase mb-4">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[left, right].map((col) => (
          <div key={col.heading} className="rounded-[10px] border border-[#F3F4F6] bg-[#FAFAFA] p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#2ACB83]" />
              <p className="text-[13px] font-semibold text-[#020202]">{col.heading}</p>
            </div>
            <ul className="flex flex-col gap-2">
              {col.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span className="w-1 h-1 rounded-full bg-[#9CA3AF] mt-[7px] flex-shrink-0" />
                  <span className="text-[12.5px] text-[#4B5563] leading-[19px]">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function ReportSkeleton() {
  return (
    <div className="rounded-[14px] border border-[#B3B7BD]/40 overflow-hidden animate-pulse">
      <div className="h-[140px] bg-[#E5E7EB]" />
      <div className="bg-white p-6 flex flex-col gap-4">
        <div className="h-3 w-32 bg-[#E5E7EB] rounded" />
        <div className="h-3 w-full bg-[#F3F4F6] rounded" />
        <div className="h-3 w-full bg-[#F3F4F6] rounded" />
        <div className="h-3 w-4/5 bg-[#F3F4F6] rounded" />
        <div className="grid grid-cols-4 gap-3 mt-2">
          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-[#F3F4F6] rounded-[10px]" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[1,2].map(i => <div key={i} className="h-36 bg-[#F3F4F6] rounded-[10px]" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Report view modal ────────────────────────────────────────────────────────
function ReportViewModal({
  item,
  onClose,
}: {
  item: typeof REPORT_HISTORY[number];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, [item.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-[18px] border border-[#e4e4e7] flex flex-col w-full max-w-[860px] shadow-2xl"
        style={{ maxHeight: "90vh" }}>

        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-[8px] flex items-center justify-center",
              item.type === "Quick Snapshot" ? "bg-[#E8FBF2]" : "bg-[#EDE8FB]",
            )}>
              {item.type === "Quick Snapshot"
                ? <Zap size={15} className="text-[#1F6F54]" />
                : <FileText size={15} className="text-[#6237C7]" />}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#020202] leading-tight">{item.product}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11.5px] text-[#6B7280]">{item.type}</span>
                <span className="text-[#D1D5DB] text-[10px]">·</span>
                <span className="text-[11.5px] text-[#9CA3AF]">{item.date}</span>
                {item.cas && <>
                  <span className="text-[#D1D5DB] text-[10px]">·</span>
                  <span className="text-[11px] font-mono text-[#9CA3AF]">CAS {item.cas}</span>
                </>}
              </div>
            </div>
            <StatusBadge status={item.status} />
          </div>

          <div className="flex items-center gap-2">
            {!loading && (
              <>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#e4e4e7] text-[11.5px] text-[#6B7280] hover:border-[#1F6F54] hover:text-[#1F6F54] transition-colors">
                  <Download size={11} /> PDF
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#e4e4e7] text-[11.5px] text-[#6B7280] hover:border-[#1F6F54] hover:text-[#1F6F54] transition-colors">
                  <ExternalLink size={11} /> Open
                </button>
              </>
            )}
            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#020202] transition-colors ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Modal body — scrollable ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {loading
            ? <ReportSkeleton />
            : <SnapshotReport product={item.product} cas={item.cas} intelIds={item.intelIds} />
          }
        </div>

      </div>
    </div>
  );
}

// ─── Detailed Intel modal ─────────────────────────────────────────────────────
function DetailedIntelModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-[18px] border border-[#e4e4e7] p-8 max-w-[420px] w-full mx-4 flex flex-col gap-5">
        <div className="w-14 h-14 rounded-full bg-[#E8FBF2] flex items-center justify-center mx-auto">
          <CheckCircle2 size={30} className="text-[#1F6F54]" />
        </div>
        <div className="text-center flex flex-col gap-2">
          <h3 className="text-[17px] font-bold text-[#020202]">Detailed Intelligence Request Submitted</h3>
          <p className="text-[13px] text-[#4B5563] leading-[20px]">
            Thank you for requesting a detailed market intelligence report.
            Our team will connect with you within <span className="font-semibold text-[#020202]">24 hours</span> to
            collect additional inputs before generating the report.
          </p>
        </div>
        <div className="rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[12px] text-[#4B5563]">
            <CheckCircle2 size={13} className="text-[#2ACB83]" /> Report added to history
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#4B5563]">
            <CheckCircle2 size={13} className="text-[#2ACB83]" /> Email confirmation sent
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#4B5563]">
            <CheckCircle2 size={13} className="text-[#2ACB83]" /> Team notified
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-[10px] bg-[#1F6F54] hover:bg-[#185C45] text-white text-[13.5px] font-semibold transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
}

// ─── Add product modal ────────────────────────────────────────────────────────
function AddProductModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, cas: string) => void;
}) {
  const [name, setName] = useState("");
  const [cas, setCas] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-[18px] border border-[#e4e4e7] p-6 max-w-[380px] w-full mx-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-[#020202]">Add New Product</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-[#71717a] hover:bg-[#f3f4f6] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#353535] uppercase tracking-wide mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sodium Bicarbonate"
              className="w-full border border-[#cbd5e1] rounded-[8px] px-3 py-2.5 text-[13px] text-[#020202] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1F6F54]/30 focus:border-[#1F6F54] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#353535] uppercase tracking-wide mb-1.5">
              CAS Number <span className="text-[#9ca3af] font-normal normal-case">(Optional)</span>
            </label>
            <input
              value={cas}
              onChange={(e) => setCas(e.target.value)}
              placeholder="e.g. 497-19-8"
              className="w-full border border-[#cbd5e1] rounded-[8px] px-3 py-2.5 text-[13px] font-mono text-[#020202] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1F6F54]/30 focus:border-[#1F6F54] transition-colors"
            />
          </div>
        </div>
        <button
          disabled={!name.trim()}
          onClick={() => { onAdd(name.trim(), cas.trim()); onClose(); }}
          className="w-full py-2.5 rounded-[10px] bg-[#1F6F54] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed hover:bg-[#185C45] text-white text-[13px] font-semibold transition-colors"
        >
          Save Product
        </button>
      </div>
    </div>
  );
}

// ─── CTA button block (reused in two places) ─────────────────────────────────
function CtaButtons({
  canGenerate,
  intelLocked,
  hasProduct,
  isLocked,
  reportLoading,
  onSnapshot,
  onIntel,
  compact = false,
}: {
  canGenerate: boolean;
  intelLocked: boolean;
  hasProduct: boolean;
  isLocked: boolean;
  reportLoading: boolean;
  onSnapshot: () => void;
  onIntel: () => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex gap-2.5", compact ? "flex-row" : "flex-col")}>
      {/* Primary filled — Generate Quick Snapshot */}
      <button
        onClick={onSnapshot}
        disabled={!canGenerate || reportLoading}
        className={cn(
          "flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-all bg-[#1F6F54] text-white",
          compact ? "flex-1 py-2.5 text-[13px]" : "w-full py-3 text-[13.5px]",
          canGenerate && !reportLoading ? "hover:bg-[#185C45]" : "opacity-50 cursor-not-allowed",
        )}
      >
        {reportLoading
          ? <><RefreshCw size={14} className="animate-spin" /> Generating…</>
          : <><Zap size={14} /> Generate Quick Snapshot</>}
      </button>

      {/* Secondary outlined — Generate Detailed Intel */}
      <button
        onClick={onIntel}
        disabled={intelLocked || !hasProduct}
        className={cn(
          "flex items-center justify-center gap-2 rounded-[10px] font-semibold border-2 border-[#1F6F54] text-[#1F6F54] transition-all",
          compact ? "flex-1 py-2.5 text-[13px]" : "w-full py-3 text-[13.5px]",
          !intelLocked && hasProduct ? "hover:bg-[#E8FBF2]" : "opacity-50 cursor-not-allowed",
        )}
      >
        <FileText size={13} /> Detailed Intel
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function MarketPulse() {
  // ── Demo/plan state ──────────────────────────────────────────────────────────
  const [plan, setPlan] = useState<PlanState>("free-active");

  // ── Product search — pre-select first product so CTAs are active by default ──
  const [searchQuery, setSearchQuery]         = useState(PRODUCTS[0].name);
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; cas: string } | null>(PRODUCTS[0]);
  const [casInput, setCasInput]               = useState(PRODUCTS[0].cas);
  const [searchOpen, setSearchOpen]           = useState(false);
  const [extraProducts, setExtraProducts]     = useState<{ name: string; cas: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const allProducts = [...PRODUCTS, ...extraProducts];
  const filtered    = searchQuery.length >= 1
    ? allProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Intel selection ──────────────────────────────────────────────────────────
  const [selectedIntel, setSelectedIntel] = useState<Set<IntelId>>(new Set());
  function toggleIntel(id: IntelId) {
    setSelectedIntel((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  // ── Report state ─────────────────────────────────────────────────────────────
  const [reportVisible, setReportVisible] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportProduct, setReportProduct] = useState("");
  const [reportCas, setReportCas]         = useState("");
  const [reportIntel, setReportIntel]     = useState<IntelId[]>([]);

  // ── Right panel state ────────────────────────────────────────────────────────
  type HistoryFilter = "all" | "snapshot" | "intel";
  type RightTab = "report" | "history";
  const [rightTab, setRightTab]                     = useState<RightTab>("history");
  const [historyFilter, setHistoryFilter]           = useState<HistoryFilter>("all");
  const [reportModalItem, setReportModalItem]       = useState<typeof REPORT_HISTORY[number] | null>(null);

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [intelModalOpen, setIntelModalOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const isLocked    = plan === "free-limit";
  const intelLocked = plan === "free-limit" || plan === "premium-intel-limit";
  const canGenerate = !isLocked && !!selectedProduct;

  const snapshotCount = REPORT_HISTORY.filter((r) => r.type === "Quick Snapshot").length;
  const intelCount    = REPORT_HISTORY.filter((r) => r.type === "Detailed Intel").length;

  const filteredHistory = REPORT_HISTORY.filter((r) => {
    if (historyFilter === "snapshot") return r.type === "Quick Snapshot";
    if (historyFilter === "intel")    return r.type === "Detailed Intel";
    return true;
  });

  function handleGenerateSnapshot() {
    if (!canGenerate) return;
    setReportProduct(selectedProduct!.name);
    setReportCas(casInput || selectedProduct!.cas);
    setReportIntel(Array.from(selectedIntel) as IntelId[]);
    setReportLoading(true);
    setReportVisible(false);
    setRightTab("report");
    setTimeout(() => { setReportLoading(false); setReportVisible(true); }, 1800);
  }

  function handleDetailedIntel() {
    if (intelLocked) return;
    setIntelModalOpen(true);
  }

  function handleViewReport(item: typeof REPORT_HISTORY[number]) {
    setReportModalItem(item);
  }

  const ctaProps = {
    canGenerate, intelLocked, hasProduct: !!selectedProduct,
    isLocked, reportLoading,
    onSnapshot: handleGenerateSnapshot, onIntel: handleDetailedIntel,
  };

  return (
    <>
      {reportModalItem && (
        <ReportViewModal item={reportModalItem} onClose={() => setReportModalItem(null)} />
      )}
      {intelModalOpen && <DetailedIntelModal onClose={() => setIntelModalOpen(false)} />}
      {addProductOpen && (
        <AddProductModal
          onClose={() => setAddProductOpen(false)}
          onAdd={(name, cas) => {
            const p = { name, cas };
            setExtraProducts((prev) => [...prev, p]);
            setSelectedProduct(p); setCasInput(cas); setSearchQuery(name);
          }}
        />
      )}

      <div className="flex flex-col gap-4 pb-12 max-w-[1400px] mx-auto">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-1 mb-1">
          <nav className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
            <span>Dashboard</span>
            <ChevronRight size={12} />
            <span className="text-[#020202] font-medium">Market Pulse</span>
          </nav>
          <h1 className="text-[22px] font-semibold text-[#020202] flex items-center gap-2 mt-1">
            <Activity size={20} className="text-[#2ACB83]" /> Market Pulse
          </h1>
          <p className="text-[13px] text-[#6B7280] mt-0.5 max-w-[560px] leading-[19px]">
            Custom intelligence reports for your product. Select products and intelligence areas to generate market insights and opportunity snapshots.
          </p>
        </div>

        {/* ── Demo switcher ── */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#e4e4e7] bg-[#fafafa]">
          <span className="text-[9.5px] font-bold text-[#9ca3af] uppercase tracking-widest shrink-0">Demo</span>
          <div className="flex items-center gap-1 flex-wrap">
            {(Object.entries(DEMO_PLAN_CONFIG) as [PlanState, typeof DEMO_PLAN_CONFIG[PlanState]][]).map(([key, cfg]) => (
              <button key={key} onClick={() => setPlan(key)} title={cfg.desc}
                className={cn("px-2.5 py-[3px] rounded-[5px] text-[11px] font-semibold transition-all duration-150",
                  plan === key ? "bg-[#020202] text-white" : "text-[#6b7280] hover:bg-[#f0f0f0]")}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Plan banner ── */}
        <PlanBanner plan={plan} onUpgrade={() => {}} />

        {/* ── 40/60 split ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ══ LEFT PANEL (40%) — single unified container ══════════════════ */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-4">
            <div className="bg-white rounded-[16px] border border-[#B3B7BD]/40 overflow-hidden flex flex-col">

              {/* ─ Section 1: Product Details ─ */}
              <div className="p-5 flex flex-col gap-4">
                {/* Header row: title left, CTAs right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#1F6F54] flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5">1</div>
                    <h2 className="text-[15px] font-semibold text-[#020202] leading-tight">Product Details</h2>
                  </div>

                  {/* Small CTAs — top right: filled + outlined */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Primary filled */}
                    <button
                      onClick={handleGenerateSnapshot}
                      disabled={!canGenerate || reportLoading}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[11.5px] font-semibold whitespace-nowrap transition-all bg-[#1F6F54] text-white",
                        canGenerate && !reportLoading ? "hover:bg-[#185C45]" : "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {reportLoading
                        ? <><RefreshCw size={12} className="animate-spin" /> Generating…</>
                        : <><Zap size={12} /> Quick Snapshot</>}
                    </button>

                    {/* Secondary outlined */}
                    <button
                      onClick={handleDetailedIntel}
                      disabled={intelLocked || !selectedProduct}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[11.5px] font-semibold whitespace-nowrap transition-all border-2 border-[#1F6F54] text-[#1F6F54]",
                        !intelLocked && selectedProduct ? "hover:bg-[#E8FBF2]" : "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <FileText size={12} /> Detailed Intel
                    </button>
                  </div>
                </div>

                {/* Product search */}
                <div ref={searchRef} className="relative flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#353535] uppercase tracking-wide">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div className={cn(
                    "flex items-center border rounded-[10px] px-3 py-2.5 gap-2 transition-colors",
                    searchOpen ? "border-[#1F6F54] ring-2 ring-[#1F6F54]/20" : "border-[#cbd5e1]",
                    isLocked && "opacity-50 pointer-events-none",
                  )}>
                    <Search size={14} className="text-[#9ca3af] shrink-0" />
                    <input
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); if (!e.target.value) setSelectedProduct(null); }}
                      onFocus={() => setSearchOpen(true)}
                      placeholder="Search product name…"
                      className="flex-1 text-[13px] text-[#020202] placeholder:text-[#9ca3af] focus:outline-none bg-transparent"
                    />
                    {searchQuery && (
                      <button onClick={() => { setSearchQuery(""); setSelectedProduct(null); setCasInput(""); }} className="text-[#9ca3af] hover:text-[#020202] transition-colors">
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  {searchOpen && filtered.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-[#e4e4e7] rounded-[10px] shadow-lg overflow-hidden max-h-[200px] overflow-y-auto">
                      {filtered.map((p) => (
                        <button key={p.name}
                          onClick={() => { setSelectedProduct(p); setSearchQuery(p.name); setCasInput(p.cas); setSearchOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F9FAFB] transition-colors text-left">
                          <span className="text-[13px] text-[#020202]">{p.name}</span>
                          <span className="text-[11px] font-mono text-[#9CA3AF]">{p.cas}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No-result helper */}
                  {searchOpen && searchQuery.length > 1 && filtered.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white border border-[#e4e4e7] rounded-[10px] p-4 shadow-lg">
                      <p className="text-[12.5px] text-[#6B7280] mb-2">No product found for "<span className="font-semibold text-[#020202]">{searchQuery}</span>"</p>
                      <button onClick={() => { setSearchOpen(false); setAddProductOpen(true); }}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1F6F54] hover:underline">
                        + Add New Product
                      </button>
                    </div>
                  )}
                </div>

                {/* CAS Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#353535] uppercase tracking-wide flex items-center gap-1.5">
                    CAS Number <span className="font-normal normal-case text-[#9CA3AF]">(Optional)</span>
                  </label>
                  <input value={casInput} onChange={(e) => setCasInput(e.target.value)}
                    placeholder="e.g. 497-19-8" disabled={isLocked}
                    className={cn("border border-[#cbd5e1] rounded-[10px] px-3 py-2.5 text-[13px] font-mono text-[#020202] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1F6F54]/30 focus:border-[#1F6F54] transition-colors",
                      isLocked && "opacity-50 cursor-not-allowed")} />
                </div>

                {/* Add product link */}
                {!searchQuery && (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#9CA3AF]">Can't find your product?</span>
                    <button onClick={() => setAddProductOpen(true)} className="text-[12px] font-semibold text-[#1F6F54] hover:underline">
                      + Add manually
                    </button>
                  </div>
                )}

                {/* Selected chip */}
                {selectedProduct && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#E8FBF2] border border-[#2ACB83]/30">
                    <CheckCircle2 size={13} className="text-[#1F6F54]" />
                    <span className="text-[12.5px] font-semibold text-[#1F6F54]">{selectedProduct.name}</span>
                    {casInput && <span className="text-[11px] font-mono text-[#1F6F54]/70 ml-1">· {casInput}</span>}
                  </div>
                )}
              </div>

              {/* ─ Divider between sections ─ */}
              <div className="border-t border-[#F3F4F6]" />

              {/* ─ Section 2: Intel Areas ─ */}
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#1F6F54] flex items-center justify-center text-white text-[11px] font-bold shrink-0">2</div>
                    <h2 className="text-[15px] font-semibold text-[#020202]">Intel Areas</h2>
                  </div>
                  <span className="text-[12px] text-[#9CA3AF]">Select at least one</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {INTEL_CARDS.map((card) => (
                    <IntelCard key={card.id} card={card}
                      selected={selectedIntel.has(card.id)} locked={isLocked}
                      onToggle={() => toggleIntel(card.id)} />
                  ))}
                </div>

                {selectedIntel.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#F9FAFB] border border-[#e4e4e7]">
                    <span className="text-[12px] text-[#6B7280]">{selectedIntel.size} area{selectedIntel.size > 1 ? "s" : ""} selected</span>
                    <button onClick={() => setSelectedIntel(new Set())} className="ml-auto text-[11px] text-[#9CA3AF] hover:text-red-500 transition-colors">
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* ─ CTAs — sticky bottom of container ─ */}
              <div className="sticky bottom-0 border-t border-[#F3F4F6] bg-white px-5 py-4">
                <CtaButtons {...ctaProps} compact />
              </div>

            </div>
          </div>

          {/* ══ RIGHT PANEL (60%) — sticky, viewport-height, tabs ═══════════ */}
          <div className="w-full lg:w-[60%] lg:sticky lg:top-4 flex flex-col lg:h-[calc(100vh-2rem)]">

            {/* ─ Unified card wrapping tabs + content ─ */}
            <div className="bg-white rounded-[16px] border border-[#B3B7BD]/40 flex flex-col flex-1 min-h-0">

              {/* ─ Tab bar ─ */}
              <div className="flex items-center gap-0 border-b border-[#F3F4F6] px-4 pt-3 shrink-0">
                {/* Snapshot Report tab */}
                <button
                  onClick={() => setRightTab("report")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-all mr-1",
                    rightTab === "report"
                      ? "border-[#1F6F54] text-[#1F6F54]"
                      : "border-transparent text-[#6B7280] hover:text-[#020202]",
                  )}
                >
                  <Zap size={13} /> Snapshot Report
                  {reportVisible && !reportLoading && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#E8FBF2] text-[#1F6F54]">Ready</span>
                  )}
                  {reportLoading && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FBF0C5] text-[#9C5022]">Generating…</span>
                  )}
                </button>

                {/* Recent Reports tab */}
                <button
                  onClick={() => setRightTab("history")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-all",
                    rightTab === "history"
                      ? "border-[#1F6F54] text-[#1F6F54]"
                      : "border-transparent text-[#6B7280] hover:text-[#020202]",
                  )}
                >
                  <FileText size={13} /> Recent Reports
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#F3F4F6] text-[#6B7280]">
                    {REPORT_HISTORY.length}
                  </span>
                </button>

                {/* Right-side actions in Snapshot tab */}
                {rightTab === "report" && reportVisible && !reportLoading && (
                  <div className="ml-auto flex items-center gap-1.5 pb-1">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#e4e4e7] text-[11.5px] text-[#6B7280] hover:border-[#1F6F54] hover:text-[#1F6F54] transition-colors">
                      <Download size={11} /> PDF
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#e4e4e7] text-[11.5px] text-[#6B7280] hover:border-[#1F6F54] hover:text-[#1F6F54] transition-colors">
                      <ExternalLink size={11} /> Open
                    </button>
                  </div>
                )}
              </div>

              {/* ─ Tab content — fills remaining height, scrolls internally ─ */}
              <div className="flex-1 min-h-0 overflow-y-auto">

                {/* SNAPSHOT REPORT TAB */}
                {rightTab === "report" && (
                  <div className="p-4 flex flex-col gap-3">
                    {reportLoading ? (
                      <ReportSkeleton />
                    ) : reportVisible ? (
                      <SnapshotReport product={reportProduct} cas={reportCas} intelIds={reportIntel} />
                    ) : (
                      <div className="rounded-[12px] border-2 border-dashed border-[#E5E7EB] bg-[#FAFAFA] flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                          <Activity size={24} className="text-[#9CA3AF]" />
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold text-[#020202] mb-1">No snapshot generated yet</p>
                          <p className="text-[13px] text-[#6B7280] max-w-[300px] leading-[19px]">
                            Select a product and intel areas on the left, then click <span className="font-semibold text-[#1F6F54]">Generate Quick Snapshot</span>.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[11.5px] text-[#9CA3AF]">
                          <CheckCircle2 size={11} className="text-[#2ACB83]" /> Powered by Scinode Market Intelligence Engine
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* RECENT REPORTS TAB */}
                {rightTab === "history" && (
                  <div className="flex flex-col">
                    {/* Filter pills */}
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F3F4F6]">
                      {(["all", "snapshot", "intel"] as HistoryFilter[]).map((f) => {
                        const labels: Record<HistoryFilter, string> = {
                          all:      `All (${REPORT_HISTORY.length})`,
                          snapshot: `Quick Snapshots (${snapshotCount})`,
                          intel:    `Detailed Intel (${intelCount})`,
                        };
                        return (
                          <button key={f} onClick={() => setHistoryFilter(f)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all",
                              historyFilter === f
                                ? "bg-[#020202] text-white"
                                : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
                            )}>
                            {f === "snapshot" && <Zap size={11} />}
                            {f === "intel"    && <FileText size={11} />}
                            {labels[f]}
                          </button>
                        );
                      })}
                    </div>

                    {/* History rows */}
                    <div className="divide-y divide-[#F3F4F6]">
                      {filteredHistory.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 px-5 py-4 hover:bg-[#FAFAFA] transition-colors">
                          <div className={cn("w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0",
                            r.type === "Quick Snapshot" ? "bg-[#E8FBF2]" : "bg-[#EDE8FB]")}>
                            {r.type === "Quick Snapshot"
                              ? <Zap size={15} className="text-[#1F6F54]" />
                              : <FileText size={15} className="text-[#6237C7]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#020202] truncate">{r.product}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11.5px] text-[#6B7280]">{r.type}</span>
                              <span className="text-[#D1D5DB] text-[10px]">·</span>
                              <span className="text-[11.5px] text-[#9CA3AF]">{r.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <StatusBadge status={r.status} />
                            {(r.status === "ready" || r.status === "intel-ready") && (
                              <button
                                onClick={() => handleViewReport(r)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-[7px] border border-[#e4e4e7] text-[11.5px] font-medium text-[#4B5563] hover:border-[#1F6F54] hover:text-[#1F6F54] transition-all"
                              >
                                <Eye size={12} /> View
                              </button>
                            )}
                            {r.status === "processing" && (
                              <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                                <RefreshCw size={12} className="animate-spin" /> Processing
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {filteredHistory.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-16 text-center px-8">
                          <FileText size={24} className="text-[#D1D5DB]" />
                          <p className="text-[13px] font-medium text-[#6B7280]">No reports in this category</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
